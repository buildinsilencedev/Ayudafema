/**
 * ReviewSidebar — right-side context panel for the attorney review screen.
 *
 * Shows: denial code + reason, deadline, evidence checklist, applicant info.
 * Read-only; actions (approve / request changes / reject) are in the parent.
 */

import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

export function ReviewSidebar({ caseData, draft, t }) {
  if (!caseData) return null

  const copy = t.admin.sidebar
  const daysLeft = getDaysLeft(caseData.denial_letter_date)
  const urgent   = daysLeft !== null && daysLeft <= 7
  const overdue  = daysLeft !== null && daysLeft < 0

  return (
    <div
      className="space-y-6 text-[13px]"
      style={{ color: 'var(--ink-soft)' }}
    >
      {/* Deadline */}
      <Section label={copy.deadline}>
        <div
          className="flex items-center gap-2 text-[15px]"
          style={{ color: overdue || urgent ? 'var(--accent)' : 'var(--ink)' }}
        >
          {(urgent || overdue)
            ? <AlertTriangle size={14} aria-hidden="true" />
            : <Clock size={14} aria-hidden="true" />
          }
          {overdue
            ? copy.deadlinePassed
            : daysLeft !== null
              ? copy.daysRemaining.replace('{n}', daysLeft)
              : copy.dateUnavailable
          }
        </div>
        {caseData.denial_letter_date && (
          <p className="mt-1 text-[12px]" style={{ color: 'var(--ink-softer)' }}>
            {copy.letterDate.replace('{date}', caseData.denial_letter_date)}
          </p>
        )}
      </Section>

      {/* Denial info */}
      <Section label={copy.denial}>
        <p>
          <span className="font-medium">{copy.denialCode}</span>{' '}
          {caseData.denial_code ?? '—'}
        </p>
        <p className="mt-1">
          <span className="font-medium">{copy.disaster}</span>{' '}
          {caseData.disaster_code ?? '—'} {caseData.disaster_name ? `— ${caseData.disaster_name}` : ''}
        </p>
      </Section>

      {/* Applicant */}
      <Section label={copy.applicant}>
        <p>{caseData.applicant_name ?? copy.applicantMissing}</p>
        {caseData.applicant_address && (
          <p className="mt-1 text-[12px]" style={{ color: 'var(--ink-softer)' }}>
            {caseData.applicant_address}
          </p>
        )}
      </Section>

      {/* Citation check */}
      {draft && (
        <Section label={copy.citations}>
          {REQUIRED_CITATIONS.map((cite) => {
            const present = draft.body_en?.includes(cite) || draft.body_es?.includes(cite)
            return (
              <div key={cite} className="flex items-start gap-2 mb-1">
                {present
                  ? <CheckCircle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--ok)' }} aria-hidden="true" />
                  : <XCircle    size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden="true" />
                }
                <span style={{ color: present ? 'var(--ink-soft)' : 'var(--accent)' }}>
                  {cite}
                </span>
              </div>
            )
          })}
        </Section>
      )}

      {/* Draft quality */}
      {draft?.draft_quality && (
        <Section label={copy.draftQuality}>
          <p
            style={{
              color: draft.draft_quality === 'code_specific' ? 'var(--ok)' : 'var(--accent)',
            }}
          >
            {draft.draft_quality === 'code_specific'
              ? copy.draftQualityCodeSpecific
              : copy.draftQualityGeneral}
          </p>
        </Section>
      )}

      {/* Model */}
      {draft?.model && (
        <Section label={copy.model}>
          <p className="font-mono text-[11px]">{draft.model}</p>
          <p className="mt-0.5">{copy.versionPrefix}{draft.version}</p>
        </Section>
      )}
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-widest mb-2"
        style={{ color: 'var(--ink-softer)' }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

function getDaysLeft(letterDate) {
  if (!letterDate) return null
  const letter = new Date(letterDate + 'T12:00:00Z').getTime()
  const deadline = letter + 60 * 24 * 60 * 60 * 1000
  return Math.ceil((deadline - Date.now()) / (24 * 60 * 60 * 1000))
}

const REQUIRED_CITATIONS = [
  '44 CFR § 206.111',
  'IAPPG v1.1',
  'DRRA § 1212',
  '86 Fed. Reg. 31,553',
]
