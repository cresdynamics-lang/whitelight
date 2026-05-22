import fs from "node:fs";
import path from "node:path";
import {
  fetchCatalogProducts,
  buildGoogleMerchantRss,
  buildMetaCatalogJson,
} from "./lib/catalog-feed.mjs";

const ROOT = path.resolve(process.cwd());
const FEEDS_DIR = path.join(ROOT, "public", "feeds");

async function main() {
  const products = await fetchCatalogProducts();
  fs.mkdirSync(FEEDS_DIR, { recursive: true });

  const googleXml = buildGoogleMerchantRss(products);
  const metaJson = buildMetaCatalogJson(products);

  fs.writeFileSync(path.join(FEEDS_DIR, "google.xml"), googleXml, "utf8");
  fs.writeFileSync(
    path.join(FEEDS_DIR, "meta.json"),
    JSON.stringify(metaJson, null, 2),
    "utf8"
  );

  console.log(`Catalog feeds written to ${FEEDS_DIR}`);
  console.log(`Products: ${products.length}`);
  console.log(`Feed items: ${metaJson.data.length}`);
}

main().catch((err) => {
  console.error("Failed to generate catalog feeds:", err.message);
  process.exit(1);
});
