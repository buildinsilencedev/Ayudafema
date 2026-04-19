import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../lib/motion.js'
import { supabase } from '../lib/supabase.js'

/**
 * Processing screen.
 *
 * When `caseId` is provided (real flow):
 *  - Subscribes to postgres_changes on `cases` for status updates.
 *  - status = 'evidence'     → onDone()           (high-confidence OCR)
 *  - status = 'needs_manual' → onDone('manual')   (low-conf → prefill ManualEntry)
 *  - 60-second timeout       → onDone('manual')   (OCR hung — route to fallback)
 *
 * When `caseId` is absent (demo / no Supabase project):
 *  - Falls back to 2.4-second simulated delay.
 */

const DEMO_MS   = 2400
const TIMEOUT_S = 60

export function Processing({ t, caseId, onDone }) {
  const reducedMotion = usePrefersReducedMotion()
  // Guard: never call onDone more than once (channel + timeout can both fire).
  const doneRef = useRef(false)

  const callOnce = (result) => {
    if (doneRef.current) return
    doneRef.current = true
    onDone(result)
  }

  useEffect(() => {
    doneRef.current = false   // reset if caseId changes

    // ── Demo / offline path ────────────────────────────────────────────────
    if (!caseId) {
      const id = setTimeout(
        () => callOnce(undefined),
        reducedMotion ? 800 : DEMO_MS
      )
      return () => clearTimeout(id)
    }

    // ── Real path: subscribe to realtime case status updates ───────────────
    const channel = supabase
      .channel(`processing:${caseId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'cases',
          filter: `id=eq.${caseId}`,
        },
        ({ new: row }) => {
          if (row.status === 'evidence') {
            callOnce(undefined)
          } else if (row.status === 'needs_manual') {
            callOnce('manual')
          }
          // 'ocr_pending' or other intermediate states — keep waiting.
        }
      )
      .subscribe()

    // Hard timeout — if parseDenialLetter hangs or errors silently,
    // route user to manual entry rather than spinning forever.
    const timeoutId = setTimeout(() => callOnce('manual'), TIMEOUT_S * 1000)

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId])

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
                display:        'inline-block',
                width:          6,
                height:         6,
                background:     'var(--accent)',
                borderRadius:   '50%',
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
