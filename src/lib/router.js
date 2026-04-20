import { useEffect, useState } from 'react'

// Tiny hash-based router — no dependency.
// URL shape: `#/upload?lang=en&case=abc123`
//
// We avoid a real router dep because this app has a short linear flow
// and must ship on the smallest possible runtime footprint for
// post-disaster Android devices on weak LTE.

export const STEPS = [
  'landing', 'login', 'upload', 'manual-entry', 'processing',
  'diagnosis', 'evidence', 'draft', 'submit', 'tracking',
  'resources',
  'admin-queue', 'admin-review',
]
export const LANGS = ['es', 'en']

const DEFAULT_ROUTE = { step: 'landing', lang: 'es', caseId: null, draftId: null }

function parseHash(hash) {
  // `#/upload?lang=en&case=abc123` or `#/` or ``
  const raw = (hash || '').replace(/^#\/?/, '')
  if (!raw) return { ...DEFAULT_ROUTE }
  const [path, query = ''] = raw.split('?')
  const step    = STEPS.includes(path) ? path : 'landing'
  const params  = new URLSearchParams(query)
  const lang    = LANGS.includes(params.get('lang')) ? params.get('lang') : 'es'
  const caseId  = params.get('case')  || null
  const draftId = params.get('draft') || null
  return { step, lang, caseId, draftId }
}

function buildHash({ step, lang, caseId, draftId }) {
  const safeStep = STEPS.includes(step) ? step : 'landing'
  const safeLang = LANGS.includes(lang)  ? lang  : 'es'
  const params   = new URLSearchParams({ lang: safeLang })
  if (caseId)  params.set('case',  caseId)
  if (draftId) params.set('draft', draftId)
  return `#/${safeStep}?${params.toString()}`
}

export function useRoute() {
  const [route, setRoute] = useState(() =>
    typeof window === 'undefined' ? { ...DEFAULT_ROUTE } : parseHash(window.location.hash)
  )

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    // On mount, normalize the URL so deep-link parity holds.
    if (!window.location.hash) {
      window.history.replaceState(null, '', buildHash(route))
    }
    return () => window.removeEventListener('hashchange', onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const navigate = (next) => {
    const merged = { ...route, ...next }
    window.location.hash = buildHash(merged)
  }

  return [route, navigate]
}
