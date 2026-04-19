# Runbook — Ayudafema.org

Incident response procedures for the Ayuda Legal PR operations team.
Built by La Mano. Contact during warranty: ops@lamano.dev

---

## Quick links

| Service         | Dashboard                              | On-call alert |
|-----------------|----------------------------------------|---------------|
| Cloudflare Pages| dash.cloudflare.com → Pages            | Better Stack  |
| Supabase        | app.supabase.com → ayudafema           | Better Stack  |
| Railway (n8n)   | railway.app → ayudafema-n8n            | Better Stack  |
| Twilio          | console.twilio.com                     | Better Stack  |
| Sentry (FE)     | sentry.io → ayudafema-fe               | email/Slack   |
| Sentry (BE)     | sentry.io → ayudafema-be               | email/Slack   |

---

## Incident: OCR down / parseDenialLetter failing

**Symptom:** Users stuck on Processing screen; cases not advancing; `parse_log.error` populated.

**Check:**
1. Sentry → ayudafema-be → filter by `parseDenialLetter`
2. Supabase → Edge Functions → parseDenialLetter → logs
3. `select * from public.parse_log order by created_at desc limit 20;`

**Fix:**
- OpenRouter outage: check `status.openrouter.ai`. Wait or fallback to direct Anthropic API (update `OPENROUTER_API_KEY` → direct key in Supabase Vault).
- Storage URL failure: check Supabase Storage bucket `denial-letters` is accessible.
- Immediate mitigation: all cases with `status = 'ocr_pending'` > 60s old should be flipped to `needs_manual` — the 60s timeout in Processing.jsx covers new users, but existing stuck cases need:
  ```sql
  update public.cases
  set status = 'needs_manual'
  where status = 'ocr_pending'
    and updated_at < now() - interval '2 minutes';
  ```

---

## Incident: LLM rate limit (draftAppeal throttled)

**Symptom:** Draft screen shows "preparing your letter…" indefinitely; `drafts` table not receiving new rows.

**Check:**
1. Supabase → Edge Functions → draftAppeal → logs
2. OpenRouter dashboard → usage vs. limits

**Fix:**
- Upgrade OpenRouter rate limit or add credits.
- Temporary mitigation: set `cases.status = 'evidence'` for affected cases so users can re-trigger.

---

## Incident: Attorney queue backlog

**Symptom:** Cases in `under_review` > 72h; users waiting.

**Check:**
```sql
select id, applicant_name, updated_at,
       extract(epoch from (now() - updated_at))/3600 as hours_waiting
from public.cases
where status = 'under_review'
order by updated_at asc;
```

**Fix:**
1. Alert attorneys via the usual AL-PR channel.
2. If no attorneys available, contact La Mano (warranty period).
3. SLA alert is set at 72h via Better Stack heartbeat on `under_review` count.

---

## Incident: Twilio SMS not delivering

**Symptom:** `sms_log` has `direction='out'` rows but users report not receiving.

**Check:**
1. Twilio Console → Monitor → Messaging → Error Codes
2. Check 10DLC registration status (must be `APPROVED`)
3. Check `profiles.sms_opt_in` for affected user

**Common causes:**
- Carrier filtering: messages look spammy. Shorten body or add brand name.
- 10DLC not approved / expired.
- User blocked the number (Twilio opt-out log).
- Phone number format issue (must be E.164: +1787XXXXXXX).

---

## Incident: Supabase project paused (free tier)

**Symptom:** All API calls fail with 503.

**Fix:**
1. Log in to app.supabase.com → project → Restore project.
2. Projects on free tier auto-pause after 7 days of inactivity.
3. **Production should be on Supabase Pro** ($25/mo) — no auto-pause.

---

## Incident: Cloudflare Pages deploy failed

**Symptom:** New commit deployed but site shows old version or 500.

**Check:**
1. Cloudflare dash → Pages → ayudafema → Deployments → latest build log
2. Common: missing env var — add to Pages Settings → Environment variables.

---

## Incident: n8n (Railway) down

**Symptom:** Workflow notifications not sending; draft queue not polling.

**Fix:**
1. railway.app → ayudafema-n8n → restart service.
2. Check Railway logs for OOM or crash.
3. If n8n volume corrupted: re-import workflow JSONs from `n8n/workflows/` in repo.
4. The Supabase edge functions (parseDenialLetter, draftAppeal, sendSMS) work independently — n8n outage does not break the core flow, only the retry/notification layer.

---

## Data breach response

1. Immediately: revoke Supabase service_role key (Settings → API → Regenerate).
2. Notify AL-PR legal team.
3. Assess: which tables were accessible? `cases`, `documents`, `profiles` contain PII.
4. Under PR law and GDPR (if any EU users): notify affected users within 72h.
5. Rotate all credentials: Twilio, OpenRouter, Sentry DSN.
6. Engage La Mano during warranty period.

---

## Manual operations

### Force a case to manual entry
```sql
update public.cases set status = 'needs_manual' where id = 'CASE_UUID';
```

### Approve a draft bypassing the UI (emergency)
```sql
select public.approve_draft(
  'DRAFT_UUID'::uuid,
  'ATTORNEY_USER_UUID'::uuid,
  'Emergency approval — attorney reviewed offline'
);
```

### Run purge immediately
```
POST https://PROJECT_REF.supabase.co/functions/v1/purgeOldCases
Authorization: Bearer <SERVICE_ROLE_KEY>
```

### Trigger reminder cron manually
```
POST https://PROJECT_REF.supabase.co/functions/v1/scheduleReminders
Authorization: Bearer <SERVICE_ROLE_KEY>
{}
```
