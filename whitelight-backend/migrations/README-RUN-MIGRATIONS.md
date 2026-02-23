# Run migrations and seed

## Environment variables (from .env)

These are read from the backend `.env` file:

| Variable    | Purpose        | Example        |
|------------|----------------|----------------|
| `DB_HOST`  | MySQL host     | `localhost`    |
| `DB_PORT`  | MySQL port     | `3306`         |
| `DB_USER`  | Database user  | (your user)    |
| `DB_PASSWORD` | Database password | (your password) |
| `DB_NAME`  | Database name  | `whitelight_db` |

**Confirmed:** `DB_USER` and `DB_PASSWORD` are set in your `.env`. The app uses `DB_NAME=whitelight_db` (or the value in `.env`).

## Prerequisites

- MySQL server running (e.g. `sudo systemctl start mysql` or `mysql.server start`).
- `.env` in the backend root with `DB_USER`, `DB_PASSWORD`, and optionally `DB_HOST`, `DB_PORT`, `DB_NAME`.

## Commands (from backend root)

```bash
cd whitelight-backend

# 1. Run all migrations (001 → 005, including training category)
npm run migrate

# 2. Seed (admin table + default admin user)
npm run seed
```

Or run the scripts directly:

```bash
node scripts/runMigrations.js
node scripts/seedData.js
```

## Migration order

1. `001_initial_schema.sql` – database, products, product_images, product_variants, orders, order_items
2. `002_add_accessories_category.sql` – add `accessories` to category ENUM
3. `002_add_order_item_details.sql` – order_items columns
4. `004_add_multiple_categories.sql` – product_categories junction table
5. `005_add_training_category.sql` – add `training` to category ENUM

## Seed

- Creates `admins` table if missing.
- Inserts default admin if none exists: **username** `admin`, **password** `admin123` (change after first login).

## If MySQL is not running

Start MySQL first, then run:

```bash
npm run migrate
npm run seed
```

On many Linux systems:

```bash
sudo systemctl start mysql
# or
sudo service mysql start
```
