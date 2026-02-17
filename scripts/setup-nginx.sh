#!/bin/bash
# Setup NGINX as reverse proxy
# Run as root or with sudo

set -e

DOMAIN="${1:-whitelightstore.co.ke}"
APP_PORT="${2:-5000}"

echo "🌐 Setting up NGINX for domain: $DOMAIN"

# Install NGINX
apt-get update
apt-get install -y nginx

# Backup default config
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Create NGINX configuration
cat > /etc/nginx/sites-available/default <<NGINX_EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Logging
    access_log /var/log/nginx/whitelight-access.log;
    error_log /var/log/nginx/whitelight-error.log;

    # Frontend (React app)
    location / {
        root /home/whitelight/whitelight/whitelight/dist;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        root /home/whitelight/whitelight/whitelight/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# Test NGINX configuration
nginx -t

# Restart NGINX
systemctl restart nginx
systemctl enable nginx

echo ""
echo "✅ NGINX setup complete!"
