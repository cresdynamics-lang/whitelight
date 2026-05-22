import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchCatalog } from "@/hooks/useCatalog";

/** Warm catalog cache as soon as the app mounts */
export function CatalogPrefetch() {
  const queryClient = useQueryClient();
  useEffect(() => {
    void prefetchCatalog(queryClient);
  }, [queryClient]);
  return null;
}
