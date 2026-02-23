# 🚀 Complete Deployment Guide - Whitelight Store

## Prerequisites
- DigitalOcean droplet (Ubuntu 22.04+)
- Domain name configured (whitelightstore.co.ke)
- SSH access to server
- GitHub repository access

---

## Step 1: Backup Environment Variables

**⚠️ IMPORTANT: Do this FIRST before deleting anything!**

```bash
# On server, navigate to project directory
cd /home/brian/whitelight  # or current location

# Run backup script
bash scripts/backup-env-variables.sh

# Or manually backup:
mkdir -p ~/env-backup-$(date +%Y%m%d)
cp whitelight-backend/.env ~/env-backup-$(date +%Y%m%d)/backend.env
cp whitelight/.env ~/env-backup-$(date +%Y%m%d)/frontend.env
```

---

## Step 2: Create New User

```bash
# As root, run:
bash scripts/create-user-whitelight.sh

# Or manually:
useradd -m -s /bin/bash whitelight
echo "whitelight:Ibrahim@254Admin" | chpasswd
usermod -aG sudo whitelight
mkdir -p /home/whitelight/.ssh
chmod 700 /home/whitelight/.ssh
chown -R whitelight:whitelight /home/whitelight/.ssh
```

---

## Step 3: Install Node.js

```bash
# As root or with sudo:
bash scripts/setup-nodejs.sh

# Or manually:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
node --version  # Should show v20.x.x
```

---

## Step 4: Clone Project

```bash
# Switch to whitelight user
su - whitelight

# Clone repository
cd ~
git clone https://github.com/your-username/whitelight.git
cd whitelight

# Or if using SSH key:
git clone git@github.com:your-username/whitelight.git
```

---

## Step 5: Setup Environment Variables

```bash
# Restore backed up .env files
cd ~/whitelight

# Backend .env
cat > whitelight-backend/.env <<EOF
# Database
DB_HOST=localhost
DB_USER=whitelight_user
DB_PASSWORD=your_db_password
DB_NAME=whitelight_db
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://whitelightstore.co.ke

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# DigitalOcean Spaces
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your_spaces_key
DO_SPACES_SECRET=your_spaces_secret
DO_SPACES_BUCKET=your_bucket_name
DO_SPACES_REGION=nyc3
EOF

# Frontend .env
cat > whitelight/.env <<EOF
VITE_API_BASE_URL=https://whitelightstore.co.ke/api
EOF
```

---

## Step 6: Install Dependencies & Build

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

---

## Step 7: Setup PM2

```bash
# As whitelight user:
bash scripts/setup-pm2.sh

# Or manually:
cd ~/whitelight/whitelight-backend
pm2 start server.js --name whitelight-backend
pm2 save
pm2 startup  # Follow the instructions shown
```

---

## Step 8: Setup Firewall

```bash
# As root:
bash scripts/setup-firewall.sh

# Or manually:
ufw enable
ufw allow ssh
ufw allow http
ufw allow https
ufw status
```

---

## Step 9: Setup NGINX

```bash
# As root:
bash scripts/setup-nginx.sh whitelightstore.co.ke 5000

# Or manually edit:
nano /etc/nginx/sites-available/default
# (See scripts/setup-nginx.sh for configuration)

nginx -t
systemctl restart nginx
```

---

## Step 10: Setup SSL Certificate

```bash
# As root:
bash scripts/setup-ssl.sh whitelightstore.co.ke

# Or manually:
add-apt-repository ppa:certbot/certbot
apt-get update
apt-get install python3-certbot-nginx
certbot --nginx -d whitelightstore.co.ke -d www.whitelightstore.co.ke
```

---

## Step 11: Setup Database (run on Digital Ocean server)

**Option A – use the setup script (recommended):**

```bash
cd ~/whitelight
sudo bash scripts/setup-mysql-digitalocean.sh
# Set DB_USER, DB_PASSWORD, DB_NAME in whitelight-backend/.env as shown by the script
```

**Option B – manual install:** See [DATABASE-DIGITAL-OCEAN.md](DATABASE-DIGITAL-OCEAN.md) for manual MySQL install or using a DigitalOcean Managed Database.

Then run migrations:

```bash
cd ~/whitelight/whitelight-backend
node scripts/runMigrations.js
# Optional: node createAdmin.js  (creates default admin user)
```

---

## Step 12: Verify Everything

```bash
# Check PM2
pm2 list
pm2 logs whitelight-backend

# Check NGINX
systemctl status nginx
curl http://localhost:5000/api/health

# Check website
curl -I https://whitelightstore.co.ke
```

---

## Quick Commands Reference

### PM2
```bash
pm2 list                    # List processes
pm2 logs                    # Show logs
pm2 restart all             # Restart all
pm2 stop all                # Stop all
pm2 delete all              # Delete all
pm2 save                    # Save current list
```

### NGINX
```bash
sudo nginx -t               # Test config
sudo systemctl restart nginx # Restart
sudo systemctl reload nginx  # Reload config
sudo systemctl status nginx  # Check status
```

### SSL
```bash
sudo certbot renew --dry-run # Test renewal
sudo certbot certificates     # List certificates
```

---

## Troubleshooting

### App not starting
```bash
pm2 logs whitelight-backend
cd ~/whitelight/whitelight-backend
node server.js  # Test manually
```

### NGINX errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues
```bash
sudo systemctl status mysql
mysql -u whitelight_user -p whitelight_db
```

### Port already in use
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

---

## Post-Deployment

1. **Update DNS**: Ensure A records point to droplet IP
2. **Test SSL**: Visit https://whitelightstore.co.ke
3. **Monitor logs**: `pm2 logs` and `/var/log/nginx/`
4. **Setup backups**: Regular database and .env backups
5. **Monitor resources**: `htop` or `df -h`

---

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Strong database passwords
- [ ] SSL certificate installed
- [ ] PM2 running as non-root user
- [ ] Regular security updates: `apt-get update && apt-get upgrade`
- [ ] Backups configured

---

**✅ Deployment Complete!**

Visit: https://whitelightstore.co.ke
