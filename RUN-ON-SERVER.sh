#!/bin/bash
# Copy and paste this entire script into your server terminal

cd /home/whitelight/whitelight || cd /home/cresdynamics/whitelight || cd /home/brian/whitelight || exit 1

echo "📥 Pulling latest code..."
git pull origin main || git pull origin master

echo ""
echo "🗄️  Running database migrations..."
cd whitelight-backend
node scripts/runMigrations.js || echo "⚠️  Migrations skipped or failed"
cd ..

echo ""
echo "🔨 Rebuilding frontend..."
cd whitelight
rm -rf dist node_modules/.vite
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

echo ""
echo "🔄 Restarting services..."
sudo systemctl reload nginx
pm2 restart all || sudo systemctl restart whitelight-backend

echo ""
echo "✅ Done! Site should be working at https://whitelightstore.co.ke"
