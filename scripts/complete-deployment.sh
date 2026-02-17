#!/bin/bash
# Complete deployment script - Run step by step
# This script guides you through the entire deployment process

set -e

echo "🚀 Whitelight Store - Complete Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Backup
echo -e "${YELLOW}Step 1: Backup Environment Variables${NC}"
read -p "Have you backed up .env files? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please backup .env files first!"
    exit 1
fi

# Step 2: Create user
echo -e "${YELLOW}Step 2: Create User${NC}"
echo "Creating user 'whitelight'..."
bash scripts/create-user-whitelight.sh

# Step 3: Install Node.js
echo -e "${YELLOW}Step 3: Install Node.js${NC}"
bash scripts/setup-nodejs.sh

# Step 4: Setup firewall
echo -e "${YELLOW}Step 4: Setup Firewall${NC}"
bash scripts/setup-firewall.sh

echo ""
echo -e "${GREEN}✅ Basic setup complete!${NC}"
echo ""
echo "Next steps (run as whitelight user):"
echo "1. Clone repository: git clone <repo-url>"
echo "2. Setup environment variables"
echo "3. Install dependencies and build"
echo "4. Setup PM2: bash scripts/setup-pm2.sh"
echo "5. Setup NGINX (as root): bash scripts/setup-nginx.sh whitelightstore.co.ke 5000"
echo "6. Setup SSL (as root): bash scripts/setup-ssl.sh whitelightstore.co.ke"
