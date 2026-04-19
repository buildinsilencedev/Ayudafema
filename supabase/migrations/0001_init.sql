-- ============================================================
-- Ayudafema — Initial schema
-- ============================================================
-- Run via: supabase db push
-- All tables have RLS enabled. Service-role is used for admin
-- operations and edge functions only — never exposed to client.
-- ============================================================

create extension if not exists vector;

-- ------------------------------------------------------------
-- profiles: extends auth.users with role + preferences
-- ------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           text not null default 'user'
                   check (role in ('user','attorney','admin')),
  phone          text,
  preferred_lang text not null default 'es'
                   check (preferred_lang in ('es','en')),
  sms_opt_in     boolean not null default false,
  sms_opt_in_at  timestamptz,
  created_at     timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- denial_codes: FEMA denial code reference (seed in seed.sql)
-- ------------------------------------------------------------
create table public.denial_codes (
  code        text primary key,
  label_es    text not null,
  label_en    text not null,
  window_days int  not null default 60,
  playbook_id text not null
);
alter table public.denial_codes enable row level security;

-- ------------------------------------------------------------
-- cases: one row per appeal attempt per user
-- ------------------------------------------------------------
create table public.cases (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  applicant_name        text,
  disaster_code         text,          -- e.g. 'DR-4671-PR'
  disaster_name         text,          -- e.g. 'Hurricane Fiona'
  denial_code           text references public.denial_codes(code),
  denial_letter_date    date,
  denial_letter_raw_text text,
  applicant_address     text,
  status                text not null default 'intake'
                          check (status in (
                            'intake',
                            'ocr_pending',
                            'needs_manual',
                            'evidence',
                            'drafting',
                            'under_review',
                            'ready',
                            'submitted',
                            'approved',
                            'denied',
                            'archived'
                          )),
  appeal_lang           text not null default 'es'
                          check (appeal_lang in ('es','en')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index on public.cases (user_id);
create index on public.cases (status);
alter table public.cases enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger cases_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- evidence: per-case checklist state
-- ------------------------------------------------------------
create table public.evidence (
  case_id     uuid not null references public.cases(id) on delete cascade,
  evidence_id text not null,
  attached    boolean not null default false,
  storage_path text,
  uploaded_at timestamptz,
  primary key (case_id, evidence_id)
);
alter table public.evidence enable row level security;

-- ------------------------------------------------------------
-- documents: uploaded files (denial letters, evidence, drafts)
-- ------------------------------------------------------------
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid not null references public.cases(id) on delete cascade,
  kind         text not null check (kind in ('denial_letter','evidence','appeal_draft')),
  evidence_id  text,
  storage_path text not null,
  mime_type    text not null,
  size_bytes   bigint not null,
  uploaded_at  timestamptz not null default now()
);
alter table public.documents enable row level security;

-- ------------------------------------------------------------
-- drafts: LLM-generated appeal letters (versioned)
-- ------------------------------------------------------------
create table public.drafts (
  id                uuid primary key default gen_random_uuid(),
  case_id           uuid not null references public.cases(id) on delete cascade,
  version           int  not null,
  body_es           text,
  body_en           text,
  model             text not null default 'static',
  attorney_reviewed boolean not null default false,
  reviewed_by       uuid references auth.users(id),
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  unique (case_id, version)
);
alter table public.drafts enable row level security;

-- ------------------------------------------------------------
-- reviews: attorney action log (audit trail)
-- ------------------------------------------------------------
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  draft_id    uuid not null references public.drafts(id) on delete cascade,
  attorney_id uuid not null references auth.users(id),
  action      text not null check (action in ('approve','request_changes','reject')),
  notes       text,
  created_at  timestamptz not null default now()
);
alter table public.reviews enable row level security;

-- ------------------------------------------------------------
-- submissions: user-reported send events (FEMA has no API)
-- ------------------------------------------------------------
create table public.submissions (
  id               uuid primary key default gen_random_uuid(),
  case_id          uuid not null references public.cases(id) on delete cascade,
  method           text not null check (method in ('mail','fax','online_portal','in_person')),
  reference_number text,
  submitted_at     timestamptz not null,
  created_at       timestamptz not null default now()
);
alter table public.submissions enable row level security;

-- ------------------------------------------------------------
-- sms_log: outbound + inbound transcript
-- ------------------------------------------------------------
create table public.sms_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id),
  case_id    uuid references public.cases(id),
  direction  text not null check (direction in ('in','out')),
  to_phone   text,
  from_phone text,
  body       text not null,
  twilio_sid text,
  created_at timestamptz not null default now()
);
alter table public.sms_log enable row level security;

-- ------------------------------------------------------------
-- knowledge_base: pgvector RAG corpus (populated in M4)
-- ------------------------------------------------------------
create table public.knowledge_base (
  id         uuid primary key default gen_random_uuid(),
  source     text not null,
  chunk      text not null,
  embedding  vector(1536) not null,
  metadata   jsonb,
  created_at timestamptz not null default now()
);
create index on public.knowledge_base
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
alter table public.knowledge_base enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles -------------------------------------------------------
create policy "profiles: owner read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: attorney read all"
  on public.profiles for select
  using ((auth.jwt() ->> 'role') in ('attorney','admin'));

create policy "profiles: admin update role"
  on public.profiles for update
  using ((auth.jwt() ->> 'role') = 'admin');

-- denial_codes ---------------------------------------------------
create policy "denial_codes: public read"
  on public.denial_codes for select
  using (true);

-- cases ----------------------------------------------------------
create policy "cases: owner all"
  on public.cases for all
  using (auth.uid() = user_id);

create policy "cases: attorney read under_review"
  on public.cases for select
  using (
    (auth.jwt() ->> 'role') in ('attorney','admin')
    and status in ('under_review','ready')
  );

create policy "cases: attorney update status"
  on public.cases for update
  using (
    (auth.jwt() ->> 'role') in ('attorney','admin')
    and status in ('under_review','ready')
  );

create policy "cases: admin read all"
  on public.cases for select
  using ((auth.jwt() ->> 'role') = 'admin');

-- evidence -------------------------------------------------------
create policy "evidence: owner all"
  on public.evidence for all
  using (
    exists (
      select 1 from public.cases c
      where c.id = evidence.case_id and c.user_id = auth.uid()
    )
  );

create policy "evidence: attorney read under_review"
  on public.evidence for select
  using (
    (auth.jwt() ->> 'role') in ('attorney','admin')
    and exists (
      select 1 from public.cases c
      where c.id = evidence.case_id and c.status in ('under_review','ready')
    )
  );

-- documents ------------------------------------------------------
create policy "documents: owner all"
  on public.documents for all
  using (
    exists (
      select 1 from public.cases c
      where c.id = documents.case_id and c.user_id = auth.uid()
    )
  );

create policy "documents: attorney read under_review"
  on public.documents for select
  using (
    (auth.jwt() ->> 'role') in ('attorney','admin')
    and exists (
      select 1 from public.cases c
      where c.id = documents.case_id and c.status in ('under_review','ready')
    )
  );

-- drafts ---------------------------------------------------------
create policy "drafts: owner read"
  on public.drafts for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = drafts.case_id and c.user_id = auth.uid()
    )
  );

create policy "drafts: attorney read under_review"
  on public.drafts for select
  using (
    (auth.jwt() ->> 'role') in ('attorney','admin')
    and exists (
      select 1 from public.cases c
      where c.id = drafts.case_id and c.status in ('under_review','ready')
    )
  );

create policy "drafts: attorney update review fields"
  on public.drafts for update
  using ((auth.jwt() ->> 'role') in ('attorney','admin'));

-- reviews --------------------------------------------------------
create policy "reviews: attorney insert"
  on public.reviews for insert
  with check ((auth.jwt() ->> 'role') in ('attorney','admin'));

create policy "reviews: attorney read all"
  on public.reviews for select
  using ((auth.jwt() ->> 'role') in ('attorney','admin'));

create policy "reviews: owner read own case"
  on public.reviews for select
  using (
    exists (
      select 1 from public.drafts d
      join public.cases c on c.id = d.case_id
      where d.id = reviews.draft_id and c.user_id = auth.uid()
    )
  );

-- submissions ----------------------------------------------------
create policy "submissions: owner all"
  on public.submissions for all
  using (
    exists (
      select 1 from public.cases c
      where c.id = submissions.case_id and c.user_id = auth.uid()
    )
  );

-- sms_log --------------------------------------------------------
create policy "sms_log: owner read"
  on public.sms_log for select
  using (auth.uid() = user_id);

create policy "sms_log: admin read all"
  on public.sms_log for select
  using ((auth.jwt() ->> 'role') = 'admin');

-- knowledge_base -------------------------------------------------
create policy "knowledge_base: public read"
  on public.knowledge_base for select
  using (true);

-- ============================================================
-- ATOMIC APPROVE FUNCTION
-- Approves a draft and advances case status in a single tx.
-- Called from the attorney review queue only.
-- ============================================================
create or replace function public.approve_draft(
  _draft_id   uuid,
  _attorney   uuid,
  _notes      text default null
)
returns void language plpgsql security definer as $$
declare
  _case_id uuid;
begin
  update public.drafts
     set attorney_reviewed = true,
         reviewed_by       = _attorney,
         reviewed_at       = now()
   where id = _draft_id
  returning case_id into _case_id;

  if _case_id is null then
    raise exception 'draft not found: %', _draft_id;
  end if;

  update public.cases
     set status = 'ready'
   where id = _case_id;

  insert into public.reviews (draft_id, attorney_id, action, notes)
  values (_draft_id, _attorney, 'approve', _notes);
end $$;
