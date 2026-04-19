import { ArrowRight } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { StepLabel, Headline } from '../components/Layout.jsx'
import { Letter } from '../components/Letter.jsx'
import { appealOwnership } from '../content/templates/appeal-ownership.js'
import { demoCase } from '../content/case/demo.js'

export function Draft({ t, appealLang, setAppealLang, onContinue }) {
  const vars = {
    caseId: demoCase.caseId,
    applicant: demoCase.applicant,
    disasterCode: demoCase.disasterCode,
    disasterName: demoCase.disasterName,
  }

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

      <Letter
        template={appealOwnership}
        lang={appealLang}
        vars={vars}
        labels={{
          reviewBadge: t.draft.reviewBadge,
          draftBadge: t.draft.draftBadge,
          previewLabel: t.draft.previewLabel,
          letterAriaLabel: t.draft.letterAriaLabel,
        }}
      />

      <p
        className="text-[12px] mb-8 leading-relaxed"
        style={{ color: 'var(--ink-softer)' }}
      >
        {t.draft.disclaimer}
      </p>

      <Button onClick={onContinue}>
        {t.draft.cta}
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </div>
  )
}
