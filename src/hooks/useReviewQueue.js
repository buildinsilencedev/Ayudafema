/**
 * useReviewQueue — subscribe to the attorney review queue.
 *
 * Returns all cases currently in 'under_review' status, ordered by
 * days remaining until appeal deadline (soonest first — urgency-first).
 * Updates in real-time via postgres_changes subscription.
 *
 * Used by: src/screens/admin/Queue.jsx
 */

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

/**
 * @typedef {Object} QueueItem
 * @property {string}      id
 * @property {string}      applicant_name
 * @property {string}      denial_code
 * @property {string}      denial_letter_date
 * @property {string}      disaster_code
 * @property {string}      status
 * @property {string}      created_at
 * @property {string}      updated_at
 * @property {string|null} assigned_attorney   — profiles.id of attorney, if any
 * @property {number|null} days_left           — computed: 60 - days since letter date
 */

export function useReviewQueue() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const loadQueue = async () => {
    const { data, error: err } = await supabase
      .from('cases')
      .select(`
        id,
        applicant_name,
        denial_code,
        denial_letter_date,
        disaster_code,
        status,
        created_at,
        updated_at
      `)
      .eq('status', 'under_review')
      .order('denial_letter_date', { ascending: true })   // soonest deadline first

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Compute days_left client-side (avoid a DB function dep in the hook)
    const today = Date.now()
    const enriched = (data ?? []).map((row) => {
      let daysLeft = null
      if (row.denial_letter_date) {
        const letterMs = new Date(row.denial_letter_date + 'T12:00:00Z').getTime()
        const deadline = letterMs + 60 * 24 * 60 * 60 * 1000
        daysLeft = Math.ceil((deadline - today) / (24 * 60 * 60 * 1000))
      }
      return { ...row, days_left: daysLeft }
    })

    setItems(enriched)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    loadQueue()

    // Realtime: refresh queue whenever any case status changes
    const channel = supabase
      .channel('review-queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cases' },
        () => loadQueue()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { items, loading, error, refresh: loadQueue }
}
