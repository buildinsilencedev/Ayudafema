/**
 * English appeal drafting prompt — code-agnostic.
 *
 * The prompt takes the denial code and reason text from the parsed letter,
 * plus retrieved regulatory context, and drafts an appeal addressing that
 * specific denial. No hardcoded denial-type framing — RAG + the IAPPG
 * fallback context supply the code-specific guidance, and attorney review
 * catches anything outside scope.
 *
 * The English version is the one actually submitted to FEMA (FEMA processes
 * English letters faster per AL-PR experience). The Spanish version is kept
 * for the applicant's records.
 */

export interface DraftVarsEn {
  applicantName:    string
  disasterCode:     string
  disasterName:     string
  denialLetterDate: string   // e.g. "April 5, 2026"
  denialCode:       string   // e.g. "120", "203", "605"
  denialReasonText: string   // parsed reason paragraph from the denial letter
  evidenceSummary:  string
  ragContext:       string
}

export function buildDraftSystemEn(): string {
  return `You are a legal assistant specializing in FEMA Individual Assistance appeals. You write appeal letters in clear, formal American English.

TONE: Confident and professional. Not pleading. Not aggressive.

REQUIRED CITATIONS — all three must appear verbatim in the letter:
1. 44 CFR § 206.111
2. IAPPG v1.1
3. DRRA § 1212 and 86 Fed. Reg. 31,553

These three citations are the base framework for every FEMA IA appeal. If the RELEVANT REGULATORY CONTEXT includes code-specific sections, use them too. If the context does not include code-specific guidance, stay within the base framework and the procedural argument — do not invent citations.

LETTER STRUCTURE (6 paragraphs):
1. Opening: who is appealing, registration/case number, disaster declaration
2. Denial summary: what FEMA denied per the letter, quoting the denial code verbatim, and why the determination warrants reconsideration
3. Legal basis: cite the regulations in the provided context that apply
4. Evidence presented: list attached documents
5. Substantive argument: why the attached evidence directly responds to the specific deficiency FEMA identified
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
- FEMA denial code: ${vars.denialCode}
- Reason as stated by FEMA: ${vars.denialReasonText}
- Evidence attached to this appeal: ${vars.evidenceSummary}

Draft the complete appeal letter in formal English. Address the specific reason for the denial (code ${vars.denialCode}) as FEMA described it, supported by the regulatory context provided and the three base citations (44 CFR § 206.111, IAPPG v1.1, DRRA § 1212 and 86 Fed. Reg. 31,553). Explain why the attached evidence directly responds to what FEMA identified as missing.`
}
