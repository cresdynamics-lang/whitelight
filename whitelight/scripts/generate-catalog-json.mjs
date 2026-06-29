/**
 * Build-time snapshot of the storefront catalog for instant image loading.
 * Written to public/catalog.json and served from CDN — no Supabase wait on first paint.
 */
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/catalog.json");

const CATALOG_SELECT = `
  id, slug, name, brand, category, categories, price, original_price,
  description, tags, is_new, is_best_seller, is_on_offer, url_slug, alt_text_main,
  created_at, updated_at,
  product_images (id, url, alt_text),
  product_variants (id, size, in_stock)
`;

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Vercel (Production build), or VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY locally."
    );
  }
  return createClient(url, key);
}

function normalizeLean(row) {
  const imagesRaw = Array.isArray(row.product_images) ? row.product_images : [];
  const firstImage = imagesRaw[0];
  const images = firstImage
    ? [
        {
          id: String(firstImage.id ?? ""),
          url: String(firstImage.url ?? ""),
          alt: String(firstImage.alt_text ?? firstImage.alt ?? ""),
        },
      ]
    : [];

  const variants = Array.isArray(row.product_variants)
    ? row.product_variants.map((v) => ({
        id: String(v.id ?? ""),
        size: v.size ?? 0,
        inStock: Boolean(v.in_stock ?? v.inStock),
      }))
    : [];

  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? row.id ?? ""),
    name: String(row.name ?? "Product"),
    brand: String(row.brand ?? ""),
    category: row.category ?? "running",
    categories: Array.isArray(row.categories) ? row.categories : undefined,
    price: Number(row.price) || 0,
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    description: String(row.description ?? ""),
    tags: Array.isArray(row.tags) ? row.tags : [],
    isNew: Boolean(row.is_new ?? row.isNew),
    isBestSeller: Boolean(row.is_best_seller ?? row.isBestSeller),
    isOnOffer: Boolean(row.is_on_offer ?? row.isOnOffer),
    url_slug: row.url_slug ?? null,
    alt_text_main: row.alt_text_main ?? null,
    images,
    variants,
    createdAt: row.created_at ?? row.createdAt ?? "",
  };
}

async function main() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("products")
      .select(CATALOG_SELECT)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const products = (data || []).map(normalizeLean).filter((p) => p.id);

    const payload = {
      generatedAt: new Date().toISOString(),
      count: products.length,
      products,
    };

    writeFileSync(OUT, JSON.stringify(payload));
    console.log(`Wrote ${products.length} products to public/catalog.json`);
  } catch (err) {
    if (existsSync(OUT)) {
      console.warn(
        "generate-catalog-json skipped (keeping existing catalog.json):",
        err.message
      );
      if (process.env.VERCEL) {
        console.warn(
          "Vercel build: add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY under Project → Settings → Environment Variables (Production) so catalog.json is generated with real products."
        );
      }
      process.exit(0);
    }
    console.warn("generate-catalog-json skipped:", err.message);
    if (process.env.VERCEL) {
      console.error(
        "Vercel build failed catalog generation: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in project environment variables."
      );
      process.exit(1);
    }
    writeFileSync(
      OUT,
      JSON.stringify({ generatedAt: null, count: 0, products: [] })
    );
    process.exit(0);
  }
}

main();
