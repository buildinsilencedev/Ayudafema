// localStorage-backed wizard persistence.
//
// CLAUDE.md rule: "No user data leaves the system without explicit consent."
// The wizard keeps its own consent gate (key: ayudafema.consent). Nothing is
// read or written unless that key is 'true'.

const CONSENT_KEY = 'ayudafema.consent'
const STATE_KEY = 'ayudafema.wizard.v1'

export const CONSENT_STATES = { GRANTED: 'true', DECLINED: 'false', UNSET: null }

function safeStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    // iOS Safari private mode throws on setItem; probe first.
    window.localStorage.setItem('__ayudafema_probe__', '1')
    window.localStorage.removeItem('__ayudafema_probe__')
    return window.localStorage
  } catch {
    return null
  }
}

export function getConsent() {
  const s = safeStorage()
  if (!s) return CONSENT_STATES.UNSET
  const v = s.getItem(CONSENT_KEY)
  if (v === 'true') return CONSENT_STATES.GRANTED
  if (v === 'false') return CONSENT_STATES.DECLINED
  return CONSENT_STATES.UNSET
}

export function setConsent(granted) {
  const s = safeStorage()
  if (!s) return
  s.setItem(CONSENT_KEY, granted ? 'true' : 'false')
  if (!granted) s.removeItem(STATE_KEY)
}

export function loadState() {
  if (getConsent() !== CONSENT_STATES.GRANTED) return null
  const s = safeStorage()
  if (!s) return null
  try {
    const raw = s.getItem(STATE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  if (getConsent() !== CONSENT_STATES.GRANTED) return
  const s = safeStorage()
  if (!s) return
  try {
    s.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // Quota exceeded or serialization error — fail silently, app continues.
  }
}

export function clearState() {
  const s = safeStorage()
  if (!s) return
  s.removeItem(STATE_KEY)
}
