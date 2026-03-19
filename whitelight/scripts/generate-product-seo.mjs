// Helper script to generate SEO fields for Supabase products.
// Run manually with: node scripts/generate-product-seo.mjs
//
// IMPORTANT: This script only logs the suggested SEO payloads.
// You should wire it to Supabase Admin API (service key) or
// copy the JSON into your own migration/import process.

import productsData from "../src/data/products.json" with { type: "json" };

const STORE_NAME = "White Light Store";
const BASE_URL = "https://whitelightstore.co.ke";

function toKebab(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildCategoryLabel(category) {
  switch (category) {
    case "running":
      return "Running Shoes";
    case "trail":
      return "Trail Running Shoes";
    case "basketball":
      return "Basketball Shoes";
    case "gym":
    case "training":
      return "Gym & Training Shoes";
    default:
      return "Shoes";
  }
}

function buildSeoForProduct(p) {
  const brand = p.brand || "";
  const name = p.name || "";
  const category = p.category || "running";
  const categoryLabel = buildCategoryLabel(category);

  const baseTitle = `${brand} ${name}`.trim();

  const seo_title = `${baseTitle} ${categoryLabel} Kenya | ${STORE_NAME}`.slice(0, 60);

  const seo_description = (
    `${baseTitle} ${categoryLabel} for Nairobi runners in Kenya. ` +
    `Trusted ${brand} performance shoes. Order online or via WhatsApp. Fast Nairobi delivery.`
  ).slice(0, 155);

  const product_h1 = `${baseTitle} ${categoryLabel} in Nairobi, Kenya`.slice(0, 70);

  const product_description =
    `${baseTitle} is built for Nairobi runners who want dependable ${categoryLabel.toLowerCase()} with real performance on Kenyan roads and paths. ` +
    `This model from ${brand} combines cushioning, support and grip so you stay comfortable from CBD streets to weekend long runs. ` +
    `Use it for daily training, easy runs and local races around Nairobi and across Kenya. ` +
    `Order now. Delivered across Nairobi and Kenya.`;

  const url_slugCore = `${toKebab(brand)}-${toKebab(name)}-${toKebab(categoryLabel)}-kenya`;
  const url_slug = `/products/${url_slugCore}`;

  const categoryWord = categoryLabel.toLowerCase();
  const alt_text_main = `${brand} ${name} ${categoryWord} — available in Kenya`.slice(0, 125);

  const seo_keywords = [
    `${brand} ${name}`,
    `${brand} ${name} ${categoryWord}`,
    `${categoryWord} Nairobi`,
    `${categoryWord} Kenya`,
    `${brand} running shoes Nairobi`,
    `${brand} running shoes Kenya`,
    `${category} shoes Nairobi`,
    `${category} shoes Kenya`,
    `${brand} Kenya`,
    `${STORE_NAME} Nairobi`,
  ];

  const structured_data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product_h1,
    brand: { "@type": "Brand", name: brand },
    description: product_description,
    image: p.images?.[0]?.url || `${BASE_URL}/whitelight_logo.jpeg`,
    offers: {
      "@type": "Offer",
      price: Number(p.price || 0),
      priceCurrency: "KES",
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}${url_slug}`,
    },
  };

  return {
    seo_title,
    seo_description,
    product_h1,
    product_description,
    url_slug,
    alt_text_main,
    seo_keywords,
    category,
    structured_data,
  };
}

function main() {
  const products = productsData.products || [];
  const result = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    ...buildSeoForProduct(p),
  }));

  // Log as JSON for manual import or Supabase updates.
  console.log(JSON.stringify(result, null, 2));
}

main();

