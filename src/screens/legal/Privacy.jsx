/**
 * Privacy policy screen.
 * Bilingual (ES/EN) — language follows the app's active lang param.
 * Linked from Footer on every screen.
 *
 * IMPORTANT: This copy is a good-faith draft. Have Ayuda Legal PR's
 * attorney review before launch (M8 pre-ship checklist item).
 */

export function Privacy({ t, lang }) {
  return (
    <div className="hog-fade pt-8 pb-16 prose-legal">
      {lang === 'es' ? <PrivacyEs /> : <PrivacyEn />}
    </div>
  )
}

function PrivacyEs() {
  return (
    <>
      <h1 className="hog-serif text-[28px] italic mb-2">Política de privacidad</h1>
      <p className="text-[12px] mb-8" style={{ color: 'var(--ink-softer)' }}>
        Vigente desde abril de 2026 · Herramienta independiente. No afiliada con FEMA ni con el gobierno federal.
      </p>

      <Section title="¿Qué información guardamos?">
        <p>Solo guardamos lo necesario para preparar tu apelación:</p>
        <ul>
          <li>Tu correo electrónico (si decides crear una cuenta)</li>
          <li>El número de tu celular (si aceptas recibir recordatorios)</li>
          <li>Los detalles de tu carta de negación de FEMA (código, fecha, nombre)</li>
          <li>Las fotos o documentos que subas como evidencia</li>
          <li>El borrador de tu apelación</li>
        </ul>
        <p>No guardamos contraseñas. No vendemos tu información. No compartimos tus datos con terceros, excepto lo estrictamente necesario para operar el servicio (ver abajo).</p>
      </Section>

      <Section title="¿Cómo usamos tu información?">
        <ul>
          <li>Para preparar el borrador de tu apelación</li>
          <li>Para que un abogado de Ayuda Legal PR revise la apelación</li>
          <li>Para enviarte recordatorios del plazo por mensaje de texto (solo si aceptas)</li>
          <li>Para guardar el historial de tu caso durante 90 días</li>
        </ul>
      </Section>

      <Section title="¿Quién ve mis datos?">
        <ul>
          <li><strong>Los abogados de Ayuda Legal PR</strong> — revisan los borradores antes de que los veas</li>
          <li><strong>Supabase</strong> — base de datos y almacenamiento (servidores en EE.UU.)</li>
          <li><strong>Twilio</strong> — envío de mensajes de texto</li>
          <li><strong>OpenRouter / Anthropic</strong> — procesamiento de imágenes y generación del borrador</li>
        </ul>
        <p>Ningún tercero recibe tu información para fines publicitarios.</p>
      </Section>

      <Section title="¿Por cuánto tiempo?">
        <p>Guardamos tu información por <strong>90 días</strong> después de que tu caso se cierre (aprobado, negado, o archivado). Después, borramos todo automáticamente, incluyendo los archivos que subiste.</p>
        <p>Puedes pedir que borren tu información antes escribiendo a privacidad@ayudalegalpr.org.</p>
      </Section>

      <Section title="Tus derechos">
        <p>Tienes derecho a:</p>
        <ul>
          <li>Ver qué información tenemos sobre ti</li>
          <li>Pedir que corrijan información incorrecta</li>
          <li>Pedir que borren toda tu información</li>
          <li>Dejar de recibir mensajes de texto respondiendo STOP</li>
        </ul>
        <p>Para ejercer estos derechos: privacidad@ayudalegalpr.org o 1-800-981-5342.</p>
      </Section>

      <Section title="Seguridad">
        <p>Todos los datos se transmiten con cifrado HTTPS. Los archivos se guardan cifrados. Las fotos de tu carta de negación solo son accesibles por ti y los abogados revisores.</p>
      </Section>

      <Section title="Aviso legal">
        <p>Esta herramienta te ayuda a preparar documentos. No es asesoramiento legal ni representa una relación abogado-cliente. Para asesoramiento legal directo, llama a Ayuda Legal PR: 1-800-981-5342.</p>
      </Section>
    </>
  )
}

function PrivacyEn() {
  return (
    <>
      <h1 className="hog-serif text-[28px] italic mb-2">Privacy policy</h1>
      <p className="text-[12px] mb-8" style={{ color: 'var(--ink-softer)' }}>
        Effective April 2026 · Independent tool. Not affiliated with FEMA or the federal government.
      </p>

      <Section title="What information do we collect?">
        <p>We only collect what is needed to prepare your appeal:</p>
        <ul>
          <li>Your email address (if you create an account)</li>
          <li>Your phone number (if you opt into text reminders)</li>
          <li>Details from your FEMA denial letter (code, date, name)</li>
          <li>Photos or documents you upload as evidence</li>
          <li>Your appeal draft</li>
        </ul>
        <p>We do not store passwords. We do not sell your information. We do not share your data with third parties except as strictly required to operate the service (see below).</p>
      </Section>

      <Section title="How do we use it?">
        <ul>
          <li>To generate your appeal draft</li>
          <li>For an Ayuda Legal PR attorney to review the draft</li>
          <li>To send deadline reminders by text message (only if you opt in)</li>
          <li>To retain your case record for 90 days</li>
        </ul>
      </Section>

      <Section title="Who sees my data?">
        <ul>
          <li><strong>Ayuda Legal PR attorneys</strong> — review drafts before you see them</li>
          <li><strong>Supabase</strong> — database and file storage (US servers)</li>
          <li><strong>Twilio</strong> — text message delivery</li>
          <li><strong>OpenRouter / Anthropic</strong> — image processing and draft generation</li>
        </ul>
        <p>No third party receives your information for advertising purposes.</p>
      </Section>

      <Section title="How long?">
        <p>We retain your information for <strong>90 days</strong> after your case closes (approved, denied, or archived). After that, everything is automatically deleted, including uploaded files.</p>
        <p>You can request deletion earlier by writing to privacy@ayudalegalpr.org.</p>
      </Section>

      <Section title="Your rights">
        <p>You have the right to:</p>
        <ul>
          <li>Access the information we hold about you</li>
          <li>Request correction of incorrect information</li>
          <li>Request deletion of all your information</li>
          <li>Stop text messages at any time by replying STOP</li>
        </ul>
        <p>To exercise these rights: privacy@ayudalegalpr.org or 1-800-981-5342.</p>
      </Section>

      <Section title="Security">
        <p>All data is transmitted over HTTPS. Files are stored encrypted. Your denial letter photos are only accessible to you and the reviewing attorneys.</p>
      </Section>

      <Section title="Legal disclaimer">
        <p>This tool helps you prepare documents. It is not legal advice and does not create an attorney-client relationship. For direct legal assistance, call Ayuda Legal PR: 1-800-981-5342.</p>
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
