import { useEffect, useState } from 'react'

// Tiny hash-based router — no dependency. URL shape: `#/upload?lang=en`.
// Unknown steps fall back to 'landing'; unknown langs fall back to 'es'.
//
// We avoid a real router dep because this app has eight steps, one linear
// flow, and should ship on the smallest possible runtime footprint for
// post-disaster Android devices on weak LTE.

export const STEPS = ['landing', 'upload', 'processing', 'diagnosis', 'evidence', 'draft', 'submit', 'tracking']
export const LANGS = ['es', 'en']

const DEFAULT_ROUTE = { step: 'landing', lang: 'es' }

function parseHash(hash) {
  // `#/upload?lang=en` or `#/` or ``.
  const raw = (hash || '').replace(/^#\/?/, '')
  if (!raw) return { ...DEFAULT_ROUTE }
  const [path, query = ''] = raw.split('?')
  const step = STEPS.includes(path) ? path : 'landing'
  const params = new URLSearchParams(query)
  const lang = LANGS.includes(params.get('lang')) ? params.get('lang') : 'es'
  return { step, lang }
}

function buildHash({ step, lang }) {
  const safeStep = STEPS.includes(step) ? step : 'landing'
  const safeLang = LANGS.includes(lang) ? lang : 'es'
  return `#/${safeStep}?lang=${safeLang}`
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
