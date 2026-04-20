/**
 * draftAppeal — Supabase Edge Function
 *
 * POST /functions/v1/draftAppeal
 * Auth: Bearer (user JWT)
 * Body: { caseId: string }
 *
 * Flow:
 *  1. Load case row + attached evidence
 *  2. Determine evidence profile (for model routing)
 *  3. Build RAG query → retrieve top-8 regulatory chunks
 *  4. Pick model (Sonnet or Opus) based on case complexity
 *  5. Generate ES + EN drafts in parallel
 *  6. Validate required citations present + ban-list passes
 *  7. Insert drafts row (version increments)
 *  8. Advance case status → 'under_review'
 *  9. Return draft row
 *
 * Attorney review gate: drafts.attorney_reviewed starts false.
 * Draft screen enforces this — users see "being reviewed" until M5 sets it true.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { openrouterChat }             from '../_shared/openrouter.ts'
import { pickModel, MODELS }          from '../_shared/pickModel.ts'
import { retrieveChunks, formatContext } from '../_shared/rag.ts'
import {
  buildDraftSystemEs,
  buildDraftUserEs,
} from '../_shared/prompts/draft-appeal-es.ts'
import {
  buildDraftSystemEn,
  buildDraftUserEn,
} from '../_shared/prompts/draft-appeal-en.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Base-framework citations that must appear in every FEMA IA appeal draft. */
const REQUIRED_CITATIONS = [
  '44 CFR § 206.111',
  'IAPPG v1.1',
  'DRRA § 1212',
  '86 Fed. Reg. 31,553',
]

/** Strings that must NOT appear in the Spanish draft. */
const BAN_LIST_ES = [
  /\busted\b/i,
  /\bmóvil\b/i,
  /\bvivienda\b/gi,   // allow in direct regulatory quotes if needed
  /\bestimado usuario\b/i,
  /nuestros servicios/i,
  /le fue negado/i,
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { caseId } = await req.json()
    if (!caseId) return jsonError('caseId required', 400)

    // ── 1. Load case ────────────────────────────────────────────────────────
    const { data: caseRow, error: caseErr } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (caseErr || !caseRow) return jsonError('case not found', 404)

    // ── 2. Load attached evidence ───────────────────────────────────────────
    const { data: evidence } = await supabase
      .from('evidence')
      .select('evidence_id, attached, storage_path')
      .eq('case_id', caseId)
      .eq('attached', true)

    const attachedIds = (evidence ?? []).map((e: { evidence_id: string }) => e.evidence_id)

    // Classify evidence profile for model routing
    const hasDeed    = attachedIds.some((id: string) => id === 'deed')
    const altDocOnly = attachedIds.length > 0 && !hasDeed
    const evidenceProfile = hasDeed ? 'has_deed' : altDocOnly ? 'alt_doc_only' : 'mixed'

    const caseForRouting = { ...caseRow, evidence_profile: evidenceProfile }

    // ── 3. RAG retrieval ────────────────────────────────────────────────────
    // Query is built from parsed letter fields so it adapts to any denial
    // code — not only 120. draft_quality reports whether we actually
    // retrieved code-specific passages or fell back to the base framework.
    const denialCode = caseRow.denial_code ?? 'unknown'
    const denialReasonText = caseRow.denial_reason_text ?? `FEMA denial code ${denialCode}`
    const ragQuery = [
      `FEMA Individual Assistance appeal Puerto Rico`,
      `denial code ${denialCode}`,
      caseRow.denial_reason_text,
      altDocOnly && `alternative documentation sworn affidavit`,
    ].filter(Boolean).join(' ')

    let ragContext = ''
    let draftQuality: 'code_specific' | 'general_framework' = 'general_framework'
    try {
      const chunks = await retrieveChunks(ragQuery, 8)
      if (chunks && chunks.length > 0) {
        ragContext = formatContext(chunks)
        // If any retrieved chunk mentions the denial code explicitly, treat
        // the draft as code-specific; otherwise it is a general-framework
        // draft and attorneys should scrutinize accordingly.
        const codeNeedle = String(denialCode).toLowerCase()
        const mentionsCode = chunks.some((c: { content?: string; chunk?: string; text?: string }) => {
          const body = (c.content ?? c.chunk ?? c.text ?? '').toLowerCase()
          return codeNeedle !== 'unknown' && body.includes(codeNeedle)
        })
        draftQuality = mentionsCode ? 'code_specific' : 'general_framework'
      } else {
        ragContext = FALLBACK_CONTEXT
      }
    } catch (ragErr) {
      // RAG is best-effort — continue with fallback context if embeddings fail
      console.warn('[draftAppeal] RAG failed, proceeding without context:', ragErr)
      ragContext = FALLBACK_CONTEXT
    }

    // ── 4. Pick model ───────────────────────────────────────────────────────
    const model = pickModel(caseForRouting)

    // ── 5. Format vars ──────────────────────────────────────────────────────
    const evidenceSummaryEs = attachedIds.length > 0
      ? formatEvidenceSummaryEs(attachedIds)
      : 'fotografías de la casa y documentos disponibles'

    const evidenceSummaryEn = attachedIds.length > 0
      ? formatEvidenceSummaryEn(attachedIds)
      : 'photographs of the property and available supporting documents'

    const letterDateEs = formatDateEs(caseRow.denial_letter_date)
    const letterDateEn = formatDateEn(caseRow.denial_letter_date)

    const varsEs = {
      applicantName:    caseRow.applicant_name    ?? '[Nombre]',
      disasterCode:     caseRow.disaster_code     ?? 'DR-XXXX-PR',
      disasterName:     caseRow.disaster_name     ?? '[Desastre]',
      denialLetterDate: letterDateEs,
      denialCode:       String(denialCode),
      denialReasonText: denialReasonText,
      evidenceSummary:  evidenceSummaryEs,
      ragContext,
    }
    const varsEn = {
      applicantName:    caseRow.applicant_name    ?? '[Name]',
      disasterCode:     caseRow.disaster_code     ?? 'DR-XXXX-PR',
      disasterName:     caseRow.disaster_name     ?? '[Disaster]',
      denialLetterDate: letterDateEn,
      denialCode:       String(denialCode),
      denialReasonText: denialReasonText,
      evidenceSummary:  evidenceSummaryEn,
      ragContext,
    }

    // ── 6. Generate both drafts in parallel ────────────────────────────────
    const [esResult, enResult] = await Promise.all([
      openrouterChat({
        model,
        max_tokens: 1200,
        messages: [
          { role: 'system', content: buildDraftSystemEs() },
          { role: 'user',   content: buildDraftUserEs(varsEs) },
        ],
      }),
      openrouterChat({
        model,
        max_tokens: 1200,
        messages: [
          { role: 'system', content: buildDraftSystemEn() },
          { role: 'user',   content: buildDraftUserEn(varsEn) },
        ],
      }),
    ])

    const bodyEs = esResult.content
    const bodyEn = enResult.content

    // ── 7. Validate ─────────────────────────────────────────────────────────
    const missingCitations = REQUIRED_CITATIONS.filter(
      (c) => !bodyEn.includes(c) && !bodyEs.includes(c)
    )
    if (missingCitations.length > 0) {
      console.warn('[draftAppeal] Missing citations:', missingCitations)
      // Don't hard-fail — attorney review will catch this.
      // Log for monitoring.
    }

    const banMatches = BAN_LIST_ES.filter((re) => re.test(bodyEs))
    if (banMatches.length > 0) {
      console.warn('[draftAppeal] Ban-list violations in ES draft:', banMatches.map((r) => r.toString()))
    }

    // ── 8. Insert draft row ─────────────────────────────────────────────────
    // Get next version number
    const { data: latest } = await supabase
      .from('drafts')
      .select('version')
      .eq('case_id', caseId)
      .order('version', { ascending: false })
      .limit(1)
    const version = (latest?.[0]?.version ?? 0) + 1

    const { data: draft, error: draftErr } = await supabase
      .from('drafts')
      .insert({
        case_id:       caseId,
        version,
        body_es:       bodyEs,
        body_en:       bodyEn,
        model,
        draft_quality: draftQuality,
      })
      .select()
      .single()

    if (draftErr) throw new Error(`Insert draft failed: ${draftErr.message}`)

    // ── 9. Advance case status → under_review ──────────────────────────────
    await supabase
      .from('cases')
      .update({ status: 'under_review' })
      .eq('id', caseId)

    return new Response(JSON.stringify({
      draftId:      draft.id,
      version:      draft.version,
      model,
      draftQuality,
      citationCheck: {
        required: REQUIRED_CITATIONS,
        missing:  missingCitations,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[draftAppeal]', err)
    return jsonError(String(err), 500)
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function jsonError(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function formatEvidenceSummaryEs(ids: string[]): string {
  const labels: Record<string, string> = {
    photo:               'fotografías de la casa',
    bill:                'recibo de servicios a nombre del solicitante',
    'mayor-letter':      'carta del municipio',
    'neighbor-affidavit': 'declaración jurada de vecino',
    deed:                'escritura o documento de título',
  }
  return ids.map((id) => labels[id] ?? id).join(', ')
}

function formatEvidenceSummaryEn(ids: string[]): string {
  const labels: Record<string, string> = {
    photo:               'photographs of the property',
    bill:                'utility bill in applicant\'s name',
    'mayor-letter':      'letter from municipal government',
    'neighbor-affidavit': 'notarized neighbor affidavit',
    deed:                'deed or title document',
  }
  return ids.map((id) => labels[id] ?? id).join(', ')
}

function formatDateEs(isoDate: string | null): string {
  if (!isoDate) return '[fecha de la carta]'
  try {
    const d = new Date(isoDate + 'T12:00:00Z')
    return d.toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return isoDate
  }
}

function formatDateEn(isoDate: string | null): string {
  if (!isoDate) return '[date of letter]'
  try {
    const d = new Date(isoDate + 'T12:00:00Z')
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return isoDate
  }
}

/**
 * Hard-coded fallback context used when RAG/embeddings are unavailable.
 * Contains the minimum citation text needed for a valid appeal.
 */
const FALLBACK_CONTEXT = `[44-cfr-206-111.txt]
44 CFR § 206.111 defines "ownership" broadly to include persons who hold title, are purchasing under contract, have made a substantial investment, or own the property under applicable state law even if title is held in another form.

[iappg-v1.1-appeals.txt]
IAPPG v1.1 § V.D.1: FEMA accepts sworn neighbor affidavits and municipal letters as primary proof of occupancy and ownership for Puerto Rico disaster declarations.

[drra-1212.txt]
DRRA § 1212 and 86 Fed. Reg. 31,553 (June 14, 2021): FEMA must maintain flexibility regarding documentation, including self-certification by sworn statement when traditional title documents are unavailable. This is especially applicable in Puerto Rico where informal ownership is common.`
