/** Catalog ads & merchant feed configuration (Google Merchant + Meta Catalog). */

export const catalogConfig = {
  baseUrl: "https://whitelightstore.co.ke",
  brand: "WHITELIGHT STORE",
  /** ISO 4217 — required by Google/Meta feeds and conversion APIs */
  currency: "KES",
  /** Default condition for all catalogue items */
  condition: "new" as const,
  /**
   * Google product taxonomy paths.
   * @see https://www.google.com/basepages/producttype/taxonomy.en-US.txt
   */
  googleProductCategoryByCategory: {
    running: "Apparel & Accessories > Shoes > Athletic Shoes",
    trail: "Apparel & Accessories > Shoes > Athletic Shoes",
    gym: "Apparel & Accessories > Shoes > Athletic Shoes",
    training: "Apparel & Accessories > Shoes > Athletic Shoes",
    basketball: "Apparel & Accessories > Shoes > Athletic Shoes",
    tennis: "Apparel & Accessories > Shoes > Athletic Shoes",
    accessories: "Apparel & Accessories > Clothing Accessories",
  } as Record<string, string>,
  /** Public feed URLs (production). Use static /feeds/* in local dev after `npm run generate:feeds`. */
  feeds: {
    google: "/api/feeds/google",
    meta: "/api/feeds/meta",
  },
} as const;

export type CatalogProductCategory = keyof typeof catalogConfig.googleProductCategoryByCategory;

/** Build canonical product URL — mirrors ProductDetail SEOHead logic. */
export function getProductCanonicalUrl(slug: string, urlSlug?: string | null): string {
  const base = catalogConfig.baseUrl;
  if (urlSlug) {
    const path = urlSlug.startsWith("/") ? urlSlug : `/${urlSlug}`;
    return `${base}${path}`;
  }
  return `${base}/product/${slug}`;
}
