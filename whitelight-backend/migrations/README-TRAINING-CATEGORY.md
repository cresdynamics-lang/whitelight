# Training category – database alignment

The **training** category is aligned with the app and admin. The backend does **not** hardcode category values; it uses whatever is stored in the database. The only constraint is the MySQL **ENUM** on the category columns.

## What is aligned

| Layer | Status |
|-------|--------|
| **products.category** | ENUM updated by migration 005 to include `'training'`. |
| **product_categories.category** | ENUM updated by migration 005 to include `'training'`. |
| **Product create/update** | Uses `category` and `categories[]` from the request; no backend whitelist. |
| **Product list/filter** | `GET /api/products?category=training` works once 005 is applied. |
| **Product by slug** | Returns `category` and `categories` including `training` if set. |

So once migration **005** is run on the server, the database is fully aligned with the new category for product create, update, and read.

## Run on the server

Migration **005** must be run **after** **004** (so that `product_categories` exists).

```bash
cd /home/whitelight/whitelight/whitelight-backend   # or your backend path
mysql -u YOUR_DB_USER -p whitelight_db < migrations/005_add_training_category.sql
```

Or in MySQL:

```sql
USE whitelight_db;

ALTER TABLE products MODIFY COLUMN category ENUM('running', 'trail', 'gym', 'basketball', 'accessories', 'training') NOT NULL;
ALTER TABLE product_categories MODIFY COLUMN category ENUM('running', 'trail', 'gym', 'basketball', 'accessories', 'training') NOT NULL;
```

## After 005

- Admin can set product category to **Training** and save; `products.category` and `product_categories` will store `'training'`.
- Frontend `/category/training` and API `?category=training` will return those products.
- No other backend code changes are required for product create/update; the database ENUM is the single source of truth.
