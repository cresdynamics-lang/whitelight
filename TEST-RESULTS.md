# Website Test Results

**Date:** 2026-02-17  
**Server user:** Updated from `brian` to `cresdynamics` in scripts (set `PROJECT_USER` if different).

---

## ✅ Tests Run

| Check | Result |
|-------|--------|
| **Website (whitelightstore.co.ke)** | ✅ HTTP 200 |
| **API health** | ✅ `{"status":"ok",...}` |
| **Products API** | ✅ Returns products with images (DO Spaces URLs) |
| **Admin image upload (API)** | ⚠️ Create product failed (e.g. duplicate slug); **update product** with new images works when using admin panel |
| **SEO** | ✅ Implemented: `SEOHead` on Index, ProductDetail, Category, About, Contact; JSON-LD (Organization, LocalBusiness, Product, BreadcrumbList). Verify in browser: View Page Source → search for `application/ld+json` |
| **Admin images** | ✅ Max 10 images (backend + frontend); upload on save; count display "X / 10 images" |

---

## Server User Change

Scripts now use **cresdynamics** as default project user. Paths:

- Project: `/home/cresdynamics/whitelight`
- Backend: `/home/cresdynamics/whitelight/whitelight-backend`
- Frontend: `/home/cresdynamics/whitelight/whitelight`

To use a different user (e.g. `brian`), run:

```bash
export PROJECT_USER=brian
bash scripts/backup-env.sh
# or
PROJECT_USER=brian bash scripts/deploy-server.sh
```

---

## Admin: Update Product & Image Upload

1. Log in at **https://whitelightstore.co.ke/admin** (or your domain).
2. **Products** → open a product → **Edit**.
3. **Media:** add/remove images (up to 10 total); counter shows "X / 10 images".
4. **Save** → loading toast "Uploading product and N image(s)..." then success.
5. Images are stored on DigitalOcean Spaces and linked in the DB.

---

## SEO Confirmed

- **Homepage:** WebSite + Organization + LocalBusiness schema.
- **Product pages:** Product schema (name, brand, price, image, offers), BreadcrumbList, WebPage.
- **Category pages:** CollectionPage, breadcrumbs.
- **Canonicals, OG, Twitter:** Set via `SEOHead`.

---

## Scripts Updated for cresdynamics

- `scripts/deploy-server.sh` — `PROJECT_USER=${PROJECT_USER:-cresdynamics}`
- `scripts/backup-env.sh` — same
- `scripts/verify-deployment.sh` — same
- `scripts/verify-after-restart.sh` — same
- `scripts/server-console-commands.sh` — same
