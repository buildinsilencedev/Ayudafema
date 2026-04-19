/**
 * /admin/review/:caseId — attorney review screen.
 *
 * Layout (desktop):
 *   [Left: denial letter image] [Center: draft text] [Right: sidebar]
 *
 * Actions:
 *  Approve         → calls approve_draft() DB function → case status 'ready'
 *  Request changes → opens notes textarea, lets attorney edit draft body,
 *                    inserts reviews row with action 'request_changes'
 *  Reject          → inserts reviews row with action 'reject', status stays
 *                    'under_review' for re-draft
 *
 * Attorney-reviewed badge fires only on Approve.
 */

import { useState, useEffect } from 'react'
import { ArrowLeft, Check, MessageSquare, X } from 'lucide-react'
import { Button, OutlineButton } from '../../components/Button.jsx'
import { ReviewSidebar } from '../../components/admin/ReviewSidebar.jsx'
import { supabase } from '../../lib/supabase.js'

export function ReviewCase({ caseId, onBack, onApproved }) {
  const [caseData,  setCaseData]  = useState(null)
  const [draft,     setDraft]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [action,    setAction]    = useState(null)   // 'approve' | 'request_changes' | 'reject'
  const [notes,     setNotes]     = useState('')
  const [editedEs,  setEditedEs]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!caseId) return
    setLoading(true)

    Promise.all([
      supabase.from('cases').select('*').eq('id', caseId).single(),
      supabase
        .from('drafts')
        .select('*')
        .eq('case_id', caseId)
        .order('version', { ascending: false })
        .limit(1),
    ]).then(([{ data: c }, { data: d }]) => {
      setCaseData(c ?? null)
      const latestDraft = d?.[0] ?? null
      setDraft(latestDraft)
      setEditedEs(latestDraft?.body_es ?? '')
      setLoading(false)
    })
  }, [caseId])

  const handleApprove = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error: fnErr } = await supabase.rpc('approve_draft', {
        _draft_id: draft.id,
        _attorney: user.id,
        _notes:    notes || null,
      })
      if (fnErr) throw new Error(fnErr.message)
      onApproved?.(caseId)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!notes.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      // Optionally update the ES body if the attorney edited it
      if (editedEs !== draft.body_es) {
        await supabase.from('drafts').update({ body_es: editedEs }).eq('id', draft.id)
      }
      const { error: revErr } = await supabase.from('reviews').insert({
        draft_id:    draft.id,
        attorney_id: user.id,
        action:      'request_changes',
        notes,
      })
      if (revErr) throw new Error(revErr.message)
      onBack?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!notes.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error: revErr } = await supabase.from('reviews').insert({
        draft_id:    draft.id,
        attorney_id: user.id,
        action:      'reject',
        notes,
      })
      if (revErr) throw new Error(revErr.message)
      onBack?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="hog-fade pt-8">
        <div className="hog-pulse h-6 w-32 mb-6" style={{ background: 'var(--rule)' }} />
        <div className="hog-pulse h-96" style={{ background: 'var(--rule)' }} />
      </div>
    )
  }

  if (!caseData || !draft) {
    return (
      <div className="pt-8">
        <button type="button" onClick={onBack} className="hog-btn-ghost text-sm mb-4 flex items-center gap-2">
          <ArrowLeft size={14} aria-hidden="true" /> Back
        </button>
        <p style={{ color: 'var(--accent)' }}>Case or draft not found.</p>
      </div>
    )
  }

  return (
    <div className="hog-fade pt-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={onBack} className="hog-btn-ghost text-sm flex items-center gap-2">
          <ArrowLeft size={14} aria-hidden="true" />
          Queue
        </button>
        <span className="text-[12px]" style={{ color: 'var(--ink-softer)' }}>
          Case {caseId.slice(0, 8).toUpperCase()} · Draft v{draft.version}
        </span>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_260px] gap-6">

        {/* Left: draft EN preview (what FEMA receives) */}
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--ink-softer)' }}>
            English draft (sent to FEMA)
          </p>
          <div
            className="text-[13px] leading-relaxed whitespace-pre-wrap p-4 border"
            style={{
              borderColor: 'var(--rule)',
              color:       'var(--ink)',
              fontFamily:  'var(--font-mono)',
              maxHeight:   '70vh',
              overflowY:   'auto',
            }}
            aria-label="English appeal draft"
          >
            {draft.body_en ?? '(no English body)'}
          </div>
        </div>

        {/* Center: ES draft (editable when requesting changes) */}
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--ink-softer)' }}>
            Spanish draft (applicant copy)
          </p>
          <textarea
            value={editedEs}
            onChange={(e) => setEditedEs(e.target.value)}
            readOnly={action !== 'request_changes'}
            aria-label="Spanish appeal draft"
            className="w-full text-[13px] leading-relaxed p-4 border resize-none"
            style={{
              borderColor: action === 'request_changes' ? 'var(--ink)' : 'var(--rule)',
              color:       'var(--ink)',
              fontFamily:  'var(--font-mono)',
              height:      '70vh',
              background:  action === 'request_changes' ? 'transparent' : 'transparent',
            }}
          />
        </div>

        {/* Right: sidebar */}
        <div>
          <ReviewSidebar caseData={caseData} draft={draft} />
        </div>
      </div>

      {/* Action bar */}
      <div
        className="mt-8 pt-6 border-t"
        style={{ borderColor: 'var(--rule)' }}
      >
        {error && (
          <p role="alert" className="mb-4 text-[13px]" style={{ color: 'var(--accent)' }}>
            {error}
          </p>
        )}

        {action === null && (
          <div className="flex flex-col md:flex-row gap-3">
            <Button onClick={() => setAction('approve')} disabled={submitting}>
              <Check size={14} aria-hidden="true" /> Approve
            </Button>
            <OutlineButton onClick={() => setAction('request_changes')}>
              <MessageSquare size={14} aria-hidden="true" /> Request changes
            </OutlineButton>
            <OutlineButton onClick={() => setAction('reject')}>
              <X size={14} aria-hidden="true" /> Reject
            </OutlineButton>
          </div>
        )}

        {action === 'approve' && (
          <div className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for the record…"
              rows={3}
              className="w-full px-4 py-3 text-[14px] border resize-none bg-transparent"
              style={{ borderColor: 'var(--rule)', color: 'var(--ink)' }}
            />
            <div className="flex gap-3">
              <Button onClick={handleApprove} disabled={submitting}>
                {submitting ? 'Approving…' : 'Confirm approve'}
              </Button>
              <OutlineButton onClick={() => setAction(null)}>Cancel</OutlineButton>
            </div>
          </div>
        )}

        {action === 'request_changes' && (
          <div className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what needs to change (required)…"
              required
              rows={4}
              className="w-full px-4 py-3 text-[14px] border resize-none bg-transparent"
              style={{ borderColor: 'var(--rule)', color: 'var(--ink)' }}
            />
            <p className="text-[12px]" style={{ color: 'var(--ink-softer)' }}>
              You can also edit the Spanish draft above before submitting.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleRequestChanges}
                disabled={submitting || !notes.trim()}
              >
                {submitting ? 'Submitting…' : 'Send feedback'}
              </Button>
              <OutlineButton onClick={() => setAction(null)}>Cancel</OutlineButton>
            </div>
          </div>
        )}

        {action === 'reject' && (
          <div className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for rejection (required)…"
              required
              rows={4}
              className="w-full px-4 py-3 text-[14px] border resize-none bg-transparent"
              style={{ borderColor: 'var(--rule)', color: 'var(--ink)' }}
            />
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                disabled={submitting || !notes.trim()}
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {submitting ? 'Rejecting…' : 'Confirm reject'}
              </Button>
              <OutlineButton onClick={() => setAction(null)}>Cancel</OutlineButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
