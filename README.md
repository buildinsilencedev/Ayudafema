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
- **Supabase CLI** — `brew install supabase/tap/supabase` or see
  https://supabase.com/docs/guides/cli
- **Git** — for cloning and pushing

You do not need Deno, Docker, Railway, or n8n for Phase 1.

---

## Phase 1 deploy (~30 minutes)

Non-technical operators: follow [`docs/DESPLIEGUE.md`](./docs/DESPLIEGUE.md)
instead — same steps, fully in Spanish, zero command-line context assumed.

### 1. Clone and install

```bash
git clone https://github.com/buildinsilencedev/ayudafema.git
cd ayudafema
npm ci
cp .env.example .env.local
```

### 2. Fill in `.env.local`

Every value has the exact dashboard path next to it. Open each service
in a tab and copy values across. Required: Supabase URL + anon key +
service-role key, OpenRouter key, OpenAI key, Twilio SID + token + PR
number + Messaging Service SID.

### 3. One command deploys the whole backend

```bash
supabase login    # first time only
npm run bootstrap
```

`bootstrap` prompts for your Supabase project-ref once, then runs
migrations, pushes secrets, deploys all six edge functions
(`parseDenialLetter`, `draftAppeal`, `sendSMS`, `scheduleReminders`,
`smsWebhook`, `purgeOldCases`), seeds the RAG knowledge base, and runs
the verify script. Safe to re-run.

### 4. Point Twilio inbound at your webhook

Twilio console → *Messaging → Services → your service → Integration*
→ inbound webhook:

```
https://<your-project-ref>.functions.supabase.co/smsWebhook
```

Method `HTTP POST`. Routes STOP / HELP / CASE replies to the
bilingual handler.

### 5. Deploy the frontend to Cloudflare Pages

1. Cloudflare → Pages → Create → Connect to Git → pick this repo.
2. Build settings: preset Vite, build `npm run build`, output `dist`.
3. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_SITE_URL` (the Pages URL), `VITE_SENTRY_DSN` (optional).
4. Deploy. In Supabase → *Authentication → URL Configuration*, add the
   Pages URL to the allow-list so magic-link sign-in works.

### 6. Turn on Supabase keepalive

In your GitHub fork: *Settings → Secrets and variables → Actions* →
add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same
values from `.env.local`. Open the *Actions* tab, pick
*Supabase keepalive*, and run it once manually. It will now run Mon
and Thu at 13:00 UTC to keep the free-tier project from pausing.

### 7. Gate launch on the pre-launch checklist

Do not open the tool to real applicants until every item in
[`docs/PRE-LAUNCH.md`](./docs/PRE-LAUNCH.md) is signed off.

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
2. **Walk a test case end-to-end** — use
   `content/samples/fiona-ownership-denial.txt` to run through upload →
   diagnosis → draft → attorney review → submit. Confirm the
   "attorney-reviewed" badge only appears after signoff.
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

## If Ayudafema itself is unreachable

Hurricane-season reality: cell towers fall, power is intermittent, and
the people who need this tool most are on prepaid phones at a shelter
with one bar of signal. The app is built to degrade gracefully — but
when the network is fully out, no software helps. Post this card
somewhere in every AL-PR intake office and in the footer of any
community outreach flyer.

**If the app won't load, or you can't get past a blank screen:**

1. **Call Ayuda Legal PR** at `1-800-981-5342`. Attorneys walk people
   through FEMA appeals by phone — free.
2. **Call 211** for shelter, food, and disaster-assistance referrals.
3. **If you're in crisis or thinking about harming yourself**, call
   `988` (Spanish available 24/7) or `911` for an emergency.

**Bring this to any AL-PR office or FEMA Disaster Recovery Center:**

- Copy of the FEMA denial letter (or just your FEMA case number)
- A photo of your house — exterior, any damage
- One bill with your name at your home address (electric, water,
  internet, cable — any recent account works)
- Your ID

Four regulatory citations apply to almost every ownership-denial appeal
in PR and AL-PR attorneys have them memorized — you do **not** need to
know them:

```
44 CFR § 206.111          IAPPG v1.1
DRRA § 1212               86 Fed. Reg. 31,553
```

A downloadable bilingual paper packet (evidence checklist + attorney-
reviewed ownership template) is a planned improvement. Track it with
the rest of the resilience work in the issue queue.

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
│   ├── migrations/         # 0001_init → 0005_draft_quality
│   └── functions/          # 6 edge functions + _shared utilities
├── n8n/
│   ├── docker-compose.yml  # Phase 2 only
│   └── workflows/          # 5 JSON workflows
├── content/corpus/         # FEMA regs, denial playbooks, sample appeals
├── scripts/                # bootstrap.sh, set-secrets.sh, n8n-import.sh,
│                           #   verify-deployment.mjs, ingest-corpus.mjs
├── docs/                   # DESPLIEGUE (ES), PRE-LAUNCH / ANTES-DE-LANZAR,
│                           #   HANDOFF, RUNBOOK, ARCHITECTURE,
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
