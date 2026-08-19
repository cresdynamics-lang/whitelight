-- Whitelight Postgres schema — plain PostgreSQL, API owns access control.
-- Apply: psql "$DATABASE_URL" -f server/db/migrations/001_init.sql
-- Admin login: node server/scripts/upsert-admin.mjs (bcrypt)

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

DO $$
BEGIN
  CREATE TYPE product_category AS ENUM (
    'running', 'trail', 'gym', 'basketball', 'accessories', 'training', 'tennis'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.products (
  id              BIGSERIAL PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  brand           TEXT NOT NULL DEFAULT '',
  category        product_category NOT NULL DEFAULT 'running',
  categories      product_category[] DEFAULT '{}',
  price           NUMERIC(12,2) NOT NULL DEFAULT 0,
  original_price  NUMERIC(12,2),
  description     TEXT NOT NULL DEFAULT '',
  tags            TEXT[] NOT NULL DEFAULT '{}',
  is_new          BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller  BOOLEAN NOT NULL DEFAULT FALSE,
  is_on_offer     BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title       TEXT,
  seo_description TEXT,
  product_h1      TEXT,
  product_description TEXT,
  url_slug        TEXT,
  alt_text_main   TEXT,
  seo_keywords    TEXT[],
  gender          TEXT,
  structured_data JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products (is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products (is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_is_on_offer ON public.products (is_on_offer);
CREATE INDEX IF NOT EXISTS idx_products_url_slug ON public.products (url_slug);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TABLE IF NOT EXISTS public.product_images (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id             BIGSERIAL PRIMARY KEY,
  product_id     BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size           TEXT NOT NULL,
  in_stock       BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants (product_id);

DROP TRIGGER IF EXISTS set_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER set_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TABLE IF NOT EXISTS public.admins (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  username      TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins (email);

DROP TRIGGER IF EXISTS set_admins_updated_at ON public.admins;
CREATE TRIGGER set_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

INSERT INTO public.admins (email, username, password_hash, role)
VALUES (
  'admin@whitelightstore.co.ke',
  'admin@whitelightstore.co.ke',
  crypt('Ibrahim@Admin', gen_salt('bf')),
  'admin'
)
ON CONFLICT (email) DO NOTHING;

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

CREATE TABLE IF NOT EXISTS public.orders (
  id                      BIGSERIAL PRIMARY KEY,
  order_number            TEXT NOT NULL UNIQUE,
  customer_name           TEXT NOT NULL,
  customer_phone          TEXT NOT NULL,
  customer_email          TEXT,
  delivery_address        TEXT NOT NULL,
  delivery_location       TEXT NOT NULL,
  delivery_location_label TEXT NOT NULL,
  delivery_fee            NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal                NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_notes             TEXT,
  payment_method          TEXT NOT NULL DEFAULT 'mpesa_paybill',
  mpesa_code              TEXT,
  status                  TEXT NOT NULL DEFAULT 'pending',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

CREATE TABLE IF NOT EXISTS public.order_items (
  id             BIGSERIAL PRIMARY KEY,
  order_id       BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id     TEXT NOT NULL,
  product_slug   TEXT,
  product_name   TEXT NOT NULL,
  product_price  NUMERIC(12,2) NOT NULL,
  size           TEXT NOT NULL,
  quantity       INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  subtotal       NUMERIC(12,2) NOT NULL,
  product_image  TEXT,
  reference_link TEXT,
  selected_sizes JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
