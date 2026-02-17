#!/bin/bash
# Setup SSL certificate with Let's Encrypt
# Run as root or with sudo

set -e

DOMAIN="${1:-whitelightstore.co.ke}"

echo "🔒 Setting up SSL certificate for: $DOMAIN"

# Install certbot
add-apt-repository -y ppa:certbot/certbot
apt-get update
apt-get install -y python3-certbot-nginx

# Obtain certificate
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN

# Test renewal
certbot renew --dry-run

echo ""
echo "✅ SSL certificate installed!"
echo "🔒 HTTPS enabled for: https://$DOMAIN"
