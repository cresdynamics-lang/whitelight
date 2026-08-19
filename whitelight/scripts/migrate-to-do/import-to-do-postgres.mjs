import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportDir = path.join(__dirname, "export");
dotenv.config({ path: path.resolve(__dirname, "../../.env.do") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Client } = pg;

async function loadJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL required");

  const manifest = await loadJson(path.join(exportDir, "manifest.json"));
  const urlMap = await loadJson(path.join(exportDir, "url-map.json")).catch(() => ({}));

  const client = new Client({
    connectionString: databaseUrl,
    ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  let imported = 0;
  let imageRows = 0;
  let variantRows = 0;

  try {
    await client.query("BEGIN");
    for (const p of manifest.products) {
      await client.query(
        `INSERT INTO products (
          id, slug, name, brand, category, categories, price, original_price, description, tags,
          is_new, is_best_seller, is_on_offer, url_slug, alt_text_main, created_at, updated_at
        ) VALUES (
          $1,$2,$3,$4,$5::product_category,$6::product_category[],$7,$8,$9,$10,
          $11,$12,$13,$14,$15,COALESCE($16::timestamptz, NOW()),COALESCE($17::timestamptz, NOW())
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          brand = EXCLUDED.brand,
          category = EXCLUDED.category,
          categories = EXCLUDED.categories,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags,
          is_new = EXCLUDED.is_new,
          is_best_seller = EXCLUDED.is_best_seller,
          is_on_offer = EXCLUDED.is_on_offer,
          url_slug = EXCLUDED.url_slug,
          alt_text_main = EXCLUDED.alt_text_main,
          updated_at = NOW()`,
        [
          p.id,
          p.slug,
          p.name,
          p.brand || "",
          p.category || "running",
          Array.isArray(p.categories) && p.categories.length ? p.categories : [p.category || "running"],
          p.price || 0,
          p.original_price ?? null,
          p.description || "",
          p.tags || [],
          Boolean(p.is_new),
          Boolean(p.is_best_seller),
          Boolean(p.is_on_offer),
          p.url_slug || null,
          p.alt_text_main || null,
          p.created_at || null,
          p.updated_at || null,
        ]
      );
      imported++;

      await client.query(`DELETE FROM product_images WHERE product_id = $1`, [p.id]);
      for (const img of p.product_images || []) {
        const mapped = urlMap[img.url]?.newUrl || img.url;
        await client.query(
          `INSERT INTO product_images (product_id, url, alt_text) VALUES ($1,$2,$3)`,
          [p.id, mapped, img.alt_text || p.name || ""]
        );
        imageRows++;
      }

      await client.query(`DELETE FROM product_variants WHERE product_id = $1`, [p.id]);
      for (const v of p.product_variants || []) {
        await client.query(
          `INSERT INTO product_variants (product_id, size, in_stock, stock_quantity) VALUES ($1,$2,$3,$4)`,
          [p.id, String(v.size), v.in_stock !== false, v.stock_quantity || 0]
        );
        variantRows++;
      }
    }

    // Reset sequences
    await client.query(
      `SELECT setval(pg_get_serial_sequence('products','id'), COALESCE((SELECT MAX(id) FROM products), 1))`
    );
    await client.query(
      `SELECT setval(pg_get_serial_sequence('product_images','id'), COALESCE((SELECT MAX(id) FROM product_images), 1))`
    );
    await client.query(
      `SELECT setval(pg_get_serial_sequence('product_variants','id'), COALESCE((SELECT MAX(id) FROM product_variants), 1))`
    );

    if (Array.isArray(manifest.admins) && manifest.admins.length) {
      for (const a of manifest.admins) {
        await client.query(
          `INSERT INTO admins (id, email, username, password_hash, role)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, username = EXCLUDED.username`,
          [a.id, a.email, a.username, a.password_hash, a.role || "admin"]
        );
      }
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }

  const report = {
    importedProducts: imported,
    imageRows,
    variantRows,
    at: new Date().toISOString(),
  };
  await fs.writeFile(path.join(exportDir, "import-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
