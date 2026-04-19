import { describe, expect, it } from 'vitest'
import { calcAppealDeadline, formatDeadline } from '../lib/deadline.js'

describe('calcAppealDeadline', () => {
  it('defaults to a 60-day window', () => {
    const r = calcAppealDeadline('2026-04-05', { now: new Date('2026-04-18T12:00:00Z') })
    expect(r.windowDays).toBe(60)
    expect(r.deadline.toISOString().slice(0, 10)).toBe('2026-06-04')
  })

  it('reports daysLeft relative to today', () => {
    const r = calcAppealDeadline('2026-04-05', { now: new Date('2026-04-18T12:00:00Z') })
    expect(r.daysLeft).toBe(47)
    expect(r.isOverdue).toBe(false)
  })

  it('returns 0 daysLeft on deadline day itself', () => {
    const r = calcAppealDeadline('2026-01-01', { now: new Date('2026-03-02T00:00:00Z') })
    expect(r.daysLeft).toBe(0)
    expect(r.isOverdue).toBe(false)
  })

  it('marks the day after deadline as overdue', () => {
    const r = calcAppealDeadline('2026-01-01', { now: new Date('2026-03-03T00:00:00Z') })
    expect(r.daysLeft).toBe(-1)
    expect(r.isOverdue).toBe(true)
  })

  it('reports correct daysLeft one day before the deadline', () => {
    const r = calcAppealDeadline('2026-01-01', { now: new Date('2026-03-01T00:00:00Z') })
    expect(r.daysLeft).toBe(1)
  })

  it('accepts a Date object as input', () => {
    const r = calcAppealDeadline(new Date(Date.UTC(2026, 3, 5)), {
      now: new Date('2026-04-18T12:00:00Z'),
    })
    expect(r.deadline.toISOString().slice(0, 10)).toBe('2026-06-04')
    expect(r.daysLeft).toBe(47)
  })

  it('honors a custom window (90 days)', () => {
    const r = calcAppealDeadline('2026-01-01', {
      windowDays: 90,
      now: new Date('2026-01-01T00:00:00Z'),
    })
    expect(r.deadline.toISOString().slice(0, 10)).toBe('2026-04-01')
    expect(r.daysLeft).toBe(90)
  })

  it('honors a custom window (30 days)', () => {
    const r = calcAppealDeadline('2026-01-01', {
      windowDays: 30,
      now: new Date('2026-01-01T00:00:00Z'),
    })
    expect(r.deadline.toISOString().slice(0, 10)).toBe('2026-01-31')
  })

  it('is tz-stable: same calendar-day inputs give same result across tz-varying `now` strings', () => {
    // Same UTC calendar day, different wall-clock representations of "today"
    const a = calcAppealDeadline('2026-04-05', { now: new Date('2026-04-18T00:30:00Z') })
    const b = calcAppealDeadline('2026-04-05', { now: new Date('2026-04-18T23:30:00Z') })
    expect(a.daysLeft).toBe(b.daysLeft)
    expect(a.deadline.toISOString()).toBe(b.deadline.toISOString())
  })

  it('throws on invalid input', () => {
    expect(() => calcAppealDeadline('not-a-date')).toThrow(TypeError)
    expect(() => calcAppealDeadline(null)).toThrow(TypeError)
    expect(() => calcAppealDeadline(undefined)).toThrow(TypeError)
    expect(() => calcAppealDeadline(new Date('nope'))).toThrow(TypeError)
  })
})

describe('formatDeadline', () => {
  const d = new Date(Date.UTC(2026, 5, 4)) // June 4, 2026 UTC

  it('formats in en-US', () => {
    expect(formatDeadline(d, 'en')).toBe('June 4, 2026')
  })

  it('formats in es-PR', () => {
    const out = formatDeadline(d, 'es')
    // Node/ICU localization renders as "4 de junio de 2026" in es-PR
    expect(out).toMatch(/4 de junio de 2026/)
  })
})
