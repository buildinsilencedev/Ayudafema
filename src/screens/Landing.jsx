import { ArrowRight, Phone } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { Headline, Rule } from '../components/Layout.jsx'

export function Landing({ t, onStart }) {
  return (
    <div className="hog-fade pt-12 md:pt-24">
      <div
        className="text-xs uppercase tracking-[0.2em] mb-8"
        style={{ color: 'var(--ink-softer)' }}
      >
        {t.landing.eyebrow}
      </div>

      <Headline text={t.landing.headline} size="hero" />

      <p
        className="text-[19px] md:text-[21px] leading-[1.5] mb-12 max-w-[520px]"
        style={{ color: 'var(--ink-soft)' }}
      >
        {t.landing.sub}
      </p>

      <Button onClick={onStart}>
        {t.landing.cta}
        <ArrowRight size={16} aria-hidden="true" />
      </Button>

      <Rule className="mt-16 mb-6" />

      <p
        className="text-[14px] leading-relaxed mb-6"
        style={{ color: 'var(--ink-softer)' }}
      >
        {t.landing.note}
      </p>

      <div className="flex items-center gap-2 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
        <Phone size={14} aria-hidden="true" />
        <span>{t.landing.phoneLabel}</span>
        <a
          href={`tel:${t.landing.phone.replace(/[^\d+]/g, '')}`}
          className="underline underline-offset-4"
          style={{ color: 'var(--ink)' }}
        >
          {t.landing.phone}
        </a>
      </div>
    </div>
  )
}
