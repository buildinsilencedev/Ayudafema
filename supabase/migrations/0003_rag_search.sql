-- M4: match_knowledge_base RPC — used by the RAG helper in draftAppeal.
-- Returns the top-k knowledge_base chunks by cosine similarity.

create or replace function public.match_knowledge_base(
  query_embedding vector(1536),
  match_count     int default 8
)
returns table (
  id       uuid,
  source   text,
  chunk    text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    source,
    chunk,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from public.knowledge_base
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Grants: anon + authenticated can call this (content is public reference text).
grant execute on function public.match_knowledge_base to anon, authenticated;

-- pg_cron schedule for reminder workflows (M6).
-- Added here so the extension is available before M6 migrations run.
create extension if not exists pg_cron;
