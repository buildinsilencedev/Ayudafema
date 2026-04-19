import { setConsent, getConsent, CONSENT_STATES } from '../lib/persistence.js'
import { useState } from 'react'

export function ConsentBanner({ t, onChange }) {
  const [state, setState] = useState(getConsent)
  if (state !== CONSENT_STATES.UNSET) return null

  const choose = (granted) => {
    setConsent(granted)
    setState(granted ? CONSENT_STATES.GRANTED : CONSENT_STATES.DECLINED)
    onChange?.(granted)
  }

  return (
    <div
      role="region"
      aria-label={t.title}
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}
    >
      <div className="max-w-[640px] mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div
            className="text-[11px] uppercase tracking-widest mb-1"
            style={{ color: 'var(--ink-softer)' }}
          >
            {t.title}
          </div>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            {t.body}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => choose(false)}
            className="hog-btn-ghost text-sm underline underline-offset-4"
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="hog-btn-primary px-5 py-3 text-sm"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
