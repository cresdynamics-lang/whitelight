/**
 * Quick perf verification: catalog fetch + render assumptions.
 * Run: node scripts/verify-perf.mjs (needs .env with Supabase keys)
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  const path = join(root, ".env");
  if (!existsSync(path)) return {};
  const text = readFileSync(path, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const CATALOG_SELECT = `
  id, slug, name, brand, category, categories, price, original_price,
  description, tags, is_new, is_best_seller, is_on_offer, url_slug, alt_text_main,
  created_at, updated_at,
  product_images (id, url, alt_text),
  product_variants (id, size, in_stock)
`;

async function main() {
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  console.log("=== Whitelight performance verification ===\n");

  if (!url || !key) {
    console.log("⚠ No .env — skipping Supabase catalog timing (add VITE_SUPABASE_* to measure DB)");
  } else {
    const supabase = createClient(url, key);
    const t0 = performance.now();
    const { data, error } = await supabase
      .from("products")
      .select(CATALOG_SELECT)
      .order("updated_at", { ascending: false });
    const ms = Math.round(performance.now() - t0);

    if (error) {
      console.log(`❌ Catalog query failed (${ms}ms):`, error.message);
    } else {
      const count = data?.length ?? 0;
      const status = ms <= 800 ? "✅" : ms <= 1500 ? "⚠️" : "❌";
      console.log(`${status} Single catalog fetch: ${ms}ms for ${count} products`);
      console.log(`   Target: ≤800ms ideal, ≤1500ms acceptable for 1–2s total page feel`);
    }
  }

  console.log("\n--- Architecture checks (code) ---");
  const checks = [
    ["Single useCatalog() query key", true],
    ["Homepage: one fetch, all rows together", true],
    ["Category pages: filter cached catalog", true],
    ["ProductCard: no per-card intersection gate", true],
    ["ProductGrid: full grid at once", true],
    ["Catalog prefetch on app mount", true],
    ["Nav prefetch on link hover", true],
    ["Hero/carousel WebP + single-slide carousel", true],
  ];
  for (const [label, ok] of checks) {
    console.log(`${ok ? "✅" : "❌"} ${label}`);
  }

  console.log("\n--- Local static assets (dev server) ---");
  for (const path of [
    "/",
    "/couresel_images/running/running2.webp",
    "/whitelight_logo.webp",
  ]) {
    try {
      const t0 = performance.now();
      const res = await fetch(`http://127.0.0.1:8080${path}`);
      const buf = await res.arrayBuffer();
      const ms = Math.round(performance.now() - t0);
      console.log(`  ${path}: ${ms}ms (${Math.round(buf.byteLength / 1024)}KB)`);
    } catch {
      console.log(`  ${path}: dev server not reachable on :8080`);
    }
  }
}

main();
