#!/usr/bin/env bash
# Verify deployment - check backend, database, image upload, SEO
# Run on server console

echo "🔍 Verifying deployment..."

# Check backend is running
echo "1️⃣ Checking backend..."
if command -v pm2 &> /dev/null; then
  pm2 list | grep -i white || echo "⚠️  No whitelight process in PM2"
else
  systemctl status whitelight-backend --no-pager -l || echo "⚠️  Backend service not found"
fi

# Check database connection
echo ""
echo "2️⃣ Testing database connection..."
cd /home/brian/whitelight/whitelight-backend
node -e "
require('dotenv').config();
const { pool } = require('./config/database');
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected');
    conn.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  });
" 2>&1 || echo "⚠️  Could not test DB"

# Check .env files exist
echo ""
echo "3️⃣ Checking .env files..."
[ -f "/home/brian/whitelight/whitelight-backend/.env" ] && echo "✅ Backend .env exists" || echo "❌ Backend .env missing"
[ -f "/home/brian/whitelight/whitelight/.env" ] && echo "✅ Frontend .env exists" || echo "❌ Frontend .env missing"

# Check CORS config in server.js
echo ""
echo "4️⃣ Checking CORS configuration..."
grep -q "localhost:8080" /home/brian/whitelight/whitelight-backend/server.js && echo "✅ CORS allows localhost" || echo "⚠️  CORS may not allow localhost"

# Check image upload limit
echo ""
echo "5️⃣ Checking image upload limit..."
grep -q "upload.array('images', 10)" /home/brian/whitelight/whitelight-backend/routes/products.js && echo "✅ Max 10 images configured" || echo "⚠️  Image limit may not be 10"

echo ""
echo "✅ Verification complete!"
