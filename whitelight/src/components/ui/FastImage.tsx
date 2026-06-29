import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  getCardImageSrcSet,
  getCardImageUrl,
  getHeroImageUrl,
  getWebpPath,
  resolveStaticImage,
} from "@/lib/imageUtils";

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  variant?: "card" | "hero";
  priority?: boolean;
  objectFit?: "cover" | "contain";
  onClick?: () => void;
}

const CARD_SIZES = "(max-width: 640px) 32vw, (max-width: 1024px) 176px, 208px";
const HERO_SIZES = "100vw";

/** Lightweight image — WebP for static assets, resized CDN URLs for products */
export function FastImage({
  src,
  alt,
  className,
  variant = "card",
  priority = false,
  objectFit = "cover",
  onClick,
}: FastImageProps) {
  const [error, setError] = useState(false);
  const isCdn = src.includes("digitaloceanspaces.com");
  const isStatic = src.startsWith("/");

  const resolved =
    variant === "hero"
      ? getHeroImageUrl(isStatic ? resolveStaticImage(src) : src)
      : getCardImageUrl(src);

  const displaySrc = error ? "/whitelight_logo.webp" : resolved;
  const webpStatic = isStatic ? getWebpPath(src) : null;
  const staticFallback = isStatic && webpStatic ? src : null;
  const srcSet = variant === "card" && isCdn ? getCardImageSrcSet(src) : undefined;
  const sizes = variant === "hero" ? HERO_SIZES : CARD_SIZES;

  const imgClass = cn(
    "h-full w-full",
    objectFit === "cover" ? "object-cover" : "object-contain",
    className
  );

  const imgProps = {
    alt,
    className: imgClass,
    loading: (priority ? "eager" : "lazy") as "eager" | "lazy",
    decoding: "async" as const,
    fetchPriority: (priority ? "high" : "auto") as "high" | "auto",
    sizes: srcSet || (isStatic ? sizes : undefined),
    srcSet,
    onError: () => setError(true),
    onClick,
  };

  if (webpStatic && !isCdn) {
    return (
      <picture className={cn("block h-full w-full", onClick && "cursor-pointer")}>
        <source type="image/webp" srcSet={displaySrc} sizes={sizes} />
        <img src={staticFallback ?? displaySrc} {...imgProps} />
      </picture>
    );
  }

  return (
    <img
      src={displaySrc}
      {...imgProps}
    />
  );
}
