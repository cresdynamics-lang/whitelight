# Training category – alignment confirmation

**Status: aligned and integrated** across database, admin, and frontend.

---

## 1. Database

| Item | Status |
|------|--------|
| **products.category** ENUM | Includes `'training'` via migration `005_add_training_category.sql` |
| **product_categories.category** ENUM | Includes `'training'` via same migration |
| **Backend API** | No category whitelist; uses DB ENUM. Accepts `category: "training"` and `categories: ["training", ...]` for create/update. |
| **Filtering** | `GET /api/products?category=training` returns products in training category. |

**Action on server:** Run migration 005 once (if not already run):

```bash
cd whitelight-backend && npm run migrate
```

---

## 2. Admin – new product & update product

| Item | Status |
|------|--------|
| **Category dropdown** | `AdminProductForm.tsx`: `CATEGORIES` includes `{ value: "training", label: "Training" }`. |
| **TypeScript type** | `ProductCategory` in `types/product.ts` includes `"training"`. |
| **Create product** | Can set primary category to Training; saved to `products.category` and `product_categories`. |
| **Update product** | Can change category to Training; backend updates both tables. |
| **Multi-category** | Training can be selected in categories array. |

Admin is aligned: new and existing products can be set to Training and persist correctly.

---

## 3. Frontend display & integration

| Area | Status |
|------|--------|
| **Navbar** | `config/site.ts`: "Training" link → `/category/training`. |
| **Footer** | "Training" in Quick Links → `/category/training`. |
| **Routes** | `App.tsx`: `/category/:category` (so `/category/training` works); legacy `/training` → CategoryPage. |
| **Category page** | `CategoryPage.tsx`: `categoryTitles["training"]`, descriptions, images (training uses gym images). |
| **Home page** | `Index.tsx`: "Training Shoes" section via `useProductsByCategory("training")`. |
| **Shop by category** | `CategoryBanner.tsx`: Training card → `/category/training`. |
| **Product detail** | `ProductDetail.tsx`: `getCategoryDisplayName` includes `training: "Training Shoes"`. |
| **SEO** | `seo.ts` + `SEOHead.tsx` + `config/seo.ts`: training title, description, keywords and display name. |
| **Sitemap** | Backend `routes/sitemap.js`: `/category/training` in static URLs. |

Frontend is aligned: training appears in nav, footer, home, category page, product detail, and SEO.

---

## 4. End-to-end flow

1. **Admin:** Create or edit product → set category to **Training** → save.  
   → Backend writes `products.category = 'training'` and `product_categories` row with `'training'`.

2. **API:** `GET /api/products?category=training` returns those products.  
   → Frontend category page and home section use this.

3. **Frontend:** User opens **Training** in navbar or footer → `/category/training` → CategoryPage shows "Training Shoes" and lists products.  
   → Product detail shows "Training Shoes" in breadcrumb/SEO when product is training.

---

## 5. When the server is updated

- **Code:** All training-related code is in the repo (frontend + backend).
- **Database:** Deploy scripts already run migrations:
  - `scripts/deploy-server.sh`: runs `node scripts/runMigrations.js` after backend install.
  - `RUN-ON-SERVER.sh` and `DEPLOY-NOW.sh`: run migrations after git pull, then build frontend and restart services.
- So on each deploy, migrations (including 005 for training) run automatically. Ensure MySQL is up and backend `.env` has correct `DB_*` so migrations succeed. Then training category works end-to-end.

---

## Summary

| Layer | Aligned | Notes |
|-------|---------|--------|
| Database | Yes | Run migration 005 on server once. |
| Admin (new/update product) | Yes | Training in dropdown; create/update use API and DB. |
| Frontend (display & UX) | Yes | Nav, footer, home, category page, product detail, SEO, sitemap. |

**Training category is well aligned, integrated, and working across database, admin, and frontend.**
