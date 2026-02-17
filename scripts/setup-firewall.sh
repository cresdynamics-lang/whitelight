#!/bin/bash
# Setup UFW firewall
# Run as root or with sudo

set -e

echo "🔥 Setting up firewall..."

# Enable UFW
ufw --force enable

# Allow SSH (important - do this first!)
ufw allow ssh
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow http
ufw allow https
ufw allow 80/tcp
ufw allow 443/tcp

# Show status
echo ""
echo "✅ Firewall configured:"
ufw status verbose

echo ""
echo "⚠️  Make sure SSH access works before closing your session!"
