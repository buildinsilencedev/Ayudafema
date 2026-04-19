/**
 * purgeOldCases — Supabase Edge Function (daily via pg_cron)
 *
 * Deletes cases (and all cascaded data) that:
 * - Are in a terminal status: approved, denied, archived
 * - Were last updated more than 90 days ago
 *
 * Before deleting, purges all Storage files attached to the case
 * to avoid orphaned blobs. Cascades in SQL handle child table rows.
 *
 * Scheduled via pg_cron: see supabase/migrations/0004_cron.sql
 * Can also be triggered manually: POST /functions/v1/purgeOldCases
 * service_role key required.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RETENTION_DAYS = 90
const TERMINAL_STATUSES = ['approved', 'denied', 'archived']

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

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const results = { cases_deleted: 0, files_purged: 0, errors: 0 }

  try {
    // ── Find eligible cases ──────────────────────────────────────────────────
    const { data: targets, error: findErr } = await supabase
      .from('cases')
      .select('id')
      .in('status', TERMINAL_STATUSES)
      .lt('updated_at', cutoff)

    if (findErr) throw new Error(`Find failed: ${findErr.message}`)
    if (!targets || targets.length === 0) {
      console.log('[purgeOldCases] Nothing to purge.')
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const caseIds = targets.map((c: { id: string }) => c.id)
    console.log(`[purgeOldCases] Purging ${caseIds.length} case(s)…`)

    // ── Purge Storage files before deleting rows ─────────────────────────────
    const { data: docs } = await supabase
      .from('documents')
      .select('storage_path, kind')
      .in('case_id', caseIds)

    for (const doc of (docs ?? [])) {
      const bucket = doc.kind === 'denial_letter' ? 'denial-letters'
        : doc.kind === 'appeal_draft' ? 'drafts'
        : 'evidence'

      const { error: rmErr } = await supabase.storage
        .from(bucket)
        .remove([doc.storage_path])

      if (rmErr) {
        console.warn(`[purgeOldCases] Storage remove failed: ${doc.storage_path}`, rmErr.message)
        results.errors++
      } else {
        results.files_purged++
      }
    }

    // ── Delete cases (cascades to all child tables) ──────────────────────────
    const { error: deleteErr } = await supabase
      .from('cases')
      .delete()
      .in('id', caseIds)

    if (deleteErr) throw new Error(`Delete failed: ${deleteErr.message}`)
    results.cases_deleted = caseIds.length

    console.log(`[purgeOldCases] Done: ${JSON.stringify(results)}`)
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[purgeOldCases]', err)
    return new Response(JSON.stringify({ error: String(err), ...results }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
