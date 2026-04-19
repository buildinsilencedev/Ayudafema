/**
 * scheduleReminders — Supabase Edge Function (called hourly by pg_cron)
 *
 * Selects cases with appeal deadlines at T-30/14/7/2 days from today.
 * For each, checks sms_log for dedup, then calls sendSMS.
 *
 * TCPA compliance:
 * - Only sends to profiles.sms_opt_in = true
 * - Only sends to profiles.phone (not null)
 * - All messages include STOP instructions (via Twilio messaging service footer)
 *
 * POST /functions/v1/scheduleReminders (invoked by pg_cron or manually)
 * service_role required.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Days before deadline when we send each reminder tier
const REMINDER_TIERS = [30, 14, 7, 2] as const
type Tier = typeof REMINDER_TIERS[number]

// SMS template per tier per language
const TEMPLATES: Record<Tier, Record<'es' | 'en', (date: string) => string>> = {
  30: {
    es: (date) => `FEMA te dio hasta el ${date} para apelar. Podemos ayudarte — gratis. Responde SÍ o visita ayudafema.org`,
    en: (date) => `FEMA gave you until ${date} to appeal. We can help — free. Reply YES or visit ayudafema.org`,
  },
  14: {
    es: (_) => `Quedan 14 días para tu apelación de FEMA. ¿Necesitas ayuda con las pruebas? Responde SÍ.`,
    en: (_) => `14 days left for your FEMA appeal. Need help with evidence? Reply YES.`,
  },
  7: {
    es: (_) => `Quedan 7 días. Tu apelación está lista, solo falta enviarla. Responde ENVIAR para ver los pasos.`,
    en: (_) => `7 days left. Your appeal is ready — just needs to be sent. Reply SEND for next steps.`,
  },
  2: {
    es: (date) => `Quedan 2 días. Tu apelación vence el ${date}. Llama a Ayuda Legal PR: 1-800-981-5342`,
    en: (date) => `2 days left. Your appeal deadline is ${date}. Call Ayuda Legal PR: 1-800-981-5342`,
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const results = { sent: 0, skipped: 0, errors: 0 }

  try {
    const today    = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // For each reminder tier, compute the target deadline date
    for (const tier of REMINDER_TIERS) {
      const targetDate = new Date(today)
      targetDate.setUTCDate(targetDate.getUTCDate() + tier)
      const targetDateStr = targetDate.toISOString().split('T')[0]

      // Find cases whose denial_letter_date + 60 days = targetDate
      // i.e. denial_letter_date = targetDate - 60 days
      const letterDateStr = new Date(
        targetDate.getTime() - 60 * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0]

      // Load cases + user profiles for this tier
      const { data: cases, error: caseErr } = await supabase
        .from('cases')
        .select(`
          id,
          user_id,
          denial_letter_date,
          status,
          profiles!inner (
            phone,
            sms_opt_in,
            preferred_lang
          )
        `)
        .eq('denial_letter_date', letterDateStr)
        .in('status', ['evidence', 'drafting', 'under_review', 'ready', 'submitted'])
        .eq('profiles.sms_opt_in', true)
        .not('profiles.phone', 'is', null)

      if (caseErr) {
        console.error(`[scheduleReminders] tier ${tier} query error:`, caseErr.message)
        results.errors++
        continue
      }

      for (const c of (cases ?? [])) {
        const profile = (c as { profiles: { phone: string; sms_opt_in: boolean; preferred_lang: string } }).profiles
        const lang: 'es' | 'en' = (profile.preferred_lang === 'en') ? 'en' : 'es'

        // Format deadline date for the template
        const deadline = new Date(letterDateStr + 'T12:00:00Z')
        deadline.setUTCDate(deadline.getUTCDate() + 60)
        const deadlineFormatted = deadline.toLocaleDateString(
          lang === 'es' ? 'es-PR' : 'en-US',
          { month: 'long', day: 'numeric', year: 'numeric' }
        )

        const smsBody = TEMPLATES[tier][lang](deadlineFormatted)

        // Invoke sendSMS (handles its own dedup + logging)
        const { error: smsErr } = await supabase.functions.invoke('sendSMS', {
          body: {
            userId: c.user_id,
            caseId: c.id,
            phone:  profile.phone,
            body:   smsBody,
            tier:   `T-${tier}`,
          },
        })

        if (smsErr) {
          console.error(`[scheduleReminders] sendSMS error case ${c.id}:`, smsErr.message)
          results.errors++
        } else {
          results.sent++
        }
      }
    }

    console.log(`[scheduleReminders] ${todayStr}: sent=${results.sent} skipped=${results.skipped} errors=${results.errors}`)

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[scheduleReminders] fatal:', err)
    return new Response(JSON.stringify({ error: String(err), ...results }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
