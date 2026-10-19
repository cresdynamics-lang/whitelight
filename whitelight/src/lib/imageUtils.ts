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
export function getLocalUploadImgUrl(url: string, width: number, quality = 78): string {
  const src = encodeURIComponent(uploadPathOnly(url));
  return `/api/img?src=${src}&w=${width}&q=${quality}`;
}

/** Product card thumbnail — small file size, sharp enough for retina */
export function getCardImageUrl(url?: string, width = 360, quality = 76): string {
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

/** Product detail main view — ~1100px cap, high quality WebP */
export function getDetailImageUrl(url?: string): string {
  return getOptimizedProductUrl(url ?? "", 1100, 82);
}

/** Product detail thumbnail strip — sized for 2-column mobile grid */
export function getDetailThumbUrl(url?: string): string {
  return getOptimizedProductUrl(url ?? "", 200, 74);
}

/** Responsive srcSet for product detail main image */
export function getDetailImageSrcSet(url: string): string | undefined {
  if (isLocalUpload(url)) {
    return [
      `${getLocalUploadImgUrl(url, 480, 78)} 480w`,
      `${getLocalUploadImgUrl(url, 800, 80)} 800w`,
      `${getLocalUploadImgUrl(url, 1100, 82)} 1100w`,
    ].join(", ");
  }
  if (!url.includes("digitaloceanspaces.com")) return undefined;

  return [
    `${url}?w=480&q=78&f=webp&auto=compress&dpr=1 480w`,
    `${url}?w=800&q=80&f=webp&auto=compress&dpr=1 800w`,
    `${url}?w=1100&q=82&f=webp&auto=compress&dpr=1 1100w`,
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
      `${getLocalUploadImgUrl(url, 240, 74)} 240w`,
      `${getLocalUploadImgUrl(url, 360, 76)} 360w`,
      `${getLocalUploadImgUrl(url, 520, 78)} 520w`,
    ].join(", ");
  }
  if (!url.includes("digitaloceanspaces.com")) return undefined;
  return [
    `${url}?w=240&q=74&f=webp&auto=compress&dpr=1 240w`,
    `${url}?w=360&q=76&f=webp&auto=compress&dpr=1 360w`,
    `${url}?w=520&q=78&f=webp&auto=compress&dpr=1 520w`,
  ].join(", ");
}

/** Hero / carousel — medium width, capped for LCP */
export function getHeroImageUrl(url: string, width = 900, quality = 80): string {
  if (isLocalUpload(url)) {
    return getLocalUploadImgUrl(url, width, quality);
  }
  if (url.includes("digitaloceanspaces.com")) {
    return `${url}?w=${width}&q=${quality}&f=webp&auto=compress&dpr=1`;
  }
  return resolveStaticImage(url);
}
