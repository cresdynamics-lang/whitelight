/** Image URL helpers — local /uploads via /api/img, Spaces CDN resize, WebP static assets. */

export function getWebpPath(path: string): string | null {
  if (!path.startsWith("/")) return null;
  const match = path.match(/\.(png|jpe?g)$/i);
  return match ? path.replace(/\.(png|jpe?g)$/i, ".webp") : null;
}

/** Prefer .webp sibling for static files in /public */
export function resolveStaticImage(path: string): string {
  return getWebpPath(path) ?? path;
}

function isLocalUpload(url: string): boolean {
  return url.startsWith("/uploads/") || url.includes("/uploads/");
}

function uploadPathOnly(url: string): string {
  if (url.startsWith("/uploads/")) return url.split("?")[0];
  try {
    const u = new URL(url, "https://whitelightstore.co.ke");
    if (u.pathname.startsWith("/uploads/")) return u.pathname;
  } catch {
    /* ignore */
  }
  return url.split("?")[0];
}

/** On-droplet resized WebP via Node sharp cache */
export function getLocalUploadImgUrl(url: string, width: number, quality = 68): string {
  const src = encodeURIComponent(uploadPathOnly(url));
  return `/api/img?src=${src}&w=${width}&q=${quality}`;
}

/** Product card thumbnail — small file size, fast decode */
export function getCardImageUrl(url?: string, width = 280, quality = 62): string {
  return getOptimizedProductUrl(url ?? "", width, quality);
}

/** Build a resized product image URL (local /api/img, DO Spaces, or static). */
export function getOptimizedProductUrl(
  url: string,
  width: number,
  quality = 70
): string {
  if (!url) return "/whitelight_logo.webp";

  if (isLocalUpload(url)) {
    return getLocalUploadImgUrl(url, width, quality);
  }

  if (url.includes("digitaloceanspaces.com")) {
    return `${url}?w=${width}&q=${quality}&f=webp&auto=compress&dpr=1`;
  }

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

/** Responsive srcSet for product detail main image */
export function getDetailImageSrcSet(url: string): string | undefined {
  if (isLocalUpload(url)) {
    return [
      `${getLocalUploadImgUrl(url, 480, 68)} 480w`,
      `${getLocalUploadImgUrl(url, 720, 72)} 720w`,
      `${getLocalUploadImgUrl(url, 960, 75)} 960w`,
    ].join(", ");
  }
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

/** Responsive srcSet for product photos (card grid) */
export function getCardImageSrcSet(url: string): string | undefined {
  if (isLocalUpload(url)) {
    return [
      `${getLocalUploadImgUrl(url, 200, 58)} 200w`,
      `${getLocalUploadImgUrl(url, 280, 62)} 280w`,
      `${getLocalUploadImgUrl(url, 400, 65)} 400w`,
    ].join(", ");
  }
  if (!url.includes("digitaloceanspaces.com")) return undefined;
  return [
    `${url}?w=200&q=58&f=webp&auto=compress&dpr=1 200w`,
    `${url}?w=280&q=62&f=webp&auto=compress&dpr=1 280w`,
    `${url}?w=400&q=65&f=webp&auto=compress&dpr=1 400w`,
  ].join(", ");
}

/** Hero / carousel — medium width, capped for LCP */
export function getHeroImageUrl(url: string, width = 960, quality = 68): string {
  if (isLocalUpload(url)) {
    return getLocalUploadImgUrl(url, width, quality);
  }
  if (url.includes("digitaloceanspaces.com")) {
    return `${url}?w=${width}&q=${quality}&f=webp&auto=compress&dpr=1`;
  }
  return resolveStaticImage(url);
}
