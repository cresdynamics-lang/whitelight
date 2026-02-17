# 🚀 Quick Start Deployment Guide

## ✅ Environment Variables Backed Up

**Backend .env** saved to: `env-backup/backend.env.backup`
**Frontend .env** saved to: `env-backup/frontend.env.backup`

---

## 📋 Deployment Steps

### 1. Backup Environment Variables ✅
```bash
# Already done - files saved in env-backup/
```

### 2. Create User (Run as root)
```bash
useradd -m -s /bin/bash whitelight
echo "whitelight:Ibrahim@254Admin" | chpasswd
usermod -aG sudo whitelight
mkdir -p /home/whitelight/.ssh
chmod 700 /home/whitelight/.ssh
chown -R whitelight:whitelight /home/whitelight/.ssh
```

### 3. Install Node.js (Run as root)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
node --version
```

### 4. Clone Project (As whitelight user)
```bash
su - whitelight
cd ~
git clone <your-repo-url> whitelight
cd whitelight
```

### 5. Restore Environment Variables
```bash
# Backend
cp env-backup/backend.env.backup whitelight-backend/.env

# Frontend  
cp env-backup/frontend.env.backup whitelight/.env
```

### 6. Install Dependencies & Build
```bash
# Backend
cd whitelight-backend
npm install --production

# Frontend
cd ../whitelight
npm install
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build
```

### 7. Setup PM2 (As whitelight user)
```bash
cd ~/whitelight/whitelight-backend
pm2 start server.js --name whitelight-backend
pm2 save
pm2 startup  # Copy and run the command shown
```

### 8. Setup Firewall (As root)
```bash
ufw enable
ufw allow ssh
ufw allow http
ufw allow https
ufw status
```

### 9. Setup NGINX (As root)
```bash
apt-get install -y nginx

# Edit config
nano /etc/nginx/sites-available/default

# Add this configuration:
server {
    listen 80;
    server_name whitelightstore.co.ke www.whitelightstore.co.ke;

    location / {
        root /home/whitelight/whitelight/whitelight/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Test and restart
nginx -t
systemctl restart nginx
```

### 10. Setup SSL (As root)
```bash
add-apt-repository ppa:certbot/certbot
apt-get update
apt-get install python3-certbot-nginx
certbot --nginx -d whitelightstore.co.ke -d www.whitelightstore.co.ke
```

---

## 🔧 All Scripts Created

1. ✅ `scripts/backup-env-variables.sh` - Backup .env files
2. ✅ `scripts/create-user-whitelight.sh` - Create user
3. ✅ `scripts/setup-nodejs.sh` - Install Node.js
4. ✅ `scripts/setup-pm2.sh` - Setup PM2
5. ✅ `scripts/setup-nginx.sh` - Configure NGINX
6. ✅ `scripts/setup-firewall.sh` - Setup firewall
7. ✅ `scripts/setup-ssl.sh` - Setup SSL
8. ✅ `scripts/complete-deployment.sh` - Master script
9. ✅ `DEPLOYMENT-GUIDE.md` - Complete guide

---

## 🎯 Quick Commands

```bash
# Check PM2
pm2 list
pm2 logs

# Check NGINX
systemctl status nginx
nginx -t

# Check SSL
certbot certificates

# Restart everything
pm2 restart all
systemctl reload nginx
```

---

## 📝 Environment Variables Reference

**Backend (.env):**
- DB_HOST=localhost
- DB_USER=whitelight_user
- DB_PASSWORD=whitelight@585723
- DB_NAME=whitelight_db
- PORT=5000
- JWT_SECRET=whitelight_7464587356_2024
- DO_SPACES_ENDPOINT=https://sfo3.digitaloceanspaces.com
- DO_SPACES_KEY=DO801PHKGXPLL39YE3ZC
- DO_SPACES_SECRET=sQmzYONdRjIRfQrHP2u7e0dF0uOEKO/8mr5DUrFK2Ns
- DO_SPACES_BUCKET=trendyfashion

**Frontend (.env):**
- VITE_API_BASE_URL=https://api.whitelightstore.co.ke/api

---

**Ready to deploy!** Follow the steps above or use the individual scripts.
