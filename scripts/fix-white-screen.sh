#!/usr/bin/env bash
# Fix white screen - rebuild and deploy
PROJECT_USER="${PROJECT_USER:-cresdynamics}"
PROJECT_DIR="/home/$PROJECT_USER/whitelight"

cd "$PROJECT_DIR/whitelight" || exit 1

# Clean old build
rm -rf dist node_modules/.vite

# Rebuild with increased memory
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

# Verify build
if [ ! -f "dist/index.html" ]; then
  echo "❌ Build failed - dist/index.html missing"
  exit 1
fi

# Restart Nginx to clear cache
sudo systemctl reload nginx

echo "✅ Fixed - site should work now"
