import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
  getBestSellers,
  getNewArrivals,
  getProductBySlug,
  getProductsByCategory,
} from "@/lib/products";
import type { ProductFilters, ProductCategory } from "@/types/product";
import { useCatalog, useCatalogByCategory } from "@/hooks/useCatalog";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
    enabled: !!filters && Object.keys(filters).length > 0,
  });
}

export function useBestSellers(limit?: number) {
  const { data = [], ...rest } = useCatalog();
  const best = data.filter((p) => p.isBestSeller);
  return {
    ...rest,
    data: limit ? best.slice(0, limit) : best,
  };
}

export function useNewArrivals(limit?: number) {
  const { data = [], ...rest } = useCatalog();
  const items = data.filter((p) => p.isNew).length
    ? data.filter((p) => p.isNew)
    : data;
  return {
    ...rest,
    data: limit ? items.slice(0, limit) : items,
  };
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductsByCategory(category: ProductCategory) {
  return useCatalogByCategory(category);
}
