#!/usr/bin/env bash
# set-secrets.sh — push backend secrets from .env.local to Supabase edge functions.
#
# Reads .env.local (in repo root), skips anything prefixed VITE_ (frontend/public),
# skips anything prefixed N8N_ (Phase 2 / Railway only), and pipes the rest to
# `supabase secrets set`.
#
# Requires: Supabase CLI logged in (`supabase login`) and project linked
# (`supabase link --project-ref <ref>`).

set -euo pipefail

ENV_FILE=".env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: $ENV_FILE not found. Copy .env.example to .env.local first." >&2
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "error: supabase CLI not installed. See https://supabase.com/docs/guides/cli" >&2
  exit 1
fi

ARGS=()
while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  [[ "$key" =~ ^VITE_ ]] && continue
  [[ "$key" =~ ^N8N_ ]] && continue
  [[ -z "$value" ]] && continue
  value="${value%\"}"
  value="${value#\"}"
  ARGS+=("$key=$value")
done < "$ENV_FILE"

if [[ ${#ARGS[@]} -eq 0 ]]; then
  echo "no backend secrets found in $ENV_FILE" >&2
  exit 1
fi

echo "pushing ${#ARGS[@]} secret(s) to Supabase..."
supabase secrets set "${ARGS[@]}"
echo "done. Verify with: supabase secrets list"
