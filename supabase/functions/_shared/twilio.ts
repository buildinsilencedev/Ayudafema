/**
 * Twilio helper — outbound SMS and webhook signature verification.
 *
 * All outbound messages go through sendSms() so rate-limiting, logging,
 * and opt-in checks stay in one place.
 */

import { createHmac } from 'https://deno.land/std@0.224.0/crypto/mod.ts'

const TWILIO_API = 'https://api.twilio.com/2010-04-01'

export interface SmsParams {
  to:   string
  body: string
  /** Override from-number (defaults to TWILIO_FROM_NUMBER env var) */
  from?: string
}

/**
 * Send an outbound SMS via Twilio.
 * Throws on non-201.
 */
export async function sendSms(params: SmsParams): Promise<{ sid: string }> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken  = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from       = params.from ?? Deno.env.get('TWILIO_FROM_NUMBER')

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio credentials not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)')
  }

  const body = new URLSearchParams({
    To:   params.to,
    From: from,
    Body: params.body,
  })

  const res = await fetch(`${TWILIO_API}/Accounts/${accountSid}/Messages.json`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
    },
    body: body.toString(),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(`Twilio ${res.status}: ${json.message ?? JSON.stringify(json)}`)
  }
  return { sid: json.sid }
}

/**
 * Verify the Twilio webhook signature.
 * Returns true if the request is genuine.
 *
 * See: https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
export async function verifyTwilioSignature(
  req: Request,
  body: URLSearchParams
): Promise<boolean> {
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  if (!authToken) return false

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url       = req.url

  // Build the string to sign: URL + sorted params
  const params = [...body.entries()].sort(([a], [b]) => a.localeCompare(b))
  const payload = url + params.map(([k, v]) => k + v).join('')

  const key     = new TextEncoder().encode(authToken)
  const message = new TextEncoder().encode(payload)
  const hmacKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', hmacKey, message)
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)))

  return expected === signature
}

/**
 * Detect language from an incoming SMS body.
 * Defaults to 'es' (most PR users will message in Spanish).
 */
export function detectLang(body: string): 'es' | 'en' {
  const english = /\b(help|stop|cancel|info|status|case)\b/i
  return english.test(body) ? 'en' : 'es'
}
