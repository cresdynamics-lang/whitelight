#!/usr/bin/env bash
# Verify everything after droplet restart
# Run on server console
# PROJECT_USER=cresdynamics (or brian, etc.)

PROJECT_USER="${PROJECT_USER:-cresdynamics}"
PROJECT_DIR="/home/$PROJECT_USER/whitelight"

echo "🔍 Verifying system after restart..."
echo ""

# 1. Check if backend is running
echo "1️⃣ Backend Status:"
if command -v pm2 &> /dev/null; then
  pm2 list
  echo ""
  echo "Backend logs (last 10 lines):"
  pm2 logs --lines 10 --nostream 2>/dev/null || echo "No logs yet"
else
  echo "⚠️  PM2 not found, checking systemd..."
  systemctl status whitelight-backend --no-pager -l 2>/dev/null || echo "⚠️  Service not found"
fi

echo ""
echo "2️⃣ Database Connection:"
cd "$PROJECT_DIR/whitelight-backend" 2>/dev/null || cd /root/whitelight/whitelight-backend
node -e "
require('dotenv').config();
const { pool } = require('./config/database');
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully');
    conn.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  });
" 2>&1

echo ""
echo "3️⃣ API Health Check:"
curl -s http://localhost:5000/api/health | head -5 || echo "❌ API not responding"

echo ""
echo "4️⃣ .env Files:"
[ -f "$PROJECT_DIR/whitelight-backend/.env" ] && echo "✅ Backend .env exists" || echo "❌ Backend .env missing"
[ -f "$PROJECT_DIR/whitelight/.env" ] && echo "✅ Frontend .env exists" || echo "❌ Frontend .env missing"

echo ""
echo "5️⃣ Recent Code Changes:"
cd "$PROJECT_DIR" 2>/dev/null || cd /root/whitelight
git log --oneline -5 2>/dev/null || echo "⚠️  Could not check git log"

echo ""
echo "✅ Verification complete!"
