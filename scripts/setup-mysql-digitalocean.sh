#!/usr/bin/env bash
# Install and configure MySQL on a Digital Ocean (Ubuntu) server so the
# WhiteLight app database runs on the same droplet.
# Run as root or with sudo: sudo bash scripts/setup-mysql-digitalocean.sh
#
# Optional env vars (set before running or export):
#   MYSQL_ROOT_PASSWORD  - root password for mysql_secure_installation
#   DB_USER              - app database user (default: whitelight_user)
#   DB_PASSWORD          - app database password (required if non-interactive)
#   DB_NAME              - database name (default: whitelight_db)

set -e

DB_USER="${DB_USER:-whitelight_user}"
DB_NAME="${DB_NAME:-whitelight_db}"

echo "🗄️  MySQL setup for WhiteLight on Digital Ocean"
echo "   Database: $DB_NAME"
echo "   App user: $DB_USER"
echo ""

# Install MySQL server (Ubuntu/Debian)
if ! command -v mysql &> /dev/null; then
  echo "📦 Installing MySQL server..."
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server
  echo "✅ MySQL installed"
else
  echo "✅ MySQL already installed"
fi

# Start and enable MySQL
systemctl start mysql 2>/dev/null || systemctl start mysqld 2>/dev/null || true
systemctl enable mysql 2>/dev/null || systemctl enable mysqld 2>/dev/null || true

# Secure installation (non-interactive where possible)
echo "🔒 Securing MySQL..."
if [ -n "$MYSQL_ROOT_PASSWORD" ]; then
  mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASSWORD'; FLUSH PRIVILEGES;" 2>/dev/null || true
fi
mysql -e "DELETE FROM mysql.user WHERE User='';"
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test; DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"
echo "✅ MySQL secured"

# App password: use env or prompt once
if [ -z "$DB_PASSWORD" ]; then
  echo ""
  read -s -p "Enter password for database user '$DB_USER': " DB_PASSWORD
  echo ""
  if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD is required. Set it or run again and enter when prompted."
    exit 1
  fi
fi

# Create database and user (localhost only for security)
echo "📋 Creating database and user..."
mysql <<EOF
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
echo "✅ Database and user created"

# Remind about .env
echo ""
echo "📌 Next steps:"
echo "   1. In whitelight-backend/.env set:"
echo "      DB_HOST=localhost"
echo "      DB_PORT=3306"
echo "      DB_USER=$DB_USER"
echo "      DB_PASSWORD=<the password you set>"
echo "      DB_NAME=$DB_NAME"
echo "   2. Run migrations: cd whitelight-backend && node scripts/runMigrations.js"
echo "   3. (Optional) Create admin: node createAdmin.js"
echo ""
echo "✅ MySQL is running on this server. Use DB_HOST=localhost in .env."
echo "   Check status: sudo systemctl status mysql"
echo "   Connect: mysql -u $DB_USER -p $DB_NAME"
echo ""
