#!/usr/bin/env bash
# Run from your LOCAL machine (uses your SSH keys). Updates the droplet and deploys.
# Usage: ./scripts/update-server.sh   or   bash scripts/update-server.sh

set -e

REMOTE="${1:-whitelight@167.172.126.204}"
PROJECT_DIR="/home/whitelight/whitelight"

echo "Updating server at $REMOTE ..."
ssh -o ConnectTimeout=15 "$REMOTE" "cd $PROJECT_DIR && (git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || git pull) && bash DROPLET-DEPLOY.sh"

echo ""
echo "Done. Site: https://whitelightstore.co.ke"
