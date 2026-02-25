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
  console.log("🔐 Using service role key to read admins (bypasses RLS).");
} else {
  console.log("ℹ️ Using anon key to read admins (RLS must allow select).");
}

console.log("🔍 Testing Supabase admins table for default admin user...");

const supabase = createClient(url, key);

try {
  const { data, error } = await supabase
    .from("admins")
    .select("id, email, username, role, created_at")
    .eq("email", "admin@whitelightstore.co.ke")
    .maybeSingle();

  if (error) {
    console.error("❌ Supabase admins query error:", error.message);
    process.exit(1);
  }

  if (!data) {
    console.error("⚠️ No admin found with email admin@whitelightstore.co.ke.");
    console.error("   Make sure you ran the migration that seeds the admin user.");
    process.exit(1);
  }

  console.log("✅ Found admin user in Supabase:");
  console.log({
    id: data.id,
    email: data.email,
    username: data.username,
    role: data.role,
    created_at: data.created_at,
  });

  console.log("👉 This confirms the admin record exists in the database.");
  console.log("   Frontend login will work once the backend API is wired to this table.");

  process.exit(0);
} catch (e) {
  console.error("❌ Unexpected error while testing admins table:", e);
  process.exit(1);
}

