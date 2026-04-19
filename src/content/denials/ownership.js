// Denial-code playbook: ownership not verified.
//
// This is the most common FEMA IA denial in Puerto Rico. ~35% of PR homes have
// no formal title; FEMA accepts alternative documentation per 44 CFR §206.111
// and DRRA §1212 (86 Fed. Reg. 31,553, June 14, 2021).

/**
 * @typedef {Object} Citation
 * @property {string} code   Short legal code, e.g. "44 CFR § 206.111"
 * @property {string} label  Plain-language label for the citation
 * @property {string} url    Canonical source URL (government or Federal Register)
 */

/**
 * @typedef {Object} DenialPlaybook
 * @property {string}    id
 * @property {string}    denialCodeLabel  FEMA's short reason label (e.g. "Ownership Not Verified")
 * @property {number}    windowDays       Appeal window in calendar days
 * @property {Array<{id: string, hasTemplate?: boolean}>} evidence  Ordered evidence items
 * @property {Citation[]} citations
 */

/** @type {DenialPlaybook} */
export const ownershipDenial = {
  id: 'ownership',
  denialCodeLabel: 'Ownership Not Verified',
  windowDays: 60,
  evidence: [
    { id: 'photo' },
    { id: 'bill' },
    { id: 'mayor-letter', hasTemplate: true },
    { id: 'neighbor-affidavit', hasTemplate: true },
  ],
  citations: [
    {
      code: '44 C.F.R. § 206.111',
      label: 'FEMA Individual Assistance regulations — proof of ownership',
      url: 'https://www.ecfr.gov/current/title-44/chapter-I/subchapter-D/part-206/subpart-D/section-206.111',
    },
    {
      code: 'IAPPG v1.1 §V.D.1',
      label: 'Individual Assistance Program and Policy Guide — ownership verification',
      url: 'https://www.fema.gov/sites/default/files/documents/fema_iappg-1.1.pdf',
    },
    {
      code: 'DRRA §1212; 86 Fed. Reg. 31,553',
      label: 'Disaster Recovery Reform Act — alternative ownership documentation',
      url: 'https://www.federalregister.gov/documents/2021/06/14/2021-12411/individual-assistance-program-equity',
    },
  ],
}
