import { useState } from "react";
import { cn } from "@/lib/utils";
import { getCardImageUrl, getHeroImageUrl, resolveStaticImage } from "@/lib/imageUtils";

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  variant?: "card" | "hero";
  priority?: boolean;
  objectFit?: "cover" | "contain";
  onClick?: () => void;
}

/** Lightweight image — no intersection gating; browser handles lazy load */
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
  const resolved =
    variant === "hero"
      ? getHeroImageUrl(resolveStaticImage(src))
      : getCardImageUrl(src);

  const displaySrc = error ? "/whitelight_logo.webp" : resolved;
  const webpStatic = src.startsWith("/") ? resolveStaticImage(src) : null;

  const img = (
    <img
      src={displaySrc}
      alt={alt}
      className={cn(
        "h-full w-full",
        objectFit === "cover" ? "object-cover" : "object-contain",
        className
      )}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setError(true)}
      onClick={onClick}
    />
  );

  if (webpStatic && variant === "hero" && !src.includes("digitaloceanspaces.com")) {
    return (
      <picture className={cn("block h-full w-full", onClick && "cursor-pointer")}>
        <source type="image/webp" srcSet={getHeroImageUrl(webpStatic)} />
        {img}
      </picture>
    );
  }

  return img;
}
