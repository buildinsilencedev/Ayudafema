# Antes de lanzar — lista de control

Todo punto de abajo tiene que estar marcado antes de que una persona
real confíe su apelación a Ayudafema. Si uno no se cumple, no se
lanza. No hay excepciones.

Firma y fecha al final solo cuando todos estén marcados.

---

## Pruebas técnicas

- [ ] **Caso de prueba de punta a punta.** Un caso falso, usando
      `content/samples/fiona-ownership-denial.txt`, completa el flujo
      entero: subida → diagnóstico → borrador → aprobación por
      abogado → entrega marcada.
      *Cómo verificar:* hacer el flujo en la aplicación desplegada.

- [ ] **Revisión de plazos por SMS.** Un celular real recibe los
      recordatorios a 30, 14, 7 y 2 días. STOP y HELP responden en el
      idioma correcto.
      *Cómo verificar:* crear un caso con fecha de carta reciente y
      adelantar el reloj con la función `scheduleReminders`.

- [ ] **Purga a 90 días funcionando.** El trabajo de `pg_cron` borra
      casos resueltos hace más de 90 días.
      *Cómo verificar:* en Supabase → SQL Editor, correr
      `select * from cron.job;` y confirmar que aparece `purge_old_cases`
      con una próxima ejecución.

- [ ] **Keepalive activo.** El flujo de GitHub Actions *Supabase
      keepalive* corrió con éxito al menos una vez.
      *Cómo verificar:* pestaña Actions en GitHub → ver la última
      ejecución en verde.

- [ ] **Sentry recibiendo eventos.** Tanto el frontend como las
      funciones de Supabase reportan errores.
      *Cómo verificar:* provocar un error de prueba y confirmar que
      llega al panel de Sentry.

---

## Pruebas legales

- [ ] **Plantilla de apelación por titularidad revisada por abogado de
      PR.** Una persona licenciada para ejercer derecho en Puerto Rico
      revisó `src/content/templates/appeal-ownership.js` y firmó
      aprobación por escrito.

- [ ] **Cinco borradores en vivo revisados.** Cinco cartas generadas
      por la IA, con casos variados (código 120, 203, 605 y al menos
      dos ownership-trap), fueron revisadas y aprobadas por el equipo
      legal. Cada una cita 44 CFR § 206.111, IAPPG v1.1, DRRA § 1212
      y 86 Fed. Reg. 31,553.

- [ ] **Pie legal visible en todas las pantallas.** La línea
      "Herramienta independiente. No afiliada con FEMA ni con el
      gobierno federal." aparece en cada pantalla.
      *Cómo verificar:* recorrer manualmente todas las pantallas.

---

## Pruebas de lenguaje

- [ ] **Revisión de PR-Spanish nativo.** Una persona que habla
      español puertorriqueño revisó: `src/content/copy/es.js`,
      `src/content/templates/appeal-ownership.js`, las pantallas
      legales en ES, y el pie de página. Confirmó que no hay
      castellanismos, mexicanismos ni corporate-speak.
      *Cómo verificar:* firma por escrito (correo sirve).

- [ ] **Lista negra vacía.** Ningún texto de usuario contiene:
      `usted`, `móvil`, `vivienda` (fuera de citas), `estimado
      usuario`, `nuestros servicios`, `bienvenido a la plataforma`.
      *Cómo verificar:* correr `npm test` — el test
      `appeal-ownership-template.test.js` y el generador de borradores
      validan esta lista.

---

## Personas

- [ ] **Al menos una abogada o abogado con rol `attorney`** puede
      entrar a `/admin/queue` y aprobar casos.

- [ ] **Contacto de garantía de La Mano verificado.** Se envió un
      correo de prueba al contacto de garantía y recibió respuesta
      dentro de 24 horas.

- [ ] **`docs/HANDOFF.md` firmado** por la persona responsable de
      operar Ayudafema en AL-PR, con fecha.

---

## Aprobación final

Cuando TODO está marcado arriba, firma aquí:

```
Fecha de aprobación:    ________________________________

Nombre:                 ________________________________

Rol:                    ________________________________

Firma:                  ________________________________
```

Guarda una copia de esta página firmada en el expediente operativo
de Ayuda Legal PR.
