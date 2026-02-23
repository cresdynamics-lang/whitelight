// Product data service - Production uses ONLY backend API data
import type { Product, ProductFilters, ProductsResponse, ProductCategory } from "@/types/product";
import { apiService } from "@/services/apiService";
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

// Transform backend response to frontend format (handles undefined/malformed response)
const transformBackendResponse = (backendData: any): ProductsResponse => {
  const data = backendData ?? {};
  const raw = Array.isArray(data.products) ? data.products : [];
  const products = safeProductList(raw);
  return {
    products,
    total: data.pagination?.total ?? products.length ?? 0,
    page: data.pagination?.page ?? 1,
    limit: data.pagination?.limit ?? products.length ?? 0,
  };
};

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

// Get all products with optional filters
export async function getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
  try {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.isNew !== undefined) params.isNew = filters.isNew.toString();
      if (filters.isBestSeller !== undefined) params.isBestSeller = filters.isBestSeller.toString();
      if (filters.minPrice !== undefined) params.minPrice = filters.minPrice.toString();
      if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice.toString();
      if (filters.search) params.search = filters.search;
    }
    
    const response = await apiService.getProducts(params);
    
    if (response.success) {
      return transformBackendResponse(response.data ?? {});
    }
    
    throw new Error(response.message || "Failed to fetch products");
  } catch (error) {
    // In production we DO NOT fall back to placeholder/local data.
    // If the API fails, surface an empty list so the UI shows "No products found"
    // instead of demo products that are not in the real database.
    console.error("Error fetching products from API:", error);
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
    const response = await apiService.getProduct(slug);
    
    if (response.success && response.data) {
      return normalizeProduct(response.data);
    }
    
    return null;
  } catch (error) {
    // Do NOT fall back to local demo products in production; if the API fails,
    // return null so the UI can show an appropriate error/404 state.
    console.error("Error fetching product from API:", error);
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
