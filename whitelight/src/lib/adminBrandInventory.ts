import type { Product } from "@/types/product";
import {
  SHOP_BRANDS,
  resolveBrandGroupKey,
  resolveBrandGroupLabel,
  productMatchesBrand,
} from "@/config/brands";

export interface BrandInventoryGroup {
  key: string;
  label: string;
  total: number;
  onSale: number;
  recentlyUpdated: Product[];
}

const RECENT_PER_BRAND = 4;

function sortByUpdated(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aTime = a.updatedAt || a.createdAt || "";
    const bTime = b.updatedAt || b.createdAt || "";
    return bTime.localeCompare(aTime);
  });
}

/** Group all products by brand for admin dashboard & product list filters */
export function buildBrandInventory(products: Product[]): BrandInventoryGroup[] {
  const bucket = new Map<string, Product[]>();

  for (const brand of SHOP_BRANDS) {
    bucket.set(brand.slug, []);
  }
  bucket.set("other", []);

  for (const product of products) {
    const key = resolveBrandGroupKey(product.brand);
    const list = bucket.get(key) ?? bucket.get("other")!;
    list.push(product);
    if (key !== "other" && !bucket.has(key)) {
      bucket.set(key, [product]);
    }
  }

  const groups: BrandInventoryGroup[] = SHOP_BRANDS.map((brand) => {
    const items = bucket.get(brand.slug) ?? [];
    const sorted = sortByUpdated(items);
    return {
      key: brand.slug,
      label: brand.name,
      total: items.length,
      onSale: items.filter((p) => p.isOnOffer).length,
      recentlyUpdated: sorted.slice(0, RECENT_PER_BRAND),
    };
  });

  const otherItems = products.filter(
    (p) => !SHOP_BRANDS.some((b) => productMatchesBrand(p.brand, b))
  );
  if (otherItems.length > 0) {
    const sorted = sortByUpdated(otherItems);
    groups.push({
      key: "other",
      label: "Other brands",
      total: otherItems.length,
      onSale: otherItems.filter((p) => p.isOnOffer).length,
      recentlyUpdated: sorted.slice(0, RECENT_PER_BRAND),
    });
  }

  return groups.filter((g) => g.total > 0).sort((a, b) => b.total - a.total);
}

export function filterProductsByBrandKey(
  products: Product[],
  brandKey: string
): Product[] {
  if (!brandKey || brandKey === "all") return products;
  if (brandKey === "other") {
    return products.filter(
      (p) => !SHOP_BRANDS.some((b) => productMatchesBrand(p.brand, b))
    );
  }
  const brand = SHOP_BRANDS.find((b) => b.slug === brandKey);
  if (!brand) return products;
  return products.filter((p) => productMatchesBrand(p.brand, brand));
}

export function formatAdminDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export { resolveBrandGroupLabel };
