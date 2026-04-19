import { ArrowRight } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { StepLabel, Headline, Row, Rule } from '../components/Layout.jsx'
import { calcAppealDeadline, formatDeadline } from '../lib/deadline.js'
import { demoCase } from '../content/case/demo.js'
import { ownershipDenial } from '../content/denials/ownership.js'

export function Diagnosis({ t, lang, onContinue }) {
  const { deadline, daysLeft, isOverdue } = calcAppealDeadline(demoCase.denialLetterDate, {
    windowDays: ownershipDenial.windowDays,
  })
  const deadlineDate = formatDeadline(deadline, lang)
  const shownDays = Math.max(0, daysLeft)

  return (
    <div className="hog-fade pt-6 md:pt-12">
      <StepLabel text={t.diagnosis.step} />
      <Headline text={t.diagnosis.headline} />

      <Rule className="mb-8" />

      <dl className="space-y-6 mb-10">
        <Row label={t.diagnosis.caseLabel} value={demoCase.caseId} mono />
        <Row
          label={t.diagnosis.disasterLabel}
          value={`${demoCase.disasterName} · ${demoCase.disasterCode}`}
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
              {isOverdue ? '—' : shownDays}
            </span>
            <span className="text-[14px]" style={{ color: 'var(--ink-soft)' }}>
              {isOverdue ? t.diagnosis.overdue : t.diagnosis.daysLeft} ·{' '}
              {t.diagnosis.deadlineDate} {deadlineDate}
            </span>
          </dd>
        </div>
      </dl>

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

      <Button onClick={onContinue}>
        {t.diagnosis.cta}
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </div>
  )
}
