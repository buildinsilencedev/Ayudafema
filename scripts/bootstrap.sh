#!/usr/bin/env bash
# bootstrap.sh — one-command Phase 1 deploy for Ayudafema.
#
# Usage:
#   npm run bootstrap
#
# What it does:
#   1. Verifies Node >= 20 and the Supabase CLI are installed.
#   2. Verifies .env.local exists and has the required keys.
#   3. Prompts for --project-ref the first time and links the repo.
#   4. Runs database migrations against the linked project.
#   5. Pushes backend secrets to Supabase.
#   6. Deploys all edge functions.
#   7. Seeds the RAG corpus (text-embedding-3-small).
#   8. Runs verify-deployment.mjs and reports PASS/FAIL.
#
# Idempotent: safe to re-run after a partial failure. Each step is a no-op
# when already complete.

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RESET='\033[0m'

say()   { printf '%s\n' "$*"; }
ok()    { printf "${GREEN}%s${RESET}\n" "$*"; }
warn()  { printf "${YELLOW}%s${RESET}\n" "$*"; }
fail()  { printf "${RED}%s${RESET}\n" "$*" >&2; exit 1; }
step()  { printf '\n—— %s ——\n' "$*"; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ── 1. Prereqs ────────────────────────────────────────────────────────────────
step "Checking prerequisites"

if ! command -v node >/dev/null 2>&1; then
  fail "Node is not installed. Install Node 20+ from https://nodejs.org/"
fi
node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$node_major" -lt 20 ]]; then
  fail "Node $node_major detected. Ayudafema requires Node 20 or newer."
fi
ok "Node $(node -v)"

if ! command -v supabase >/dev/null 2>&1; then
  fail "Supabase CLI not installed. See https://supabase.com/docs/guides/cli/getting-started"
fi
ok "Supabase CLI $(supabase --version 2>/dev/null | head -n1)"

# ── 2. .env.local ─────────────────────────────────────────────────────────────
step "Checking .env.local"

if [[ ! -f .env.local ]]; then
  fail ".env.local not found. Copy .env.example to .env.local and fill in values (see docs/DESPLIEGUE.md)."
fi

required_keys=(
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  OPENROUTER_API_KEY
  OPENAI_API_KEY
)
missing=()
for key in "${required_keys[@]}"; do
  if ! grep -qE "^${key}=.+" .env.local; then
    missing+=("$key")
  fi
done
if [[ ${#missing[@]} -gt 0 ]]; then
  fail ".env.local is missing values for: ${missing[*]}"
fi
ok ".env.local has all required keys"

# Load SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / OPENAI_API_KEY into the
# environment for the ingest step and for the promotion snippet.
set -a
# shellcheck disable=SC1091
source <(
  sed -n 's/^\([A-Z_][A-Z0-9_]*\)=\(.*\)$/\1="\2"/p' .env.local
)
set +a
export SUPABASE_URL="${VITE_SUPABASE_URL:-}"

# ── 3. Supabase link ──────────────────────────────────────────────────────────
step "Linking Supabase project"

PROJECT_REF_FILE=".supabase/project-ref"
if [[ -f "$PROJECT_REF_FILE" ]]; then
  PROJECT_REF="$(cat "$PROJECT_REF_FILE")"
  ok "Using saved project-ref: $PROJECT_REF"
else
  say "Find your project-ref at Supabase → Project Settings → General → Reference ID."
  read -r -p "Enter Supabase project-ref: " PROJECT_REF
  if [[ -z "$PROJECT_REF" ]]; then
    fail "project-ref is required."
  fi
  mkdir -p .supabase
  printf '%s\n' "$PROJECT_REF" > "$PROJECT_REF_FILE"
fi

if ! supabase link --project-ref "$PROJECT_REF" >/dev/null 2>&1; then
  warn "supabase link failed. You may need to run 'supabase login' first."
  supabase link --project-ref "$PROJECT_REF"
fi
ok "Linked to $PROJECT_REF"

# ── 4. Migrations ─────────────────────────────────────────────────────────────
step "Pushing database migrations"
npm run db:push
ok "Migrations applied"

# ── 5. Secrets ────────────────────────────────────────────────────────────────
step "Setting edge-function secrets"
npm run functions:secrets
ok "Secrets pushed"

# ── 6. Edge functions ─────────────────────────────────────────────────────────
step "Deploying edge functions"
npm run functions:deploy
ok "Edge functions deployed"

# ── 7. Corpus ingest ──────────────────────────────────────────────────────────
step "Seeding knowledge base"
if [[ -d content/corpus ]] && compgen -G "content/corpus/*.txt" >/dev/null; then
  npm run corpus:ingest
  ok "Corpus seeded"
else
  warn "content/corpus/ is empty — skipping ingest. Add regulation .txt files and run 'npm run corpus:ingest' later."
fi

# ── 8. Optional attorney promotion hint ──────────────────────────────────────
if [[ -n "${BOOTSTRAP_ATTORNEY_EMAIL:-}" ]]; then
  step "First-attorney promotion"
  say "After ${BOOTSTRAP_ATTORNEY_EMAIL} signs in once, run this SQL in the"
  say "Supabase SQL editor to grant review privileges:"
  say ""
  say "  update auth.users"
  say "  set raw_user_meta_data ="
  say "    coalesce(raw_user_meta_data, '{}'::jsonb) || '{\"role\":\"attorney\"}'::jsonb"
  say "  where email = '${BOOTSTRAP_ATTORNEY_EMAIL}';"
  say ""
fi

# ── 9. Verify ─────────────────────────────────────────────────────────────────
step "Running post-deploy verification"
if npm run verify; then
  ok "All checks passed."
else
  warn "Verification reported failures. See output above and docs/RUNBOOK.md."
  exit 1
fi

printf '\n'
ok "Phase 1 deploy complete."
say "Next: deploy the frontend to Cloudflare Pages (see docs/DESPLIEGUE.md §6)."
