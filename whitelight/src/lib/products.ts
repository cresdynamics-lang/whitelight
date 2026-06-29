// Product data service - now uses Supabase directly so the app
// can be hosted as a single frontend on Vercel.
import type { Product, ProductFilters, ProductsResponse, ProductCategory } from "@/types/product";
import { getBrandBySlug } from "@/config/brands";
import { supabase } from "@/lib/supabaseClient";
import productsData from "@/data/products.json";
// Normalize a single product: safe arrays, boolean inStock, and required display fields never null/undefined
function normalizeProduct(p: any): any {
  if (!p || typeof p !== "object") return null;
  const images = Array.isArray(p.images) ? p.images : [];
  const variants = Array.isArray(p.variants)
    ? p.variants.map((v: any) => ({
        ...v,
        id: v?.id ?? `${p.id}-${v?.size ?? "s"}`,
        size: v?.size ?? 0,
        inStock: Boolean(v?.inStock ?? v?.in_stock),
      }))
    : [];
  return {
    ...p,
    id: String(p.id ?? ""),
    slug: String(p.slug ?? p.id ?? ""),
    name: String(p.name ?? "Product"),
    brand: String(p.brand ?? ""),
    category: p.category ?? "running",
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    description: String(p.description ?? ""),
    tags: Array.isArray(p.tags) ? p.tags : [],
    images,
    variants,
    isNew: Boolean(p.isNew ?? p.is_new),
    isBestSeller: Boolean(p.isBestSeller ?? p.is_best_seller),
    isOnOffer: Boolean(p.isOnOffer ?? p.is_on_offer),
    // Optional SEO fields (from new Supabase columns)
    seo_title: p.seo_title ?? null,
    seo_description: p.seo_description ?? null,
    product_h1: p.product_h1 ?? null,
    product_description: p.product_description ?? null,
    url_slug: p.url_slug ?? null,
    alt_text_main: p.alt_text_main ?? null,
    seo_keywords: Array.isArray(p.seo_keywords) ? p.seo_keywords : null,
    gender: p.gender ?? null,
    structured_data: p.structured_data ?? null,
    createdAt: p.createdAt ?? p.created_at ?? "",
  };
}

// Only include products that have at least an id (so display never crashes on missing key/data)
function safeProductList(raw: any[]): Product[] {
  return raw.map(normalizeProduct).filter((p) => p != null && p.id) as Product[];
}

/** Lean Supabase select — one request for the whole storefront */
const CATALOG_SELECT = `
  id, slug, name, brand, category, categories, price, original_price,
  description, tags, is_new, is_best_seller, is_on_offer, url_slug, alt_text_main,
  created_at, updated_at,
  product_images (id, url, alt_text),
  product_variants (id, size, in_stock)
`;

function normalizeCatalogRow(row: Record<string, unknown>): Product | null {
  const imagesRaw = Array.isArray(row.product_images) ? row.product_images : [];
  const firstImage = imagesRaw[0];
  const images = firstImage
    ? [
        {
          id: String((firstImage as { id?: string }).id ?? ""),
          url: String((firstImage as { url?: string }).url ?? ""),
          alt: String(
            (firstImage as { alt_text?: string }).alt_text ??
              (firstImage as { alt?: string }).alt ??
              ""
          ),
        },
      ]
    : [];

  return normalizeProduct({
    ...row,
    images,
    variants: row.product_variants,
  }) as Product | null;
}

/** Static catalog snapshot — generated at build, served from CDN */
export async function fetchStaticCatalog(): Promise<Product[] | null> {
  try {
    const base = import.meta.env.BASE_URL || "/";
    const url = `${base}catalog.json`.replace(/\/{2,}/g, "/");
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    const raw = await res.text();
    // SPA fallback can return index.html when static file routing fails
    if (raw.trimStart().startsWith("<") || !contentType.includes("json")) {
      return null;
    }

    const json = JSON.parse(raw) as { products?: unknown[] } | unknown[];
    const list = Array.isArray(json) ? json : json.products;
    if (!Array.isArray(list) || list.length === 0) return null;
    return safeProductList(list);
  } catch {
    return null;
  }
}

/** Live catalog from Supabase */
export async function fetchLiveCatalog(): Promise<Product[]> {
  if (!supabase) throw new Error("Supabase client not initialised");

  const { data, error } = await supabase
    .from("products")
    .select(CATALOG_SELECT)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data || [])
    .map((row) => normalizeCatalogRow(row as Record<string, unknown>))
    .filter((p): p is Product => p != null && !!p.id);
}

/** Single fetch for homepage, search, and category pages */
export async function getCatalogProducts(): Promise<Product[]> {
  const staticCatalog = await fetchStaticCatalog();
  if (staticCatalog?.length) return staticCatalog;

  try {
    return await fetchLiveCatalog();
  } catch (error) {
    console.error("Error fetching catalog from Supabase:", error);
    if (import.meta.env.DEV) {
      return safeProductList(productsData.products || []);
    }
    return [];
  }
}

export function filterByCategory(products: Product[], category: ProductCategory): Product[] {
  return products.filter(
    (p) =>
      p.category === category ||
      (Array.isArray(p.categories) && p.categories.includes(category))
  );
}

/** Products marked On Sale in admin */
export function filterSaleProducts(products: Product[]): Product[] {
  return products.filter((p) => Boolean(p.isOnOffer));
}

/** Match products by brand slug — works across running, gym, trail, etc. */
export function filterByBrand(products: Product[], brandSlug: string): Product[] {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return [];

  return products.filter((p) => {
    const normalized = String(p.brand ?? "").toLowerCase().trim();
    if (!normalized) return false;
    return brand.match.some(
      (alias) =>
        normalized === alias.toLowerCase() ||
        normalized.includes(alias.toLowerCase())
    );
  });
}

export function partitionCatalog(products: Product[]) {
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 12);
  const newArrivals = products.filter((p) => p.isNew).length
    ? products.filter((p) => p.isNew)
    : products.slice(0, 24);

  return {
    all: products,
    bestSellers,
    newArrivals,
    running: filterByCategory(products, "running"),
    trail: filterByCategory(products, "trail"),
    gym: filterByCategory(products, "gym"),
    training: filterByCategory(products, "training"),
    basketball: filterByCategory(products, "basketball"),
    tennis: filterByCategory(products, "tennis"),
    accessories: filterByCategory(products, "accessories"),
  };
}

// Local data helper (kept for potential future use in local/dev-only tools)
const getLocalProducts = (filters?: ProductFilters): ProductsResponse => {
  let products = productsData.products || [];
  
  if (filters) {
    if (filters.category) {
      products = products.filter(
        (p) =>
          p.category === filters.category ||
          (Array.isArray(p.categories) && p.categories.includes(filters.category!))
      );
    }
    if (filters.brand) {
      products = products.filter(p => p.brand.toLowerCase().includes(filters.brand!.toLowerCase()));
    }
    if (filters.isNew !== undefined) {
      products = products.filter(p => p.isNew === filters.isNew);
    }
    if (filters.isBestSeller !== undefined) {
      products = products.filter(p => p.isBestSeller === filters.isBestSeller);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
      );
    }
  }
  
  return {
    products,
    total: products.length,
    page: 1,
    limit: products.length,
  };
};

// Get all products with optional filters (Supabase)
export async function getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialised");
    }

    let query = supabase
      .from("products")
      .select(
        `
        *,
        product_images (*),
        product_variants (*)
      `
      )
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false });

    // Show product in a category if it's the primary category OR in the categories array
    if (filters?.category) {
      query = query.or(
        `category.eq.${filters.category},categories.cs.{"${filters.category}"}`
      );
    }
    if (filters?.brand) {
      query = query.ilike("brand", `%${filters.brand}%`);
    }
    if (filters?.isNew !== undefined) {
      query = query.eq("is_new", filters.isNew);
    }
    if (filters?.isBestSeller !== undefined) {
      query = query.eq("is_best_seller", filters.isBestSeller);
    }
    if (filters?.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters?.search) {
      const s = `%${filters.search}%`;
      query = query.or(`name.ilike.${s},description.ilike.${s},brand.ilike.${s}`);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const products = safeProductList(
      (data || []).map((row: any) => ({
        ...row,
        images: row.product_images || [],
        variants: row.product_variants || [],
      }))
    );

    return {
      products,
      total: products.length,
      page: 1,
      limit: products.length,
    };
  } catch (error) {
    console.error("Error fetching products from Supabase:", error);

    // In development, fall back to local demo data so we can reproduce
    // UI issues (like React hook errors) even when the API/database is down.
    if (import.meta.env.DEV) {
      console.warn("Falling back to local products.json in development.");
      return getLocalProducts(filters);
    }

    // In production we DO NOT fall back to placeholder/local data.
    // If Supabase fails, surface an empty list so the UI shows "No products found".
    return {
      products: [],
      total: 0,
      page: 1,
      limit: 0,
    };
  }
}

// Get single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialised");
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (*),
        product_variants (*)
      `
      )
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) return null;

    return normalizeProduct({
      ...data,
      images: data.product_images || [],
      variants: data.product_variants || [],
    });
  } catch (error) {
    // Do NOT fall back to local demo products in production; if Supabase fails,
    // return null so the UI can show an appropriate error/404 state.
    console.error("Error fetching product from Supabase:", error);
    return null;
  }
}

// Get best sellers (uses catalog cache when available via hooks)
export async function getBestSellers(limit?: number): Promise<Product[]> {
  const products = (await getCatalogProducts()).filter((p) => p.isBestSeller);
  return limit ? products.slice(0, limit) : products;
}

export async function getNewArrivals(limit?: number): Promise<Product[]> {
  const products = await getCatalogProducts();
  return limit ? products.slice(0, limit) : products;
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  return filterByCategory(await getCatalogProducts(), category);
}

// Format price with currency (safe for NaN / invalid)
export function formatPrice(price: number, currency: string = "KSh"): string {
  const n = Number(price);
  if (!Number.isFinite(n)) return `${currency} 0`;
  return `${currency} ${n.toLocaleString()}`;
}
