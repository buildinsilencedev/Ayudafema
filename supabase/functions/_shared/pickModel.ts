/**
 * Model routing for appeal drafting.
 *
 * Decision tree (per CLAUDE.md):
 *  - Haiku 4.5  → extraction / parsing only (not used here)
 *  - Sonnet 4.6 → standard ownership appeal (clean first-time case)
 *  - Opus 4.7   → complex cases: prior appeals, alt-doc-only, edge ownership
 *
 * "Complex" is defined conservatively — err toward Opus when in doubt,
 * because a defensible appeal is worth the extra cost.
 */

export interface CaseRow {
  denial_code:        string | null
  prior_appeal_count?: number | null
  /** Derived field — set by draftAppeal before calling pickModel */
  evidence_profile?:  'has_deed' | 'alt_doc_only' | 'mixed' | null
}

/** Locked model strings — match OpenRouter identifiers exactly. */
export const MODELS = {
  haiku:  'anthropic/claude-haiku-4-5',
  sonnet: 'anthropic/claude-sonnet-4-6',
  opus:   'anthropic/claude-opus-4-5',
} as const

export type ModelId = typeof MODELS[keyof typeof MODELS]

/**
 * Pick the appropriate model for a given case.
 *
 * @param caseRow  Postgres case row (relevant fields only)
 * @returns OpenRouter model identifier
 */
export function pickModel(caseRow: CaseRow): ModelId {
  const priorAppeals = caseRow.prior_appeal_count ?? 0
  const altDocOnly   = caseRow.evidence_profile === 'alt_doc_only'

  // Complex conditions → Opus
  if (priorAppeals > 0)  return MODELS.opus
  if (altDocOnly)        return MODELS.opus
  if (caseRow.denial_code !== '120') return MODELS.opus  // non-ownership = less routine

  // Standard first-time code-120 appeal → Sonnet
  return MODELS.sonnet
}
