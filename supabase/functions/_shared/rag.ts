/**
 * RAG helper — embed a query and retrieve top-k chunks from knowledge_base.
 *
 * Uses OpenAI text-embedding-3-small (1536 dims) to match the pgvector index.
 * Can be proxied through OpenRouter but the native OpenAI endpoint is simpler
 * for embeddings since OpenRouter doesn't expose embeddings directly.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_EMBED_URL = 'https://api.openai.com/v1/embeddings'
const EMBED_MODEL      = 'text-embedding-3-small'
const EMBED_DIMS       = 1536

export interface KnowledgeChunk {
  id:       string
  source:   string
  chunk:    string
  metadata: Record<string, unknown> | null
}

/**
 * Embed `query` with text-embedding-3-small and return the top-k most
 * similar chunks from knowledge_base, ordered by cosine similarity.
 */
export async function retrieveChunks(
  query: string,
  k = 8
): Promise<KnowledgeChunk[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) throw new Error('OPENAI_API_KEY not configured')

  // ── Embed the query ──────────────────────────────────────────────────────
  const embedRes = await fetch(OPENAI_EMBED_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model:      EMBED_MODEL,
      input:      query,
      dimensions: EMBED_DIMS,
    }),
  })

  if (!embedRes.ok) {
    const err = await embedRes.text().catch(() => '')
    throw new Error(`Embeddings API ${embedRes.status}: ${err}`)
  }

  const embedJson = await embedRes.json()
  const vector: number[] = embedJson.data?.[0]?.embedding
  if (!vector || vector.length !== EMBED_DIMS) {
    throw new Error('Unexpected embedding response shape')
  }

  // ── Vector search ────────────────────────────────────────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Uses the ivfflat cosine index defined in 0001_init.sql
  const { data, error } = await supabase.rpc('match_knowledge_base', {
    query_embedding: vector,
    match_count:     k,
  })

  if (error) throw new Error(`RAG search failed: ${error.message}`)
  return (data ?? []) as KnowledgeChunk[]
}

/**
 * Format retrieved chunks into a compact context block for the prompt.
 * Truncates at ~4000 chars to stay within the context window budget.
 */
export function formatContext(chunks: KnowledgeChunk[], maxChars = 4000): string {
  let out = ''
  for (const c of chunks) {
    const entry = `[${c.source}]\n${c.chunk}\n\n`
    if (out.length + entry.length > maxChars) break
    out += entry
  }
  return out.trim()
}
