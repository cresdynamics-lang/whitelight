import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

console.log("🔍 Testing Supabase connectivity...");

const supabase = createClient(url, anonKey);

try {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand, category")
    .limit(1);

  if (error) {
    console.error("❌ Supabase query error:", error.message);
    process.exit(1);
  }

  console.log("✅ Connected to Supabase successfully.");
  if (data && data.length > 0) {
    console.log("Sample product row:", data[0]);
  } else {
    console.log("No products found yet, but connection is working.");
  }

  process.exit(0);
} catch (e) {
  console.error("❌ Supabase connectivity test failed:", e);
  process.exit(1);
}

