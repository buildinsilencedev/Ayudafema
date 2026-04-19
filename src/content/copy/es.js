// PR-Spanish copy. All user-facing strings live here.
//
// Register rules (from CLAUDE.md):
// - Use `tú`, not `usted`.
// - "casa" not "vivienda"; "dueño" not "propietario" in casual copy.
// - "celular" not "móvil"; "recibo de luz" not "factura eléctrica".
// - Avoid "estimado usuario", "nuestros servicios", "bienvenido".
//
// Strings marked with `// REVIEW:` should get a PR-native pass before launch.

export const es = {
  partnerName: 'Ayuda Legal PR',
  builtBy: 'Construido por La Mano',
  free: 'Gratuito · Sin fines de lucro',
  demo: 'Prototipo — datos de demostración',
  back: 'Atrás',
  disclaimer: 'Herramienta independiente. No afiliada con FEMA ni con el gobierno federal.',
  skipToContent: 'Saltar al contenido',
  languageSwitch: 'Cambiar a inglés',

  consent: {
    title: 'Guardar tu progreso en este dispositivo',
    body: 'Podemos guardar dónde te quedaste — en este celular, no en internet. Puedes borrarlo cuando quieras.',
    accept: 'Está bien',
    decline: 'No guardar',
  },

  errorBoundary: {
    title: 'Algo salió mal.',
    body: 'Tu progreso está guardado. Puedes intentarlo otra vez.',
    retry: 'Volver a intentar',
  },

  evidence: {
    whyLabel: '¿Por qué?',
    progressLabel: 'evidencia completada',
    items: {
      photo: {
        title: 'Foto de tu casa',
        desc: 'Exterior y cualquier daño. Fotos de tu celular sirven.',
        why: 'Muestra que la casa existe y que tú tienes acceso a ella. FEMA acepta fotos con fecha.',
      },
      bill: {
        title: 'Un recibo con tu nombre y dirección',
        desc: 'Luz, agua, internet, o cualquier cuenta reciente.',
        why: 'Prueba que tú vives en esa casa. No tiene que ser escritura — un recibo con tu nombre basta.',
      },
      'mayor-letter': {
        title: 'Carta del alcalde o junta comunitaria',
        desc: 'Si no tienes recibo, una carta del municipio funciona.',
        why: 'FEMA acepta cartas oficiales del municipio que confirmen que tú vives ahí. Te damos el modelo para pedírsela.',
      },
      'neighbor-affidavit': {
        title: 'Declaración jurada de un vecino',
        desc: 'Un vecino firma diciendo que tú vives ahí. Te damos la plantilla.',
        why: 'Desde 2021, FEMA acepta declaraciones juradas cuando no hay escritura. Esta es tu red de seguridad.',
      },
    },
  },

  landing: {
    eyebrow: 'Apelaciones de FEMA',
    headline: '¿FEMA te negó\nayuda?',
    sub: 'Podemos ayudarte a apelar. Gratis. En 15 minutos, con una foto de tu carta.',
    cta: 'Empezar',
    note: 'Leemos tu carta, preparamos la apelación, y te decimos exactamente qué enviar a FEMA.',
    phoneLabel: '¿Prefieres hablar con alguien?',
    phone: '1-800-981-5342',
  },

  upload: {
    step: 'Paso 1 de 5',
    headline: 'Sube tu carta\nde negación',
    sub: 'Una foto desde tu celular está bien. PDF también.',
    dropTitle: 'Toma una foto o sube un archivo',
    dropSub: 'Lee automáticamente la carta en inglés o español',
    camera: 'Tomar foto',
    upload: 'Subir archivo',
    reassure: 'Tus documentos son privados. Nadie más los ve.',
    demo: 'Usar carta de demostración',
    fileInputLabel: 'Seleccionar carta de negación',
  },

  processing: {
    headline: 'Leyendo tu carta…',
    sub: 'Esto tarda unos 20 segundos.',
    tasks: [
      'Identificando el número de caso',
      'Encontrando la razón de la negación',
      'Calculando el plazo de apelación',
      'Revisando qué evidencia necesitas',
    ],
  },

  diagnosis: {
    step: 'Paso 2 de 5',
    headline: 'Esto es lo\nque encontramos',
    caseLabel: 'Tu caso',
    disasterLabel: 'El desastre',
    reasonLabel: 'Razón de la negación',
    deadlineLabel: 'Plazo para apelar',
    daysLeft: 'días restantes',
    deadlineDate: 'vence el',
    overdue: 'Plazo vencido',
    reasonPlain: 'FEMA dice que no probaste ser dueño de la casa.',
    reasonContext:
      'Esta es la negación más común en Puerto Rico. El 35% de las casas no tienen título formal. Es apelable, y FEMA acepta otras formas de probar que la casa es tuya — no necesitas una escritura.',
    appealableBadge: 'Apelable',
    cta: 'Prepara mi apelación',
  },

  evidenceScreen: {
    step: 'Paso 3 de 5',
    headline: 'Necesitamos\nestas cosas',
    sub: 'Para tu tipo de negación, esta evidencia es lo que convence a FEMA. Te ayudamos con cada una.',
    optional: 'Opcional — pero ayuda',
    addButton: 'Subir',
    done: 'Listo',
    template: 'Ver plantilla',
    cta: 'Lo tengo todo',
    skipLater: 'Puedo subirlo más tarde',
  },

  draft: {
    step: 'Paso 4 de 5',
    headline: 'Tu apelación\nestá lista',
    // REVIEW: "Revisada por un abogado" is aspirational — the badge only shows
    // when the underlying template has attorneyReviewed === true. Confirm the
    // phrasing once the review workflow is in place.
    sub: 'Revisada por un abogado de Ayuda Legal PR. Lista para enviar a FEMA.',
    reviewBadge: 'Revisado por abogado',
    draftBadge: 'Borrador',
    previewLabel: 'Vista previa de la carta',
    letterAriaLabel: 'Borrador de carta de apelación',
    switchTo: 'Ver en inglés',
    cta: 'Enviar a FEMA',
    disclaimer:
      'La apelación se envía en inglés porque FEMA procesa más rápido en inglés. Guardamos la versión en español para ti.',
  },

  submit: {
    step: 'Paso 5 de 5',
    headline: 'Envía la apelación\na FEMA',
    sub: 'Tres maneras. Escoge la que te sirva.',
    methods: [
      {
        title: 'Por internet',
        badge: 'Más rápido',
        steps: [
          'Entra a disasterassistance.gov',
          'Inicia sesión con tu cuenta',
          'Ve a "Correspondence" (Correspondencia)',
          'Sube el archivo que te damos',
          'Toca "Submit"',
        ],
        cta: 'Descargar archivo',
      },
      {
        title: 'Por correo',
        badge: 'Si prefieres papel',
        steps: [
          'Imprime la carta y la evidencia',
          'Métela en un sobre con la etiqueta que te damos',
          'Llévala al correo antes del plazo',
        ],
        cta: 'Descargar sobre y etiqueta',
      },
      {
        title: 'Por fax',
        badge: 'Opción tradicional',
        steps: [
          'Usa el fax del Centro de Recuperación más cercano',
          'El número de fax viene en el archivo que te damos',
        ],
        cta: 'Ver números de fax',
      },
    ],
    confirm: 'Ya la envié',
    help: '¿Necesitas ayuda? Llámanos: 1-800-981-5342',
  },

  tracking: {
    step: 'Listo',
    headline: 'Enviado',
    sub: 'FEMA tiene 90 días para responder. Te avisamos por mensaje de texto cuando haya novedades.',
    submittedLabel: 'Enviado el',
    expectedLabel: 'Respuesta esperada',
    caseLabel: 'Tu número de caso',
    smsLabel: 'Recordatorios por SMS',
    nextSteps: '¿Qué sigue?',
    stepsList: [
      'FEMA revisa la apelación (30–90 días)',
      'Si aprueban, te envían el dinero',
      'Si piden más información, te avisamos',
      'Si niegan otra vez, podemos preparar una segunda apelación',
    ],
    another: 'Ayudar a alguien más',
  },
}
