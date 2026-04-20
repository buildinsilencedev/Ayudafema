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
  crisisLine: 'Crisis o emergencia: 911 · línea en español 988',
  skipToContent: 'Saltar al contenido',
  languageSwitch: 'Cambiar a inglés',
  needHelp: '¿Necesitas otra ayuda?',
  needHelpSub: 'Comida, refugio, o estás en crisis — te podemos mostrar dónde llamar.',

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
    manualEntry: 'Escribir los datos a mano',
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

  login: {
    step: 'Tu cuenta',
    headline: 'Entra para\nguardar tu caso',
    sub: 'Te mandamos un enlace por correo. No necesitas contraseña.',
    emailLabel: 'Tu correo electrónico',
    emailPlaceholder: 'tucorreo@ejemplo.com',
    cta: 'Mandarme el enlace',
    sending: 'Enviando…',
    sentHeadline: 'Revisa tu correo',
    sentSub: 'Mandamos un enlace a {email}. Tócalo para continuar.',
    sentNote: 'Si no lo ves, revisa la carpeta de spam.',
    privacy: 'Solo guardamos lo necesario para tu apelación. Puedes borrar todo en cualquier momento.',
  },

  manualEntry: {
    step: 'Información de tu carta',
    headline: 'Escribe los\ndatos a mano',
    sub: 'No podemos leer la foto automáticamente. Escribe la fecha y el código de tu carta.',
    dateLabel: 'Fecha de la carta de negación',
    codeLabel: 'Código de negación',
    code120: '120 — Titularidad no verificada',
    code203: '203 — Ocupación no verificada',
    code204: '204 — Duplicación de beneficios',
    codeOther: 'Otro / No sé',
    nameLabel: 'Tu nombre (opcional)',
    namePlaceholder: 'Como aparece en la carta',
    daysLeft: '{n} días para apelar',
    overdue: 'El plazo venció',
    unsupportedCode: 'Aún no podemos preparar esta apelación automáticamente. Llama a Ayuda Legal PR: 1-800-981-5342.',
    otherResources: 'Ver otros recursos de ayuda',
    cta: 'Continuar',
    saving: 'Guardando…',
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
    noDate: 'Fecha no disponible',
    reasonPlain: 'FEMA dice que no probaste ser dueño de la casa.',
    reasonContext:
      'Esta es la negación más común en Puerto Rico. El 35% de las casas no tienen título formal. Es apelable, y FEMA acepta otras formas de probar que la casa es tuya — no necesitas una escritura.',
    appealableBadge: 'Apelable',
    cta: 'Prepara mi apelación',
    overdueCta: 'Ver qué más puedo hacer',
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
    generating: 'Preparando tu carta…',
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

  admin: {
    queueTitle: 'Cola de revisión',
    pendingSuffix: 'pendientes',
    queueEmpty: 'La cola está vacía. Todo al día.',
    queueError: 'Error en la cola',
    queueLoadingLabel: 'Cargando casos pendientes',
    unknownApplicant: 'Solicitante sin nombre',
    overdue: 'Vencido',
    daysLeftShort: '{n}d restantes',
    backToQueue: 'Cola',
    caseShort: 'Caso {id}',
    caseHeader: 'Caso {id} · Borrador v{v}',
    englishDraftHeader: 'Borrador en inglés (se envía a FEMA)',
    spanishDraftHeader: 'Borrador en español (copia para el solicitante)',
    englishDraftAria: 'Borrador de apelación en inglés',
    spanishDraftAria: 'Borrador de apelación en español',
    englishDraftEmpty: '(sin texto en inglés)',
    editHint: 'También puedes editar el borrador en español antes de enviar.',
    approve: 'Aprobar',
    requestChanges: 'Pedir cambios',
    reject: 'Rechazar',
    cancel: 'Cancelar',
    caseOrDraftMissing: 'No encontramos el caso o el borrador.',
    caseNotFound: 'Caso o borrador no encontrado.',
    backLabel: 'Atrás',
    approveNotesPlaceholder: 'Nota opcional para el expediente…',
    requestChangesPlaceholder: 'Describe qué hay que cambiar (obligatorio)…',
    rejectPlaceholder: 'Razón del rechazo (obligatorio)…',
    confirmApprove: 'Confirmar aprobación',
    confirmReject: 'Confirmar rechazo',
    sendFeedback: 'Enviar comentarios',
    approving: 'Aprobando…',
    rejecting: 'Rechazando…',
    submitting: 'Enviando…',
    sidebar: {
      deadline: 'Plazo',
      deadlinePassed: 'Plazo vencido',
      daysRemaining: '{n} días restantes',
      dateUnavailable: 'Fecha no disponible',
      letterDate: 'Fecha de la carta: {date}',
      denial: 'Negación',
      denialCode: 'Código:',
      disaster: 'Desastre:',
      applicant: 'Solicitante',
      applicantMissing: 'Nombre no registrado',
      citations: 'Citas requeridas',
      model: 'Modelo',
      versionPrefix: 'v',
      draftQuality: 'Origen del borrador',
      draftQualityCodeSpecific: 'Guía específica del código',
      draftQualityGeneral: 'Marco general — revisar con más cuidado',
    },
  },

  resources: {
    step: 'Otros recursos',
    headline: 'Otra ayuda que\nexiste hoy',
    sub: 'Si lo que necesitas ahora no es una apelación — o ya pasó tu plazo — estas líneas son gratis y atienden en español.',
    disclaimer: 'No somos estas organizaciones. Solo te decimos dónde están.',
    callLabel: 'Llamar',
    visitLabel: 'Sitio web',
    back: 'Volver al inicio',
    sections: [
      {
        id: 'crisis',
        title: 'Crisis ahora mismo',
        body: 'Si estás en peligro o pensando en hacerte daño, llama antes que nada.',
        items: [
          { label: '911 — emergencias', phone: '911', note: 'Policía, bomberos, ambulancia' },
          { label: '988 — línea de crisis', phone: '988', note: 'Español 24/7' },
          { label: 'SAMHSA — estrés por desastre', phone: '1-800-985-5990', note: 'Marca "2" para español' },
        ],
      },
      {
        id: 'shelter',
        title: 'Refugio y ayuda federal',
        body: 'Refugios de emergencia, estatus de tu caso con FEMA, y preguntas sobre asistencia por desastre.',
        items: [
          { label: 'Cruz Roja', phone: '1-800-733-2767', url: 'https://www.redcross.org/get-help/disaster-relief-and-recovery-services.html', note: 'Refugio y necesidades inmediatas' },
          { label: 'Línea general de FEMA', phone: '1-800-621-3362', url: 'https://www.disasterassistance.gov/es', note: 'Estatus de tu solicitud, preguntas sobre la carta' },
        ],
      },
      {
        id: 'food',
        title: 'Comida y servicios básicos',
        body: 'Bancos de comida, D-SNAP, agua potable, asistencia local.',
        items: [
          { label: '211 — directorio de servicios', phone: '211', url: 'https://www.211.org/', note: 'Disponible 24/7 en español' },
        ],
      },
      {
        id: 'legal',
        title: 'Otra ayuda legal',
        body: 'Si tu caso no es de FEMA, o si necesitas un abogado.',
        items: [
          { label: 'Ayuda Legal Puerto Rico', phone: '1-800-981-5342', url: 'https://www.ayudalegalpr.org', note: 'Gratis para familias de bajos ingresos' },
        ],
      },
    ],
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
