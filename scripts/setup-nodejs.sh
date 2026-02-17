#!/bin/bash
# Install Node.js and NPM
# Run as root or with sudo

set -e

echo "📦 Installing Node.js..."

# Update system
apt-get update

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
echo ""
echo "✅ Node.js installation complete:"
node --version
npm --version

# Install global packages
echo ""
echo "📦 Installing global packages..."
npm install -g pm2

echo ""
echo "✅ Setup complete!"
