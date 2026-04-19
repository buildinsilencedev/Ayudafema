# Architecture — Ayudafema.org

## Overview

```
Browser (PWA)
    │ HTTPS
    ▼
Cloudflare Pages ─── ayudafema.org
    │ Supabase JS client
    ▼
Supabase (us-east-1)
    ├── Postgres + pgvector
    ├── Auth (magic link / SMS OTP)
    ├── Storage (denial-letters, evidence, drafts)
    ├── Edge Functions (Deno)
    └── Realtime (postgres_changes)
    │
    ├── OpenRouter ──── Haiku 4.5 (OCR)
    │                   Sonnet 4.6 (standard draft)
    │                   Opus 4.7   (complex draft)
    │
    ├── Twilio ──────── SMS/MMS (outbound reminders + inbound webhook)
    │
    └── n8n (Railway) ─ Workflow orchestration + retry/DLQ
```

## User flow

```
Landing → [Login (magic link)] → Upload → Processing (realtime)
       ↘ (low OCR conf) → ManualEntry ↗
                                         ↓
                                     Diagnosis → Evidence → Draft (under review)
                                                                   ↓
                                                           Attorney approves
                                                                   ↓
                                                           Submit → Tracking
                                                           (SMS reminders T-30/14/7/2)
```

## Edge functions

| Function            | Trigger         | Model       | Purpose                          |
|---------------------|-----------------|-------------|----------------------------------|
| parseDenialLetter   | Upload → invoke | Haiku 4.5   | Vision OCR + field extraction    |
| draftAppeal         | Manual / n8n    | Sonnet/Opus | RAG + LLM appeal generation      |
| sendSMS             | Internal        | —           | Outbound SMS with opt-in gate    |
| scheduleReminders   | pg_cron hourly  | —           | T-30/14/7/2 deadline reminders   |
| smsWebhook          | Twilio inbound  | —           | STOP/HELP/status routing         |
| purgeOldCases       | pg_cron daily   | —           | 90-day retention enforcement     |

## Database tables

| Table              | Purpose                                    |
|--------------------|--------------------------------------------|
| profiles           | Role, phone, SMS opt-in on top of auth.users |
| denial_codes       | FEMA denial code reference (120, 203, 204…) |
| cases              | One row per appeal case; status FSM         |
| evidence           | Evidence items attached per case            |
| documents          | Uploaded files (denial letter, evidence)    |
| drafts             | Versioned appeal drafts (ES + EN)           |
| reviews            | Attorney review actions (approve/reject)    |
| submissions        | FEMA submission records                     |
| sms_log            | All inbound/outbound SMS                    |
| knowledge_base     | pgvector RAG corpus (FEMA regs + guides)    |
| parse_log          | OCR attempt audit trail                     |
| workflow_failures  | n8n DLQ for failed workflow executions      |

## Key design decisions

**RLS on every table.** Users can only read/write their own rows. Attorneys get scoped access to `under_review` cases. Service role bypasses RLS for edge functions.

**Attorney review gate.** `drafts.attorney_reviewed` starts `false`. The Draft screen shows "being reviewed" until an attorney calls `approve_draft()`. Users cannot see the CTA to submit until this flag is `true`. This is the primary legal quality control.

**Offline-first fallback.** Every screen that depends on the backend has a `caseId = null` fallback path that works with demo data. This ensures the tool is testable without a live Supabase project.

**Static template stub.** `requestDraft()` falls back to the static appeal template in `src/content/templates/appeal-ownership.js` when the `draftAppeal` edge function is unavailable. This means M2 and M3 cases can proceed through the full UI without M4 being deployed.

**Hash router.** No server-side routing required. URL: `#/evidence?lang=es&case=abc123`. Cloudflare Pages serves the same `index.html` for all paths.
