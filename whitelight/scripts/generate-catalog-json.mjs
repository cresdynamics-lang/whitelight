/**
 * Build-time snapshot of the storefront catalog from Postgres (DATABASE_URL).
 */
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.CATALOG_OUT || join(__dirname, "../public/catalog.json");

function normalizeLean(row) {
  const imagesRaw = Array.isArray(row.product_images)
    ? row.product_images
    : Array.isArray(row.images)
      ? row.images
      : [];
  const images = imagesRaw
    .filter((img) => img && (img.url || img.src))
    .map((img) => ({
      id: String(img.id ?? ""),
      url: String(img.url ?? img.src ?? ""),
      alt: String(img.alt_text ?? img.alt ?? ""),
    }));

  const variantsRaw = Array.isArray(row.product_variants)
    ? row.product_variants
    : Array.isArray(row.variants)
      ? row.variants
      : [];
  const variants = variantsRaw.map((v) => ({
    id: String(v.id ?? ""),
    size: v.size ?? 0,
    inStock: Boolean(v.in_stock ?? v.inStock),
  }));

  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? row.id ?? ""),
    name: String(row.name ?? "Product"),
    brand: String(row.brand ?? ""),
    category: row.category ?? "running",
    categories: Array.isArray(row.categories) ? row.categories : undefined,
    price: Number(row.price) || 0,
    originalPrice:
      row.original_price != null ? Number(row.original_price) : row.originalPrice,
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
    updatedAt: row.updated_at ?? row.updatedAt ?? "",
  };
}

async function fromDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    const { rows } = await client.query(
      `SELECT p.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', i.id, 'url', i.url, 'alt_text', i.alt_text) ORDER BY i.id)
           FROM product_images i WHERE i.product_id = p.id), '[]'::json
        ) AS product_images,
        COALESCE(
          (SELECT json_agg(json_build_object('id', v.id, 'size', v.size, 'in_stock', v.in_stock) ORDER BY v.id)
           FROM product_variants v WHERE v.product_id = p.id), '[]'::json
        ) AS product_variants
       FROM products p
       ORDER BY p.updated_at DESC NULLS LAST`
    );
    return rows.map(normalizeLean).filter((p) => p.id);
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    const products = await fromDatabaseUrl();
    if (!products) {
      throw new Error("Missing DATABASE_URL for catalog generation.");
    }
    writeFileSync(
      OUT,
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        count: products.length,
        products,
      })
    );
    console.log(`Wrote ${products.length} products to public/catalog.json`);
  } catch (err) {
    if (existsSync(OUT)) {
      console.warn("generate-catalog-json skipped (keeping existing catalog.json):", err.message);
      process.exit(0);
    }
    console.warn("generate-catalog-json skipped:", err.message);
    writeFileSync(OUT, JSON.stringify({ generatedAt: null, count: 0, products: [] }));
    process.exit(0);
  }
}

main();
