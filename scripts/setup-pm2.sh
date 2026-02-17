#!/bin/bash
# Setup PM2 process manager
# Run as the whitelight user (not root)

set -e

PROJECT_DIR="/home/whitelight/whitelight"
BACKEND_DIR="$PROJECT_DIR/whitelight-backend"

echo "🚀 Setting up PM2..."

cd "$BACKEND_DIR" || exit 1

# Install dependencies
npm install --production

# Start app with PM2
pm2 start server.js --name whitelight-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo ""
echo "✅ PM2 setup complete!"
