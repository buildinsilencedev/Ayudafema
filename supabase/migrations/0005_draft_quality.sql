-- 0005_draft_quality.sql
--
-- Adds a `draft_quality` column to `drafts` so attorneys know whether a
-- draft was generated from code-specific RAG passages or only the base
-- IAPPG framework. Defaults to 'general_framework' — the conservative
-- assumption — so old rows surface as "needs extra scrutiny" in the
-- review queue.

alter table public.drafts
  add column if not exists draft_quality text
    not null default 'general_framework'
    check (draft_quality in ('code_specific', 'general_framework'));

comment on column public.drafts.draft_quality is
  'How the draft was sourced: code_specific (RAG returned passages that mention the denial code) or general_framework (base IAPPG/CFR citations only). Attorney review should scrutinize general_framework drafts more carefully.';
