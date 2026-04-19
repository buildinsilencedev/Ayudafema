import { useState } from 'react'
import { ArrowRight, ChevronDown, ChevronRight, FileText, Upload as UploadIcon } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { Checkbox } from '../components/Checkbox.jsx'
import { StepLabel, Headline } from '../components/Layout.jsx'
import { ownershipDenial } from '../content/denials/ownership.js'

export function Evidence({ t, checked, setChecked, onContinue }) {
  const [expanded, setExpanded] = useState(null)
  const items = ownershipDenial.evidence
  const toggle = (id) => setChecked({ ...checked, [id]: !checked[id] })
  const doneCount = items.filter((it) => checked[it.id]).length

  return (
    <div className="hog-fade pt-6 md:pt-12">
      <StepLabel text={t.evidenceScreen.step} />
      <Headline text={t.evidenceScreen.headline} />
      <p
        className="text-[17px] mb-10 leading-relaxed"
        style={{ color: 'var(--ink-soft)' }}
      >
        {t.evidenceScreen.sub}
      </p>

      <ul className="space-y-1 mb-10 list-none p-0">
        {items.map((it) => {
          const content = t.evidence.items[it.id]
          const isDone = !!checked[it.id]
          const isOpen = expanded === it.id
          const why = `why-${it.id}`
          return (
            <li
              key={it.id}
              className="flex items-start gap-4 py-5 border-t"
              style={{ borderColor: 'var(--rule)' }}
            >
              <div className="mt-1 flex-shrink-0">
                <Checkbox
                  id={`evidence-${it.id}`}
                  checked={isDone}
                  onChange={() => toggle(it.id)}
                  label={content.title}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <label
                    htmlFor={`evidence-${it.id}`}
                    className="hog-serif text-[22px] leading-tight cursor-pointer"
                    style={{
                      color: isDone ? 'var(--ink-softer)' : 'var(--ink)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}
                  >
                    {content.title}
                  </label>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : it.id)}
                    aria-expanded={isOpen}
                    aria-controls={why}
                    className="hog-btn-ghost text-xs uppercase tracking-widest inline-flex items-center gap-1 mt-1 flex-shrink-0"
                  >
                    {isOpen ? (
                      <>
                        <ChevronDown size={12} aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        {t.evidence.whyLabel} <ChevronRight size={12} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
                <div
                  className="text-[14px] leading-relaxed mb-3"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  {content.desc}
                </div>
                {isOpen && (
                  <div
                    id={why}
                    className="hog-fade text-[13px] leading-relaxed p-4 mb-3"
                    style={{ background: 'var(--paper-edge)', color: 'var(--ink-soft)' }}
                  >
                    {content.why}
                  </div>
                )}
                <div className="flex gap-4 text-[12px] uppercase tracking-widest">
                  {!isDone ? (
                    <button
                      type="button"
                      onClick={() => toggle(it.id)}
                      className="hog-btn-ghost inline-flex items-center gap-1"
                      style={{ color: 'var(--ink)' }}
                    >
                      <UploadIcon size={11} aria-hidden="true" /> {t.evidenceScreen.addButton}
                    </button>
                  ) : (
                    <span style={{ color: 'var(--ok)' }}>{t.evidenceScreen.done}</span>
                  )}
                  {it.hasTemplate && (
                    <button
                      type="button"
                      className="hog-btn-ghost inline-flex items-center gap-1"
                    >
                      <FileText size={11} aria-hidden="true" /> {t.evidenceScreen.template}
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="hog-rule" />

      <div className="mt-10 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Button onClick={onContinue} disabled={doneCount < 2}>
          {t.evidenceScreen.cta}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
        <button
          type="button"
          onClick={onContinue}
          className="hog-btn-ghost text-sm underline underline-offset-4"
        >
          {t.evidenceScreen.skipLater}
        </button>
      </div>

      <div
        className="mt-4 text-[12px]"
        style={{ color: 'var(--ink-softer)' }}
        aria-live="polite"
      >
        {doneCount}/{items.length} {t.evidence.progressLabel}
      </div>
    </div>
  )
}
