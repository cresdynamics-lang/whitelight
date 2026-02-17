#!/usr/bin/env bash
# Commands to run on DigitalOcean server console
# Copy and paste these commands one by one
# If project user is not cresdynamics, set: PROJECT_USER=brian (or your user)

PROJECT_USER="${PROJECT_USER:-cresdynamics}"
PROJECT_DIR="/home/$PROJECT_USER/whitelight"

# 1. Backup .env files
echo "=== Step 1: Backup .env files ==="
mkdir -p ~/backups/env_$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups/env_$(date +%Y%m%d_%H%M%S)
cp $PROJECT_DIR/whitelight-backend/.env $BACKUP_DIR/backend.env 2>/dev/null && echo "✅ Backend .env backed up" || echo "⚠️  Backend .env not found"
cp $PROJECT_DIR/whitelight/.env $BACKUP_DIR/frontend.env 2>/dev/null && echo "✅ Frontend .env backed up" || echo "⚠️  Frontend .env not found"
echo "Backup location: $BACKUP_DIR"

# 2. Pull latest code
echo ""
echo "=== Step 2: Pull latest code ==="
cd $PROJECT_DIR
git config --global --add safe.directory $PROJECT_DIR 2>/dev/null || true
git pull origin main || git pull origin master
echo "✅ Code updated"

# 3. Update backend
echo ""
echo "=== Step 3: Update backend ==="
cd $PROJECT_DIR/whitelight-backend
npm install --production
echo "✅ Backend dependencies updated"

# 4. Restart backend
echo ""
echo "=== Step 4: Restart backend ==="
if command -v pm2 &> /dev/null; then
  pm2 restart all || pm2 start server.js --name whitelight-backend
  pm2 save
  echo "✅ Backend restarted with PM2"
  pm2 list
else
  echo "⚠️  PM2 not found, trying systemd..."
  sudo systemctl restart whitelight-backend || echo "⚠️  No systemd service found"
fi

# 5. Verify
echo ""
echo "=== Step 5: Verification ==="
echo "Backend status:"
pm2 list 2>/dev/null || systemctl status whitelight-backend --no-pager -l 2>/dev/null || echo "Check manually"

echo ""
echo "✅ Deployment complete!"
echo "Check logs: pm2 logs (or systemctl status whitelight-backend)"
