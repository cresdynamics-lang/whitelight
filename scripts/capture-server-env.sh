#!/usr/bin/env bash
# Capture environment variables from the whitelight server.
# Usage: ./scripts/capture-server-env.sh [user@ip]
# Example: ./scripts/capture-server-env.sh root@167.172.126.204
# You will be prompted for SSH password (or use your SSH key).

REMOTE="${1:-root@167.172.126.204}"
RAW="/tmp/whitelight_server_env.txt"
BACKEND_ENV="$(dirname "$0")/../whitelight-backend/.env"

echo "Connecting to $REMOTE ..."
ssh "$REMOTE" 'printenv; echo "---"; for f in /root/whitelight/whitelight-backend/.env /var/www/whitelight-backend/.env .env; do [ -f "$f" ] && { echo "=== $f ==="; cat "$f"; }; done' > "$RAW" 2>/dev/null || ssh "$REMOTE" printenv > "$RAW"

echo "Raw output saved to $RAW"

# Wanted keys (one per line)
WANTED="PORT
FRONTEND_URL
NODE_ENV
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
JWT_SECRET
DO_SPACES_ENDPOINT
DO_SPACES_KEY
DO_SPACES_SECRET
DO_SPACES_BUCKET
DO_SPACES_CDN_URL"

mkdir -p "$(dirname "$BACKEND_ENV")"
echo "# Captured from $REMOTE on $(date)" > "$BACKEND_ENV"
while IFS= read -r key; do
  [ -z "$key" ] && continue
  line=$(grep -E "^${key}=" "$RAW" 2>/dev/null | head -1)
  [ -n "$line" ] && echo "$line" >> "$BACKEND_ENV"
done <<< "$WANTED"

# If no matches from printenv, take any .env block from the raw output
if ! grep -qE "^[A-Za-z_][A-Za-z0-9_]*=." "$BACKEND_ENV"; then
  sed -n '/=== .*\.env ===/,/=== \|^---$/p' "$RAW" | grep -E "^[A-Za-z_][A-Za-z0-9_]*=." >> "$BACKEND_ENV" 2>/dev/null || true
fi
if ! grep -qE "^[A-Za-z_][A-Za-z0-9_]*=." "$BACKEND_ENV"; then
  grep -E "^[A-Za-z_][A-Za-z0-9_]*=." "$RAW" >> "$BACKEND_ENV" 2>/dev/null || true
fi

echo "Backend .env written to $BACKEND_ENV"
echo "Review and edit as needed (e.g. set DB_HOST=localhost for local)."
