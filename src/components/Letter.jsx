import { Shield } from 'lucide-react'

// Renders an appeal template in the chosen language. The "attorney-reviewed"
// badge is gated on `template.attorneyReviewed` — do not show the badge
// without an upstream signoff. Per CLAUDE.md: "The 'attorney-reviewed' badge
// is only added after actual Ayuda Legal (or partner attorney) signoff."

export function Letter({ template, lang, vars, labels }) {
  const body = template[lang](vars)
  return (
    <section aria-label={labels.letterAriaLabel}>
      <div className="flex items-center gap-3 mb-8">
        {template.attorneyReviewed ? (
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-widest"
            style={{ background: 'var(--ok)', color: 'var(--paper)' }}
            role="status"
          >
            <Shield size={11} aria-hidden="true" /> {labels.reviewBadge}
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-widest border"
            style={{ borderColor: 'var(--ink-softer)', color: 'var(--ink-softer)' }}
            role="status"
          >
            {labels.draftBadge}
          </span>
        )}
      </div>

      <div
        className="text-[11px] uppercase tracking-widest mb-3"
        style={{ color: 'var(--ink-softer)' }}
      >
        {labels.previewLabel}
      </div>

      <div className="hog-letter p-6 md:p-10 mb-6">
        <pre
          className="hog-mono text-[11px] md:text-[12px] leading-[1.6] whitespace-pre-wrap"
          style={{ color: 'var(--ink)' }}
        >
          {body}
        </pre>
      </div>
    </section>
  )
}
