// Demo case — realistic Hurricane Fiona ownership-denial scenario.
//
// @deprecated M2 — screens now receive real case data via `caseData` props
// from `useCase(caseId)`. This file is kept for tests and Storybook only.
// Do not import this into screens — use the prop instead.
//
// `denialLetterDate` is the canonical input; the 60-day appeal deadline is
// computed from it via `lib/deadline.js` at render time, so the "days left"
// counter stays honest as the calendar moves forward.

/**
 * @typedef {Object} DemoCase
 * @property {string} caseId
 * @property {string} applicant
 * @property {string} disasterCode
 * @property {string} disasterName
 * @property {string} denialId             References a playbook under content/denials/
 * @property {string} denialLetterDate     ISO date (YYYY-MM-DD) of the denial letter
 * @property {string} smsPartial           Partially-masked phone for display
 * @property {string} submittedDate        Display-only submitted date for Tracking demo
 * @property {string} expectedDateEs       Display-only expected-response date (es)
 * @property {string} expectedDateEn       Display-only expected-response date (en)
 */

/** @type {DemoCase} */
export const demoCase = {
  caseId: '4671-7214893',
  applicant: 'María R.',
  disasterCode: 'DR-4671-PR',
  disasterName: 'Huracán Fiona (2022)',
  denialId: 'ownership',
  // April 5, 2026 → 60-day appeal window lands on June 4, 2026.
  // With today = April 18, 2026 the counter reads 47 days left.
  denialLetterDate: '2026-04-05',
  smsPartial: '+1 787 ••• •• 42',
  submittedDate: 'April 18, 2026',
  expectedDateEs: 'antes del 17 de julio, 2026',
  expectedDateEn: 'by July 17, 2026',
}
