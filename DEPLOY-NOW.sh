#!/bin/bash
# Complete deployment script - Copy entire block and paste into server SSH terminal

set -e

echo "🚀 Starting deployment..."

# Detect project user
if [ -d "/home/cresdynamics/whitelight" ]; then
  PROJECT_DIR="/home/cresdynamics/whitelight"
  USER="cresdynamics"
elif [ -d "/home/brian/whitelight" ]; then
  PROJECT_DIR="/home/brian/whitelight"
  USER="brian"
else
  echo "❌ Project directory not found"
  exit 1
fi

cd "$PROJECT_DIR"

echo "📥 Pulling latest code..."
git pull origin main || git pull origin master

echo ""
echo "🔨 Rebuilding frontend..."
cd whitelight
rm -rf dist node_modules/.vite
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

if [ ! -f "dist/index.html" ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "✅ Build successful!"

echo ""
echo "🔄 Restarting services..."
sudo systemctl reload nginx
pm2 restart all || sudo systemctl restart whitelight-backend

echo ""
echo "✅ Deployment complete!"
echo "🌐 Site: https://whitelightstore.co.ke"
