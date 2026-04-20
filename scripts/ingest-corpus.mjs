#!/usr/bin/env node
/**
 * ingest-corpus.mjs — embed corpus files into knowledge_base.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=... \
 *   node scripts/ingest-corpus.mjs
 *
 * Options:
 *   --dry-run   Print chunks without inserting
 *   --clear     Delete existing knowledge_base rows before inserting
 *
 * Chunking: 2048 chars (~512 tokens @ 4 chars/token), 256-char overlap.
 * Model: text-embedding-3-small (1536 dims, matches pgvector index).
 *
 * Requires Node 20+ (uses global fetch, fs/promises, import.meta.url).
 */

import { readFile, readdir, stat } from 'node:fs/promises'
import { join, resolve, relative } from 'node:path'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

const CORPUS_DIR    = resolve(process.cwd(), 'content', 'corpus')
const CHUNK_CHARS   = 2048
const OVERLAP_CHARS = 256
const EMBED_MODEL   = 'text-embedding-3-small'
const EMBED_DIMS    = 1536
const BATCH_SIZE    = 20

const args     = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const doClear  = args.includes('--clear')

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('ERROR: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY must be set.')
  console.error('See docs/DESPLIEGUE.md — these come from your Supabase and OpenAI dashboards.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ─── Walk a directory for .txt files ─────────────────────────────────────────

async function walkTxt(dir) {
  const out = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch (err) {
    if (err.code === 'ENOENT') return out
    throw err
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...await walkTxt(full))
    } else if (entry.isFile() && full.toLowerCase().endsWith('.txt')) {
      out.push(full)
    }
  }
  return out
}

// ─── Chunk a text file ───────────────────────────────────────────────────────

function chunkText(text, source) {
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
    if (end === text.length) break
    start = end - OVERLAP_CHARS
    if (start < 0) start = 0
  }
  return chunks
}

// ─── Embed a batch via OpenAI ────────────────────────────────────────────────

async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
  return json.data.map((d) => d.embedding)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Corpus directory: ${CORPUS_DIR}`)

  try {
    await stat(CORPUS_DIR)
  } catch {
    console.error(`ERROR: ${CORPUS_DIR} does not exist. Add corpus .txt files first.`)
    process.exit(1)
  }

  const files = await walkTxt(CORPUS_DIR)
  if (files.length === 0) {
    console.error(`ERROR: no .txt files found under ${CORPUS_DIR}.`)
    console.error('Populate content/corpus/ with regulation text before running ingest.')
    process.exit(1)
  }

  console.log(`Found ${files.length} corpus file(s):`)
  for (const f of files) console.log(`  ${relative(process.cwd(), f)}`)

  const allChunks = []
  for (const filePath of files) {
    const source = filePath.split(/[\\/]/).pop()
    const text   = await readFile(filePath, 'utf8')
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
    return
  }

  if (doClear) {
    console.log('\nClearing existing knowledge_base rows…')
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) throw new Error(`Clear failed: ${error.message}`)
    console.log('Cleared.')
  }

  let totalTokensEst = 0
  let inserted = 0

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch      = allChunks.slice(i, i + BATCH_SIZE)
    const texts      = batch.map((c) => c.chunk)
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

  console.log('\n\nDone.')
  console.log(`  Chunks inserted: ${inserted}`)
  console.log(`  Estimated tokens: ~${totalTokensEst.toLocaleString()}`)
  console.log(`  Estimated cost: ~$${((totalTokensEst / 1_000_000) * 0.02).toFixed(4)} (text-embedding-3-small @ $0.02/1M)`)
}

main().catch((err) => {
  console.error('\nFailed:', err.message)
  process.exit(1)
})
