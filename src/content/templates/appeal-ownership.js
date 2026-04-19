// Appeal template for "ownership not verified" denials.
//
// CLAUDE.md rule (non-negotiable): "Every appeal draft must be attorney-
// reviewed before a user is shown 'ready to send.' The 'attorney-reviewed'
// badge is only added after actual Ayuda Legal (or partner attorney) signoff."
//
// `attorneyReviewed` is the enforcement flag. `components/Letter.jsx` only
// renders the reviewed badge when this is true. Do NOT flip this to true
// without a recorded signoff (reviewedBy + reviewedAt populated).

/**
 * @typedef {Object} AppealTemplate
 * @property {string}  id
 * @property {boolean} attorneyReviewed
 * @property {?string} reviewedBy            Attorney name / bar number once signed off
 * @property {?string} reviewedAt            ISO timestamp of signoff
 * @property {string[]} citationIds          IDs of citations from the denial playbook
 * @property {(vars: AppealVars) => string} es
 * @property {(vars: AppealVars) => string} en
 */

/**
 * @typedef {Object} AppealVars
 * @property {string} caseId
 * @property {string} applicant
 * @property {string} disasterCode
 * @property {string} disasterName
 */

/** @type {AppealTemplate} */
export const appealOwnership = {
  id: 'appeal-ownership-v1',
  attorneyReviewed: false,
  reviewedBy: null,
  reviewedAt: null,
  citationIds: ['44 C.F.R. § 206.111', 'IAPPG v1.1 §V.D.1', 'DRRA §1212; 86 Fed. Reg. 31,553'],

  en: ({ caseId, applicant, disasterCode, disasterName }) => `Registration Number: ${caseId}

U.S. Department of Homeland Security
Federal Emergency Management Agency
National Processing Service Center
P.O. Box 10055
Hyattsville, MD 20782-7055

Re:  Appeal of Ineligibility Determination
     Disaster: ${disasterCode} — ${disasterName}
     Applicant: ${applicant}
     Denial Reason: Ownership Not Verified

Dear FEMA Appeals Officer:

I am writing to appeal FEMA's determination that I
have not established ownership of my primary residence
at the address of record. I respectfully request that
this determination be reversed based on the supporting
documentation enclosed herewith.

The property in question has been in my family since
1961, passed to me upon the death of my father in
2014. No formal transfer of title was executed at that
time, consistent with customary practice for intra-
family transfers in rural Puerto Rico. As recognized
in FEMA's 2021 guidance on informal homeownership
(DRRA §1212; 86 Fed. Reg. 31,553), alternative
documentation is sufficient to establish ownership
where a formal deed is unavailable.

In support of this appeal I enclose:

    1. Photographs of the residence showing exterior
       and storm-related damage, timestamped.
    2. Electric service bill in the applicant's name
       at the address of record, dated March 2026.
    3. Letter from the Municipal Office of Yabucoa
       confirming continuous residence at the address.
    4. Sworn statement from adjacent neighbor,
       notarized, attesting to ownership and occupancy
       since 2014.

This documentation is consistent with the categories
of proof FEMA is authorized to accept under 44 C.F.R.
§ 206.111 and the Individual Assistance Program and
Policy Guide (IAPPG) v1.1, §V.D.1.

I respectfully request that the determination of
ineligibility be reversed and that my application be
restored to active review for Housing Assistance
under the Individuals and Households Program.

Respectfully submitted,

___________________________
${applicant}
Date: ____________________

Enclosures: (4)
cc: Ayuda Legal Puerto Rico`,

  es: ({ caseId, applicant, disasterCode, disasterName }) => `Número de registro: ${caseId}

Departamento de Seguridad Nacional de los EE. UU.
Agencia Federal para el Manejo de Emergencias (FEMA)
National Processing Service Center
P.O. Box 10055
Hyattsville, MD 20782-7055

Asunto:  Apelación de determinación de inelegibilidad
         Desastre: ${disasterCode} — ${disasterName}
         Solicitante: ${applicant}
         Razón de negación: Titularidad no verificada

Estimado oficial de apelaciones de FEMA:

Escribo para apelar la determinación de FEMA según la
cual no he establecido la titularidad de mi residencia
principal en la dirección registrada. Respetuosamente
solicito que se revoque dicha determinación con base
en la documentación adjunta.

La propiedad en cuestión ha estado en mi familia desde
1961 y pasó a mi nombre al fallecimiento de mi padre
en 2014. No se ejecutó un traspaso formal del título
en ese momento, conforme a la práctica consuetudinaria
para transferencias intrafamiliares en zonas rurales
de Puerto Rico. Como lo reconoce la guía de FEMA
de 2021 sobre titularidad informal (DRRA §1212;
86 Fed. Reg. 31,553), se acepta documentación
alternativa cuando no existe una escritura formal.

En apoyo de esta apelación incluyo:

    1. Fotografías de la residencia mostrando el
       exterior y los daños por el huracán, con fecha.
    2. Recibo de servicio eléctrico a nombre de la
       solicitante en la dirección registrada,
       marzo de 2026.
    3. Carta de la Oficina Municipal de Yabucoa que
       confirma residencia continua en la dirección.
    4. Declaración jurada de vecino colindante,
       notarizada, que da fe de la titularidad y
       ocupación desde 2014.

Esta documentación es consistente con las categorías
de prueba que FEMA está autorizada a aceptar bajo
44 C.F.R. § 206.111 y la Guía de Programa y Política
de Asistencia Individual (IAPPG) v1.1, §V.D.1.

Solicito respetuosamente que se revoque la
determinación de inelegibilidad y que mi solicitud
sea restaurada a revisión activa bajo el Programa
de Individuos y Hogares.

Respetuosamente,

___________________________
${applicant}
Fecha: ____________________

Anexos: (4)
cc: Ayuda Legal Puerto Rico`,
}
