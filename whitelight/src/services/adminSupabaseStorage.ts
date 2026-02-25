import { supabase } from "@/lib/supabaseClient";

const BUCKET = "product-images";

export async function uploadProductImage(file: File): Promise<string> {
  if (!supabase) {
    throw new Error(
      "Supabase client not initialised. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
  const filePath = `admin-uploads/${fileName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    upsert: false,
  });

  if (error) {
    console.error("Error uploading image to Supabase Storage:", error);
    throw new Error(error.message || "Failed to upload image to Supabase Storage");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Could not get public URL for uploaded image");
  }

  return data.publicUrl;
}

