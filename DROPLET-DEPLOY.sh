#!/bin/bash
# Paste this entire file into your Digital Ocean droplet console, or run: bash DROPLET-DEPLOY.sh

set -e

# Go to project (adjust path if your app lives elsewhere)
cd /home/whitelight/whitelight || cd /home/cresdynamics/whitelight || cd /home/brian/whitelight || { echo "❌ Project dir not found. Edit the cd paths in this script."; exit 1; }

echo "📥 Pulling latest code..."
git pull origin main || git pull origin master

echo ""
echo "📦 Backend: install + migrations..."
cd whitelight-backend
npm install --production
node scripts/runMigrations.js || echo "⚠️  Migrations skipped or failed"
cd ..

echo ""
echo "📦 Frontend: install + build..."
cd whitelight
npm install
rm -rf dist node_modules/.vite
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
npm run build
cd ..

echo ""
echo "🔄 Restarting services..."
pm2 restart all 2>/dev/null && pm2 save 2>/dev/null || sudo systemctl restart whitelight-backend 2>/dev/null || true
sudo systemctl reload nginx 2>/dev/null || true

echo ""
echo "✅ Deploy done. Site: https://whitelightstore.co.ke"
