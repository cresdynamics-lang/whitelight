#!/usr/bin/env bash
# Deploy Whitelight SPA + API to the droplet.
# IMPORTANT: never rsync --delete over /var/www/whitelight/uploads (product images).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOST="${WL_HOST:-root@64.227.13.96}"
SSH_OPTS="${WL_SSH_OPTS:--o PreferredAuthentications=password -o PubkeyAuthentication=no}"

cd "$ROOT/whitelight"
npm run build

echo "→ Syncing frontend (preserving uploads/)..."
rsync -az --delete \
  --exclude 'uploads/' \
  -e "ssh $SSH_OPTS" \
  dist/ "$HOST:/var/www/whitelight/"

echo "→ Syncing API..."
rsync -az \
  -e "ssh $SSH_OPTS" \
  server/src/ "$HOST:/opt/whitelight/server/src/"

echo "→ Restarting API..."
ssh $SSH_OPTS "$HOST" 'systemctl restart whitelight-api && systemctl is-active whitelight-api'

echo "✓ Deploy complete — https://whitelightstore.co.ke"
