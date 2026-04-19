import { useEffect } from 'react'
import { usePrefersReducedMotion } from '../lib/motion.js'

// Placeholder for the real parse pipeline. The 2.4s timeout stands in for OCR
// + LLM extraction; when the backend lands, swap this for the real call and
// route on resolution.
const SIMULATED_MS = 2400

export function Processing({ t, onDone }) {
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const id = setTimeout(onDone, reducedMotion ? 800 : SIMULATED_MS)
    return () => clearTimeout(id)
  }, [onDone, reducedMotion])

  return (
    <div className="hog-fade pt-12 md:pt-32">
      <h1 className="hog-serif text-[40px] md:text-[56px] leading-[1] mb-4 italic">
        {t.processing.headline}
        <span className="hog-caret ml-1" aria-hidden="true" />
      </h1>
      <p className="text-[16px] mb-12" style={{ color: 'var(--ink-soft)' }}>
        {t.processing.sub}
      </p>
      <ul className="space-y-4" aria-live="polite">
        {t.processing.tasks.map((task, i) => (
          <li
            key={i}
            className="flex items-center gap-3 text-[15px]"
            style={{ color: 'var(--ink-soft)' }}
          >
            <span
              aria-hidden="true"
              className="hog-pulse"
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                background: 'var(--accent)',
                borderRadius: '50%',
                animationDelay: `${i * 0.2}s`,
              }}
            />
            {task}
          </li>
        ))}
      </ul>
    </div>
  )
}
