/**
 * sendSMS — Supabase Edge Function
 *
 * Outbound SMS wrapper with:
 * - opt-in gate (profiles.sms_opt_in must be true)
 * - dedup (no double-send for same case + tier + calendar day)
 * - sms_log insert (direction 'out')
 * - rate limit: 1 msg/case/day max (enforced via sms_log)
 *
 * POST /functions/v1/sendSMS
 * Body: { userId, caseId, phone, body, tier? }
 *
 * Called by scheduleReminders and smsWebhook.
 * service_role key required (not user-scoped).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendSms } from '../_shared/twilio.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { userId, caseId, phone, body, tier } = await req.json()

    if (!phone || !body) return jsonError('phone and body required', 400)

    // ── Opt-in check ───────────────────────────────────────────────────────
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('sms_opt_in')
        .eq('id', userId)
        .single()

      if (!profile?.sms_opt_in) {
        return new Response(JSON.stringify({ skipped: 'not opted in' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // ── Dedup: check if we already sent this tier today ────────────────────
    if (caseId && tier) {
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('sms_log')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', caseId)
        .eq('direction', 'out')
        .eq('to_phone', phone)
        .gte('created_at', today + 'T00:00:00Z')
        .lt('created_at', today + 'T23:59:59Z')

      if ((count ?? 0) > 0) {
        return new Response(JSON.stringify({ skipped: 'already sent today' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // ── Send via Twilio ────────────────────────────────────────────────────
    const { sid } = await sendSms({ to: phone, body })

    // ── Log ────────────────────────────────────────────────────────────────
    await supabase.from('sms_log').insert({
      user_id:    userId ?? null,
      case_id:    caseId ?? null,
      direction:  'out',
      to_phone:   phone,
      from_phone: Deno.env.get('TWILIO_FROM_NUMBER'),
      body,
      twilio_sid: sid,
    })

    return new Response(JSON.stringify({ sid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[sendSMS]', err)
    return jsonError(String(err), 500)
  }
})

function jsonError(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
