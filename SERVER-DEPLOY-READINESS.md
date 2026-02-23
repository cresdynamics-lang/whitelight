# Server deploy readiness – training category & multi-category

## 1. Migration 005 (training category)

- **File:** `whitelight-backend/migrations/005_add_training_category.sql`  
  Adds `'training'` to `products.category` and `product_categories.category` ENUMs.
- **Runner:** `whitelight-backend/scripts/runMigrations.js` includes `005_add_training_category.sql` in `migrationOrder`.
- **When it runs:** On the server, when you run:
  - `npm run migrate` (in backend), or
  - Any of the deploy scripts (`scripts/deploy-server.sh`, `RUN-ON-SERVER.sh`, `DEPLOY-NOW.sh`), which call `node scripts/runMigrations.js` after pull/install.
- **Note:** Migration 005 has not been run in your local environment (MySQL was not running). It will run on the **DigitalOcean server** when you deploy, because the deploy scripts run migrations and the server has MySQL.

---

## 2. Admin – category selection (checkboxes, multiple categories)

| Item | Status |
|------|--------|
| **UI** | Categories are **checkboxes** (not a single dropdown). Label: "Categories * (Select one or more)". |
| **State** | `formData.categories` is an array; multiple categories can be selected. |
| **Primary** | First selected category is used as `category` (primary); all selected are sent as `categories[]`. |
| **Validation** | At least one category required; error shown if none selected. |
| **Create/Update** | Payload includes `categories: formData.categories`; backend receives and persists them. |

So: **category selection is checkboxes and supports multiple categories.**

---

## 3. Database – multiple categories

| Item | Status |
|------|--------|
| **products.category** | Single value (primary category). ENUM includes `running`, `trail`, `gym`, `training`, `basketball`, `accessories`. |
| **product_categories** | Junction table: one row per (product_id, category). A product can have many rows (many categories). |
| **Create product** | Backend inserts one row into `product_categories` per selected category. |
| **Update product** | Backend deletes existing `product_categories` rows for the product, then inserts new set from selected categories. |
| **Migration 005** | Adds `training` to both ENUMs so "training" is valid in both tables. |

So: **database accepts and stores more than one category per product.**

---

## 4. Display on category pages (product in multiple categories)

| Item | Status |
|------|--------|
| **API:** `GET /api/products?category=X` | Backend returns products where `products.category = X` **OR** `product_id` is in `product_categories` with `category = X`. |
| **Frontend** | CategoryPage and Index use `useProductsByCategory(category)` → calls API with that category. |
| **Result** | If a product is in e.g. "Gym" and "Training", it appears on both `/category/gym` and `/category/training`. |

So: **a product selected in different categories appears on every category page chosen.**

---

## 5. DigitalOcean server update – checklist

Before deploying:

- [ ] Server has MySQL running and backend `.env` has correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (and optionally `DB_PORT`).
- [ ] Deploy script will run migrations (already in `deploy-server.sh`, `RUN-ON-SERVER.sh`, `DEPLOY-NOW.sh`), so **005 will run on the server** when you deploy.
- [ ] After deploy: frontend rebuild, backend restart (e.g. PM2), Nginx reload as per your scripts.

After deploy:

- [ ] Run migrations if not already in script: `cd whitelight-backend && npm run migrate`.
- [ ] In admin, create or edit a product, select **multiple categories** (e.g. Gym + Training) via checkboxes, save.
- [ ] Open `/category/gym` and `/category/training` and confirm the product appears on both.
- [ ] Confirm "Training" in navbar/footer and that `/category/training` works.

---

## 6. Summary

| Requirement | Status |
|-------------|--------|
| Migration 005 run | Will run on server when you deploy (migrations in deploy flow). |
| Admin category = checkboxes | Yes – checkboxes, multiple selection. |
| Database accepts multiple categories | Yes – `product_categories` junction table. |
| Product in chosen categories displays on each | Yes – API uses junction table; category pages show products in that category. |
| Ready for DigitalOcean server update | Yes – deploy scripts + migrations + code are aligned. |

You are ready to do the DigitalOcean server update. After deploying, run the checks above to confirm behaviour on the live site.
