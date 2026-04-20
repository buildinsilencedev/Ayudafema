# Resources verification log

The Resources screen (`/resources`) points survivors who fall outside the
FEMA-appeal pipeline at third-party services. Those numbers and URLs have
to actually work. This log is the receipt.

Re-verify **before every major release** (minor copy edits do not
require re-dial). Keep the most recent signed pass in the Ayuda Legal PR
operations file along with `docs/PRE-LAUNCH.md`.

## How to verify an entry

1. **Phones.** Dial from a cell phone in Puerto Rico. Confirm:
   - The line picks up (live human, menu, or recorded line — all three
     are acceptable; a dead line is not).
   - Spanish is available at the point of entry, either immediately or
     via an IVR option.
   - The service still matches what we describe (no scope drift).
2. **URLs.** Open in a fresh browser tab. Confirm HTTP 200, Spanish
   content is reachable within two clicks.
3. **Sign the row.** Fill in the date and initials. If the entry failed,
   note the failure mode and open a tracking issue before shipping.

## Current entries

Source: `src/content/copy/es.js` and `en.js`, under `resources.sections`.

| Section  | Entry                          | Number / URL                       | Last verified | ES tested | EN tested | Verifier |
|----------|--------------------------------|------------------------------------|---------------|-----------|-----------|----------|
| crisis   | 911 — emergencies              | 911                                |               |           |           |          |
| crisis   | 988 — crisis line              | 988                                |               |           |           |          |
| crisis   | SAMHSA disaster distress       | 1-800-985-5990                     |               |           |           |          |
| shelter  | Red Cross                      | 1-800-733-2767                     |               |           |           |          |
| shelter  | Red Cross (web)                | redcross.org/get-help/...          |               |           |           |          |
| shelter  | FEMA main line                 | 1-800-621-3362                     |               |           |           |          |
| shelter  | disasterassistance.gov         | https://www.disasterassistance.gov |               |           |           |          |
| food     | 211 — services directory       | 211                                |               |           |           |          |
| food     | 211 (web)                      | https://www.211.org/               |               |           |           |          |
| legal    | Ayuda Legal Puerto Rico        | 1-800-981-5342                     |               |           |           |          |
| legal    | Ayuda Legal PR (web)           | https://www.ayudalegalpr.org       |               |           |           |          |

## Failure protocol

If an entry fails verification:

1. Do **not** ship the Resources change until the entry is either fixed
   or removed from `src/content/copy/*.js`.
2. File the failure in the Ayuda Legal PR operations tracker with the
   date, the tested number, and the observed response.
3. If a replacement number exists (e.g., a local food bank), add it —
   but only after a native Spanish speaker has verified it personally.
   Do **not** pull numbers from search-engine results without a call.

## Adding a new entry

Only add an entry after a live call or visit confirms it meets all four
criteria:

- **National or statewide stability.** Municipal numbers churn; the
  lifeline is not the place for them unless AL-PR commits to monthly
  re-verification.
- **Spanish service.** At minimum a Spanish IVR path or a Spanish-speaking
  staffer on the other end.
- **Free for the caller.** No fees, no paywall.
- **Scope fit.** Crisis, shelter, food, federal disaster assistance, or
  legal aid. Anything else belongs in a referral conversation with AL-PR
  staff, not on this screen.

Sign + date at the bottom once every row is green:

```
Verification pass date: ________________________________

Name:                   ________________________________

Role:                   ________________________________

Signature:              ________________________________
```
