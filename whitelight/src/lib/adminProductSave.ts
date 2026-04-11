/**
 * Helpers for admin product create/update (slug + readable Supabase errors).
 */

/** URL-safe slug from product name (avoids invalid / duplicate-prone slugs). */
export function sanitizeProductSlug(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "product";
}

type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

/** Turn PostgREST/Postgres errors into actionable messages (e.g. missing enum value). */
export function formatSupabaseProductError(err: SupabaseLikeError | null | undefined): string {
  const msg = (err?.message ?? "").trim();
  const code = err?.code ?? "";
  const combined = `${msg} ${err?.details ?? ""} ${err?.hint ?? ""}`;

  if (
    /invalid input value for enum/i.test(combined) &&
    /product_category/i.test(combined) &&
    /tennis/i.test(combined)
  ) {
    return (
      'The database does not allow category "tennis" yet. In Supabase → SQL Editor, run ' +
      "whitelight/supabase/migrations/0004_add_tennis_category.sql (adds tennis to product_category), then try again."
    );
  }

  if (
    /invalid input value for enum/i.test(combined) &&
    /product_category/i.test(combined)
  ) {
    return (
      "Invalid product category for the database. Ensure Supabase migrations are applied so " +
      "product_category includes all categories you use (e.g. tennis)."
    );
  }

  if (code === "23505" || /duplicate key|unique constraint/i.test(combined)) {
    return "A product with this slug already exists. Change the product name slightly and save again.";
  }

  return msg || "Request failed";
}
