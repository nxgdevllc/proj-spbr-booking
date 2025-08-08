#!/bin/bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: scripts/run-sql.sh path/to/file.sql"
  exit 1
fi

SQL_FILE="$1"
if [ ! -f "$SQL_FILE" ]; then
  echo "❌ File not found: $SQL_FILE"
  exit 1
fi

# Load .env.local if present
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

: "${SUPABASE_DB_HOST:?Set SUPABASE_DB_HOST in .env.local (copy exact Host from Supabase → Project Settings → Database)}"
: "${SUPABASE_DB_PASSWORD:?Set SUPABASE_DB_PASSWORD in .env.local}"

# Allow overriding port and options. Defaults:
SUPABASE_DB_PORT=${SUPABASE_DB_PORT:-5432}
# If using pooled hosts like aws-0-<region>.pooler.supabase.com, default port is 6543
if [[ "$SUPABASE_DB_HOST" == *"pooler.supabase.com"* && "${SUPABASE_DB_PORT}" == "5432" ]]; then
  SUPABASE_DB_PORT=6543
fi

# Optional: options string (e.g., options=project=<ref>)
SUPABASE_DB_OPTIONS_PART=""
if [ -n "${SUPABASE_DB_OPTIONS:-}" ]; then
  SUPABASE_DB_OPTIONS_PART=" options=${SUPABASE_DB_OPTIONS}"
fi

CONN_STRING="host=${SUPABASE_DB_HOST} port=${SUPABASE_DB_PORT} dbname=postgres user=postgres sslmode=require password=${SUPABASE_DB_PASSWORD}${SUPABASE_DB_OPTIONS_PART}"

echo "▶️ Running $SQL_FILE on $SUPABASE_DB_HOST:$SUPABASE_DB_PORT (db: postgres, user: postgres, ssl: require)"
PGCONNECT_TIMEOUT=20 psql "$CONN_STRING" -v ON_ERROR_STOP=1 -f "$SQL_FILE"

echo "✅ Done"
