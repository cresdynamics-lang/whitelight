-- Blueprint 2026/27 product enrichment fields
-- Apply: psql "$DATABASE_URL" -f server/db/migrations/002_blueprint_fields.sql

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS purpose TEXT,
  ADD COLUMN IF NOT EXISTS feel JSONB,
  ADD COLUMN IF NOT EXISTS fit_note TEXT,
  ADD COLUMN IF NOT EXISTS for_whom TEXT,
  ADD COLUMN IF NOT EXISTS skip_if TEXT,
  ADD COLUMN IF NOT EXISTS hotspots JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ;

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS angle_role TEXT;

COMMENT ON COLUMN public.products.purpose IS 'race_day|daily|long_run|trail|gym|court';
COMMENT ON COLUMN public.products.fit_note IS 'true_to_size|half_up|runs_small|runs_large';
COMMENT ON COLUMN public.product_images.angle_role IS 'side|front|heel|sole|detail|spin';
