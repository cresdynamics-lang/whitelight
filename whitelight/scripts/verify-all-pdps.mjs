/**
 * Verify every product PDP resolves via API with images.
 * Run: node scripts/verify-all-pdps.mjs [baseUrl]
 */
const base = (process.argv[2] || process.env.PUBLIC_BASE_URL || "http://64.227.13.96").replace(
  /\/$/,
  ""
);

async function main() {
  const catRes = await fetch(`${base}/api/catalog`);
  if (!catRes.ok) throw new Error(`catalog ${catRes.status}`);
  const { products = [] } = await catRes.json();
  console.log(`Checking ${products.length} products at ${base}\n`);

  const failures = [];
  let multi = 0;
  let single = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slug = p.slug;
    const catalogImages = (p.images || []).length;
    if (catalogImages > 1) multi++;
    else single++;

    let res;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await fetch(`${base}/api/products/${encodeURIComponent(slug)}`);
        break;
      } catch (err) {
        if (attempt === 2) {
          failures.push({ slug, name: p.name, error: String(err) });
          res = null;
        } else {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }
    if (!res) continue;
    if (!res.ok) {
      failures.push({ slug, name: p.name, error: `HTTP ${res.status}` });
      continue;
    }
    const { product } = await res.json();
    const apiImages = (product?.images || []).length;
    if (!product?.slug) {
      failures.push({ slug, name: p.name, error: "missing product" });
    } else if (apiImages === 0) {
      failures.push({ slug, name: p.name, error: "no images" });
    } else if (apiImages !== catalogImages) {
      failures.push({
        slug,
        name: p.name,
        error: `image mismatch catalog=${catalogImages} api=${apiImages}`,
      });
    }
  }

  console.log(`Multi-angle: ${multi} | Single image: ${single}`);
  if (failures.length) {
    console.error(`\nFAILED (${failures.length}):`);
    for (const f of failures) console.error(`  ${f.slug} — ${f.error} (${f.name})`);
    process.exit(1);
  }
  console.log(`\nOK — all ${products.length} product pages load with correct image counts.`);
  console.log(`Example: ${base}/product/${products[0].slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
