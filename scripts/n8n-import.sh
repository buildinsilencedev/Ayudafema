#!/usr/bin/env bash
# n8n-import.sh — POST each workflow JSON to a running n8n instance.
#
# Phase 2 only. Skip if n8n isn't deployed yet — pg_cron handles the core
# scheduled work (SMS reminders, 90-day purge) without n8n.
#
# Requires N8N_WEBHOOK_URL, N8N_BASIC_AUTH_USER, N8N_BASIC_AUTH_PASSWORD
# in .env.local (all three populated).

set -euo pipefail

ENV_FILE=".env.local"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${N8N_WEBHOOK_URL:-}" ]]; then
  echo "N8N_WEBHOOK_URL not set — skipping n8n import."
  echo "This is expected for Phase 1 deployments. See docs/ARCHITECTURE.md."
  exit 0
fi

if [[ -z "${N8N_BASIC_AUTH_USER:-}" || -z "${N8N_BASIC_AUTH_PASSWORD:-}" ]]; then
  echo "error: N8N_BASIC_AUTH_USER and N8N_BASIC_AUTH_PASSWORD must be set." >&2
  exit 1
fi

WORKFLOW_DIR="n8n/workflows"
count=0

for f in "$WORKFLOW_DIR"/*.json; do
  name=$(basename "$f")
  echo "importing $name..."
  curl -fsS \
    -u "$N8N_BASIC_AUTH_USER:$N8N_BASIC_AUTH_PASSWORD" \
    -H "Content-Type: application/json" \
    --data-binary "@$f" \
    "$N8N_WEBHOOK_URL/rest/workflows" > /dev/null
  count=$((count + 1))
done

echo "imported $count workflow(s). Activate them in the n8n UI at $N8N_WEBHOOK_URL"
