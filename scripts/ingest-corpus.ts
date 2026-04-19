#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env
/**
 * ingest-corpus.ts — embed corpus files into knowledge_base.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=... \
 *   deno run --allow-read --allow-net --allow-env scripts/ingest-corpus.ts
 *
 * Options:
 *   --dry-run   Print chunks without inserting
 *   --clear     Delete existing knowledge_base rows before inserting
 *
 * Chunking: 512-token approximation (1 token ≈ 4 chars), 64-char overlap.
 * Model: text-embedding-3-small (1536 dims, matches pgvector index).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'
import { walk } from 'https://deno.land/std@0.224.0/fs/walk.ts'

const CORPUS_DIR    = join(Deno.cwd(), 'content', 'corpus')
const CHUNK_CHARS   = 2048   // ~512 tokens @ 4 chars/token
const OVERLAP_CHARS = 256    // ~64 tokens overlap
const EMBED_MODEL   = 'text-embedding-3-small'
const EMBED_DIMS    = 1536
const BATCH_SIZE    = 20     // embed N chunks per API call

const isDryRun = Deno.args.includes('--dry-run')
const doClear  = Deno.args.includes('--clear')

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
const openaiKey = Deno.env.get('OPENAI_API_KEY')!

// ─── Chunk a text file ────────────────────────────────────────────────────────

function chunkText(
  text: string,
  source: string
): Array<{ source: string; chunk: string; metadata: Record<string, number> }> {
  const chunks = []
  let start = 0
  let idx = 0
  while (start < text.length) {
    const end = Math.min(start + CHUNK_CHARS, text.length)
    chunks.push({
      source,
      chunk:    text.slice(start, end),
      metadata: { chunk_index: idx, char_start: start, char_end: end },
    })
    idx++
    start = end - OVERLAP_CHARS
    if (start < 0) start = 0
    if (end === text.length) break
  }
  return chunks
}

// ─── Embed a batch ────────────────────────────────────────────────────────────

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model:      EMBED_MODEL,
      input:      texts,
      dimensions: EMBED_DIMS,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Embeddings API ${res.status}: ${err}`)
  }
  const json = await res.json()
  return json.data.map((d: { embedding: number[] }) => d.embedding)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`Corpus directory: ${CORPUS_DIR}`)

// Collect all .txt files
const files: string[] = []
for await (const entry of walk(CORPUS_DIR, { exts: ['.txt'], includeDirs: false })) {
  files.push(entry.path)
}
console.log(`Found ${files.length} corpus file(s): ${files.map((f) => f.split(/[\\/]/).pop()).join(', ')}`)

// Build all chunks
const allChunks: Array<{ source: string; chunk: string; metadata: Record<string, number> }> = []
for (const filePath of files) {
  const source = filePath.split(/[\\/]/).pop()!
  const text   = await Deno.readTextFile(filePath)
  const chunks = chunkText(text, source)
  allChunks.push(...chunks)
  console.log(`  ${source}: ${text.length} chars → ${chunks.length} chunk(s)`)
}

console.log(`\nTotal chunks: ${allChunks.length}`)

if (isDryRun) {
  console.log('\n[dry-run] First 2 chunks:')
  allChunks.slice(0, 2).forEach((c, i) => {
    console.log(`\n[${i}] ${c.source} chunk ${c.metadata.chunk_index}:`)
    console.log(c.chunk.slice(0, 200) + '…')
  })
  console.log('\n[dry-run] Exiting without inserting.')
  Deno.exit(0)
}

// Optionally clear existing rows
if (doClear) {
  console.log('\nClearing existing knowledge_base rows…')
  const { error } = await supabase.from('knowledge_base').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw new Error(`Clear failed: ${error.message}`)
  console.log('Cleared.')
}

// Embed + insert in batches
let totalTokensEst = 0
let inserted = 0

for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
  const batch     = allChunks.slice(i, i + BATCH_SIZE)
  const texts     = batch.map((c) => c.chunk)
  const embeddings = await embedBatch(texts)

  totalTokensEst += texts.reduce((sum, t) => sum + Math.ceil(t.length / 4), 0)

  const rows = batch.map((c, j) => ({
    source:    c.source,
    chunk:     c.chunk,
    embedding: embeddings[j],
    metadata:  c.metadata,
  }))

  const { error } = await supabase.from('knowledge_base').insert(rows)
  if (error) throw new Error(`Insert failed at batch ${i}: ${error.message}`)

  inserted += batch.length
  process.stdout.write(`\rInserted ${inserted}/${allChunks.length} chunks…`)
}

console.log('\n\n✓ Done.')
console.log(`  Chunks inserted: ${inserted}`)
console.log(`  Estimated tokens: ~${totalTokensEst.toLocaleString()}`)
console.log(`  Estimated cost: ~$${((totalTokensEst / 1_000_000) * 0.02).toFixed(4)} (text-embedding-3-small @ $0.02/1M)`)
