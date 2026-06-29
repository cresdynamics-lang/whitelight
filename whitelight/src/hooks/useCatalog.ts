import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  fetchLiveCatalog,
  fetchStaticCatalog,
  filterByBrand,
  filterSaleProducts,
  getCatalogProducts,
  partitionCatalog,
} from "@/lib/products";
import type { ProductCategory } from "@/types/product";

const CATALOG_KEY = ["catalog"] as const;

/** Static JSON first, then revalidate from Supabase in the background */
function makeCatalogQueryFn(queryClient?: QueryClient) {
  return async () => {
    const staticCatalog = await fetchStaticCatalog();
    if (staticCatalog?.length) {
      if (queryClient) {
        void fetchLiveCatalog()
          .then((live) => {
            if (live.length) queryClient.setQueryData(CATALOG_KEY, live);
          })
          .catch(() => {});
      }
      return staticCatalog;
    }
    return getCatalogProducts();
  };
}

export function useCatalog() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: CATALOG_KEY,
    queryFn: makeCatalogQueryFn(queryClient),
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

export function useCatalogByBrand(brandSlug: string) {
  const { data = [], ...rest } = useCatalog();
  const products = filterByBrand(data, brandSlug);
  return { data: products, ...rest };
}

export function useCatalogSale() {
  const { data = [], ...rest } = useCatalog();
  const products = filterSaleProducts(data);
  return { data: products, ...rest };
}

export function prefetchCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.prefetchQuery({
    queryKey: CATALOG_KEY,
    queryFn: makeCatalogQueryFn(queryClient),
    staleTime: 10 * 60 * 1000,
  });
}

export type CatalogPartitions = ReturnType<typeof partitionCatalog>;
