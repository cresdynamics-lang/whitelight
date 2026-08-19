import { apiFetch, getAdminToken } from "@/lib/apiClient";
import type { Product } from "@/types/product";

type NewProduct = Omit<Product, "id" | "createdAt">;

function normalizeProductRow(row: Product): Product {
  const images = Array.isArray(row.images) ? row.images : [];
  const variants = Array.isArray(row.variants) ? row.variants : [];

  return {
    ...row,
    id: String(row.id),
    slug: String(row.slug ?? row.id),
    name: String(row.name ?? "Product"),
    brand: String(row.brand ?? ""),
    category: row.category ?? "running",
    categories:
      Array.isArray(row.categories) && row.categories.length > 0
        ? row.categories
        : [row.category ?? "running"],
    price: Number(row.price) || 0,
    originalPrice: row.originalPrice != null ? Number(row.originalPrice) : undefined,
    description: String(row.description ?? ""),
    tags: Array.isArray(row.tags) ? row.tags : [],
    images,
    variants,
    isNew: Boolean(row.isNew),
    isBestSeller: Boolean(row.isBestSeller),
    isOnOffer: Boolean(row.isOnOffer),
    createdAt: row.createdAt ?? "",
    updatedAt: row.updatedAt ?? "",
  };
}

async function getAll(): Promise<Product[]> {
  const data = await apiFetch<{ products: Product[] }>("/api/admin/products", {
    token: getAdminToken(),
  });
  return (data.products || []).map((p) => normalizeProductRow(p));
}

async function getById(id: string): Promise<Product | null> {
  const data = await apiFetch<{ product: Product }>(`/api/admin/products/${id}`, {
    token: getAdminToken(),
  });
  return data.product ? normalizeProductRow(data.product) : null;
}

async function create(product: NewProduct): Promise<Product> {
  const data = await apiFetch<{ product: Product }>("/api/admin/products", {
    method: "POST",
    token: getAdminToken(),
    body: JSON.stringify(product),
  });
  return normalizeProductRow(data.product);
}

async function update(id: string, updates: NewProduct): Promise<Product | null> {
  const data = await apiFetch<{ product: Product }>(`/api/admin/products/${id}`, {
    method: "PUT",
    token: getAdminToken(),
    body: JSON.stringify(updates),
  });
  return data.product ? normalizeProductRow(data.product) : null;
}

async function remove(id: string): Promise<boolean> {
  await apiFetch(`/api/admin/products/${id}`, { method: "DELETE", token: getAdminToken() });
  return true;
}

async function toggleSale(id: string, isOnOffer: boolean): Promise<boolean> {
  await apiFetch(`/api/admin/products/${id}/sale`, {
    method: "PATCH",
    token: getAdminToken(),
    body: JSON.stringify({ isOnOffer }),
  });
  return true;
}

export const adminProductsService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  toggleSale,
};
