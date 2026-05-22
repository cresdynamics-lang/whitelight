import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCatalogProducts, partitionCatalog } from "@/lib/products";
import type { Product, ProductCategory } from "@/types/product";

const CATALOG_KEY = ["catalog"] as const;

export function useCatalog() {
  return useQuery({
    queryKey: CATALOG_KEY,
    queryFn: getCatalogProducts,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCatalogPartitions() {
  const query = useCatalog();
  const partitions = query.data ? partitionCatalog(query.data) : null;

  return {
    ...query,
    partitions,
    products: query.data ?? [],
  };
}

export function useCatalogByCategory(category: ProductCategory) {
  const { data = [], ...rest } = useCatalog();
  const products = data.filter(
    (p) =>
      p.category === category ||
      (Array.isArray(p.categories) && p.categories.includes(category))
  );
  return { data: products, ...rest };
}

export function prefetchCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.prefetchQuery({
    queryKey: CATALOG_KEY,
    queryFn: getCatalogProducts,
    staleTime: 10 * 60 * 1000,
  });
}

export type CatalogPartitions = ReturnType<typeof partitionCatalog>;
