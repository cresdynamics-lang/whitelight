// Product data service — static catalog.json + Node API on DigitalOcean.
import type { Product, ProductFilters, ProductsResponse, ProductCategory } from "@/types/product";
import { getBrandBySlug } from "@/config/brands";
import { apiFetch } from "@/lib/apiClient";
import productsData from "@/data/products.json";

function normalizeProduct(p: Record<string, unknown> | null | undefined): Product | null {
  if (!p || typeof p !== "object") return null;
  const images = Array.isArray(p.images) ? p.images : [];
  const variants = Array.isArray(p.variants)
    ? p.variants.map((v: Record<string, unknown>) => ({
        ...v,
        id: String(v?.id ?? `${p.id}-${v?.size ?? "s"}`),
        size: v?.size ?? 0,
        inStock: Boolean(v?.inStock ?? v?.in_stock),
      }))
    : [];
  return {
    ...(p as Product),
    id: String(p.id ?? ""),
    slug: String(p.slug ?? p.id ?? ""),
    name: String(p.name ?? "Product"),
    brand: String(p.brand ?? ""),
    category: (p.category as ProductCategory) ?? "running",
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    description: String(p.description ?? ""),
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
    images: images as Product["images"],
    variants: variants as Product["variants"],
    isNew: Boolean(p.isNew ?? p.is_new),
    isBestSeller: Boolean(p.isBestSeller ?? p.is_best_seller),
    isOnOffer: Boolean(p.isOnOffer ?? p.is_on_offer),
    seo_title: (p.seo_title as string) ?? null,
    seo_description: (p.seo_description as string) ?? null,
    product_h1: (p.product_h1 as string) ?? null,
    product_description: (p.product_description as string) ?? null,
    url_slug: (p.url_slug as string) ?? null,
    alt_text_main: (p.alt_text_main as string) ?? null,
    seo_keywords: Array.isArray(p.seo_keywords) ? (p.seo_keywords as string[]) : null,
    gender: (p.gender as string) ?? null,
    structured_data: p.structured_data ?? null,
    createdAt: String(p.createdAt ?? p.created_at ?? ""),
    updatedAt: String(p.updatedAt ?? p.updated_at ?? ""),
  };
}

/** Most recently updated first (falls back to created date). */
export function sortByLatestUpdated(products: Product[]): Product[] {
  const ts = (p: Product) => {
    const t = Date.parse(p.updatedAt || p.createdAt || "");
    return Number.isNaN(t) ? 0 : t;
  };
  return [...products].sort((a, b) => ts(b) - ts(a));
}

function safeProductList(raw: unknown[]): Product[] {
  return raw.map((p) => normalizeProduct(p as Record<string, unknown>)).filter((p) => p != null && p.id) as Product[];
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

/** Live catalog from Node API */
export async function fetchLiveCatalog(): Promise<Product[]> {
  const data = await apiFetch<{ products: Product[] }>("/api/catalog");
  return safeProductList(data.products || []);
}

/** Single fetch for homepage, search, and category pages */
export async function getCatalogProducts(): Promise<Product[]> {
  const staticCatalog = await fetchStaticCatalog();
  if (staticCatalog?.length) return staticCatalog;

  try {
    return await fetchLiveCatalog();
  } catch (error) {
    console.error("Error fetching catalog from API:", error);
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

export function filterSaleProducts(products: Product[]): Product[] {
  return products.filter((p) => Boolean(p.isOnOffer));
}

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
  // New arrivals = most recently updated products on the site
  const newArrivals = sortByLatestUpdated(products).slice(0, 24);

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

function applyFilters(products: Product[], filters?: ProductFilters): Product[] {
  let result = products;
  if (!filters) return result;

  if (filters.category) {
    result = filterByCategory(result, filters.category);
  }
  if (filters.brand) {
    const b = filters.brand.toLowerCase();
    result = result.filter((p) => p.brand.toLowerCase().includes(b));
  }
  if (filters.isNew !== undefined) {
    result = result.filter((p) => p.isNew === filters.isNew);
  }
  if (filters.isBestSeller !== undefined) {
    result = result.filter((p) => p.isBestSeller === filters.isBestSeller);
  }
  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
    );
  }
  return result;
}

export async function getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
  try {
    const products = applyFilters(await getCatalogProducts(), filters);
    return {
      products,
      total: products.length,
      page: 1,
      limit: products.length,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    if (import.meta.env.DEV) {
      return {
        products: applyFilters(safeProductList(productsData.products || []), filters),
        total: 0,
        page: 1,
        limit: 0,
      };
    }
    return { products: [], total: 0, page: 1, limit: 0 };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const needle = String(slug || "")
    .trim()
    .replace(/^\/+/, "")
    .toLowerCase();

  const matchIn = (list: Product[]): Product | null => {
    const found = list.find((p) => {
      const s = String(p.slug || "").toLowerCase();
      const id = String(p.id || "").toLowerCase();
      const urlSlug = String(p.url_slug || "")
        .replace(/^\/+/, "")
        .replace(/^product\//, "")
        .toLowerCase();
      return s === needle || id === needle || urlSlug === needle;
    });
    return found ? normalizeProduct(found) : null;
  };

  try {
    const data = await apiFetch<{ product: Product }>(
      `/api/products/${encodeURIComponent(slug.trim())}`
    );
    const product = normalizeProduct(data.product as Record<string, unknown>);
    if (product?.id && product.slug) return product;
  } catch (error) {
    console.error("Error fetching product from API:", error);
  }

  try {
    const live = await fetchLiveCatalog();
    const hit = matchIn(live);
    if (hit) return hit;
  } catch (error) {
    console.error("Error fetching catalog for product fallback:", error);
  }

  try {
    const catalog = await getCatalogProducts();
    return matchIn(catalog);
  } catch (error) {
    console.error("Error reading catalog for product:", error);
    return null;
  }
}

export async function getBestSellers(limit?: number): Promise<Product[]> {
  const products = (await getCatalogProducts()).filter((p) => p.isBestSeller);
  return limit ? products.slice(0, limit) : products;
}

export async function getNewArrivals(limit?: number): Promise<Product[]> {
  const products = sortByLatestUpdated(await getCatalogProducts());
  return limit ? products.slice(0, limit) : products;
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  return filterByCategory(await getCatalogProducts(), category);
}

export function formatPrice(price: number, currency: string = "KSh"): string {
  const n = Number(price);
  if (!Number.isFinite(n)) return `${currency} 0`;
  return `${currency} ${n.toLocaleString()}`;
}
