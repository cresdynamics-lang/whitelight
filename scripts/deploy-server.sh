#!/usr/bin/env bash
# Deployment script for DigitalOcean server
# Run on server console: bash <(curl -s <url>) or copy-paste contents

set -e

# Server user (change if different: brian, cresdynamics, etc.)
PROJECT_USER="${PROJECT_USER:-cresdynamics}"
PROJECT_DIR="/home/$PROJECT_USER/whitelight"
BACKUP_DIR="/home/$PROJECT_USER/backups/$(date +%Y%m%d_%H%M%S)"
USER="$PROJECT_USER"

echo "🚀 Starting deployment..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup .env files
echo "📦 Backing up .env files..."
if [ -f "$PROJECT_DIR/whitelight-backend/.env" ]; then
  cp "$PROJECT_DIR/whitelight-backend/.env" "$BACKUP_DIR/backend.env"
  echo "✅ Backed up backend .env"
fi
if [ -f "$PROJECT_DIR/whitelight/.env" ]; then
  cp "$PROJECT_DIR/whitelight/.env" "$BACKUP_DIR/frontend.env"
  echo "✅ Backed up frontend .env"
fi

# Switch to project user if running as root
if [ "$(whoami)" = "root" ]; then
  echo "⚠️  Running as root, switching to $USER..."
  su - "$USER" << 'EOF'
cd "$PROJECT_DIR" || exit 1

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || git pull origin master

# Update backend
echo "📦 Updating backend..."
cd whitelight-backend
npm install --production

# Run DB migrations (keeps DB in sync with code, e.g. training category)
if [ -f "scripts/runMigrations.js" ]; then
  echo "🗄️  Running database migrations..."
  node scripts/runMigrations.js || echo "⚠️  Migrations failed (MySQL down or already applied)"
fi

# Restart backend (PM2)
if command -v pm2 &> /dev/null; then
  echo "🔄 Restarting backend with PM2..."
  pm2 restart all || pm2 start server.js --name whitelight-backend
else
  echo "⚠️  PM2 not found, checking systemd..."
  sudo systemctl restart whitelight-backend || echo "⚠️  No systemd service found"
fi

# Update frontend (if building on server)
cd ../whitelight
if [ -f "package.json" ]; then
  echo "📦 Updating frontend..."
  npm install
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
  npm run build
fi

echo "✅ Deployment complete!"
EOF
else
  # Running as project user
  cd "$PROJECT_DIR" || exit 1
  
  echo "📥 Pulling latest code..."
  git pull origin main || git pull origin master
  
  echo "📦 Updating backend..."
  cd whitelight-backend
  npm install --production
  
  if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting backend with PM2..."
    pm2 restart all || pm2 start server.js --name whitelight-backend
  fi
  
  cd ../whitelight
  if [ -f "package.json" ]; then
    echo "📦 Updating frontend..."
    npm install
    export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
    npm run build
  fi
  
  echo "✅ Deployment complete!"
fi

echo "📋 Backup saved to: $BACKUP_DIR"
echo "🔍 Check status: pm2 list (or systemctl status whitelight-backend)"
