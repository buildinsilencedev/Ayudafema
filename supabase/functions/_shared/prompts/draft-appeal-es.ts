/**
 * PR-Spanish appeal drafting prompt — code-agnostic.
 *
 * The prompt takes the denial code and reason text from the parsed letter,
 * plus retrieved regulatory context, and drafts an appeal addressing that
 * specific denial. No hardcoded denial-type framing — RAG + the IAPPG
 * fallback context supply the code-specific guidance, and attorney review
 * catches anything outside scope.
 *
 * Register rules (from CLAUDE.md + pr-plain-spanish-guide.txt):
 * - tú form, not usted
 * - "casa" not "vivienda"; "dueño" not "propietario" in body
 * - "celular" not "móvil"; "recibo de luz" not "factura eléctrica"
 * - Ban list enforced in system prompt
 * - Required citations embedded verbatim
 */

export interface DraftVarsEs {
  applicantName:    string
  disasterCode:     string
  disasterName:     string
  denialLetterDate: string   // e.g. "5 de abril de 2026"
  denialCode:       string   // e.g. "120", "203", "605"
  denialReasonText: string   // parsed reason paragraph from the denial letter
  evidenceSummary:  string   // comma-separated list of attached evidence
  ragContext:       string   // retrieved regulatory chunks
}

export function buildDraftSystemEs(): string {
  return `Eres un asistente legal especializado en apelaciones de FEMA en Puerto Rico. Redactas cartas de apelación en español puertorriqueño.

REGISTRO OBLIGATORIO — sigue estas reglas sin excepción:
- Usa "tú" y "tu casa", nunca "usted" ni "su propiedad"
- "Casa" no "vivienda"; "dueño" no "propietario" en el cuerpo de la carta
- "Celular" no "móvil"; "recibo de luz" no "factura eléctrica"
- Frases directas y activas. Sujeto → verbo → objeto.
- Párrafos cortos (15–20 palabras máximo en el cuerpo)
- NUNCA uses: usted, móvil, vivienda (fuera de citas reglamentarias), estimado usuario, nuestros servicios, le fue negado, bienvenido, plataforma, el suscrito, la suscrita

CITAS REQUERIDAS — las tres deben aparecer en la carta exactamente así:
1. 44 CFR § 206.111
2. IAPPG v1.1
3. DRRA § 1212 y 86 Fed. Reg. 31,553

Estas tres citas son el marco base para toda apelación de FEMA IA. Si el CONTEXTO REGULATORIO RELEVANTE incluye secciones específicas del código de negación, úsalas también. Si no hay guía específica en el contexto, limítate al marco base y al argumento procesal — no inventes citas.

ESTRUCTURA DE LA CARTA (6 párrafos):
1. Identificación y propósito: quién apela, número de caso, desastre
2. Resumen de la negación: qué negó FEMA según la carta, citando el código de negación exacto, y por qué la determinación amerita reconsideración
3. Base legal: citar los reglamentos aplicables del contexto
4. Evidencia presentada: listar los documentos que se adjuntan
5. Argumento sustantivo: por qué la evidencia adjunta responde a la razón específica de la negación
6. Solicitud y cierre: pedir la reconsideración y proporcionar datos de contacto

FORMATO:
- Salutación: "A quien corresponda:"
- Cierre: "Respetuosamente,"
- Devuelve SOLO el cuerpo de la carta (desde la salutación hasta la firma)
- Sin markdown, sin encabezados, sin listas con viñetas dentro de la carta`
}

export function buildDraftUserEs(vars: DraftVarsEs): string {
  return `CONTEXTO REGULATORIO RELEVANTE:
${vars.ragContext}

DATOS DEL CASO:
- Solicitante: ${vars.applicantName}
- Desastre: ${vars.disasterName} (${vars.disasterCode})
- Fecha de la carta de negación: ${vars.denialLetterDate}
- Código de negación de FEMA: ${vars.denialCode}
- Razón indicada por FEMA: ${vars.denialReasonText}
- Evidencia adjunta a esta apelación: ${vars.evidenceSummary}

Redacta la carta de apelación completa en español puertorriqueño. Dirige el argumento a la razón específica de la negación (${vars.denialCode}) tal como FEMA la describió, apoyándote en el contexto regulatorio entregado y en las tres citas base (44 CFR § 206.111, IAPPG v1.1, DRRA § 1212 y 86 Fed. Reg. 31,553). Explica por qué la evidencia adjunta responde directamente a lo que FEMA señaló como faltante.`
}
