import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { getProfile } from '../lib/api.js'

/**
 * Auth state hook. Subscribes to Supabase onAuthStateChange so the
 * component tree re-renders on login/logout without a page reload.
 *
 * @returns {{
 *   user: import('@supabase/supabase-js').User | null,
 *   profile: { id: string, role: string, preferred_lang: string } | null,
 *   loading: boolean,
 *   signOut: () => Promise<void>
 * }}
 */
export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Load initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        const p = await getProfile().catch(() => null)
        if (mounted) setProfile(p)
      }
      setLoading(false)
    })

    // Subscribe to future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          const p = await getProfile().catch(() => null)
          if (mounted) setProfile(p)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, profile, loading, signOut }
}
