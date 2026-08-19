#!/usr/bin/env bash
# Run ON the droplet AFTER DNS A records for whitelightstore.co.ke (+ www)
# point to this server's public IP (64.227.13.96).
set -euo pipefail
certbot --nginx \
  -d whitelightstore.co.ke \
  -d www.whitelightstore.co.ke \
  --non-interactive --agree-tos \
  -m admin@whitelightstore.co.ke \
  --redirect
systemctl reload nginx
echo "SSL OK — https://whitelightstore.co.ke"
