import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — ' +
      'API calls will fail. Add them to .env.local.'
  )
}

export const supabase = createClient(url ?? '', key ?? '', {
  auth: {
    // Store session in localStorage so it survives reload.
    // Consent is managed separately via persistence.js — the
    // auth token is always stored regardless of wizard consent.
    persistSession: true,
    storageKey: 'ayudafema.auth.v1',
  },
})
