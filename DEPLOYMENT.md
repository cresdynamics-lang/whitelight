# 🚀 Server Deployment Guide

## Quick Deploy (Run on Server Console)

**1. Backup .env files first:**
```bash
cd /home/brian/whitelight
mkdir -p ~/backups/env_$(date +%Y%m%d_%H%M%S)
cp whitelight-backend/.env ~/backups/env_$(date +%Y%m%d_%H%M%S)/backend.env
cp whitelight/.env ~/backups/env_$(date +%Y%m%d_%H%M%S)/frontend.env
```

**2. Pull latest code and restart:**
```bash
cd /home/brian/whitelight
git pull origin main
cd whitelight-backend
npm install
pm2 restart all
```

**3. Verify:**
```bash
pm2 list
pm2 logs --lines 20
```

---

## What's Updated

✅ **CORS** - Now allows localhost:8080, localhost:5173 for local dev  
✅ **Image Upload** - Max 10 images (was 5)  
✅ **Admin UX** - Shows "X / 10 images", seamless upload feedback  
✅ **SEO** - Comprehensive structured data, product pages optimized  
✅ **Image Loading** - Optimized for low networks (WebP, lazy loading, fetchPriority)

---

## Verify Everything Works

**1. Backend API:**
```bash
curl http://localhost:5000/api/health
```

**2. Database:**
```bash
cd /home/brian/whitelight/whitelight-backend
node -e "require('dotenv').config(); const {pool} = require('./config/database'); pool.getConnection().then(c => {console.log('✅ DB OK'); c.release(); process.exit(0);}).catch(e => {console.error('❌ DB:', e.message); process.exit(1);});"
```

**3. Test Image Upload:**
```bash
cd /home/brian/whitelight/whitelight-backend
API_BASE_URL=http://localhost:5000/api node scripts/test-image-upload.js
```

---

## Domain Note

Current codebase uses `whitelightstore.co.ke`. If your domain is `whitelight.co.ke`, update:
- `whitelight-backend/server.js` - FRONTEND_URL
- `whitelight/src/components/seo/SEOHead.tsx` - BASE_URL
- `whitelight/src/utils/seo.ts` - BASE_URL
- `whitelight/public/sitemap.xml` - URLs
- `whitelight-backend/routes/sitemap.js` - baseUrl

Or confirm if `whitelightstore.co.ke` is correct.

---

## Troubleshooting

**Backend not starting:**
```bash
pm2 logs whitelight-backend
pm2 restart all
```

**Database connection fails:**
- Check MySQL is running: `sudo systemctl status mysql`
- Verify .env has correct DB credentials
- Test: `mysql -u whitelight_user -p whitelight_db`

**Images not uploading:**
- Check DO_SPACES_* in .env
- Verify bucket exists and key has write access
- Check backend logs: `pm2 logs whitelight-backend | grep -i upload`
