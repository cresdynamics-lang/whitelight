-- Add SEO fields to products table for Whitelight Store
-- Safe to run multiple times: uses IF NOT EXISTS where supported.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS product_h1 text,
  ADD COLUMN IF NOT EXISTS product_description text,
  ADD COLUMN IF NOT EXISTS url_slug text,
  ADD COLUMN IF NOT EXISTS alt_text_main text,
  ADD COLUMN IF NOT EXISTS seo_keywords text[],
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS structured_data jsonb;

-- Ensure category is present and indexed for SEO/category pages
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category text;

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_url_slug ON public.products (url_slug);

