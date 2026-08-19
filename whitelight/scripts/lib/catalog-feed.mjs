/**
 * Shared catalog feed builder — fetches products from Postgres (DATABASE_URL).
 */
import pg from "pg";

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

async function getPgClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL for catalog feeds");
  }
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  return client;
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
    isOnOffer: Boolean(row.is_on_offer ?? row.isOnOffer),
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
  if (variants.length === 0) return "out of stock";
  const inStock = variants.some((v) => v.inStock || Number(v.stockQuantity) > 0);
  return inStock ? "in stock" : "out of stock";
}

export function filterValidCatalogProducts(products = []) {
  return products.filter((product) => {
    if (!product || !product.id || !product.slug || !product.name || !product.brand) return false;
    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) return false;
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (variants.length === 0) return false;
    if (!variants.some((v) => Boolean(v.inStock) || Number(v.stockQuantity) > 0)) return false;
    const imageLink = getMainImage(product);
    if (!imageLink) return false;
    return true;
  });
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
  const client = await getPgClient();
  try {
    const { rows } = await client.query(
      `SELECT p.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', i.id, 'url', i.url, 'alt_text', i.alt_text) ORDER BY i.id)
           FROM product_images i WHERE i.product_id = p.id), '[]'::json
        ) AS product_images,
        COALESCE(
          (SELECT json_agg(json_build_object('id', v.id, 'size', v.size, 'in_stock', v.in_stock, 'stock_quantity', v.stock_quantity) ORDER BY v.id)
           FROM product_variants v WHERE v.product_id = p.id), '[]'::json
        ) AS product_variants
       FROM products p
       ORDER BY p.updated_at DESC NULLS LAST`
    );
    return filterValidCatalogProducts(rows.map(normalizeProduct));
  } finally {
    await client.end();
  }
}

/** Products marked On Sale in admin — used for Meta/Google ad catalog feeds */
export async function fetchSaleCatalogProducts() {
  const client = await getPgClient();
  try {
    const { rows } = await client.query(
      `SELECT p.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', i.id, 'url', i.url, 'alt_text', i.alt_text) ORDER BY i.id)
           FROM product_images i WHERE i.product_id = p.id), '[]'::json
        ) AS product_images,
        COALESCE(
          (SELECT json_agg(json_build_object('id', v.id, 'size', v.size, 'in_stock', v.in_stock, 'stock_quantity', v.stock_quantity) ORDER BY v.id)
           FROM product_variants v WHERE v.product_id = p.id), '[]'::json
        ) AS product_variants
       FROM products p
       WHERE p.is_on_offer = TRUE
       ORDER BY p.updated_at DESC NULLS LAST`
    );
    return filterValidCatalogProducts(rows.map(normalizeProduct));
  } finally {
    await client.end();
  }
}

export function toFeedItems(products) {
  return filterValidCatalogProducts(products)
    .map((product) => {
      const imageLink = getMainImage(product);
      if (!imageLink) return null;

      const availability = getAvailability(product);
      const link = getProductLink(product);
      const googleCategory =
        GOOGLE_CATEGORIES[product.category] ||
        GOOGLE_CATEGORIES.running;

      const hasSalePrice =
        product.originalPrice != null &&
        product.originalPrice > product.price;

      const listPrice = hasSalePrice ? product.originalPrice : product.price;
      const salePrice = hasSalePrice ? product.price : undefined;

      return {
        id: product.id,
        title: product.name.slice(0, 150),
        description: stripHtml(product.description).slice(0, 5000),
        link,
        image_link: imageLink,
        availability,
        condition: "new",
        price: formatFeedPrice(listPrice),
        sale_price: salePrice != null ? formatFeedPrice(salePrice) : undefined,
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
      <g:price>${xmlEscape(item.price)}</g:price>${item.sale_price ? `\n      <g:sale_price>${xmlEscape(item.sale_price)}</g:sale_price>` : ""}
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
    <description>Sale catalogue for ${xmlEscape(BRAND_DEFAULT)} ad campaigns</description>
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
      ...(item.sale_price ? { sale_price: item.sale_price } : {}),
      link: item.link,
      image_link: item.image_link,
      brand: item.brand,
      item_group_id: item.item_group_id,
    })),
  };
}

function csvEscape(value = "") {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Meta Commerce Manager CSV feed (URL should end with .csv) */
export function buildMetaCatalogCsv(products) {
  const items = toFeedItems(products);
  const headers = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "sale_price",
    "link",
    "image_link",
    "brand",
    "item_group_id",
  ];

  const rows = items.map((item) =>
    [
      item.id,
      item.title,
      item.description,
      item.availability,
      item.condition,
      item.price,
      item.sale_price ?? "",
      item.link,
      item.image_link,
      item.brand,
      item.item_group_id,
    ]
      .map(csvEscape)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n") + "\n";
}
