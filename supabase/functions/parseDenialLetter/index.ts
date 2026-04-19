/**
 * parseDenialLetter — Supabase Edge Function
 *
 * M2 STUB: returns shaped fake data so the frontend pipeline works
 * end-to-end before real OCR lands in M3.
 *
 * M3 will replace this body with:
 *   1. Load document signed URL from Storage
 *   2. Call OpenRouter (claude-haiku-4.5) with vision + structured-output prompt
 *   3. Validate fields, score confidence
 *   4. Update cases row + log to parse_log
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { caseId } = await req.json()

    if (!caseId) {
      return new Response(JSON.stringify({ error: 'caseId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // M2 stub: simulate high-confidence extraction with demo values.
    // In M3 this becomes real OCR output.
    const fakeExtraction = {
      denialCode:       { value: '120', confidence: 0.97 },
      letterDate:       { value: '2026-04-05', confidence: 0.99 },
      applicantName:    { value: 'María R.', confidence: 0.95 },
      disasterCode:     { value: 'DR-4671-PR', confidence: 0.98 },
      disasterName:     { value: 'Huracán Fiona (2022)', confidence: 0.94 },
      applicantAddress: { value: 'Yabucoa, PR', confidence: 0.90 },
      rawText:          '[M2 stub — real OCR lands in M3]',
      overallConfidence: 0.90,
    }

    // Simulate async delay (OCR takes ~5–15s in production)
    await new Promise((r) => setTimeout(r, 1500))

    // Update case row with extracted values
    const { error: updateError } = await supabase
      .from('cases')
      .update({
        denial_code:          fakeExtraction.denialCode.value,
        denial_letter_date:   fakeExtraction.letterDate.value,
        applicant_name:       fakeExtraction.applicantName.value,
        disaster_code:        fakeExtraction.disasterCode.value,
        disaster_name:        fakeExtraction.disasterName.value,
        applicant_address:    fakeExtraction.applicantAddress.value,
        denial_letter_raw_text: fakeExtraction.rawText,
        status: fakeExtraction.overallConfidence >= 0.8 ? 'evidence' : 'needs_manual',
      })
      .eq('id', caseId)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(fakeExtraction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
