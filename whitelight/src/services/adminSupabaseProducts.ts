import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/types/product";

type NewProduct = Omit<Product, "id" | "createdAt">;

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase client not initialised. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
}

function normalizeProductRow(row: any): Product {
  const images = Array.isArray(row.product_images)
    ? row.product_images.map((img: any) => ({
        id: String(img.id),
        url: img.url,
        alt: img.alt_text ?? row.name ?? "Product",
      }))
    : [];

  const variants = Array.isArray(row.product_variants)
    ? row.product_variants.map((v: any) => ({
        id: String(v.id),
        size: v.size,
        inStock: Boolean(v.in_stock ?? v.inStock ?? true),
        stockQuantity: typeof v.stock_quantity === "number" ? v.stock_quantity : undefined,
      }))
    : [];

  return {
    id: String(row.id),
    slug: String(row.slug ?? row.id),
    name: String(row.name ?? "Product"),
    brand: String(row.brand ?? ""),
    category: row.category ?? "running",
    categories: Array.isArray(row.categories) && row.categories.length > 0 ? row.categories : [row.category ?? "running"],
    price: Number(row.price) || 0,
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    description: String(row.description ?? ""),
    tags: Array.isArray(row.tags) ? row.tags : [],
    images,
    variants,
    isNew: Boolean(row.is_new ?? row.isNew),
    isBestSeller: Boolean(row.is_best_seller ?? row.isBestSeller),
    isOnOffer: Boolean(row.is_on_offer ?? row.isOnOffer),
    createdAt: row.created_at ?? "",
  };
}

async function getAll(): Promise<Product[]> {
  ensureSupabase();

  const { data, error } = await supabase!
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

  if (error) {
    console.error("Error fetching admin products from Supabase:", error);
    throw new Error(error.message || "Failed to fetch products");
  }

  return (data || []).map(normalizeProductRow);
}

async function getById(id: string): Promise<Product | null> {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("products")
    .select(
      `
      *,
      product_images (*),
      product_variants (*)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching admin product by id from Supabase:", error);
    throw new Error(error.message || "Failed to fetch product");
  }

  if (!data) return null;
  return normalizeProductRow(data);
}

async function create(product: NewProduct): Promise<Product> {
  ensureSupabase();

  const base = {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    categories: product.categories && product.categories.length > 0 ? product.categories : [product.category],
    price: product.price,
    original_price: product.originalPrice ?? null,
    description: product.description,
    tags: product.tags,
    is_new: product.isNew ?? false,
    is_best_seller: product.isBestSeller ?? false,
    is_on_offer: product.isOnOffer ?? false,
  };

  const { data: created, error } = await supabase!
    .from("products")
    .insert(base)
    .select("id")
    .single();

  if (error || !created) {
    console.error("Error creating product in Supabase:", error);
    throw new Error(error?.message || "Failed to create product");
  }

  const productId = created.id as number;

  // Insert images
  const images = Array.isArray(product.images) ? product.images : [];
  if (images.length > 0) {
    const imageRows = images.map((img) => ({
      product_id: productId,
      url: img.url,
      alt_text: img.alt ?? product.name,
    }));

    const { error: imageError } = await supabase!
      .from("product_images")
      .insert(imageRows);

    if (imageError) {
      console.error("Error inserting product images in Supabase:", imageError);
      throw new Error(imageError.message || "Failed to save product images");
    }
  }

  // Insert variants
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length > 0) {
    const variantRows = variants.map((v) => ({
      product_id: productId,
      size: String(v.size),
      in_stock: v.inStock ?? true,
      stock_quantity: v.stockQuantity ?? 0,
    }));

    const { error: variantError } = await supabase!
      .from("product_variants")
      .insert(variantRows);

    if (variantError) {
      console.error("Error inserting product variants in Supabase:", variantError);
      throw new Error(variantError.message || "Failed to save product variants");
    }
  }

  const result = await getById(String(productId));
  if (!result) {
    throw new Error("Product created but could not be reloaded from Supabase.");
  }
  return result;
}

async function update(
  id: string,
  updates: NewProduct
): Promise<Product | null> {
  ensureSupabase();

  const updateData: Record<string, any> = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.slug !== undefined) updateData.slug = updates.slug;
  if (updates.brand !== undefined) updateData.brand = updates.brand;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.categories !== undefined)
    updateData.categories =
      updates.categories.length > 0 ? updates.categories : [updates.category];
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.originalPrice !== undefined)
    updateData.original_price = updates.originalPrice;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.isNew !== undefined) updateData.is_new = updates.isNew;
  if (updates.isBestSeller !== undefined)
    updateData.is_best_seller = updates.isBestSeller;
  if (updates.isOnOffer !== undefined)
    updateData.is_on_offer = updates.isOnOffer;

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase!
      .from("products")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating product in Supabase:", error);
      throw new Error(error.message || "Failed to update product");
    }
  }

  const productId = Number(id);

  // Replace images if provided
  if (updates.images) {
    const { error: delError } = await supabase!
      .from("product_images")
      .delete()
      .eq("product_id", productId);
    if (delError) {
      console.error("Error deleting old product images in Supabase:", delError);
      throw new Error(delError.message || "Failed to update product images");
    }

    if (updates.images.length > 0) {
      const imageRows = updates.images.map((img) => ({
        product_id: productId,
        url: img.url,
        alt_text: img.alt ?? updates.name,
      }));

      const { error: insError } = await supabase!
        .from("product_images")
        .insert(imageRows);
      if (insError) {
        console.error("Error inserting updated product images in Supabase:", insError);
        throw new Error(insError.message || "Failed to save product images");
      }
    }
  }

  // Replace variants if provided
  if (updates.variants) {
    const { error: delVarError } = await supabase!
      .from("product_variants")
      .delete()
      .eq("product_id", productId);
    if (delVarError) {
      console.error("Error deleting old product variants in Supabase:", delVarError);
      throw new Error(delVarError.message || "Failed to update product variants");
    }

    if (updates.variants.length > 0) {
      const variantRows = updates.variants.map((v) => ({
        product_id: productId,
        size: String(v.size),
        in_stock: v.inStock ?? true,
        stock_quantity: v.stockQuantity ?? 0,
      }));

      const { error: insVarError } = await supabase!
        .from("product_variants")
        .insert(variantRows);
      if (insVarError) {
        console.error("Error inserting updated product variants in Supabase:", insVarError);
        throw new Error(insVarError.message || "Failed to save product variants");
      }
    }
  }

  return await getById(String(id));
}

async function remove(id: string): Promise<boolean> {
  ensureSupabase();

  const { error } = await supabase!
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting product in Supabase:", error);
    throw new Error(error.message || "Failed to delete product");
  }

  return true;
}

export const adminProductsService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
};

