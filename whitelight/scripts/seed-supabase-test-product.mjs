import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "❌ Missing VITE_SUPABASE_URL and/or Supabase key (SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY)."
  );
  process.exit(1);
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log("🔐 Using service role key for seeding (bypasses RLS).");
} else {
  console.log("ℹ️ Using anon key for seeding (RLS must allow inserts).");
}

console.log("🧪 Seeding test product into Supabase...");

const supabase = createClient(url, key);

try {
  // Insert a single test product
  const { data: productData, error: productError } = await supabase
    .from("products")
    .insert([
      {
        slug: "test-running-shoe-1",
        name: "Test Running Shoe 1",
        brand: "Whitelight Test",
        category: "running",
        price: 7999,
        original_price: 9999,
        description: "Test product seeded from seed-supabase-test-product.mjs",
        tags: ["test", "running", "demo"],
        is_new: true,
        is_best_seller: true,
        is_on_offer: true,
      },
    ])
    .select("id")
    .single();

  if (productError) {
    console.error("❌ Failed to insert test product:", productError.message);
    process.exit(1);
  }

  const productId = productData.id;
  console.log("✅ Inserted test product with id:", productId);

  // Insert one image
  const { error: imageError } = await supabase.from("product_images").insert([
    {
      product_id: productId,
      url: "https://via.placeholder.com/800x800.png?text=Whitelight+Test+Shoe",
      alt_text: "Test Running Shoe 1",
    },
  ]);

  if (imageError) {
    console.error("⚠️ Test product created, but failed to insert image:", imageError.message);
  } else {
    console.log("✅ Inserted test product image.");
  }

  // Insert a few size variants
  const { error: variantError } = await supabase.from("product_variants").insert([
    { product_id: productId, size: "40", in_stock: true, stock_quantity: 5 },
    { product_id: productId, size: "41", in_stock: true, stock_quantity: 3 },
    { product_id: productId, size: "42", in_stock: false, stock_quantity: 0 },
  ]);

  if (variantError) {
    console.error("⚠️ Test product created, but failed to insert variants:", variantError.message);
  } else {
    console.log("✅ Inserted test product variants.");
  }

  console.log("🎉 Supabase test product seed completed.");
  process.exit(0);
} catch (e) {
  console.error("❌ Unexpected error while seeding test product:", e);
  process.exit(1);
}

