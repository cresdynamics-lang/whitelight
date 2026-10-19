#!/usr/bin/env bash
# Deploy Whitelight SPA + API to DigitalOcean (whitelightstore.co.ke → do-new / 143.198.169.74).
# IMPORTANT: never rsync --delete over uploads/ (product images).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOST="${WL_HOST:-do-new}"
WEB_ROOT="${WL_WEB_ROOT:-/var/www/sites/whitelightstore.co.ke}"
API_ROOT="${WL_API_ROOT:-/var/www/sites/whitelight-api/server}"
SITE_USER="${WL_SITE_USER:-site_whitelight}"

cd "$ROOT/whitelight"
# Prefer live catalogue for prerender/sitemap when building off-server
if curl -fsS "https://whitelightstore.co.ke/api/catalog" -o public/catalog.json; then
  echo "→ Refreshed public/catalog.json from live API"
fi
npm run build

echo "→ Syncing frontend to $WEB_ROOT (preserving uploads/)..."
rsync -az --delete \
  --exclude 'uploads/' \
  -e ssh \
  dist/ "$HOST:$WEB_ROOT/"

echo "→ Syncing API sources..."
rsync -az \
  -e ssh \
  server/src/ "$HOST:$API_ROOT/src/"
# Keep package files if present for dependency installs on server
if [[ -f server/package.json ]]; then
  rsync -az -e ssh server/package.json server/package-lock.json "$HOST:$API_ROOT/" || true
fi

echo "→ Ensuring nginx serves prerendered HTML paths + restarting API..."
ssh "$HOST" "bash -s" <<EOF
set -euo pipefail
CONF=/etc/nginx/sites-available/whitelightstore
if sudo test -f "\$CONF" && sudo grep -q 'try_files \\\$uri \\\$uri/ /index.html;' "\$CONF"; then
  sudo sed -i 's|try_files \\\$uri \\\$uri/ /index.html;|try_files \\\$uri \\\$uri/index.html /index.html;|g' "\$CONF"
  sudo nginx -t
  sudo systemctl reload nginx
  echo "nginx try_files updated for prerender"
else
  echo "nginx try_files already customized or different — left unchanged"
  sudo grep -n 'try_files' "\$CONF" || true
fi
sudo -u ${SITE_USER} bash -lc 'cd /var/www/sites/whitelight-api && pm2 restart whitelight-api && pm2 describe whitelight-api | head -20'
EOF

echo "✓ Deploy complete — https://whitelightstore.co.ke"
