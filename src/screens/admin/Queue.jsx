/**
 * /admin/queue — attorney review queue screen.
 *
 * Shows all cases in 'under_review' status, sorted by deadline urgency.
 * Clicking a row navigates to the ReviewCase screen.
 *
 * Access: requires role 'attorney' or 'admin' (enforced by App.jsx routing).
 */

import { Clock, AlertTriangle } from 'lucide-react'
import { useReviewQueue } from '../../hooks/useReviewQueue.js'

export function Queue({ onReview }) {
  const { items, loading, error } = useReviewQueue()

  if (loading) {
    return (
      <div className="hog-fade pt-12">
        <div className="hog-pulse h-6 w-48 mb-8" style={{ background: 'var(--rule)' }} />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="hog-pulse h-16 mb-3"
            style={{ background: 'var(--rule)', opacity: 0.5 - i * 0.1 }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-12">
        <p style={{ color: 'var(--accent)' }}>Queue error: {error}</p>
      </div>
    )
  }

  return (
    <div className="hog-fade pt-8 md:pt-12">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="hog-serif text-[32px] italic">Review queue</h1>
        <span className="text-[13px]" style={{ color: 'var(--ink-softer)' }}>
          {items.length} pending
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-[15px]" style={{ color: 'var(--ink-softer)' }}>
          Queue is empty. All caught up.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <QueueRow key={item.id} item={item} onReview={onReview} />
          ))}
        </div>
      )}
    </div>
  )
}

function QueueRow({ item, onReview }) {
  const urgent  = item.days_left !== null && item.days_left <= 7
  const overdue = item.days_left !== null && item.days_left < 0

  return (
    <button
      type="button"
      onClick={() => onReview(item.id)}
      className="w-full text-left border p-4 flex items-center justify-between gap-4 transition-colors"
      style={{
        borderColor: urgent ? 'var(--accent)' : 'var(--rule)',
        background:  'transparent',
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[15px] font-medium truncate" style={{ color: 'var(--ink)' }}>
            {item.applicant_name ?? 'Unknown applicant'}
          </span>
          <span
            className="text-[11px] px-2 py-0.5 shrink-0"
            style={{ background: 'var(--rule)', color: 'var(--ink-softer)' }}
          >
            {item.denial_code ?? '—'}
          </span>
        </div>
        <div className="text-[12px]" style={{ color: 'var(--ink-softer)' }}>
          {item.disaster_code ?? '—'} · Case {item.id.slice(0, 8).toUpperCase()}
        </div>
      </div>

      <div className="shrink-0 text-right">
        {item.days_left !== null && (
          <div
            className="flex items-center gap-1 text-[13px]"
            style={{ color: overdue ? 'var(--accent)' : urgent ? 'var(--accent)' : 'var(--ink-softer)' }}
          >
            {urgent
              ? <AlertTriangle size={12} aria-hidden="true" />
              : <Clock size={12} aria-hidden="true" />
            }
            {overdue
              ? 'Overdue'
              : `${item.days_left}d left`
            }
          </div>
        )}
        <div className="text-[11px] mt-1" style={{ color: 'var(--ink-softer)' }}>
          {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </button>
  )
}
