/**
 * Terms of service screen.
 * Bilingual (ES/EN).
 * IMPORTANT: Have Ayuda Legal PR's attorney review before launch.
 */

export function Terms({ t, lang }) {
  return (
    <div className="hog-fade pt-8 pb-16">
      {lang === 'es' ? <TermsEs /> : <TermsEn />}
    </div>
  )
}

function TermsEs() {
  return (
    <>
      <h1 className="hog-serif text-[28px] italic mb-2">Términos de uso</h1>
      <p className="text-[12px] mb-8" style={{ color: 'var(--ink-softer)' }}>
        Vigente desde abril de 2026 · Herramienta independiente. No afiliada con FEMA ni con el gobierno federal.
      </p>

      <Section title="¿Qué es esta herramienta?">
        <p>Ayudafema.org es una herramienta gratuita que ayuda a residentes de Puerto Rico a preparar apelaciones de denegaciones de Asistencia Individual de FEMA. La herramienta fue construida por La Mano y es administrada por Ayuda Legal Puerto Rico.</p>
        <p><strong>Esta herramienta no es un servicio legal ni crea una relación abogado-cliente.</strong> Los borradores generados son revisados por abogados de Ayuda Legal PR, pero el acto de enviar la apelación es responsabilidad del usuario.</p>
      </Section>

      <Section title="Uso apropiado">
        <p>Al usar esta herramienta, aceptas:</p>
        <ul>
          <li>Proporcionar información veraz sobre tu caso</li>
          <li>No usar la herramienta para casos fraudulentos o ficticios</li>
          <li>Entender que los borradores son una guía, no asesoramiento legal definitivo</li>
          <li>Revisar el borrador antes de enviarlo a FEMA</li>
        </ul>
      </Section>

      <Section title="Sin garantías">
        <p>La herramienta se ofrece "tal como está". No garantizamos que FEMA apruebe tu apelación. Los resultados dependen de la documentación que presentes y de la decisión de FEMA.</p>
        <p>Los plazos de apelación calculados son orientativos. Verifica el plazo exacto en tu carta de denegación.</p>
      </Section>

      <Section title="Propiedad intelectual">
        <p>El código fuente de esta herramienta es de código abierto (licencia MIT). Los borradores de apelación generados son tuyos — haz con ellos lo que necesites para tu caso.</p>
      </Section>

      <Section title="Cambios">
        <p>Podemos actualizar estos términos. Te notificaremos por correo o mensaje de texto si hay cambios materiales. El uso continuado implica aceptación de los nuevos términos.</p>
      </Section>

      <Section title="Contacto">
        <p>Ayuda Legal Puerto Rico · 1-800-981-5342 · info@ayudalegalpr.org</p>
      </Section>
    </>
  )
}

function TermsEn() {
  return (
    <>
      <h1 className="hog-serif text-[28px] italic mb-2">Terms of use</h1>
      <p className="text-[12px] mb-8" style={{ color: 'var(--ink-softer)' }}>
        Effective April 2026 · Independent tool. Not affiliated with FEMA or the federal government.
      </p>

      <Section title="What is this tool?">
        <p>Ayudafema.org is a free tool that helps Puerto Rico residents prepare appeals of FEMA Individual Assistance denials. The tool was built by La Mano and is operated by Ayuda Legal Puerto Rico.</p>
        <p><strong>This tool is not a legal service and does not create an attorney-client relationship.</strong> Generated drafts are reviewed by Ayuda Legal PR attorneys, but submitting the appeal is the user's responsibility.</p>
      </Section>

      <Section title="Appropriate use">
        <p>By using this tool, you agree to:</p>
        <ul>
          <li>Provide truthful information about your case</li>
          <li>Not use the tool for fraudulent or fictitious claims</li>
          <li>Understand that drafts are a guide, not definitive legal advice</li>
          <li>Review the draft before submitting it to FEMA</li>
        </ul>
      </Section>

      <Section title="No warranties">
        <p>The tool is provided "as is." We do not guarantee that FEMA will approve your appeal. Outcomes depend on the documentation you provide and FEMA's determination.</p>
        <p>Deadline calculations are provided as guidance. Verify the exact deadline on your denial letter.</p>
      </Section>

      <Section title="Intellectual property">
        <p>The source code for this tool is open source (MIT license). Appeal drafts generated are yours — use them as needed for your case.</p>
      </Section>

      <Section title="Changes">
        <p>We may update these terms. We will notify you by email or text message if there are material changes. Continued use constitutes acceptance of the updated terms.</p>
      </Section>

      <Section title="Contact">
        <p>Ayuda Legal Puerto Rico · 1-800-981-5342 · info@ayudalegalpr.org</p>
      </Section>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-[15px] font-medium mb-3" style={{ color: 'var(--ink)' }}>{title}</h2>
      <div className="text-[14px] leading-relaxed space-y-2" style={{ color: 'var(--ink-soft)' }}>
        {children}
      </div>
    </div>
  )
}
