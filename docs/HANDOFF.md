# Handoff Checklist — La Mano → Ayuda Legal PR

Complete this checklist at M8. Every item must be checked before La Mano steps back.
La Mano retains read-only GitHub access for 30-day warranty.

---

## Domain

- [ ] Transfer `ayudafema.org` from La Mano registrar to AL-PR registrar
- [ ] Update WHOIS registrant to AL-PR
- [ ] Verify NS records point to Cloudflare after transfer
- [ ] Test: `dig ayudafema.org` returns Cloudflare IPs

## Cloudflare

- [ ] Transfer zone ownership to AL-PR Cloudflare account
- [ ] Transfer Pages project to AL-PR account
- [ ] Update all Pages environment variables in AL-PR dashboard
- [ ] Verify: deploy from `main` still works after transfer
- [ ] Remove La Mano member from Cloudflare account

## Supabase

- [ ] Add AL-PR as Organization Owner (`Settings → Members`)
- [ ] AL-PR sets billing to their credit card
- [ ] Rotate `service_role` key (Settings → API → Regenerate)
- [ ] Update rotated key in Cloudflare Pages env vars
- [ ] Update rotated key in Railway env vars
- [ ] Remove La Mano member from Supabase project
- [ ] La Mano retains read-only member for 30-day warranty

## Railway (n8n)

- [ ] Transfer Railway project ownership to AL-PR account
- [ ] AL-PR sets billing
- [ ] Rotate all Railway environment variables (new Supabase keys, etc.)
- [ ] Verify n8n workflows import cleanly after transfer

## Twilio

- [ ] Create sub-account under AL-PR Twilio (or transfer number)
- [ ] Update `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` everywhere
- [ ] Verify 10DLC brand registration is in AL-PR's name
- [ ] Test: SMS sends from new account

## OpenRouter

- [ ] Transfer API key to AL-PR account (or create new key, update everywhere)
- [ ] Verify credit balance for AL-PR account
- [ ] Update `OPENROUTER_API_KEY` in Supabase Vault

## GitHub

- [ ] Transfer repo to AL-PR GitHub org: `Settings → Transfer`
- [ ] La Mano retains read-only collaborator for 30-day warranty
- [ ] After 30 days: remove La Mano collaborator

## Sentry

- [ ] Transfer `ayudafema-fe` and `ayudafema-be` projects to AL-PR Sentry org
- [ ] Update DSNs in env vars after transfer
- [ ] Set on-call alerts to AL-PR email

## Better Stack

- [ ] Transfer monitors to AL-PR Better Stack account
- [ ] Update on-call contacts to AL-PR team
- [ ] Verify `status.ayudafema.org` subdomain resolves after DNS transfer

## Password manager

- [ ] AL-PR creates new entries for all credentials
- [ ] La Mano purges all secrets from local storage
- [ ] Shared vault access revoked for La Mano

## DNS / Email (transactional)

- [ ] Update SPF record to include AL-PR's sending domain
- [ ] Update DKIM for `ayudalegalpr.org` if used for magic links
- [ ] Test: magic link email lands in inbox, not spam

## Final verification

- [ ] E2E happy path on production URL under AL-PR accounts
- [ ] Simulate attorney login → approve a draft
- [ ] Send a test SMS from new Twilio account
- [ ] Deploy a test commit from AL-PR GitHub account → Pages
- [ ] Confirm La Mano can no longer access Supabase / Cloudflare

## Handoff date: _______________

Signed off by:
- La Mano representative: _______________
- Ayuda Legal PR representative: _______________
