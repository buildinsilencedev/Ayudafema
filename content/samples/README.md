# Sample denial letters

Use these to walk a fake case through the pipeline end-to-end before a
real applicant ever touches the tool.

## Files

- `fiona-ownership-denial.txt` — synthetic Hurricane Fiona (DR-4671-PR)
  denial letter, code 120 (ownership not verified), 60-day appeal
  window, dated April 2026. Realistic FEMA letter structure with a
  fabricated applicant name and registration number.

## How to test

1. Run the app locally (`npm run dev`).
2. On the upload screen, pick **"Escribir los datos a mano"** /
   **"Enter details by hand"** to skip OCR.
3. Fill the form using the values from the letter above:
   - Date: `April 5, 2026`
   - Denial code: `120 — Ownership not verified`
   - Applicant: `María J. Rivera Santiago`
4. Continue through diagnosis → evidence → draft → attorney review.
5. In `/admin/queue`, approve the draft. Confirm the final letter
   contains all four base citations and no ban-list words.

For OCR path testing, replace this file with an anonymized scan of an
actual denial letter from an AL-PR client. Do **not** commit scans of
real applicant letters to this repository.
