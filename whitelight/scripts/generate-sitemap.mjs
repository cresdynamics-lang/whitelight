import fs from "node:fs";
import path from "node:path";
import { fetchCatalogProducts } from "./lib/catalog-feed.mjs";
import productsData from "../src/data/products.json" with { type: "json" };

const BASE_URL = "https://whitelightstore.co.ke";
const ROOT = path.resolve(process.cwd());
const OUTPUT = path.join(ROOT, "public", "sitemap.xml");

const blogSlugs = [
  "best-running-shoes-nairobi",
  "buy-running-shoes-nairobi-cbd-luthuli-avenue",
  "running-shoes-price-kenya",
  "trail-running-shoes-kenya",
  "running-shoes-vs-gym-shoes-kenya",
  "running-shoe-size-fit-guide-kenya",
];

const staticUrls = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/running", changefreq: "weekly", priority: "0.9" },
  { loc: "/trail", changefreq: "weekly", priority: "0.9" },
  { loc: "/gym", changefreq: "weekly", priority: "0.9" },
  { loc: "/training", changefreq: "weekly", priority: "0.8" },
  { loc: "/basketball", changefreq: "weekly", priority: "0.9" },
  { loc: "/tennis", changefreq: "weekly", priority: "0.8" },
  { loc: "/accessories", changefreq: "weekly", priority: "0.8" },
  { loc: "/category/running", changefreq: "weekly", priority: "0.7" },
  { loc: "/category/trail", changefreq: "weekly", priority: "0.7" },
  { loc: "/new", changefreq: "weekly", priority: "0.9" },
  { loc: "/new-arrivals", changefreq: "weekly", priority: "0.7" },
  { loc: "/sale", changefreq: "weekly", priority: "0.9" },
  { loc: "/products", changefreq: "weekly", priority: "0.8" },
  { loc: "/size-guide", changefreq: "monthly", priority: "0.8" },
  { loc: "/delivery", changefreq: "monthly", priority: "0.8" },
  { loc: "/store", changefreq: "monthly", priority: "0.8" },
  { loc: "/about", changefreq: "monthly", priority: "0.7" },
  { loc: "/contact", changefreq: "monthly", priority: "0.7" },
  { loc: "/buying-guide", changefreq: "monthly", priority: "0.6" },
  { loc: "/blog", changefreq: "weekly", priority: "0.9" },
  { loc: "/journal", changefreq: "weekly", priority: "0.85" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
  ...blogSlugs.map((slug) => ({
    loc: `/blog/${slug}`,
    changefreq: "weekly",
    priority: "0.85",
  })),
];

function xmlEscape(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildUrlNode({ loc, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(`${BASE_URL}${loc}`)}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

async function loadProducts() {
  const catalogPath = path.join(ROOT, "public", "catalog.json");
  if (fs.existsSync(catalogPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
      const products = Array.isArray(data) ? data : data.products || [];
      if (products.length > 0) {
        console.log(`Sitemap: ${products.length} products from public/catalog.json`);
        return products;
      }
    } catch (err) {
      console.warn("Sitemap: catalog.json unreadable —", err.message);
    }
  }
  try {
    const res = await fetch("https://whitelightstore.co.ke/api/catalog");
    if (res.ok) {
      const data = await res.json();
      const products = data.products || [];
      if (products.length > 0) {
        console.log(`Sitemap: ${products.length} products from live API`);
        return products;
      }
    }
  } catch (err) {
    console.warn("Sitemap: live API unavailable —", err.message);
  }
  try {
    const fromDb = await fetchCatalogProducts();
    if (fromDb.length > 0) {
      console.log(`Sitemap: ${fromDb.length} products from DB feed helper`);
      return fromDb;
    }
  } catch (err) {
    console.warn("Sitemap: DB feed unavailable, using products.json —", err.message);
  }
  return Array.isArray(productsData.products) ? productsData.products : [];
}

async function main() {
  const products = await loadProducts();

  const productUrls = products
    .filter((p) => p?.slug)
    .flatMap((p) => [
      { loc: `/shoes/${p.slug}`, changefreq: "weekly", priority: "0.85" },
      { loc: `/product/${p.slug}`, changefreq: "weekly", priority: "0.7" },
    ]);

  const allUrls = [...staticUrls, ...productUrls];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allUrls.map(buildUrlNode),
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(OUTPUT, xml, "utf8");
  console.log(`Sitemap generated: ${OUTPUT}`);
  console.log(`Total URLs: ${allUrls.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
