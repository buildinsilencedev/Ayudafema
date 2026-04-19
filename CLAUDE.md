# CLAUDE.md

Context for Claude Code sessions working on this repo. Read this first.

## What this is

`ayudafema.org` — a free, bilingual, AI-assisted tool that helps Puerto Rico disaster survivors appeal FEMA denials of Individual Assistance.

**The user journey:** Upload denial letter → AI parses reason code and deadline → Walk user through evidence collection in plain PR-Spanish → Draft attorney-reviewed appeal letter → Walk user through submission → Track deadline with SMS reminders.

**Why it matters:** After Hurricane Maria, FEMA denied 60%+ of PR applications. Of those who appealed, 80% lost on procedure. After Fiona, only 17,000 PR households got housing assistance vs 72,000 in Florida for comparable damage. The #1 denial reason is "ownership not verified" because ~35% of PR homes don't have formal title — yet FEMA accepts alternative documentation that most applicants don't know about. This tool closes that gap.

## The operation

This project is the first shipment under an anonymous research entity. Internal operation name: **Hand of God / La Mano**. The public-facing brand is the steward nonprofit (initially **Ayuda Legal PR**). The entity is not promoted. The tool is donated.

**Rules:**

1. The entity never uses first-person singular in any output, copy, or commit message.
2. Partner org (Ayuda Legal PR) gets all public credit. Entity gets a "Construido por La Mano" footer line, nothing more.
3. No launch announcements from the entity. Partner org announces.
4. Open source from day one (MIT).
5. The tool is free forever. No donate button, no freemium, no "premium features."
6. Distribution happens through partner channels + paid influencer reach, never through founder-personal-brand promotion.

Keep this in mind when writing copy, naming things, or drafting commit messages. No "We're excited to announce…" voice. No founder-story energy. Quiet, technical, excellent.

## Standard

> "Every appeal this tool drafts would be defensible if a FEMA reviewer, an Ayuda Legal attorney, or a judge picked it up at random."

That is the quality bar. Not "good for a civic tech tool." Not "impressive for a solo builder." Legally defensible, linguistically native, operationally reliable.

## Aesthetic principles

**Editorial, restrained, paper-like. Not Silicon Valley SaaS. Not "civic tech."**

- Typography: Instrument Serif for display, IBM Plex Sans for body, IBM Plex Mono for legal-document preview. Never swap to Inter or Roboto.
- Color: cream paper bg (`--paper: #f6f2ea`), near-black ink (`--ink: #1a1613`), one restrained accent (`--accent: #8a2a1e` — deep burnt sienna). No gradients. No purples. No dashboard colors.
- Spacing: generous. Single-column, max-width 640px. Breathing room everywhere.
- No illustrations. No hero images. No smiling family photos. No stock imagery ever.
- No dark patterns. No manufactured urgency. No animated confetti.
- Animations: slow fades on screen transitions (500ms), nothing bouncy.
- Buttons: square corners, ink-on-paper, one primary per screen.
- Mobile-first always. Most users will be on slow Android devices post-disaster.

Design tokens are defined in `src/index.css` as CSS custom properties. Use them. Do not invent new ones without a reason.

## Spanish register — non-negotiable

- **PR-Spanish, not Castilian, not Mexican, not neutral LatAm.**
- Use `tú` form, not `usted`. Warmer, more intimate. How neighbors actually talk.
- "FEMA te negó" — not "Le fue negado a usted."
- "Casa" not "vivienda." "Dueño" not "propietario" in casual copy (propietario is fine in legal templates).
- "Celular" not "móvil." "Recibo de luz" not "factura eléctrica."
- Avoid "estimado usuario," "nuestros servicios," "bienvenido a la plataforma" — any corporate or Spain-ish register kills trust instantly.
- If you're unsure, flag the string for PR-native review rather than guessing.

## Tech constraints

- **React 18 + Vite + Tailwind core only.** No component library. No shadcn, no Chakra, no Material. Build the components we need by hand.
- **Tailwind core utilities only** — no custom plugins, no Tailwind config extensions for colors (use CSS variables instead).
- **lucide-react** for icons. No other icon libraries.
- **Single-file component structure is fine for the prototype.** Once real integration begins, split by screen.

## Legal guardrails

- Every page footer includes: "Herramienta independiente. No afiliada con FEMA ni con el gobierno federal." This is non-negotiable.
- The tool **does not file on behalf of users.** It generates documents, users submit them. FEMA has no submission API — this is architecturally correct and legally safer.
- Every appeal draft must be attorney-reviewed before a user is shown "ready to send." The "attorney-reviewed" badge is only added after actual Ayuda Legal (or partner attorney) signoff.
- No user data leaves the system without explicit consent. Data retention default is 90 days post-case-resolution.
- Never describe what the tool does as "legal advice" or "legal services." It's an assistance wizard, not a law firm.

## Current state (v0 prototype)

What exists:
- 8-screen UI shell in `src/App.jsx`
- Bilingual copy (ES default, EN toggle)
- Demo data for a realistic Fiona case (DR-4671-PR, Yabucoa, ownership denial)
- Simulated processing flow
- Sample appeal letter in both languages with real FEMA citations (44 CFR §206.111, IAPPG v1.1, DRRA §1212, 86 Fed. Reg. 31,553)

What does NOT exist yet:
- Real letter parsing (OCR + LLM extraction)
- Real LLM-generated appeals
- Evidence upload flow (just UI checkboxes right now)
- Attorney review queue
- SMS infrastructure
- User accounts / case persistence
- Email/OCR document handling
- Actual deployment

## Architecture for production

Do not implement these yet unless specifically asked. This is the target architecture.

**Orchestration:** n8n (self-hosted on Railway) — each user journey is an n8n workflow. Upload triggers parse-workflow, which triggers draft-workflow, which triggers review-queue.

**LLM routing (OpenRouter):**
- **Haiku 4.5** — letter parsing, OCR extraction, user-facing status, SMS replies, evidence checklist lookups. ~80% of traffic.
- **Sonnet 4.6** — evidence requirement reasoning, PR-Spanish output, standard appeal drafting, document validation.
- **Opus 4.7** — complex appeals (multi-denial history, ownership-trap edge cases, regulatory citation-heavy cases), judgment calls, attorney-review-prep packages.

**Storage:** Supabase (Postgres + pgvector). Tables: `cases`, `users`, `denial_codes`, `evidence`, `drafts`, `reviews`, `submissions`, `sms_log`. RLS on all tables.

**Knowledge base:** pgvector collection of FEMA regulations, denial code playbooks, Ayuda Legal appeal templates, prior successful appeals (anonymized). RAG pipeline retrieves top-k relevant passages for each draft call.

**Messaging:** Twilio for SMS/MMS. Bilingual autoreply. Deadline reminders at T-30, T-14, T-7, T-2 days.

**Document handling:** Cloudflare R2 or Supabase Storage. Encrypted at rest. 90-day retention.

**OCR:** Start with Sonnet vision. Fall back to Tesseract for cost optimization on simple cases.

**Deployment:** Cloudflare Pages for the frontend. n8n + Supabase on Railway for the backend.

## Non-goals

Things NOT to build:
- A general-purpose disaster navigator (scope creep — stay on FEMA appeals)
- A chatbot interface (users don't want conversation, they want a guided wizard)
- Gamification, progress bars with percentages, confetti, achievements
- An account system with passwords (use magic links / SMS OTP)
- A native mobile app (PWA is enough)
- Multi-country support in v1 (PR only — expand after proof)

## Partnership status

- **Ayuda Legal Puerto Rico** — primary partner target. They already do FEMA appeals work. They have attorneys for the review layer. They are the intended steward of this tool.
- **Hispanic Federation** — potential fiscal sponsor alternative.
- **Claude for Nonprofits** — to be applied for once fiscal sponsor is confirmed.

Do not publicly describe these as confirmed partnerships unless they actually are. Current status is "target."

## When in doubt

1. Ship less, ship it better.
2. Ask for PR-Spanish review before launching any new string.
3. Prefer legal accuracy over AI confidence.
4. If a feature would require marketing to explain, it's the wrong feature.
5. The tool should feel like a neighbor built it, not a startup.
