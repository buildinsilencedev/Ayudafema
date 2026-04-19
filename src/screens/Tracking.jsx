import { ArrowRight, Clock, MessageSquare } from 'lucide-react'
import { Row, Rule } from '../components/Layout.jsx'
// demoCase intentionally removed — data comes via caseData prop.

export function Tracking({ t, lang, caseData, onReset }) {
  const locale = lang === 'es' ? 'es-PR' : 'en-US'

  const caseId = caseData?.id
    ? caseData.id.slice(0, 8).toUpperCase()
    : '—'

  const submittedDate = caseData?.updated_at
    ? new Intl.DateTimeFormat(locale, {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
      }).format(new Date(caseData.updated_at))
    : '—'

  // Phone is not stored in cases — show placeholder until M6 wires profiles
  const smsPartial = '—'

  return (
    <div className="hog-fade pt-6 md:pt-12">
      <div
        className="text-xs uppercase tracking-[0.2em] mb-8"
        style={{ color: 'var(--ok)' }}
      >
        {t.tracking.step}
      </div>

      <h1
        className="hog-serif text-[80px] md:text-[120px] leading-none mb-6"
        style={{ color: 'var(--ink)' }}
      >
        {t.tracking.headline}
        <span style={{ color: 'var(--ok)' }} aria-hidden="true">
          .
        </span>
      </h1>

      <p
        className="text-[18px] leading-relaxed mb-12 max-w-[480px]"
        style={{ color: 'var(--ink-soft)' }}
      >
        {t.tracking.sub}
      </p>

      <Rule className="mb-8" />

      <dl className="space-y-6 mb-10">
        <Row label={t.tracking.caseLabel} value={caseId} mono />
        <Row label={t.tracking.submittedLabel} value={submittedDate} />
        <Row
          label={t.tracking.smsLabel}
          value={smsPartial}
          mono
          icon={<MessageSquare size={14} aria-hidden="true" />}
        />
      </dl>

      <section aria-labelledby="next-steps-heading" className="mb-10">
        <h2
          id="next-steps-heading"
          className="text-xs uppercase tracking-widest mb-4"
          style={{ color: 'var(--ink-softer)' }}
        >
          {t.tracking.nextSteps}
        </h2>
        <ul className="space-y-3 list-none p-0">
          {t.tracking.stepsList.map((s, i) => (
            <li
              key={i}
              className="flex gap-3 text-[14px] leading-relaxed"
              style={{ color: 'var(--ink-soft)' }}
            >
              <Clock
                size={14}
                className="flex-shrink-0 mt-1"
                style={{ color: 'var(--ink-softer)' }}
                aria-hidden="true"
              />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={onReset}
        className="hog-btn-ghost text-sm underline underline-offset-4 inline-flex items-center gap-2"
      >
        <ArrowRight size={14} aria-hidden="true" /> {t.tracking.another}
      </button>
    </div>
  )
}
