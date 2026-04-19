import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { getCase } from '../lib/api.js'

/**
 * Fetches a case by ID and subscribes to realtime updates.
 * Returns null while loading or if caseId is null.
 *
 * Usage:
 *   const { caseData, loading, refresh } = useCase(caseId)
 *
 * @param {string | null} caseId
 * @returns {{ caseData: object | null, loading: boolean, refresh: () => void }}
 */
export function useCase(caseId) {
  const [caseData, setCaseData] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const channelRef = useRef(null)

  const load = async (id) => {
    if (!id) { setCaseData(null); setLoading(false); return }
    setLoading(true)
    try {
      const row = await getCase(id)
      setCaseData(row)
    } catch (e) {
      console.error('[useCase] fetch failed', e)
      setCaseData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!caseId) {
      setCaseData(null)
      return
    }

    load(caseId)

    // Realtime subscription — updates caseData whenever the DB row changes.
    // Processing screen relies on this to detect 'evidence' or 'needs_manual'.
    channelRef.current = supabase
      .channel(`case:${caseId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'cases',
          filter: `id=eq.${caseId}`,
        },
        ({ new: row }) => {
          setCaseData(row)
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [caseId])

  return {
    caseData,
    loading,
    refresh: () => load(caseId),
  }
}
