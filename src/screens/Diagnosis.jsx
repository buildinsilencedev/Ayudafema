import { ArrowRight } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { StepLabel, Headline, Row, Rule } from '../components/Layout.jsx'
import { calcAppealDeadline, formatDeadline } from '../lib/deadline.js'
import { ownershipDenial } from '../content/denials/ownership.js'
// demoCase is intentionally not imported here — data comes via caseData prop.

export function Diagnosis({ t, lang, caseData, onContinue, onResources }) {
  // Fall back gracefully while case data loads.
  const letterDate   = caseData?.denial_letter_date ?? null
  const caseId       = caseData?.id
    ? caseData.id.slice(0, 8).toUpperCase()
    : '—'
  const disasterName = caseData?.disaster_name ?? '—'
  const disasterCode = caseData?.disaster_code ?? '—'

  const windowDays = ownershipDenial.windowDays
  const { deadline, daysLeft, isOverdue } = letterDate
    ? calcAppealDeadline(letterDate, { windowDays })
    : { deadline: null, daysLeft: null, isOverdue: false }

  const deadlineDate = deadline ? formatDeadline(deadline, lang) : '—'
  const shownDays    = daysLeft != null ? Math.max(0, daysLeft) : null

  return (
    <div className="hog-fade pt-6 md:pt-12">
      <StepLabel text={t.diagnosis.step} />
      <Headline text={t.diagnosis.headline} />

      <Rule className="mb-8" />

      <dl className="space-y-6 mb-10">
        <Row label={t.diagnosis.caseLabel} value={caseId} mono />
        <Row
          label={t.diagnosis.disasterLabel}
          value={`${disasterName} · ${disasterCode}`}
        />
        <div>
          <dt
            id="reason-label"
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: 'var(--ink-softer)' }}
          >
            {t.diagnosis.reasonLabel}
          </dt>
          <dd className="text-[18px] mb-3" style={{ color: 'var(--ink)' }}>
            {t.diagnosis.reasonPlain}
          </dd>
          <dd className="text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            {t.diagnosis.reasonContext}
          </dd>
        </div>
        <div>
          <dt
            id="deadline-label"
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: 'var(--ink-softer)' }}
          >
            {t.diagnosis.deadlineLabel}
          </dt>
          <dd className="flex items-baseline gap-3" aria-labelledby="deadline-label">
            <span
              className="hog-serif text-[48px] leading-none"
              style={{ color: isOverdue ? 'var(--accent)' : 'var(--ink)' }}
            >
              {shownDays != null ? (isOverdue ? '0' : shownDays) : '—'}
            </span>
            <span className="text-[14px]" style={{ color: 'var(--ink-soft)' }}>
              {shownDays != null
                ? (isOverdue ? t.diagnosis.overdue : t.diagnosis.daysLeft)
                : t.diagnosis.noDate}{' '}
              {deadline ? `· ${t.diagnosis.deadlineDate} ${deadlineDate}` : ''}
            </span>
          </dd>
        </div>
      </dl>

      {!isOverdue && (
        <div
          className="flex items-center gap-3 mb-10 px-4 py-3"
          style={{ background: 'var(--accent-soft)' }}
          role="status"
        >
          <span
            aria-hidden="true"
            style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }}
          />
          <span
            className="text-[13px] uppercase tracking-widest"
            style={{ color: 'var(--accent)' }}
          >
            {t.diagnosis.appealableBadge}
          </span>
        </div>
      )}

      {isOverdue ? (
        <Button onClick={onResources}>
          {t.diagnosis.overdueCta}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      ) : (
        <Button onClick={onContinue}>
          {t.diagnosis.cta}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}
