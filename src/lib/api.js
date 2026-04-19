/**
 * src/lib/api.js
 *
 * Typed wrappers around Supabase. Every function returns a Promise.
 * Components never call supabase directly — they go through here so
 * the seam to backend is a single, testable surface.
 *
 * M2 stubs: requestDraft returns static template body.
 * M3 wires: uploadDenialLetter + invokeParse.
 * M4 wires: requestDraft calls the real draftAppeal edge function.
 */

import { supabase } from './supabase.js'
import { appealOwnership } from '../content/templates/appeal-ownership.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Throw if Supabase returned an error. */
function assertOk({ error, data }, label) {
  if (error) throw new Error(`[api/${label}] ${error.message}`)
  return data
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Send a magic-link email. On click the user is redirected to
 * `${VITE_SITE_URL}/#/landing?auth=callback`.
 * @param {string} email
 */
export async function signInWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${import.meta.env.VITE_SITE_URL ?? ''}/#/landing?auth=callback`,
    },
  })
  if (error) throw new Error(`[api/signInWithEmail] ${error.message}`)
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(`[api/signOut] ${error.message}`)
}

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * Fetch the current user's profile row.
 * @returns {Promise<import('../types.js').Profile | null>}
 */
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error && error.code !== 'PGRST116') throw new Error(`[api/getProfile] ${error.message}`)
  return data ?? null
}

// ─── Cases ───────────────────────────────────────────────────────────────────

/**
 * @param {string} caseId
 * @returns {Promise<import('../types.js').Case>}
 */
export async function getCase(caseId) {
  return assertOk(
    await supabase.from('cases').select('*').eq('id', caseId).single(),
    'getCase'
  )
}

/**
 * Create a new intake case for the current user.
 * @returns {Promise<import('../types.js').Case>}
 */
export async function createCase() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('[api/createCase] not authenticated')
  return assertOk(
    await supabase.from('cases').insert({ user_id: user.id }).select().single(),
    'createCase'
  )
}

/**
 * @param {string} caseId
 * @param {Partial<import('../types.js').Case>} patch
 */
export async function updateCase(caseId, patch) {
  return assertOk(
    await supabase.from('cases').update(patch).eq('id', caseId).select().single(),
    'updateCase'
  )
}

/**
 * Populate case from manual entry form.
 * Advances status from 'intake' or 'needs_manual' → 'evidence'.
 *
 * @param {string} caseId
 * @param {{ denialCode: string, denialLetterDate: string, applicantName?: string, disasterCode?: string, disasterName?: string }} fields
 */
export async function manualEntry(caseId, fields) {
  return assertOk(
    await supabase
      .from('cases')
      .update({
        denial_code:         fields.denialCode,
        denial_letter_date:  fields.denialLetterDate,
        applicant_name:      fields.applicantName ?? null,
        disaster_code:       fields.disasterCode ?? null,
        disaster_name:       fields.disasterName ?? null,
        status:              'evidence',
      })
      .eq('id', caseId)
      .select()
      .single(),
    'manualEntry'
  )
}

// ─── Evidence ────────────────────────────────────────────────────────────────

/**
 * @param {string} caseId
 * @returns {Promise<import('../types.js').Evidence[]>}
 */
export async function listEvidence(caseId) {
  return assertOk(
    await supabase.from('evidence').select('*').eq('case_id', caseId),
    'listEvidence'
  )
}

/**
 * @param {string} caseId
 * @param {string} evidenceId  matches ownershipDenial.evidence[i].id
 * @param {boolean} attached
 */
export async function toggleEvidence(caseId, evidenceId, attached) {
  return assertOk(
    await supabase
      .from('evidence')
      .upsert({ case_id: caseId, evidence_id: evidenceId, attached })
      .select()
      .single(),
    'toggleEvidence'
  )
}

// ─── Documents / Upload ──────────────────────────────────────────────────────

/**
 * Upload a file to the appropriate bucket and insert a documents row.
 *
 * @param {string} caseId
 * @param {'denial_letter' | 'evidence' | 'appeal_draft'} kind
 * @param {File} file
 * @param {string} [evidenceId]
 * @returns {Promise<import('../types.js').Document>}
 */
export async function uploadFile(caseId, kind, file, evidenceId) {
  const bucket = kind === 'denial_letter' ? 'denial-letters' : 'evidence'
  const ext    = file.name.split('.').pop()
  const path   = `${caseId}/${kind}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`[api/uploadFile] storage: ${uploadError.message}`)

  return assertOk(
    await supabase
      .from('documents')
      .insert({
        case_id:      caseId,
        kind,
        evidence_id:  evidenceId ?? null,
        storage_path: path,
        mime_type:    file.type,
        size_bytes:   file.size,
      })
      .select()
      .single(),
    'uploadFile/insert'
  )
}

/**
 * Invoke the parseDenialLetter edge function.
 * After this, subscribe to realtime on cases to watch for
 * status → 'evidence' or 'needs_manual'.
 *
 * @param {string} caseId
 * @param {string} documentId
 */
export async function invokeParse(caseId, documentId) {
  const { error } = await supabase.functions.invoke('parseDenialLetter', {
    body: { caseId, documentId },
  })
  if (error) throw new Error(`[api/invokeParse] ${error.message}`)
}

// ─── Drafts ──────────────────────────────────────────────────────────────────

/**
 * Get the latest draft for a case (or a specific version).
 *
 * @param {string} caseId
 * @param {number} [version]  if omitted, returns highest version
 * @returns {Promise<import('../types.js').Draft | null>}
 */
export async function getDraft(caseId, version) {
  let q = supabase.from('drafts').select('*').eq('case_id', caseId)
  if (version != null) {
    q = q.eq('version', version)
  } else {
    q = q.order('version', { ascending: false }).limit(1)
  }
  const { data, error } = await q
  if (error) throw new Error(`[api/getDraft] ${error.message}`)
  return data?.[0] ?? null
}

/**
 * Request a draft by invoking the draftAppeal edge function.
 *
 * The edge function generates ES + EN appeal bodies with real LLM
 * (Sonnet or Opus via OpenRouter), RAG context from knowledge_base,
 * and citation validation. Advances case status → 'under_review'.
 *
 * Falls back to the static template if the edge function is
 * unavailable (e.g. no Supabase project in dev / integration tests).
 *
 * @param {string} caseId
 * @returns {Promise<import('../types.js').Draft>}
 */
export async function requestDraft(caseId) {
  // Invoke the real draftAppeal edge function
  const { data, error } = await supabase.functions.invoke('draftAppeal', {
    body: { caseId },
  })

  if (error) {
    // Edge function unavailable — fall back to static template so
    // the Draft screen still renders in dev/demo mode.
    console.warn('[api/requestDraft] draftAppeal unavailable, using static stub:', error.message)
    return _requestDraftStub(caseId)
  }

  // Edge function succeeded — fetch the newly inserted draft row
  if (data?.draftId) {
    const draft = await getDraft(caseId)
    if (draft) return draft
  }

  // Fallback if we can't retrieve the newly inserted row
  return _requestDraftStub(caseId)
}

/**
 * Static-template fallback for dev/demo/test environments.
 * @internal
 */
async function _requestDraftStub(caseId) {
  const caseRow = await getCase(caseId)
  const vars = {
    caseId:       caseRow.id.slice(0, 8).toUpperCase(),
    applicant:    caseRow.applicant_name ?? '[Nombre]',
    disasterCode: caseRow.disaster_code  ?? 'DR-XXXX-PR',
    disasterName: caseRow.disaster_name  ?? '[Nombre del desastre]',
  }
  const existing = await getDraft(caseId)
  const version  = (existing?.version ?? 0) + 1

  return assertOk(
    await supabase
      .from('drafts')
      .insert({
        case_id:  caseId,
        version,
        body_es:  appealOwnership.es(vars),
        body_en:  appealOwnership.en(vars),
        model:    'static-stub',
      })
      .select()
      .single(),
    'requestDraft/stub'
  )
}

// ─── Submissions ─────────────────────────────────────────────────────────────

/**
 * @param {string} caseId
 * @param {{ method: string, referenceNumber?: string, submittedAt: string }} opts
 */
export async function reportSubmission(caseId, { method, referenceNumber, submittedAt }) {
  // Insert submission record + advance case status
  await assertOk(
    await supabase
      .from('submissions')
      .insert({ case_id: caseId, method, reference_number: referenceNumber ?? null, submitted_at: submittedAt })
      .select()
      .single(),
    'reportSubmission/insert'
  )
  return updateCase(caseId, { status: 'submitted' })
}
