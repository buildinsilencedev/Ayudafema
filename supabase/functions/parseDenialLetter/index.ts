/**
 * parseDenialLetter — Supabase Edge Function
 *
 * POST /functions/v1/parseDenialLetter
 * Auth: Bearer (user JWT)
 * Body: { caseId: string, documentId: string }
 *
 * Flow:
 *  1. Validate inputs + auth
 *  2. Load document row → storage_path
 *  3. Generate 60-min signed URL for the file
 *  4. Download file bytes, base64-encode for vision API
 *  5. Call anthropic/claude-haiku-4.5 via OpenRouter (vision)
 *  6. Parse + validate JSON response
 *  7. Score overallConfidence = min(...field confidences)
 *  8. Update cases row (or mark needs_manual if conf < 0.8)
 *  9. Log attempt to parse_log
 * 10. Return extraction result
 *
 * On any unrecoverable error the case is set to 'needs_manual' so the
 * frontend can route the user to the manual-entry fallback.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { openrouterChat } from '../_shared/openrouter.ts'
import {
  EXTRACT_DENIAL_SYSTEM,
  EXTRACT_DENIAL_USER,
} from '../_shared/prompts/extract-denial.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Threshold below which we route to manual entry. */
const CONF_THRESHOLD = 0.80

/** Fields used to score overall confidence. */
const REQUIRED_FIELDS = ['denialCode', 'letterDate'] as const

interface ExtractionField {
  value: string | null
  confidence: number
}

interface ExtractionResult {
  denialCode:       ExtractionField
  letterDate:       ExtractionField
  applicantName:    ExtractionField
  disasterCode:     ExtractionField
  disasterName:     ExtractionField
  applicantAddress: ExtractionField
  rawText?:         string
  overallConfidence: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  let caseId: string | null = null

  try {
    const body = await req.json()
    caseId     = body.caseId    ?? null
    const documentId: string | null = body.documentId ?? null

    if (!caseId || !documentId) {
      return jsonError('caseId and documentId are required', 400)
    }

    // ── 1. Load document row ──────────────────────────────────────────────
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .select('storage_path, mime_type, kind')
      .eq('id', documentId)
      .eq('case_id', caseId)
      .single()

    if (docErr || !doc) {
      await markNeedsManual(supabase, caseId)
      return jsonError('document not found', 404)
    }

    // ── 2. Signed URL (60 min) ────────────────────────────────────────────
    const bucket = doc.kind === 'denial_letter' ? 'denial-letters' : 'evidence'
    const { data: signed, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(doc.storage_path, 3600)

    if (signErr || !signed?.signedUrl) {
      throw new Error(`Could not sign storage URL: ${signErr?.message}`)
    }

    // ── 3. Fetch file → base64 ────────────────────────────────────────────
    const fileRes  = await fetch(signed.signedUrl)
    if (!fileRes.ok) throw new Error(`Storage fetch ${fileRes.status}`)
    const fileBytes = await fileRes.arrayBuffer()
    const base64    = btoa(String.fromCharCode(...new Uint8Array(fileBytes)))

    // Haiku vision supports image/* natively; PDF is treated as image/jpeg
    // base for now (most denial letters are photos). M4 will add PDF→image
    // conversion for scanned PDFs.
    const mimeForVision = doc.mime_type.startsWith('image/')
      ? doc.mime_type
      : 'image/jpeg'

    // ── 4. Call Haiku 4.5 via vision ──────────────────────────────────────
    const { content, inputTokens, outputTokens } = await openrouterChat({
      model:      'anthropic/claude-haiku-4-5',
      max_tokens: 512,
      messages: [
        { role: 'system', content: EXTRACT_DENIAL_SYSTEM },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeForVision};base64,${base64}` },
            },
            { type: 'text', text: EXTRACT_DENIAL_USER },
          ],
        },
      ],
    })

    // ── 5. Parse + validate JSON ──────────────────────────────────────────
    let extraction: ExtractionResult
    try {
      const raw = JSON.parse(content.trim())

      // Clamp confidences to [0, 1] and normalise missing fields
      const toField = (f: unknown): ExtractionField => {
        if (f && typeof f === 'object' && 'value' in f) {
          const conf = Math.min(1, Math.max(0, Number((f as ExtractionField).confidence ?? 0)))
          return { value: (f as ExtractionField).value ?? null, confidence: conf }
        }
        return { value: null, confidence: 0 }
      }

      extraction = {
        denialCode:       toField(raw.denialCode),
        letterDate:       toField(raw.letterDate),
        applicantName:    toField(raw.applicantName),
        disasterCode:     toField(raw.disasterCode),
        disasterName:     toField(raw.disasterName),
        applicantAddress: toField(raw.applicantAddress),
        overallConfidence: 0,
      }
    } catch (parseErr) {
      throw new Error(`JSON parse failed: ${parseErr}. Raw: ${content.slice(0, 200)}`)
    }

    // Overall confidence = min of the required fields only
    extraction.overallConfidence = Math.min(
      ...REQUIRED_FIELDS.map((k) => extraction[k].confidence)
    )

    // Validate denial code format (3 digits)
    if (extraction.denialCode.value && !/^\d{3}$/.test(extraction.denialCode.value)) {
      extraction.denialCode = { value: null, confidence: 0 }
      extraction.overallConfidence = 0
    }

    // Validate date format
    if (extraction.letterDate.value) {
      const d = new Date(extraction.letterDate.value)
      if (isNaN(d.getTime())) {
        extraction.letterDate = { value: null, confidence: 0 }
        extraction.overallConfidence = 0
      }
    }

    // ── 6. Update case row ────────────────────────────────────────────────
    const highConf = extraction.overallConfidence >= CONF_THRESHOLD
    const newStatus = highConf ? 'evidence' : 'needs_manual'

    await supabase.from('cases').update({
      denial_code:            extraction.denialCode.value,
      denial_letter_date:     extraction.letterDate.value,
      applicant_name:         extraction.applicantName.value,
      disaster_code:          extraction.disasterCode.value,
      disaster_name:          extraction.disasterName.value,
      applicant_address:      extraction.applicantAddress.value,
      status:                 newStatus,
    }).eq('id', caseId)

    // ── 7. Log to parse_log ───────────────────────────────────────────────
    await supabase.from('parse_log').insert({
      case_id:           caseId,
      document_id:       documentId,
      model:             'anthropic/claude-haiku-4-5',
      output:            extraction,
      input_tokens:      inputTokens,
      output_tokens:     outputTokens,
      overall_confidence: extraction.overallConfidence,
    })

    return new Response(JSON.stringify(extraction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    // Unrecoverable — route user to manual entry, log the failure
    if (caseId) {
      await markNeedsManual(supabase, caseId)
      await supabase.from('parse_log').insert({
        case_id:  caseId,
        model:    'anthropic/claude-haiku-4-5',
        error:    String(err),
        overall_confidence: 0,
      }).catch(() => { /* best-effort */ })
    }

    console.error('[parseDenialLetter]', err)
    return jsonError(String(err), 500)
  }
})

// ── Helpers ────────────────────────────────────────────────────────────────────

async function markNeedsManual(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  caseId: string
): Promise<void> {
  await supabase
    .from('cases')
    .update({ status: 'needs_manual' })
    .eq('id', caseId)
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
