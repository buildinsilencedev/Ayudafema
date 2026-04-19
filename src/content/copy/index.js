// Copy is split by language. The shape must be identical in both files —
// `src/tests/copy-coverage.test.js` enforces parity on every build.

import { es } from './es.js'
import { en } from './en.js'

export const copy = { es, en }

/**
 * @typedef {'es'|'en'} Lang
 * @typedef {typeof es} CopyShape  Canonical copy shape; EN must match.
 */
