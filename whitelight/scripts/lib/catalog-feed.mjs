/**
 * Shared catalog feed builder — used by Vercel API routes and local generate scripts.
 * Fetches live products from Supabase (same shape as the storefront).
 */
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://whitelightstore.co.ke";
const CURRENCY = "KES";
const BRAND_DEFAULT = "WHITELIGHT STORE";
const GOOGLE_CATEGORIES = {
  running: "Apparel & Accessories > Shoes > Athletic Shoes",
  trail: "Apparel & Accessories > Shoes > Athletic Shoes",
  gym: "Apparel & Accessories > Shoes > Athletic Shoes",
  training: "Apparel & Accessories > Shoes > Athletic Shoes",
  basketball: "Apparel & Accessories > Shoes > Athletic Shoes",
  tennis: "Apparel & Accessories > Shoes > Athletic Shoes",
  accessories: "Apparel & Accessories > Clothing Accessories",
};

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY)"
    );
  }
  return createClient(url, key);
}

function normalizeProduct(row) {
  const images = Array.isArray(row.product_images) ? row.product_images : [];
  const variants = Array.isArray(row.product_variants) ? row.product_variants : [];
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? row.id ?? ""),
    name: String(row.name ?? "Product"),
    brand: String(row.brand ?? BRAND_DEFAULT),
    category: row.category ?? "running",
    price: Number(row.price) || 0,
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    description: String(row.description ?? ""),
    url_slug: row.url_slug ?? null,
    images: images.map((img) => ({
      id: String(img.id ?? ""),
      url: String(img.url ?? ""),
      alt: String(img.alt_text ?? img.alt ?? ""),
    })),
    variants: variants.map((v) => ({
      id: String(v.id ?? ""),
      size: v.size ?? 0,
      inStock: Boolean(v.in_stock ?? v.inStock),
    })),
  };
}

export function getProductLink(product) {
  if (product.url_slug) {
    const path = product.url_slug.startsWith("/")
      ? product.url_slug
      : `/${product.url_slug}`;
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}/product/${product.slug}`;
}

export function getAvailability(product) {
  const variants = product.variants || [];
  if (variants.length === 0) return "in stock";
  const inStock = variants.some((v) => v.inStock);
  return inStock ? "in stock" : "out of stock";
}

function getMainImage(product) {
  const url = product.images?.[0]?.url;
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatFeedPrice(price) {
  return `${Number(price).toFixed(2)} ${CURRENCY}`;
}

function xmlEscape(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(text) {
  return String(text).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function fetchCatalogProducts() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (*),
      product_variants (*)
    `
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeProduct).filter((p) => p.id && p.slug);
}

export function toFeedItems(products) {
  return products
    .map((product) => {
      const imageLink = getMainImage(product);
      if (!imageLink) return null;

      const availability = getAvailability(product);
      const link = getProductLink(product);
      const googleCategory =
        GOOGLE_CATEGORIES[product.category] ||
        GOOGLE_CATEGORIES.running;

      return {
        id: product.id,
        title: product.name.slice(0, 150),
        description: stripHtml(product.description).slice(0, 5000),
        link,
        image_link: imageLink,
        availability,
        condition: "new",
        price: formatFeedPrice(product.price),
        brand: product.brand || BRAND_DEFAULT,
        google_product_category: googleCategory,
        item_group_id: product.slug,
        identifier_exists: "false",
        mpn: product.id,
      };
    })
    .filter(Boolean);
}

export function buildGoogleMerchantRss(products) {
  const items = toFeedItems(products);
  const itemNodes = items
    .map(
      (item) => `    <item>
      <g:id>${xmlEscape(item.id)}</g:id>
      <title>${xmlEscape(item.title)}</title>
      <description>${xmlEscape(item.description)}</description>
      <g:link>${xmlEscape(item.link)}</g:link>
      <g:image_link>${xmlEscape(item.image_link)}</g:image_link>
      <g:availability>${xmlEscape(item.availability)}</g:availability>
      <g:price>${xmlEscape(item.price)}</g:price>
      <g:brand>${xmlEscape(item.brand)}</g:brand>
      <g:condition>${xmlEscape(item.condition)}</g:condition>
      <g:google_product_category>${xmlEscape(item.google_product_category)}</g:google_product_category>
      <g:identifier_exists>${xmlEscape(item.identifier_exists)}</g:identifier_exists>
      <g:mpn>${xmlEscape(item.mpn)}</g:mpn>
      <g:item_group_id>${xmlEscape(item.item_group_id)}</g:item_group_id>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xmlEscape(BRAND_DEFAULT)} Product Feed</title>
    <link>${xmlEscape(BASE_URL)}</link>
    <description>Premium footwear catalogue for ${xmlEscape(BRAND_DEFAULT)}</description>
${itemNodes}
  </channel>
</rss>
`;
}

export function buildMetaCatalogJson(products) {
  const items = toFeedItems(products);
  return {
    data: items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      availability: item.availability,
      condition: item.condition,
      price: item.price,
      link: item.link,
      image_link: item.image_link,
      brand: item.brand,
      item_group_id: item.item_group_id,
    })),
  };
}
