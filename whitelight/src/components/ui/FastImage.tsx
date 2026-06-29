import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  getCardImageSrcSet,
  getCardImageUrl,
  getDetailImageSrcSet,
  getDetailImageUrl,
  getDetailThumbUrl,
  getHeroImageUrl,
  getWebpPath,
  resolveStaticImage,
} from "@/lib/imageUtils";

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  variant?: "card" | "hero" | "detail" | "thumb";
  priority?: boolean;
  objectFit?: "cover" | "contain";
  onClick?: () => void;
}

const CARD_SIZES = "(max-width: 640px) 32vw, (max-width: 1024px) 176px, 208px";
const HERO_SIZES = "100vw";
const DETAIL_SIZES = "(max-width: 1024px) 100vw, 50vw";
const THUMB_SIZES = "(max-width: 1024px) 45vw, 80px";

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

  useEffect(() => {
    setError(false);
  }, [src]);

  const resolveUrl = () => {
    if (isStatic) {
      return variant === "hero"
        ? getHeroImageUrl(resolveStaticImage(src))
        : getCardImageUrl(resolveStaticImage(src));
    }
    switch (variant) {
      case "hero":
        return getHeroImageUrl(src);
      case "detail":
        return getDetailImageUrl(src);
      case "thumb":
        return getDetailThumbUrl(src);
      default:
        return getCardImageUrl(src);
    }
  };

  const displaySrc = error ? "/whitelight_logo.webp" : resolveUrl();
  const webpStatic = isStatic ? getWebpPath(src) : null;
  const staticFallback = isStatic && webpStatic ? src : null;
  const srcSet =
    variant === "detail" && isCdn
      ? getDetailImageSrcSet(src)
      : variant === "card" && isCdn
        ? getCardImageSrcSet(src)
        : undefined;
  const sizes =
    variant === "hero"
      ? HERO_SIZES
      : variant === "detail"
        ? DETAIL_SIZES
        : variant === "thumb"
          ? THUMB_SIZES
          : CARD_SIZES;

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
    sizes: srcSet ? sizes : undefined,
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

  return <img src={displaySrc} {...imgProps} />;
}
