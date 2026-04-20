# ayudafema.org

> 🇵🇷 *[Leer en español → README.es.md](./README.es.md)*

Free, open-source, bilingual tool that helps Puerto Rico disaster survivors
appeal FEMA Individual Assistance denials. Upload a denial letter, get a
plain-Spanish evidence checklist, and generate an attorney-reviewed appeal.

Built by La Mano. Donated to **Ayuda Legal Puerto Rico** to operate.

Full project context lives in [`CLAUDE.md`](./CLAUDE.md).

---

## Stewardship

Ayuda Legal Puerto Rico owns this deployment and its compliance. The code is
MIT. The partner org runs the service, handles user data, and signs off on
every appeal. The only entity mention is the footer line "Construido por La
Mano" — nothing else.

This README is the deployment roadmap. Follow it top to bottom; everything
else in [`docs/`](./docs) is referenced from here as you need it.

---

## Cost at a glance

| Phase | What runs | Typical bill at <50 cases/mo |
|-------|-----------|-------------------------------|
| **Phase 1** (required) | Supabase free, Cloudflare Pages free, OpenRouter + OpenAI + Twilio pay-per-use | ~$0–$5/mo (Twilio trial credit covers the first month) |
| **Phase 2** (optional) | Phase 1 + Railway ($5) hosting n8n retry layer | add ~$5–10/mo |

Detailed cost tables by volume (100 / 1,000 / 10,000 cases/month) live in
[`docs/COST-MODEL.md`](./docs/COST-MODEL.md). Phase 2 is worth adding once
you're routinely seeing failed edge-function calls worth retrying — not
before.

---

## Before you start

### Accounts to create

Each of these has a free tier generous enough for launch. Sign up with an
Ayuda Legal org email you're willing to share across your ops team.

| Service | Why | Free tier |
|---------|-----|-----------|
| [Supabase](https://supabase.com) | Database, auth, storage, edge functions | 500 MB DB, 2 GB bandwidth |
| [Cloudflare](https://dash.cloudflare.com) | Frontend hosting (Pages) + DNS | Unlimited requests |
| [OpenRouter](https://openrouter.ai) | LLM routing (Haiku / Sonnet / Opus) | Pay-per-use, no minimum |
| [OpenAI](https://platform.openai.com) | Embeddings for RAG knowledge base | Pay-per-use; first ingest ≈ $0.01 |
| [Twilio](https://www.twilio.com) | SMS reminders + inbound keyword router | $15 trial credit |
| [Sentry](https://sentry.io) *(optional)* | Error tracking | 5k events/mo |
| [GitHub](https://github.com) | Code hosting + CI | Free for public repos |

### Tools on your laptop

- **Node 20+** — https://nodejs.org
- **Deno 1.40+** — https://deno.com (only needed for the corpus ingest)
- **Supabase CLI** — `brew install supabase/tap/supabase` or see
  https://supabase.com/docs/guides/cli
- **Git** — for cloning and pushing

You do not need Docker, Railway, or n8n for Phase 1.

---

## Phase 1 deploy (~1 hour)

Every step is a single command or a documented dashboard action. If you hit
anything that requires judgment calls the docs don't cover, stop and email
the La Mano warranty contact in [`docs/RUNBOOK.md`](./docs/RUNBOOK.md).

### 1. Clone and install

```bash
git clone https://github.com/buildinsilencedev/ayudafema.git
cd ayudafema
npm ci
cp .env.example .env.local
```

### 2. Create the Supabase project

1. In the Supabase dashboard, create a new project. Pick the region closest to
   Puerto Rico (US East is fine).
2. Open *Project Settings → API* and copy these three values into
   `.env.local`:
   - `VITE_SUPABASE_URL` ← Project URL
   - `VITE_SUPABASE_ANON_KEY` ← anon / public key
   - `SUPABASE_SERVICE_ROLE_KEY` ← service_role key (keep this secret)
3. Link the CLI to the project:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

### 3. Push the database schema

```bash
npm run db:push
```

This applies all four migrations in `supabase/migrations/`: tables, RLS
policies, pgvector for RAG, and `pg_cron` jobs for SMS reminders + the
90-day purge.

### 4. Add LLM and SMS keys

Fill these in `.env.local` — the file tells you exactly where each value
lives in each dashboard:

- `OPENROUTER_API_KEY`
- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `TWILIO_MESSAGING_SERVICE_SID`

Twilio setup: buy one PR-area number, create a Messaging Service, and add the
number as a sender. You'll wire the inbound webhook in step 7.

Then push the backend secrets to Supabase:

```bash
npm run functions:secrets
```

### 5. Deploy the edge functions

```bash
npm run functions:deploy
```

This deploys all six functions:
`parseDenialLetter`, `draftAppeal`, `sendSMS`, `scheduleReminders`,
`smsWebhook`, `purgeOldCases`.

### 6. Seed the RAG knowledge base

```bash
npm run corpus:ingest
```

Embeds the FEMA regulations, denial-code playbooks, and sample appeals in
`content/corpus/` into `knowledge_base`. One-time ~$0.01 OpenAI charge.
Re-run with `-- --clear` to wipe and re-seed after corpus updates.

### 7. Point Twilio inbound at your webhook

In the Twilio console, open *Messaging → Services → your service →
Integration* and set the inbound webhook to:

```
https://<your-project-ref>.functions.supabase.co/smsWebhook
```

Method: `HTTP POST`. This routes STOP / HELP / CASE replies to the bilingual
handler.

### 8. Deploy the frontend to Cloudflare Pages

1. Cloudflare dashboard → Pages → Create → Connect to Git → pick this repo.
2. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output: `dist`
3. Environment variables: add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_SITE_URL` (the Pages URL), and `VITE_SENTRY_DSN` if you set up
   Sentry.
4. Deploy. Add the production domain under *Custom domains* once DNS is
   ready.
5. Back in Supabase → *Authentication → URL Configuration*, add your Pages
   URL to the allow-list so magic-link sign-in redirects work.

### 9. Verify

```bash
npm run verify
```

Expect all green. The script confirms: Supabase reachable, RLS on, corpus
seeded, edge functions responsive, Twilio number registered. Any red flags
point you at the relevant section of `docs/RUNBOOK.md`.

---

## Phase 2 deploy (optional)

Add this only once volume justifies a retry layer. pg_cron already handles
SMS scheduling and the 90-day purge without n8n. What n8n adds: workflow
retries with a dead-letter queue, a fallback SMS reminder path if pg_cron
skips a tick, and webhook orchestration for heavier flows later. See
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

1. Create a Railway project, point it at this repo, and let `railway.json`
   spin up the n8n service from `n8n/docker-compose.yml`.
2. In Railway's variables tab on the n8n service, set `N8N_BASIC_AUTH_USER`,
   `N8N_BASIC_AUTH_PASSWORD`, `N8N_WEBHOOK_URL` (the Railway public URL),
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
   `TWILIO_FROM_NUMBER`.
3. Copy the same values into your local `.env.local` so the import script
   can log in.
4. Import the workflows:
   ```bash
   npm run n8n:import
   ```
5. Open the n8n UI (the Railway URL) and activate each workflow.

---

## First-week checklist for Ayuda Legal PR

1. **Promote your first attorney.** In Supabase → SQL Editor:
   ```sql
   update public.profiles set role = 'attorney'
   where email = 'attorney@ayudalegalpr.org';
   ```
   Full walkthrough and SLA expectations in
   [`docs/ATTORNEY-ONBOARDING.md`](./docs/ATTORNEY-ONBOARDING.md).
2. **Walk a test case end-to-end** — use the sample Fiona denial in
   `content/samples/` to run through upload → diagnosis → draft → attorney
   review → submit. Confirm the "attorney-reviewed" badge only appears after
   signoff.
3. **Hook up Sentry alerts** if you enabled it, and subscribe the ops
   on-call address.
4. **Transfer ownership** of every account to the Ayuda Legal org using the
   34-step checklist in [`docs/HANDOFF.md`](./docs/HANDOFF.md). Sign and
   date the bottom when complete.

---

## When things break

| Symptom | Where to look |
|---------|---------------|
| Users stuck on Processing screen | `docs/RUNBOOK.md` → *Incident: OCR down* |
| Drafts failing or empty | `docs/RUNBOOK.md` → *Incident: LLM rate limit* |
| Attorney queue piling up | `docs/RUNBOOK.md` → *Incident: Attorney queue backlog* |
| SMS not delivering | `docs/RUNBOOK.md` → *Incident: Twilio SMS not delivering* |
| Supabase project paused | `docs/RUNBOOK.md` → *Incident: Supabase project paused* |
| n8n down (Phase 2) | `docs/RUNBOOK.md` → *Incident: n8n (Railway) down* |
| Suspected data exposure | `docs/RUNBOOK.md` → *Data breach response* |

---

## Run locally for development

```bash
npm run dev
```

Opens on `http://localhost:5173`. With `.env.local` populated the app talks
to your real Supabase project; without it the UI shell runs against demo
data.

Tests:

```bash
npm test
```

---

## Project layout

```
ayudafema/
├── src/                    # React 18 + Vite frontend
│   ├── App.jsx             # Screen router
│   ├── screens/            # Landing, Upload, Processing, Diagnosis,
│   │                       #   Evidence, Draft, Submit, Tracking, /admin
│   ├── components/         # Layout, Checkbox, Letter, etc.
│   ├── content/copy/       # ES + EN copy, parity-tested
│   └── content/templates/  # Appeal letter templates
├── supabase/
│   ├── migrations/         # 0001_init → 0004_cron
│   └── functions/          # 6 edge functions + _shared utilities
├── n8n/
│   ├── docker-compose.yml  # Phase 2 only
│   └── workflows/          # 5 JSON workflows
├── content/corpus/         # FEMA regs, denial playbooks, sample appeals
├── scripts/                # set-secrets.sh, n8n-import.sh,
│                           #   verify-deployment.mjs, ingest-corpus.ts
├── docs/                   # HANDOFF, RUNBOOK, ARCHITECTURE,
│                           #   ATTORNEY-ONBOARDING, COST-MODEL
├── .env.example            # Annotated: every var tells you where to find it
├── railway.json            # Phase 2 only
└── CLAUDE.md               # Full project context
```

---

## Stack

- Vite + React 18, Tailwind core utilities only (no plugins, no component lib)
- lucide-react for icons
- Instrument Serif + IBM Plex Sans/Mono via Google Fonts
- Supabase (Postgres + pgvector + edge functions + auth)
- OpenRouter for LLM routing; OpenAI for embeddings
- Twilio for SMS; Cloudflare Pages for hosting
- n8n on Railway for the optional retry layer

See [`CLAUDE.md`](./CLAUDE.md) for the *why* behind each choice.

---

## License

MIT. Fork it. Deploy it. Donate it to a steward org in your country.

---

## Not affiliated

Herramienta independiente. No afiliada con FEMA ni con el gobierno federal.

Not affiliated with FEMA or the U.S. federal government.
