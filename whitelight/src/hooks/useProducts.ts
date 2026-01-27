import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
  getBestSellers,
  getNewArrivals,
  getProductBySlug,
  getProductsByCategory,
} from "@/lib/products";
import type { ProductFilters, ProductCategory } from "@/types/product";

// Hook for fetching all products with filters
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });
}

// Hook for fetching best sellers
export function useBestSellers(limit?: number) {
  return useQuery({
    queryKey: ["products", "best-sellers", limit],
    queryFn: () => getBestSellers(limit),
  });
}

// Hook for fetching new arrivals
export function useNewArrivals(limit?: number) {
  return useQuery({
    queryKey: ["products", "new-arrivals", limit],
    queryFn: () => getNewArrivals(limit),
  });
}

// Hook for fetching single product by slug
export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}

// Hook for fetching products by category
export function useProductsByCategory(category: ProductCategory) {
  return useQuery({
    queryKey: ["products", "category", category],
    queryFn: () => getProductsByCategory(category),
    enabled: !!category,
  });
}
