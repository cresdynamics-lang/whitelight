// Product data service - now uses Supabase directly so the app
// can be hosted as a single frontend on Vercel.
import type { Product, ProductFilters, ProductsResponse, ProductCategory } from "@/types/product";
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
    createdAt: p.createdAt ?? p.created_at ?? "",
  };
}

// Only include products that have at least an id (so display never crashes on missing key/data)
function safeProductList(raw: any[]): any[] {
  return raw.map(normalizeProduct).filter((p) => p != null && p.id);
}

// Local data helper (kept for potential future use in local/dev-only tools)
const getLocalProducts = (filters?: ProductFilters): ProductsResponse => {
  let products = productsData.products || [];
  
  if (filters) {
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
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

    if (filters?.category) {
      query = query.eq("category", filters.category);
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

// Get best sellers
export async function getBestSellers(limit?: number): Promise<Product[]> {
  const { products } = await getProducts({ isBestSeller: true });
  return limit ? products.slice(0, limit) : products;
}

// Get new arrivals
export async function getNewArrivals(limit?: number): Promise<Product[]> {
  const { products } = await getProducts({ isNew: true });
  return limit ? products.slice(0, limit) : products;
}

// Get products by category
export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const { products } = await getProducts({ category });
  return products;
}

// Format price with currency (safe for NaN / invalid)
export function formatPrice(price: number, currency: string = "KSh"): string {
  const n = Number(price);
  if (!Number.isFinite(n)) return `${currency} 0`;
  return `${currency} ${n.toLocaleString()}`;
}
