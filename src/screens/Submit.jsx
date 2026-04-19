import { CheckCircle2, Phone } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { StepLabel, Headline } from '../components/Layout.jsx'

export function Submit({ t, onContinue }) {
  return (
    <div className="hog-fade pt-6 md:pt-12">
      <StepLabel text={t.submit.step} />
      <Headline text={t.submit.headline} />
      <p className="text-[17px] mb-10" style={{ color: 'var(--ink-soft)' }}>
        {t.submit.sub}
      </p>

      <div className="space-y-1 mb-10">
        {t.submit.methods.map((m, i) => (
          <section
            key={i}
            aria-labelledby={`submit-method-${i}`}
            className="py-6 border-t"
            style={{ borderColor: 'var(--rule)' }}
          >
            <div className="flex items-baseline justify-between mb-3">
              <h2
                id={`submit-method-${i}`}
                className="hog-serif text-[26px]"
                style={{ color: 'var(--ink)' }}
              >
                {m.title}
              </h2>
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--ink-softer)' }}
              >
                {m.badge}
              </span>
            </div>
            <ol className="space-y-2 mb-4 ml-1 list-none p-0">
              {m.steps.map((s, j) => (
                <li
                  key={j}
                  className="flex gap-3 text-[14px] leading-relaxed"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  <span
                    className="hog-mono text-[12px] flex-shrink-0 mt-1"
                    style={{ color: 'var(--ink-softer)' }}
                    aria-hidden="true"
                  >
                    {String(j + 1).padStart(2, '0')}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="hog-btn-ghost text-[12px] uppercase tracking-widest underline underline-offset-4"
              style={{ color: 'var(--ink)' }}
            >
              {m.cta} →
            </button>
          </section>
        ))}
        <div className="hog-rule" />
      </div>

      <Button onClick={onContinue} className="mb-6">
        <CheckCircle2 size={16} aria-hidden="true" /> {t.submit.confirm}
      </Button>

      <div
        className="flex items-center gap-2 text-[13px]"
        style={{ color: 'var(--ink-softer)' }}
      >
        <Phone size={13} aria-hidden="true" /> {t.submit.help}
      </div>
    </div>
  )
}
