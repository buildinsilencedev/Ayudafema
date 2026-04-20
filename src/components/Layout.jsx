import { ArrowLeft } from 'lucide-react'
import { STEPS } from '../lib/router.js'

export function Header({ t, route, onBack }) {
  const idx = STEPS.indexOf(route.step)
  const canBack = idx > 0 && route.step !== 'processing'
  return (
    <header className="px-6 md:px-10 pt-6 md:pt-8 pb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {canBack ? (
          <button
            type="button"
            onClick={onBack}
            className="hog-btn-ghost text-sm inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} aria-hidden="true" /> {t.back}
          </button>
        ) : (
          <div className="text-xs tracking-wide uppercase" style={{ color: 'var(--ink-softer)' }}>
            {t.partnerName}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span
          className="uppercase tracking-widest hidden md:inline"
          style={{ color: 'var(--ink-softer)' }}
        >
          {t.demo}
        </span>
        <LangToggle t={t} lang={route.lang} />
      </div>
    </header>
  )
}

function LangToggle({ t, lang }) {
  const next = lang === 'es' ? 'en' : 'es'
  const target = next === 'es' ? 'ES' : 'EN'
  const onClick = () => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
    params.set('lang', next)
    const step = window.location.hash.replace(/^#\//, '').split('?')[0] || 'landing'
    window.location.hash = `/${step}?${params.toString()}`
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t.languageSwitch}
      className="hog-btn-ghost uppercase tracking-widest"
    >
      {target}
    </button>
  )
}

export function Footer({ t }) {
  return (
    <footer className="px-6 md:px-10 pb-10 max-w-[640px] mx-auto">
      <div className="hog-rule mb-5" />
      <div
        className="flex flex-wrap items-center justify-between gap-3 text-xs mb-2"
        style={{ color: 'var(--ink-softer)' }}
      >
        <span>{t.free}</span>
        <span className="uppercase tracking-widest">{t.builtBy}</span>
      </div>
      <p className="text-[11px] mb-1" style={{ color: 'var(--ink-soft)' }}>
        {t.crisisLine}
      </p>
      <p className="text-[10px]" style={{ color: 'var(--ink-softer)' }}>
        {t.disclaimer}
      </p>
    </footer>
  )
}

export function StepLabel({ text }) {
  return (
    <div
      className="text-xs uppercase tracking-[0.2em] mb-6"
      style={{ color: 'var(--ink-softer)' }}
    >
      {text}
    </div>
  )
}

export function Headline({ text, size = 'default' }) {
  const classes =
    size === 'hero'
      ? 'hog-serif text-[56px] md:text-[88px] leading-[0.95] mb-8 whitespace-pre-line'
      : 'hog-serif text-[44px] md:text-[64px] leading-[0.95] mb-6 whitespace-pre-line'
  return (
    <h1 className={classes} style={{ color: 'var(--ink)' }}>
      {text}
    </h1>
  )
}

export function Row({ label, value, mono, icon, valueId }) {
  return (
    <div>
      <dt
        className="text-xs uppercase tracking-widest mb-2"
        style={{ color: 'var(--ink-softer)' }}
      >
        {label}
      </dt>
      <dd
        id={valueId}
        className={`text-[17px] flex items-center gap-2 ${mono ? 'hog-mono text-[15px]' : ''}`}
        style={{ color: 'var(--ink)' }}
      >
        {icon}
        {value}
      </dd>
    </div>
  )
}

export function Rule({ className = '' }) {
  return <div className={`hog-rule ${className}`} />
}
