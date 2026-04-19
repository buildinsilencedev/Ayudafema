-- M6: pg_cron schedule for SMS deadline reminders.
-- scheduleReminders runs hourly and sends SMS for T-30/14/7/2 day tiers.

-- pg_cron was enabled in migration 0003_rag_search.sql.
-- This migration just registers the cron job.

-- Note: cron.job table only exists after pg_cron is enabled.
-- Supabase enables pg_cron by default on Pro+; enable manually on free tier.

select cron.schedule(
  'send-deadline-reminders',
  '0 * * * *',   -- every hour on the hour
  $$
    select net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/scheduleReminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- workflow_failures DLQ table (used by M7 n8n but defined here to avoid
-- migration ordering issues — better to have it early).
create table if not exists public.workflow_failures (
  id            uuid primary key default gen_random_uuid(),
  workflow      text not null,
  payload       jsonb not null,
  error         text not null,
  attempt_count int  not null default 1,
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz
);

alter table public.workflow_failures enable row level security;
create policy "admin read workflow_failures"
  on public.workflow_failures for select
  using ( (auth.jwt() ->> 'role') = 'admin' );
