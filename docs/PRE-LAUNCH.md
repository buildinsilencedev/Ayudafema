# Pre-launch checklist

Every item below must be checked before a real applicant trusts
Ayudafema with their appeal. If one is not met, do not launch. No
exceptions.

Sign and date at the bottom only when all items are checked.

---

## Technical tests

- [ ] **End-to-end test case.** A fake case built from
      `content/samples/fiona-ownership-denial.txt` completes the full
      flow: upload → diagnosis → draft → attorney approval → submission
      marker.
      *How to verify:* walk the flow in the deployed app.

- [ ] **SMS deadline reminders.** A real phone receives reminders at
      T-30, T-14, T-7, and T-2 days. STOP and HELP reply in the
      correct language.
      *How to verify:* create a case with a recent letter date and
      fast-forward via the `scheduleReminders` function.

- [ ] **90-day purge running.** The `pg_cron` job removes cases
      resolved more than 90 days ago.
      *How to verify:* Supabase → SQL Editor → run
      `select * from cron.job;` and confirm `purge_old_cases` appears
      with a next-run timestamp.

- [ ] **Keepalive active.** The *Supabase keepalive* GitHub Actions
      workflow has run successfully at least once.
      *How to verify:* GitHub Actions tab → last run is green.

- [ ] **Sentry receiving events.** Both frontend and Supabase edge
      functions report errors.
      *How to verify:* trigger a test error and confirm it reaches
      the Sentry dashboard.

- [ ] **Resources phone numbers verified live.** Every number and URL
      in `src/content/copy/{es,en}.js` under `resources.sections[*].items`
      was dialed or visited, in Spanish and English where applicable,
      and each entry is signed off in
      `docs/RESOURCES-VERIFICATION.md`.
      *How to verify:* the verification log is dated, signed, and
      every row is green.

---

## Legal tests

- [ ] **Ownership appeal template reviewed by PR-licensed attorney.**
      A person licensed to practice law in Puerto Rico reviewed
      `src/content/templates/appeal-ownership.js` and signed written
      approval.

- [ ] **Five live drafts reviewed.** Five AI-generated letters across
      varied cases (codes 120, 203, 605, and at least two
      ownership-trap variants) were reviewed and approved by legal.
      Each cites 44 CFR § 206.111, IAPPG v1.1, DRRA § 1212, and 86
      Fed. Reg. 31,553.

- [ ] **Legal footer visible on every screen.** The line "Independent
      tool. Not affiliated with FEMA or the federal government."
      appears on every screen.
      *How to verify:* walk every screen manually.

---

## Language tests

- [ ] **PR-Spanish native review.** A PR-Spanish native speaker
      reviewed `src/content/copy/es.js`,
      `src/content/templates/appeal-ownership.js`, the ES legal
      screens, and the footer. Confirmed no Castilianisms, Mexicanisms,
      or corporate-speak.
      *How to verify:* written sign-off (email is fine).

- [ ] **Ban list empty.** No user-facing text contains: `usted`,
      `móvil`, `vivienda` (outside quoted regulations), `estimado
      usuario`, `nuestros servicios`, `bienvenido a la plataforma`.
      *How to verify:* run `npm test` — the
      `appeal-ownership-template.test.js` and the draft generator
      validate this list.

---

## People

- [ ] **At least one attorney** with the `attorney` role can sign
      into `/admin/queue` and approve cases.

- [ ] **La Mano warranty contact verified.** A test email to the
      warranty contact received a response within 24 hours.

- [ ] **`docs/HANDOFF.md` signed** by the person responsible for
      operating Ayudafema at AL-PR, with a date.

---

## Final sign-off

When every item above is checked, sign here:

```
Approval date:    _______________________________

Name:             _______________________________

Role:             _______________________________

Signature:        _______________________________
```

Keep a signed copy of this page in the Ayuda Legal PR operations
file.
