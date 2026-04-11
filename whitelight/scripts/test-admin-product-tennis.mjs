/**
 * Verifies Supabase accepts tennis category + variants on create/update (admin flow).
 * Loads ../.env for VITE_SUPABASE_URL and key.
 *
 * Usage: node scripts/test-admin-product-tennis.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDotEnv() {
  const envPath = join(__dirname, "..", ".env");
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq <= 0) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch (e) {
    console.error("Could not read .env:", e.message);
  }
}

loadDotEnv();

const url = process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Missing VITE_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

const supabase = createClient(url, key);
const slug = `test-tennis-${Date.now()}`;
const name = "CI Tennis Save Test";

async function run() {
  console.log("1) INSERT product (category + categories = tennis)…");
  const { data: created, error: insErr } = await supabase
    .from("products")
    .insert({
      slug,
      name,
      brand: "Test",
      category: "tennis",
      categories: ["tennis"],
      price: 100,
      description: "Automated tennis save test",
      tags: ["test", "tennis"],
      is_new: false,
      is_best_seller: false,
      is_on_offer: false,
    })
    .select("id")
    .single();

  if (insErr || !created) {
    console.error("❌ INSERT failed:", insErr?.message || insErr);
    process.exit(1);
  }

  const id = created.id;
  console.log("   ✅ product id:", id);

  console.log("2) INSERT variants (40, 46)…");
  const { error: vErr } = await supabase.from("product_variants").insert([
    { product_id: id, size: "40", in_stock: true, stock_quantity: 1 },
    { product_id: id, size: "46", in_stock: true, stock_quantity: 1 },
  ]);
  if (vErr) {
    console.error("❌ Variants INSERT failed:", vErr.message);
    await supabase.from("products").delete().eq("id", id);
    process.exit(1);
  }
  console.log("   ✅ variants ok");

  console.log("3) UPDATE product (name + price)…");
  const { error: uErr } = await supabase
    .from("products")
    .update({
      name: `${name} (updated)`,
      price: 150,
    })
    .eq("id", id);
  if (uErr) {
    console.error("❌ UPDATE failed:", uErr.message);
    await supabase.from("products").delete().eq("id", id);
    process.exit(1);
  }
  console.log("   ✅ update ok");

  console.log("4) REPLACE variants (delete + insert)…");
  await supabase.from("product_variants").delete().eq("product_id", id);
  const { error: v2Err } = await supabase.from("product_variants").insert([
    { product_id: id, size: "41", in_stock: true, stock_quantity: 2 },
    { product_id: id, size: "47", in_stock: true, stock_quantity: 1 },
  ]);
  if (v2Err) {
    console.error("❌ Variant replace failed:", v2Err.message);
    await supabase.from("products").delete().eq("id", id);
    process.exit(1);
  }
  console.log("   ✅ variants replace ok");

  console.log("5) CLEANUP delete product…");
  const { error: dErr } = await supabase.from("products").delete().eq("id", id);
  if (dErr) {
    console.error("⚠️ Cleanup delete failed (remove manually):", dErr.message);
    process.exit(1);
  }
  console.log("   ✅ deleted");

  console.log("\n✅ All tennis create/update checks passed.");
  process.exit(0);
}

run().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
