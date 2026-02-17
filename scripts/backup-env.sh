#!/usr/bin/env bash
# Backup .env files from server
# Run on server console

BACKUP_DIR="/home/brian/backups/env_$(date +%Y%m%d_%H%M%S)"
PROJECT_DIR="/home/brian/whitelight"

mkdir -p "$BACKUP_DIR"

echo "📦 Backing up .env files..."

if [ -f "$PROJECT_DIR/whitelight-backend/.env" ]; then
  cp "$PROJECT_DIR/whitelight-backend/.env" "$BACKUP_DIR/backend.env"
  echo "✅ Backed up: $BACKUP_DIR/backend.env"
fi

if [ -f "$PROJECT_DIR/whitelight/.env" ]; then
  cp "$PROJECT_DIR/whitelight/.env" "$BACKUP_DIR/frontend.env"
  echo "✅ Backed up: $BACKUP_DIR/frontend.env"
fi

echo "📋 Backup location: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"
