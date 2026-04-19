-- M3: parse_log — audit trail for every OCR/extraction attempt.
-- Keeps token counts for cost tracking and confidence scores for
-- deciding when to fall back to manual entry.

create table public.parse_log (
  id               uuid primary key default gen_random_uuid(),
  case_id          uuid not null references public.cases(id) on delete cascade,
  document_id      uuid references public.documents(id) on delete set null,
  model            text not null,
  input_hash       text,                 -- sha256 of raw file bytes (dedup)
  output           jsonb,                -- raw parsed JSON fields
  input_tokens     int,
  output_tokens    int,
  overall_confidence float,
  error            text,                 -- set when extraction failed / threw
  created_at       timestamptz not null default now()
);

create index on public.parse_log (case_id);
create index on public.parse_log (created_at);

-- RLS: owner reads own logs; admin reads all; service-role writes.
alter table public.parse_log enable row level security;

create policy "owner read own parse_log"
  on public.parse_log for select
  using (
    case_id in (
      select id from public.cases where user_id = auth.uid()
    )
  );

create policy "admin read all parse_log"
  on public.parse_log for select
  using ( (auth.jwt() ->> 'role') = 'admin' );

-- service_role INSERT is allowed implicitly (bypasses RLS).
