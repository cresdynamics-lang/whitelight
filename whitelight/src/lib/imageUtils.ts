/** Image URL helpers — WebP for local assets, CDN resize for product photos. */

export function getWebpPath(path: string): string | null {
  if (!path.startsWith("/")) return null;
  const match = path.match(/\.(png|jpe?g)$/i);
  return match ? path.replace(/\.(png|jpe?g)$/i, ".webp") : null;
}

/** Prefer .webp sibling for static files in /public */
export function resolveStaticImage(path: string): string {
  return getWebpPath(path) ?? path;
}

/** Product card thumbnail — small file size, fast decode */
export function getCardImageUrl(url?: string, width = 280, quality = 62): string {
  return getOptimizedProductUrl(url ?? "", width, quality);
}

/** Build a resized product image URL (DO Spaces query params, or original for Supabase/static). */
export function getOptimizedProductUrl(
  url: string,
  width: number,
  quality = 70
): string {
  if (!url) return "/whitelight_logo.webp";

  if (url.includes("digitaloceanspaces.com")) {
    return `${url}?w=${width}&q=${quality}&f=webp&auto=compress&dpr=1`;
  }

  // Supabase public URLs — use original file (render API needs Image Transformations add-on)
  return url.startsWith("/") ? resolveStaticImage(url) : url;
}

/** Product detail main view — ~960px cap */
export function getDetailImageUrl(url?: string): string {
  return getOptimizedProductUrl(url ?? "", 960, 75);
}

/** Product detail thumbnail strip — sized for 2-column mobile grid */
export function getDetailThumbUrl(url?: string): string {
  return getOptimizedProductUrl(url ?? "", 240, 65);
}

/** Responsive srcSet for product detail main image (CDN only) */
export function getDetailImageSrcSet(url: string): string | undefined {
  if (!url.includes("digitaloceanspaces.com")) return undefined;

  return [
    `${url}?w=480&q=68&f=webp&auto=compress&dpr=1 480w`,
    `${url}?w=720&q=72&f=webp&auto=compress&dpr=1 720w`,
    `${url}?w=960&q=75&f=webp&auto=compress&dpr=1 960w`,
  ].join(", ");
}

/** Original public URL when resize/render is unavailable */
export function getOriginalProductUrl(url: string): string {
  return url.startsWith("/") ? resolveStaticImage(url) : url;
}

/** Responsive srcSet for CDN product photos (card grid) */
export function getCardImageSrcSet(url: string): string | undefined {
  if (!url.includes("digitaloceanspaces.com")) return undefined;
  return [
    `${url}?w=200&q=58&f=webp&auto=compress&dpr=1 200w`,
    `${url}?w=280&q=62&f=webp&auto=compress&dpr=1 280w`,
    `${url}?w=400&q=65&f=webp&auto=compress&dpr=1 400w`,
  ].join(", ");
}

/** Hero / carousel — medium width, capped for LCP */
export function getHeroImageUrl(url: string, width = 960, quality = 68): string {
  if (url.includes("digitaloceanspaces.com")) {
    return `${url}?w=${width}&q=${quality}&f=webp&auto=compress&dpr=1`;
  }
  return resolveStaticImage(url);
}
