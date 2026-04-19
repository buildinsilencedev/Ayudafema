import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { StepLabel, Headline } from '../components/Layout.jsx'
import { Letter } from '../components/Letter.jsx'
import { appealOwnership } from '../content/templates/appeal-ownership.js'
import { getDraft, requestDraft } from '../lib/api.js'
// demoCase intentionally removed — data comes via caseData prop.

export function Draft({ t, caseData, appealLang, setAppealLang, onContinue }) {
  const [draft,   setDraft]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const caseId = caseData?.id ?? null

  useEffect(() => {
    if (!caseId) { setLoading(false); return }
    let mounted = true
    setLoading(true)
    getDraft(caseId)
      .then(async (existing) => {
        if (!mounted) return
        if (existing) { setDraft(existing); setLoading(false); return }
        // No draft yet — generate one (M2 stub = static template)
        const created = await requestDraft(caseId)
        if (mounted) { setDraft(created); setLoading(false) }
      })
      .catch((err) => {
        if (mounted) { setError(err.message); setLoading(false) }
      })
    return () => { mounted = false }
  }, [caseId])

  // Vars for template fallback when no backend draft exists yet
  const vars = {
    caseId:       caseData?.id ? caseData.id.slice(0, 8).toUpperCase() : '[CASO]',
    applicant:    caseData?.applicant_name ?? '[Nombre]',
    disasterCode: caseData?.disaster_code  ?? 'DR-XXXX-PR',
    disasterName: caseData?.disaster_name  ?? '[Desastre]',
  }

  // Build a pseudo-template from the stored draft body when available
  const liveTemplate = draft
    ? {
        ...appealOwnership,
        es: () => draft.body_es ?? appealOwnership.es(vars),
        en: () => draft.body_en ?? appealOwnership.en(vars),
        attorneyReviewed: draft.attorney_reviewed,
      }
    : appealOwnership

  return (
    <div className="hog-fade pt-6 md:pt-12">
      <StepLabel text={t.draft.step} />
      <Headline text={t.draft.headline} />
      <p className="text-[17px] mb-6" style={{ color: 'var(--ink-soft)' }}>
        {t.draft.sub}
      </p>

      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setAppealLang(appealLang === 'en' ? 'es' : 'en')}
          className="hog-btn-ghost text-[12px] uppercase tracking-widest underline underline-offset-4"
        >
          {t.draft.switchTo}
        </button>
      </div>

      {loading && (
        <div className="mb-8" aria-live="polite">
          <div className="hog-pulse text-[13px] uppercase tracking-widest"
               style={{ color: 'var(--ink-softer)' }}>
            {t.draft.generating}
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mb-6 text-[13px]" style={{ color: 'var(--accent)' }}>
          {error}
        </p>
      )}

      {!loading && (
        <Letter
          template={liveTemplate}
          lang={appealLang}
          vars={vars}
          labels={{
            reviewBadge:     t.draft.reviewBadge,
            draftBadge:      t.draft.draftBadge,
            previewLabel:    t.draft.previewLabel,
            letterAriaLabel: t.draft.letterAriaLabel,
          }}
        />
      )}

      <p
        className="text-[12px] mb-8 leading-relaxed"
        style={{ color: 'var(--ink-softer)' }}
      >
        {t.draft.disclaimer}
      </p>

      <Button onClick={onContinue} disabled={loading}>
        {t.draft.cta}
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </div>
  )
}
