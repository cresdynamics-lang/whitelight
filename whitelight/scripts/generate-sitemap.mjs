import fs from "node:fs";
import path from "node:path";
import productsData from "../src/data/products.json" with { type: "json" };

const BASE_URL = "https://whitelightstore.co.ke";
const ROOT = path.resolve(process.cwd());
const OUTPUT = path.join(ROOT, "public", "sitemap.xml");

const staticUrls = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/category/running", changefreq: "weekly", priority: "0.9" },
  { loc: "/category/trail", changefreq: "weekly", priority: "0.9" },
  { loc: "/category/gym", changefreq: "weekly", priority: "0.9" },
  { loc: "/category/basketball", changefreq: "weekly", priority: "0.9" },
  { loc: "/category/training", changefreq: "weekly", priority: "0.8" },
  { loc: "/category/accessories", changefreq: "weekly", priority: "0.8" },
  { loc: "/new-arrivals", changefreq: "weekly", priority: "0.8" },
  { loc: "/buying-guide", changefreq: "monthly", priority: "0.7" },
  { loc: "/about", changefreq: "monthly", priority: "0.7" },
  { loc: "/contact", changefreq: "monthly", priority: "0.7" },
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

function main() {
  const products = Array.isArray(productsData.products) ? productsData.products : [];

  const productUrls = products
    .filter((p) => p?.slug)
    .map((p) => ({
      loc: `/product/${p.slug}`,
      changefreq: "weekly",
      priority: "0.8",
    }));

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

main();

