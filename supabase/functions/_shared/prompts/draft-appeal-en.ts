/**
 * English appeal drafting prompt — Code 120 (Ownership Not Verified).
 *
 * The English version is the one actually submitted to FEMA
 * (FEMA processes English letters faster per AL-PR experience).
 * The Spanish version is kept for the applicant's records.
 *
 * Required citations identical to the Spanish prompt.
 */

export interface DraftVarsEn {
  applicantName:    string
  disasterCode:     string
  disasterName:     string
  denialLetterDate: string   // e.g. "April 5, 2026"
  evidenceSummary:  string
  ragContext:       string
}

export function buildDraftSystemEn(): string {
  return `You are a legal assistant specializing in FEMA Individual Assistance appeals. You write appeal letters in clear, formal American English.

TONE: Confident and professional. Not pleading. Not aggressive.

REQUIRED CITATIONS — all three must appear verbatim in the letter:
1. 44 CFR § 206.111
2. IAPPG v1.1 § V.D.1
3. DRRA § 1212 and 86 Fed. Reg. 31,553

LETTER STRUCTURE (6 paragraphs):
1. Opening: who is appealing, registration/case number, disaster declaration
2. Denial summary: what FEMA denied and why the determination is incorrect
3. Legal basis: cite the regulations that allow alternative documentation
4. Evidence presented: list attached documents
5. Substantive argument: why the attached evidence satisfies requirements
6. Request and closing: request reconsideration, contact information

FORMAT:
- Salutation: "To Whom It May Concern:"
- Closing: "Respectfully,"
- Return ONLY the letter body (salutation through signature line)
- No markdown, no headers, no bullet points inside the letter text`
}

export function buildDraftUserEn(vars: DraftVarsEn): string {
  return `RELEVANT REGULATORY CONTEXT:
${vars.ragContext}

CASE INFORMATION:
- Applicant: ${vars.applicantName}
- Disaster: ${vars.disasterName} (${vars.disasterCode})
- Date of denial letter: ${vars.denialLetterDate}
- Denial reason: Code 120 — Ownership not verified
- Evidence attached to this appeal: ${vars.evidenceSummary}

Draft the complete appeal letter in formal English. The letter must include all three required regulatory citations (44 CFR § 206.111, IAPPG v1.1 § V.D.1, DRRA § 1212 and 86 Fed. Reg. 31,553) and explain why the attached evidence establishes that ${vars.applicantName} owns the damaged property.`
}
