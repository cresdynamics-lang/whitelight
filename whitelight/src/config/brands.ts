/** Shop-by-brand config — slug used in URLs, match aliases for Supabase product.brand values */
export interface BrandConfig {
  slug: string;
  name: string;
  /** Substrings matched case-insensitively against product.brand */
  match: string[];
  description: string;
}

export const SHOP_BRANDS: BrandConfig[] = [
  {
    slug: "nike",
    name: "Nike",
    match: ["nike"],
    description: "Running, trail, gym, basketball and lifestyle Nike footwear in Nairobi.",
  },
  {
    slug: "adidas",
    name: "Adidas",
    match: ["adidas"],
    description: "Adidas performance and training shoes across every category we stock.",
  },
  {
    slug: "asics",
    name: "Asics",
    match: ["asics"],
    description: "Asics running and training shoes — cushioning built for Kenyan roads.",
  },
  {
    slug: "puma",
    name: "Puma",
    match: ["puma"],
    description: "Puma trainers, running and court shoes for Nairobi athletes.",
  },
  {
    slug: "under-armour",
    name: "Under Armour",
    match: ["under armour", "under armor", "underarmour"],
    description: "Under Armour gym, training and running shoes with stable support.",
  },
  {
    slug: "brooks",
    name: "Brooks",
    match: ["brooks"],
    description: "Brooks running shoes for daily miles and long-distance training.",
  },
];

export function getBrandBySlug(slug: string): BrandConfig | undefined {
  const key = slug.toLowerCase().trim();
  return SHOP_BRANDS.find((b) => b.slug === key);
}

export function brandSlugFromName(name: string): string | undefined {
  const normalized = name.toLowerCase().trim();
  return SHOP_BRANDS.find((b) =>
    b.match.some((m) => normalized.includes(m.toLowerCase()))
  )?.slug;
}

/** Brands shown in admin pickers — covers storefront shop-by-brand + common stock */
export const ADMIN_BRAND_OPTIONS = [
  ...SHOP_BRANDS.map((b) => b.name),
  "HOKA",
  "New Balance",
  "Salomon",
  "Skechers",
  "Reebok",
  "Jordan",
  "Converse",
  "Other",
] as const;

export function productMatchesBrand(productBrand: string, brand: BrandConfig): boolean {
  const normalized = productBrand.toLowerCase().trim();
  if (!normalized) return false;
  return brand.match.some(
    (alias) =>
      normalized === alias.toLowerCase() || normalized.includes(alias.toLowerCase())
  );
}

export function resolveBrandGroupKey(productBrand: string): string {
  return brandSlugFromName(productBrand) ?? "other";
}

export function resolveBrandGroupLabel(productBrand: string): string {
  const slug = brandSlugFromName(productBrand);
  if (slug) return getBrandBySlug(slug)?.name ?? productBrand;
  return productBrand.trim() || "Other";
}
