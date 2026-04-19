import { describe, expect, it } from 'vitest'
import { es } from '../content/copy/es.js'
import { en } from '../content/copy/en.js'

// Walk a copy tree and yield a dotted path for every leaf, including array
// indices. Arrays of strings yield "foo.0", "foo.1", ...; arrays of objects
// recurse into each object.
function leafPaths(value, prefix = '', out = []) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => leafPaths(v, prefix ? `${prefix}.${i}` : String(i), out))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      leafPaths(v, prefix ? `${prefix}.${k}` : k, out)
    }
  } else {
    out.push(prefix)
  }
  return out
}

function leafValue(obj, path) {
  return path.split('.').reduce((o, k) => o[/^\d+$/.test(k) ? Number(k) : k], obj)
}

describe('copy parity', () => {
  it('ES and EN expose the same leaf paths', () => {
    const esPaths = leafPaths(es).sort()
    const enPaths = leafPaths(en).sort()
    const missingInEn = esPaths.filter((p) => !enPaths.includes(p))
    const missingInEs = enPaths.filter((p) => !esPaths.includes(p))
    expect(missingInEn, 'keys present in ES but missing in EN').toEqual([])
    expect(missingInEs, 'keys present in EN but missing in ES').toEqual([])
  })

  it('every leaf is a non-empty string', () => {
    for (const [lang, copy] of [['es', es], ['en', en]]) {
      for (const path of leafPaths(copy)) {
        const value = leafValue(copy, path)
        expect(typeof value, `${lang}.${path} should be string`).toBe('string')
        expect(value.length, `${lang}.${path} should be non-empty`).toBeGreaterThan(0)
      }
    }
  })

  it('disclaimer carries the required independence statement in both languages', () => {
    expect(es.disclaimer).toMatch(/No afiliada con FEMA/)
    expect(en.disclaimer).toMatch(/Not affiliated with FEMA/)
  })

  it('builtBy line mentions La Mano (CLAUDE.md rule)', () => {
    expect(es.builtBy).toMatch(/La Mano/)
    expect(en.builtBy).toMatch(/La Mano/)
  })
})
