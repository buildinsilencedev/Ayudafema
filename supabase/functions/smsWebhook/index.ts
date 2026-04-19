/**
 * smsWebhook — Supabase Edge Function (Twilio inbound webhook)
 *
 * Route: POST /functions/v1/smsWebhook
 * Configured in Twilio Console → Messaging Service → Inbound webhook URL
 *
 * Handles:
 *  STOP/ALTO/NO/CANCEL  → opt-out (Twilio handles the auto-reply;
 *                          we also persist the flag in profiles)
 *  HELP/AYUDA/INFO      → send bilingual help message
 *  CASE <id>            → look up case status and reply
 *  SÍ/YES               → send continuation link to current active case
 *  <anything else>      → friendly fallback with contact info
 *
 * TCPA: Twilio automatically handles STOP unsubscription at the carrier level.
 * We additionally set profiles.sms_opt_in = false so our reminder cron
 * also stops sending.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendSms, verifyTwilioSignature, detectLang } from '../_shared/twilio.ts'

Deno.serve(async (req) => {
  // Twilio expects TwiML or empty 200 response
  const twimlOk = () => new Response(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { headers: { 'Content-Type': 'text/xml' } }
  )

  if (req.method !== 'POST') return twimlOk()

  const rawBody = await req.text()
  const body    = new URLSearchParams(rawBody)

  // Verify Twilio signature in production
  const isDev = Deno.env.get('DENO_ENV') === 'development'
  if (!isDev) {
    const valid = await verifyTwilioSignature(req, body)
    if (!valid) {
      return new Response('Forbidden', { status: 403 })
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const fromPhone = body.get('From') ?? ''
  const msgBody   = (body.get('Body') ?? '').trim()
  const lang      = detectLang(msgBody)
  const normalized = msgBody.toUpperCase().replace(/\s+/g, ' ')

  // ── Log inbound ───────────────────────────────────────────────────────────
  // Best-effort; don't fail the webhook if logging fails
  supabase.from('sms_log').insert({
    direction:  'in',
    from_phone: fromPhone,
    body:       msgBody,
  }).catch(console.warn)

  // ── Route ─────────────────────────────────────────────────────────────────

  // STOP (handled by Twilio auto-reply too, but we persist the opt-out)
  if (/^(STOP|ALTO|NO|CANCEL|CANCELAR|UNSUBSCRIBE)$/.test(normalized)) {
    await optOut(supabase, fromPhone)
    return twimlOk()
  }

  // HELP
  if (/^(HELP|AYUDA|INFO)$/.test(normalized)) {
    await reply(fromPhone, HELP_COPY[lang])
    return twimlOk()
  }

  // CASE <id> — status lookup
  const caseMatch = normalized.match(/^CASE\s+([A-Z0-9]{6,8})$/)
  if (caseMatch) {
    await replyCaseStatus(supabase, fromPhone, caseMatch[1], lang)
    return twimlOk()
  }

  // SÍ/YES/SI — continuation link
  if (/^(SÍ|SI|YES)$/.test(normalized)) {
    const siteUrl = Deno.env.get('VITE_SITE_URL') ?? 'https://ayudafema.org'
    const linkMsg = lang === 'es'
      ? `Continúa tu apelación aquí: ${siteUrl} — Ayuda Legal PR: 1-800-981-5342`
      : `Continue your appeal here: ${siteUrl} — Ayuda Legal PR: 1-800-981-5342`
    await reply(fromPhone, linkMsg)
    return twimlOk()
  }

  // Default fallback
  await reply(fromPhone, FALLBACK_COPY[lang])
  return twimlOk()
})

// ── Helpers ───────────────────────────────────────────────────────────────────

async function optOut(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  phone: string
): Promise<void> {
  await supabase
    .from('profiles')
    .update({ sms_opt_in: false })
    .eq('phone', phone)
}

async function reply(to: string, body: string): Promise<void> {
  await sendSms({ to, body }).catch(console.error)
}

async function replyCaseStatus(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  phone: string,
  caseShortId: string,
  lang: 'es' | 'en'
): Promise<void> {
  // Match by first 8 chars of UUID (case insensitive)
  const { data: cases } = await supabase
    .from('cases')
    .select('id, status, denial_letter_date')
    .ilike('id', `${caseShortId}%`)
    .limit(1)

  const caseRow = cases?.[0]

  if (!caseRow) {
    const msg = lang === 'es'
      ? `No encontramos ese caso. Llama a Ayuda Legal PR: 1-800-981-5342`
      : `Case not found. Call Ayuda Legal PR: 1-800-981-5342`
    await reply(phone, msg)
    return
  }

  const statusLabels: Record<string, Record<'es' | 'en', string>> = {
    intake:       { es: 'en proceso inicial', en: 'in intake' },
    evidence:     { es: 'recopilando evidencia', en: 'gathering evidence' },
    drafting:     { es: 'preparando el borrador', en: 'preparing draft' },
    under_review: { es: 'bajo revisión de abogado', en: 'under attorney review' },
    ready:        { es: 'listo para enviar', en: 'ready to send' },
    submitted:    { es: 'enviado a FEMA', en: 'submitted to FEMA' },
    approved:     { es: 'aprobado por FEMA', en: 'approved by FEMA' },
    denied:       { es: 'negado por FEMA', en: 'denied by FEMA' },
  }

  const statusLabel = statusLabels[caseRow.status]?.[lang] ?? caseRow.status
  const msg = lang === 'es'
    ? `Tu caso ${caseShortId}: ${statusLabel}. Para más ayuda: 1-800-981-5342`
    : `Your case ${caseShortId}: ${statusLabel}. For help: 1-800-981-5342`

  await reply(phone, msg)
}

const HELP_COPY = {
  es: 'Ayudafema.org — apelaciones FEMA gratis para Puerto Rico. Para hablar con alguien: 1-800-981-5342. Para parar mensajes: STOP.',
  en: 'Ayudafema.org — free FEMA appeals for Puerto Rico. To speak with someone: 1-800-981-5342. To stop messages: STOP.',
}

const FALLBACK_COPY = {
  es: 'Para apelaciones FEMA gratis, visita ayudafema.org o llama a Ayuda Legal PR: 1-800-981-5342. Para parar mensajes: STOP.',
  en: 'For free FEMA appeals, visit ayudafema.org or call Ayuda Legal PR: 1-800-981-5342. To stop messages: STOP.',
}
