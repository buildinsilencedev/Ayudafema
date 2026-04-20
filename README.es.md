# ayudafema.org

> 🇺🇸 *[Read in English → README.md](./README.md)*

Herramienta gratis, de código abierto y bilingüe que ayuda a sobrevivientes
de desastres en Puerto Rico a apelar negaciones de Asistencia Individual de
FEMA. Subes tu carta de negación, recibes una lista de evidencia en español
claro, y generas una apelación revisada por abogado.

Construida por La Mano. Donada a **Ayuda Legal Puerto Rico** para operarla.

> **¿No tienes experiencia técnica?** Lee primero
> [`docs/DESPLIEGUE.md`](./docs/DESPLIEGUE.md). Es la versión sin
> línea de comando, hecha para quien opera una organización sin fines
> de lucro.

El contexto completo del proyecto está en [`CLAUDE.md`](./CLAUDE.md).

---

## Custodia

Ayuda Legal Puerto Rico es dueña de este despliegue y de su cumplimiento
legal. El código es MIT. La organización aliada opera el servicio, maneja
los datos de las personas, y firma cada apelación. La única mención de la
entidad es la línea del footer "Construido por La Mano" — nada más.

Este README es la hoja de ruta de despliegue. Síguelo de arriba a abajo;
todo lo demás en [`docs/`](./docs) se referencia desde aquí cuando lo
necesites.

---

## Costo de un vistazo

| Fase | Qué corre | Cuenta típica con menos de 50 casos al mes |
|-------|-----------|-------------------------------------------|
| **Fase 1** (requerida) | Supabase gratis, Cloudflare Pages gratis, OpenRouter + OpenAI + Twilio por uso | ~$0–$5/mes (el crédito de prueba de Twilio cubre el primer mes) |
| **Fase 2** (opcional) | Fase 1 + Railway ($5) corriendo la capa de reintentos de n8n | suma ~$5–10/mes |

Las tablas detalladas de costo por volumen (100 / 1,000 / 10,000 casos al
mes) están en [`docs/COST-MODEL.md`](./docs/COST-MODEL.md). La Fase 2 vale
la pena cuando ya ves llamadas fallidas a las edge functions que valga la
pena reintentar — no antes.

---

## Antes de empezar

### Cuentas que tienes que crear

Cada una tiene un nivel gratis suficiente para lanzar. Regístrate con un
correo de la organización de Ayuda Legal que puedas compartir con el equipo
de operaciones.

| Servicio | Para qué | Nivel gratis |
|----------|----------|--------------|
| [Supabase](https://supabase.com) | Base de datos, login, archivos, edge functions | 500 MB de DB, 2 GB de tráfico |
| [Cloudflare](https://dash.cloudflare.com) | Hosting del frontend (Pages) + DNS | Peticiones ilimitadas |
| [OpenRouter](https://openrouter.ai) | Routing de LLM (Haiku / Sonnet / Opus) | Pago por uso, sin mínimo |
| [OpenAI](https://platform.openai.com) | Embeddings para la base de conocimiento RAG | Pago por uso; el primer ingest ≈ $0.01 |
| [Twilio](https://www.twilio.com) | Recordatorios por SMS + router de palabras clave entrantes | $15 de crédito de prueba |
| [Sentry](https://sentry.io) *(opcional)* | Monitoreo de errores | 5k eventos/mes |
| [GitHub](https://github.com) | Hosting del código + CI | Gratis para repos públicos |

### Herramientas en tu computadora

- **Node 20+** — https://nodejs.org
- **Supabase CLI** — `brew install supabase/tap/supabase` o ver
  https://supabase.com/docs/guides/cli
- **Git** — para clonar y empujar

No necesitas Deno, Docker, Railway, ni n8n para la Fase 1.

---

## Despliegue de Fase 1 (~30 minutos)

Para la guía paso a paso en español, orientada a quien no programa,
usa [`docs/DESPLIEGUE.md`](./docs/DESPLIEGUE.md). Los mismos pasos
condensados en tres comandos:

### 1. Clona e instala

```bash
git clone https://github.com/buildinsilencedev/ayudafema.git
cd ayudafema
npm ci
cp .env.example .env.local
```

### 2. Llena `.env.local`

Cada variable trae al lado la ruta exacta en el dashboard correspondiente.
Necesarias: URL y llaves de Supabase, OpenRouter, OpenAI, y Twilio.

### 3. Un solo comando despliega el backend

```bash
supabase login    # solo la primera vez
npm run bootstrap
```

`bootstrap` te pide el *project-ref* de Supabase una vez, y corre:
migraciones, push de secretos, despliegue de las seis edge functions
(`parseDenialLetter`, `draftAppeal`, `sendSMS`, `scheduleReminders`,
`smsWebhook`, `purgeOldCases`), siembra RAG y verificación. Puedes
correrlo de nuevo si algo falla.

### 4. Apunta el webhook de entrada de Twilio

Twilio → *Messaging → Services → tu servicio → Integration* → webhook
de entrada:

```
https://<tu-project-ref>.functions.supabase.co/smsWebhook
```

Método `HTTP POST`. Enruta STOP / HELP / CASE al manejador bilingüe.

### 5. Despliega el frontend en Cloudflare Pages

1. Cloudflare → Pages → Create → Connect to Git → escoge este repo.
2. Preset Vite, build `npm run build`, salida `dist`.
3. Variables de entorno: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_SITE_URL` (el URL que te dé Pages), `VITE_SENTRY_DSN`
   (opcional).
4. En Supabase → *Authentication → URL Configuration*, añade el URL de
   Pages para que los magic-links funcionen.

### 6. Activa el keepalive de Supabase

En tu fork de GitHub: *Settings → Secrets and variables → Actions* →
añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos
valores de `.env.local`. Abre la pestaña *Actions*, selecciona
*Supabase keepalive* y córrelo manualmente una vez. A partir de ahí
corre los lunes y jueves a las 13:00 UTC y evita que el proyecto del
plan gratis se pause.

### 7. Revisa la lista antes de lanzar

No abras la herramienta al público hasta que todo en
[`docs/ANTES-DE-LANZAR.md`](./docs/ANTES-DE-LANZAR.md) esté firmado.

---

## Despliegue de Fase 2 (opcional)

Añade esto solo cuando el volumen justifique la capa de reintentos.
pg_cron ya maneja los recordatorios por SMS y la purga a los 90 días sin
n8n. Lo que n8n suma: reintentos con una dead-letter queue, una ruta de
respaldo de recordatorios si pg_cron brinca un tick, y orquestación de
webhooks para flujos más pesados más adelante. Ver
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

1. Crea un proyecto en Railway, apúntalo a este repo, y deja que
   `railway.json` levante el servicio de n8n desde
   `n8n/docker-compose.yml`.
2. En la pestaña de variables de Railway del servicio de n8n, configura
   `N8N_BASIC_AUTH_USER`, `N8N_BASIC_AUTH_PASSWORD`, `N8N_WEBHOOK_URL`
   (el URL público de Railway), `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `TWILIO_FROM_NUMBER`.
3. Copia los mismos valores a tu `.env.local` para que el script de import
   pueda autenticarse.
4. Importa los workflows:
   ```bash
   npm run n8n:import
   ```
5. Abre la interfaz de n8n (el URL de Railway) y activa cada workflow.

---

## Lista de la primera semana para Ayuda Legal PR

1. **Promueve a tu primer abogado.** En Supabase → SQL Editor:
   ```sql
   update public.profiles set role = 'attorney'
   where email = 'abogado@ayudalegalpr.org';
   ```
   El walkthrough completo y las expectativas de SLA están en
   [`docs/ATTORNEY-ONBOARDING.md`](./docs/ATTORNEY-ONBOARDING.md).
2. **Corre un caso de prueba de principio a fin** — usa
   `content/samples/fiona-ownership-denial.txt` para pasar por subida →
   diagnóstico → borrador → revisión de abogado → envío. Confirma que el
   sello "revisado por abogado" solo aparece después de la firma.
3. **Conecta las alertas de Sentry** si lo habilitaste, y suscribe el
   correo de on-call de operaciones.
4. **Transfiere la titularidad** de cada cuenta a la organización de Ayuda
   Legal usando la lista de 34 pasos en
   [`docs/HANDOFF.md`](./docs/HANDOFF.md). Firma y pon la fecha al final
   cuando termines.

---

## Cuando algo se rompe

| Síntoma | Dónde buscar |
|---------|--------------|
| Personas atoradas en la pantalla de Procesando | `docs/RUNBOOK.md` → *Incident: OCR down* |
| Borradores fallando o vacíos | `docs/RUNBOOK.md` → *Incident: LLM rate limit* |
| La fila de abogados se está acumulando | `docs/RUNBOOK.md` → *Incident: Attorney queue backlog* |
| Los SMS no están llegando | `docs/RUNBOOK.md` → *Incident: Twilio SMS not delivering* |
| El proyecto de Supabase se pausó | `docs/RUNBOOK.md` → *Incident: Supabase project paused* |
| n8n caído (Fase 2) | `docs/RUNBOOK.md` → *Incident: n8n (Railway) down* |
| Sospecha de exposición de datos | `docs/RUNBOOK.md` → *Data breach response* |

---

## Correr localmente para desarrollo

```bash
npm run dev
```

Abre en `http://localhost:5173`. Con `.env.local` completo la app se
conecta a tu proyecto real de Supabase; sin él, la interfaz corre contra
datos de demo.

Pruebas:

```bash
npm test
```

---

## Organización del proyecto

```
ayudafema/
├── src/                    # Frontend React 18 + Vite
│   ├── App.jsx             # Router de pantallas
│   ├── screens/            # Landing, Upload, Processing, Diagnosis,
│   │                       #   Evidence, Draft, Submit, Tracking, /admin
│   ├── components/         # Layout, Checkbox, Letter, etc.
│   ├── content/copy/       # Copy en ES + EN, con test de paridad
│   └── content/templates/  # Plantillas de cartas de apelación
├── supabase/
│   ├── migrations/         # 0001_init → 0005_draft_quality
│   └── functions/          # 6 edge functions + utilidades _shared
├── n8n/
│   ├── docker-compose.yml  # Solo Fase 2
│   └── workflows/          # 5 workflows en JSON
├── content/corpus/         # Reglas de FEMA, playbooks, apelaciones de ejemplo
├── scripts/                # bootstrap.sh, set-secrets.sh, n8n-import.sh,
│                           #   verify-deployment.mjs, ingest-corpus.mjs
├── docs/                   # DESPLIEGUE (ES), ANTES-DE-LANZAR / PRE-LAUNCH,
│                           #   HANDOFF, RUNBOOK, ARCHITECTURE,
│                           #   ATTORNEY-ONBOARDING, COST-MODEL
├── .env.example            # Anotado: cada variable te dice dónde encontrarla
├── railway.json            # Solo Fase 2
└── CLAUDE.md               # Contexto completo del proyecto
```

---

## Stack

- Vite + React 18, solo utilidades core de Tailwind (sin plugins, sin
  librería de componentes)
- lucide-react para los íconos
- Instrument Serif + IBM Plex Sans/Mono vía Google Fonts
- Supabase (Postgres + pgvector + edge functions + auth)
- OpenRouter para el routing de LLM; OpenAI para embeddings
- Twilio para SMS; Cloudflare Pages para el hosting
- n8n en Railway para la capa opcional de reintentos

Ver [`CLAUDE.md`](./CLAUDE.md) para el *porqué* detrás de cada decisión.

---

## Licencia

MIT. Haz fork. Despliégala. Dónala a una organización guardiana en tu
país.

---

## Sin afiliación

Herramienta independiente. No afiliada con FEMA ni con el gobierno
federal.

Not affiliated with FEMA or the U.S. federal government.
