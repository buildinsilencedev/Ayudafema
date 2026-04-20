import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { StepLabel, Headline } from '../components/Layout.jsx'
import { manualEntry } from '../lib/api.js'
import { calcAppealDeadline } from '../lib/deadline.js'

// Denial codes supported end-to-end in v1.
// Others show a "not yet supported" message.
const SUPPORTED_CODES = ['120']

export function ManualEntry({ t, caseId, prefill = {}, onContinue, onResources }) {
  const [date,    setDate]    = useState(prefill.denialLetterDate ?? '')
  const [code,    setCode]    = useState(prefill.denialCode       ?? '120')
  const [name,    setName]    = useState(prefill.applicantName    ?? '')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)

  const unsupported = code && !SUPPORTED_CODES.includes(code)

  // Live deadline preview
  let preview = null
  if (date) {
    try {
      const { daysLeft, isOverdue } = calcAppealDeadline(date)
      preview = { daysLeft, isOverdue }
    } catch (_) {
      // invalid date — ignore
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!date || !code) return
    setSaving(true)
    setError(null)
    try {
      await manualEntry(caseId, {
        denialCode:        code,
        denialLetterDate:  date,
        applicantName:     name || undefined,
      })
      onContinue()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="hog-fade pt-6 md:pt-12">
      <StepLabel text={t.manualEntry.step} />
      <Headline text={t.manualEntry.headline} />
      <p className="text-[17px] mb-10" style={{ color: 'var(--ink-soft)' }}>
        {t.manualEntry.sub}
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Denial date */}
        <div>
          <label
            htmlFor="manual-date"
            className="block text-[12px] uppercase tracking-widest mb-2"
            style={{ color: 'var(--ink-softer)' }}
          >
            {t.manualEntry.dateLabel}
          </label>
          <input
            id="manual-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 text-[16px] border bg-transparent"
            style={{ borderColor: 'var(--rule)', color: 'var(--ink)' }}
          />
          {preview && (
            <p
              className="mt-2 text-[13px]"
              style={{ color: preview.isOverdue ? 'var(--accent)' : 'var(--ok)' }}
            >
              {preview.isOverdue
                ? t.manualEntry.overdue
                : t.manualEntry.daysLeft.replace('{n}', preview.daysLeft)}
            </p>
          )}
        </div>

        {/* Denial code */}
        <div>
          <label
            htmlFor="manual-code"
            className="block text-[12px] uppercase tracking-widest mb-2"
            style={{ color: 'var(--ink-softer)' }}
          >
            {t.manualEntry.codeLabel}
          </label>
          <select
            id="manual-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 text-[16px] border bg-transparent"
            style={{ borderColor: 'var(--rule)', color: 'var(--ink)' }}
          >
            <option value="120">{t.manualEntry.code120}</option>
            <option value="203">{t.manualEntry.code203}</option>
            <option value="204">{t.manualEntry.code204}</option>
            <option value="other">{t.manualEntry.codeOther}</option>
          </select>
          {unsupported && (
            <div className="mt-2">
              <p
                className="text-[13px] leading-relaxed mb-3"
                style={{ color: 'var(--ink-softer)' }}
              >
                {t.manualEntry.unsupportedCode}
              </p>
              <button
                type="button"
                onClick={onResources}
                className="hog-btn-ghost text-[14px] underline underline-offset-4"
                style={{ color: 'var(--ink)' }}
              >
                {t.manualEntry.otherResources}
              </button>
            </div>
          )}
        </div>

        {/* Applicant name (optional) */}
        <div>
          <label
            htmlFor="manual-name"
            className="block text-[12px] uppercase tracking-widest mb-2"
            style={{ color: 'var(--ink-softer)' }}
          >
            {t.manualEntry.nameLabel}
          </label>
          <input
            id="manual-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 text-[16px] border bg-transparent"
            style={{ borderColor: 'var(--rule)', color: 'var(--ink)' }}
            placeholder={t.manualEntry.namePlaceholder}
          />
        </div>

        {error && (
          <p role="alert" className="text-[13px]" style={{ color: 'var(--accent)' }}>
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={saving || !date || !code || unsupported}
        >
          {saving ? t.manualEntry.saving : t.manualEntry.cta}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}
