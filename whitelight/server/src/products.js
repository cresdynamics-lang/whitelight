/** Map DB rows to storefront Product JSON shape */

export function mapProductRow(row, images = [], variants = []) {
  const category = row.category || "running";
  return {
    id: String(row.id),
    slug: String(row.slug ?? row.id),
    name: String(row.name ?? "Product"),
    brand: String(row.brand ?? ""),
    category,
    categories:
      Array.isArray(row.categories) && row.categories.length
        ? row.categories
        : [category],
    price: Number(row.price) || 0,
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    description: String(row.description ?? ""),
    tags: Array.isArray(row.tags) ? row.tags : [],
    isNew: Boolean(row.is_new),
    isBestSeller: Boolean(row.is_best_seller),
    isOnOffer: Boolean(row.is_on_offer),
    url_slug: row.url_slug ?? null,
    alt_text_main: row.alt_text_main ?? null,
    seo_title: row.seo_title ?? null,
    seo_description: row.seo_description ?? null,
    product_h1: row.product_h1 ?? null,
    product_description: row.product_description ?? null,
    seo_keywords: Array.isArray(row.seo_keywords) ? row.seo_keywords : null,
    gender: row.gender ?? null,
    structured_data: row.structured_data ?? null,
    images: images.map((img) => ({
      id: String(img.id),
      url: img.url,
      alt: img.alt_text || row.name || "Product",
    })),
    variants: variants.map((v) => ({
      id: String(v.id),
      size: v.size,
      inStock: Boolean(v.in_stock),
      stockQuantity: typeof v.stock_quantity === "number" ? v.stock_quantity : undefined,
    })),
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export async function loadProductsFull(query, { saleOnly = false, slug = null, id = null } = {}) {
  const clauses = [];
  const params = [];
  if (saleOnly) clauses.push("p.is_on_offer = true");
  if (slug) {
    params.push(slug);
    clauses.push(
      `(LOWER(p.slug) = LOWER($${params.length}) OR LOWER(COALESCE(p.url_slug, '')) = LOWER($${params.length}) OR LOWER(COALESCE(p.url_slug, '')) = LOWER('/' || $${params.length}) OR LOWER(COALESCE(p.url_slug, '')) = LOWER('/product/' || $${params.length}))`
    );
  }
  if (id) {
    params.push(id);
    clauses.push(`p.id = $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const { rows } = await query(
    `SELECT p.* FROM products p ${where} ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC`,
    params
  );
  if (!rows.length) return [];

  const ids = rows.map((r) => r.id);
  const { rows: images } = await query(
    `SELECT * FROM product_images WHERE product_id = ANY($1::bigint[]) ORDER BY id ASC`,
    [ids]
  );
  const { rows: variants } = await query(
    `SELECT * FROM product_variants WHERE product_id = ANY($1::bigint[]) ORDER BY id ASC`,
    [ids]
  );

  const imagesBy = new Map();
  for (const img of images) {
    const list = imagesBy.get(img.product_id) || [];
    list.push(img);
    imagesBy.set(img.product_id, list);
  }
  const variantsBy = new Map();
  for (const v of variants) {
    const list = variantsBy.get(v.product_id) || [];
    list.push(v);
    variantsBy.set(v.product_id, list);
  }

  return rows.map((row) =>
    mapProductRow(row, imagesBy.get(row.id) || [], variantsBy.get(row.id) || [])
  );
}
