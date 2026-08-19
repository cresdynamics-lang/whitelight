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

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.join(exportDir, "manifest.json"), "utf8"));
  const urlMap = JSON.parse(await fs.readFile(path.join(exportDir, "url-map.json"), "utf8").catch(() => "{}"));

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows: countRows } = await client.query(`SELECT COUNT(*)::int AS n FROM products`);
  const { rows: saleRows } = await client.query(
    `SELECT COUNT(*)::int AS n FROM products WHERE is_on_offer = true`
  );
  const { rows: noImg } = await client.query(
    `SELECT p.id, p.slug FROM products p
     LEFT JOIN product_images i ON i.product_id = p.id
     GROUP BY p.id, p.slug HAVING COUNT(i.id) = 0`
  );
  const { rows: saleNoImg } = await client.query(
    `SELECT p.id, p.slug FROM products p
     LEFT JOIN product_images i ON i.product_id = p.id
     WHERE p.is_on_offer = true
     GROUP BY p.id, p.slug HAVING COUNT(i.id) = 0`
  );
  const { rows: samples } = await client.query(
    `SELECT p.id, p.slug, p.name, p.price, p.is_on_offer,
            (SELECT COUNT(*) FROM product_images i WHERE i.product_id = p.id) AS images,
            (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) AS variants
     FROM products p ORDER BY p.id DESC LIMIT 10`
  );

  // Spot-check a few mapped URLs are reachable
  const mapped = Object.values(urlMap).filter((v) => v.newUrl).slice(0, 5);
  const urlChecks = [];
  for (const entry of mapped) {
    try {
      const res = await fetch(entry.newUrl, { method: "HEAD" });
      urlChecks.push({ url: entry.newUrl, status: res.status });
    } catch (e) {
      urlChecks.push({ url: entry.newUrl, error: String(e.message || e) });
    }
  }

  await client.end();

  const report = {
    sourceProducts: manifest.products?.length ?? 0,
    dbProducts: countRows[0].n,
    saleProducts: saleRows[0].n,
    productsWithoutImages: noImg,
    saleWithoutImages: saleNoImg,
    samples,
    urlChecks,
    match: (manifest.products?.length ?? 0) === countRows[0].n,
  };
  await fs.writeFile(path.join(exportDir, "verify-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!report.match || report.saleWithoutImages.length) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
