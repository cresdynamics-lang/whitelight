# Run Whitelight locally (Blueprint 2026/27)

## Quick start

**Terminal 1 — API** (Postgres + env):

```bash
cd whitelight/server
# Ensure .env has DATABASE_URL (see ../.env.example / .env.do.example)
npm install
npm run dev
# API: http://127.0.0.1:5000  (or port in .env)
```

Apply blueprint columns once:

```bash
psql "$DATABASE_URL" -f server/db/migrations/002_blueprint_fields.sql
```

**Terminal 2 — storefront**:

```bash
cd whitelight
npm install
npm run dev
# or: npm run dev:safe   if file-watcher limits are hit
```

Open **http://localhost:8080**

Vite proxies `/api` → `http://127.0.0.1:5000`.

Without a local DB, the UI still loads `public/catalog.json` (refresh via live API if needed):

```bash
curl -fsS https://whitelightstore.co.ke/api/catalog -o public/catalog.json
```

## What to verify (Phase 0+)

- Paper background + Leaf green buttons (blueprint tokens)
- Cormorant headlines / Inter UI
- Size chip in header remembers EU size (localStorage)
- Search understands `trail 43`
- Home shows 12 blueprint sections
- `/running`, `/shoes/:slug`, `/journal`, `/size-guide`, `/delivery`, `/store` resolve

## Admin

```bash
# http://localhost:8080/admin
# Seed: DATABASE_URL=... node server/scripts/upsert-admin.mjs
```

## Build + prerender

```bash
npm run build
# outputs dist/ with SEO HTML for crawlers
```

## Deploy (Contabo)

```bash
bash scripts/deploy-droplet.sh
# HOST contabo → /var/www/sites/whitelightstore.co.ke
```

## If `npm run dev` hits ENOSPC

```bash
npm run dev:safe
```
