// FEMA Individual Assistance appeals are due within 60 calendar days of the
// denial letter. 44 CFR § 206.111(a); IAPPG v1.1 §V.D. Calendar days — not
// business days — so weekends and federal holidays do NOT roll the deadline
// forward. If the calculated date is a holiday, FEMA treats the next business
// day as timely receipt, but the deadline itself is the calendar date.

const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_WINDOW_DAYS = 60

/**
 * @typedef {Object} DeadlineResult
 * @property {Date}    deadline      The appeal deadline as a UTC-midnight Date.
 * @property {number}  daysLeft      Whole days between today and the deadline. Negative when overdue.
 * @property {boolean} isOverdue     True when the deadline has passed.
 * @property {number}  windowDays    Window applied (default 60).
 */

/**
 * Compute the FEMA appeal deadline from a denial-letter date.
 *
 * Input is normalized to UTC midnight so day math is immune to tz drift.
 * Accepts a Date or an ISO-like string (YYYY-MM-DD or full ISO).
 *
 * @param {Date|string} letterDate            Date of the denial letter.
 * @param {{ windowDays?: number, now?: Date }} [opts]
 * @returns {DeadlineResult}
 */
export function calcAppealDeadline(letterDate, opts = {}) {
  const windowDays = opts.windowDays ?? DEFAULT_WINDOW_DAYS
  const now = opts.now ?? new Date()

  const letter = toUtcMidnight(letterDate)
  if (letter === null) {
    throw new TypeError('calcAppealDeadline: letterDate must be a valid Date or ISO date string')
  }

  const deadline = new Date(letter.getTime() + windowDays * DAY_MS)
  const today = toUtcMidnight(now)
  const daysLeft = Math.round((deadline.getTime() - today.getTime()) / DAY_MS)

  return {
    deadline,
    daysLeft,
    isOverdue: daysLeft < 0,
    windowDays,
  }
}

function toUtcMidnight(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
  }
  if (typeof value === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (m) {
      const [, y, mo, d] = m
      return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
    }
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()))
    }
  }
  return null
}

/**
 * Format a deadline date for display. Uses Intl.DateTimeFormat so we get
 * correct month names in both locales without a date-formatting library.
 *
 * @param {Date} date
 * @param {'es'|'en'} lang
 * @returns {string}
 */
export function formatDeadline(date, lang) {
  const locale = lang === 'es' ? 'es-PR' : 'en-US'
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
