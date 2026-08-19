# DigitalOcean provisioning & cutover (Whitelight)

This is the ops guide for the self-hosted DigitalOcean stack. The storefront uses the Node API + Postgres only (Supabase has been removed).

## Phase 0 — Provision

### 1. Postgres on droplet (or Managed Postgres)
1. Create database `whitelight` and user `whitelight`.
2. Copy `DATABASE_URL`.
3. Apply schema: `psql "$DATABASE_URL" -f server/db/migrations/001_init.sql`
4. Seed admin: `DATABASE_URL=... node server/scripts/upsert-admin.mjs`

### 2. Spaces (optional — product images can live in `/uploads` on droplet)
See `.env.do.example` for Spaces vars if using CDN storage.

### 3. API + static site on droplet
- API: `/opt/whitelight/server` (systemd `whitelight-api`)
- SPA: `/var/www/whitelight` (nginx)
- Deploy: `whitelight/scripts/deploy-droplet.sh` (preserves `uploads/`)

---

## Cutover checklist

1. DNS → droplet IP
2. SSL: `/opt/whitelight/enable-domain-ssl.sh`
3. `PUBLIC_BASE_URL=https://whitelightstore.co.ke`
4. Smoke tests: `/`, `/product/:slug`, `/admin`, checkout, `/feeds/meta.csv`

## Rollback
Point DNS back to previous host and restore from last known-good deploy snapshot.

