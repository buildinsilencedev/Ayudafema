/**
 * PR-Spanish appeal drafting prompt — Code 120 (Ownership Not Verified).
 *
 * Register rules (from CLAUDE.md + pr-plain-spanish-guide.txt):
 * - tú form, not usted
 * - "casa" not "vivienda"; "dueño" not "propietario" in body
 * - "celular" not "móvil"; "recibo de luz" not "factura eléctrica"
 * - Ban list enforced in system prompt
 * - Required citations embedded verbatim
 * - 6-paragraph structure for code 120
 */

export interface DraftVarsEs {
  applicantName:    string
  disasterCode:     string
  disasterName:     string
  denialLetterDate: string   // e.g. "5 de abril de 2026"
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
2. IAPPG v1.1 § V.D.1
3. DRRA § 1212 y 86 Fed. Reg. 31,553

ESTRUCTURA DE LA CARTA (6 párrafos):
1. Identificación y propósito: quién apela, número de caso, desastre
2. Resumen de la negación: qué negó FEMA y por qué es incorrecto
3. Base legal: citar los reglamentos que permiten documentación alternativa
4. Evidencia presentada: listar los documentos que se adjuntan
5. Argumento sustantivo: por qué la evidencia adjunta satisface los requisitos
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
- Motivo de negación: Código 120 — Titularidad no verificada
- Evidencia adjunta a esta apelación: ${vars.evidenceSummary}

Redacta la carta de apelación completa en español puertorriqueño. La carta debe incluir las tres citas reglamentarias requeridas (44 CFR § 206.111, IAPPG v1.1 § V.D.1, DRRA § 1212 y 86 Fed. Reg. 31,553) y explicar por qué la evidencia adjunta demuestra que ${vars.applicantName} es dueño de su casa.`
}
