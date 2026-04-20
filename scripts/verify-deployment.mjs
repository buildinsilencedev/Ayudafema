#!/usr/bin/env node
// verify-deployment.mjs — post-deploy smoke test.
//
// Reads .env.local from repo root and runs a series of pass/fail checks
// against the live Supabase project, edge functions, and Twilio number.
// Exits non-zero on any failure so CI or a deploy runbook can gate on it.
//
// Usage:  node scripts/verify-deployment.mjs
// Or:     npm run verify

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ENV_PATH = resolve(process.cwd(), '.env.local')

function loadEnv(path) {
  const env = {}
  let raw
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    console.error(`error: ${path} not found. Copy .env.example to .env.local first.`)
    process.exit(2)
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    env[key] = value
  }
  return env
}

const env = loadEnv(ENV_PATH)

const EDGE_FUNCTIONS = [
  'parseDenialLetter',
  'draftAppeal',
  'sendSMS',
  'scheduleReminders',
  'smsWebhook',
  'purgeOldCases',
]

const results = []

function record(name, ok, note) {
  results.push({ name, ok, note })
  const mark = ok ? 'PASS' : 'FAIL'
  console.log(`[${mark}] ${name}${note ? ' — ' + note : ''}`)
}

async function checkSupabaseReachable() {
  const url = env.VITE_SUPABASE_URL
  if (!url) return record('Supabase URL set', false, 'VITE_SUPABASE_URL missing')
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: env.VITE_SUPABASE_ANON_KEY ?? '' },
    })
    record('Supabase reachable', res.status < 500, `HTTP ${res.status}`)
  } catch (err) {
    record('Supabase reachable', false, err.message)
  }
}

async function checkRlsOnCases() {
  // An anon client should be rejected from reading `cases` without a session.
  // A successful read with no rows or a 401/403 both indicate RLS is on.
  // A 200 with rows from anon would indicate RLS is off — FAIL.
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return record('RLS on cases', false, 'Supabase keys missing')
  try {
    const res = await fetch(`${url}/rest/v1/cases?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (res.status === 401 || res.status === 403) {
      return record('RLS on cases', true, `anon rejected (${res.status})`)
    }
    const body = await res.json().catch(() => null)
    if (Array.isArray(body) && body.length === 0) {
      return record('RLS on cases', true, 'anon sees no rows')
    }
    record('RLS on cases', false, 'anon can read rows — policies are off')
  } catch (err) {
    record('RLS on cases', false, err.message)
  }
}

async function checkCorpusSeeded() {
  const url = env.VITE_SUPABASE_URL
  const srk = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !srk) return record('Corpus seeded', false, 'service role key missing')
  try {
    const res = await fetch(`${url}/rest/v1/knowledge_base?select=id`, {
      headers: {
        apikey: srk,
        Authorization: `Bearer ${srk}`,
        Prefer: 'count=exact',
        Range: '0-0',
      },
    })
    const range = res.headers.get('content-range') ?? ''
    const total = parseInt(range.split('/')[1] ?? '0', 10)
    record('Corpus seeded', total > 0, `knowledge_base rows: ${total}`)
  } catch (err) {
    record('Corpus seeded', false, err.message)
  }
}

async function checkEdgeFunctions() {
  const url = env.VITE_SUPABASE_URL
  if (!url) return
  const base = url.replace('.supabase.co', '.functions.supabase.co')
  for (const name of EDGE_FUNCTIONS) {
    try {
      // OPTIONS is safe and should return 200/204 if the function is deployed.
      const res = await fetch(`${base}/${name}`, { method: 'OPTIONS' })
      record(`edge fn: ${name}`, res.status < 500, `HTTP ${res.status}`)
    } catch (err) {
      record(`edge fn: ${name}`, false, err.message)
    }
  }
}

async function checkTwilioNumber() {
  const sid = env.TWILIO_ACCOUNT_SID
  const token = env.TWILIO_AUTH_TOKEN
  const from = env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) {
    return record('Twilio number', false, 'Twilio env vars missing')
  }
  try {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64')
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(from)}`,
      { headers: { Authorization: `Basic ${auth}` } },
    )
    if (res.status !== 200) {
      return record('Twilio number', false, `HTTP ${res.status}`)
    }
    const body = await res.json()
    const match = (body.incoming_phone_numbers ?? []).some((n) => n.phone_number === from)
    record('Twilio number', match, match ? from : `${from} not found on account`)
  } catch (err) {
    record('Twilio number', false, err.message)
  }
}

console.log('Verifying Ayudafema deployment...\n')

await checkSupabaseReachable()
await checkRlsOnCases()
await checkCorpusSeeded()
await checkEdgeFunctions()
await checkTwilioNumber()

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)

if (failed.length > 0) {
  console.log('\nFailed checks — see docs/RUNBOOK.md for remediation:')
  for (const r of failed) console.log(`  - ${r.name}`)
  process.exit(1)
}
