import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { FastImage } from "@/components/ui/FastImage";

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Load image immediately (above-the-fold rows) */
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const id = product?.id ?? "";
  const slug = product?.slug ?? product?.id ?? "";
  const name = String(product?.name ?? "Product");
  const brand = String(product?.brand ?? "");
  const category = String(product?.category ?? "running");
  const price = Number(product?.price) || 0;
  const originalPrice = product?.originalPrice != null ? Number(product.originalPrice) : undefined;
  const hasDiscount = originalPrice != null && originalPrice > price;

  const images = Array.isArray(product?.images) ? product.images : [];
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const inStockVariants = variants.filter((v) => Boolean(v?.inStock));
  const isSoldOut = variants.length > 0 && inStockVariants.length === 0;

  const swatchImages = images.slice(0, 4);
  const moreAngles = Math.max(0, images.length - swatchImages.length);
  const activeImage = images[activeImageIndex] ?? images[0];
  const mainAlt =
    product.alt_text_main ||
    activeImage?.alt ||
    `${brand} ${name} ${category} — available in Kenya`;

  if (!id) return null;

  return (
    <article className={cn("group product-card flex flex-col", className)}>
      <Link to={`/product/${slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <FastImage
            src={activeImage?.url || images[0]?.url || "/whitelight_logo.webp"}
            alt={mainAlt}
            objectFit="contain"
            className="product-image h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            priority={priority}
          />
        </div>
      </Link>

      {swatchImages.length > 1 && (
        <div className="mt-2 flex items-center gap-1.5">
          {swatchImages.map((image, index) => (
            <button
              key={image.id || `${id}-angle-${index}`}
              type="button"
              aria-label={`View angle ${index + 1}`}
              onMouseEnter={() => setActiveImageIndex(index)}
              onFocus={() => setActiveImageIndex(index)}
              onClick={(e) => {
                e.preventDefault();
                setActiveImageIndex(index);
              }}
              className={cn(
                "h-9 w-9 shrink-0 overflow-hidden rounded-sm border bg-white p-0 transition-colors",
                activeImageIndex === index
                  ? "border-foreground"
                  : "border-neutral-200 hover:border-neutral-400"
              )}
            >
              <FastImage
                src={image.url}
                alt={image.alt || `${name} angle ${index + 1}`}
                variant="thumb"
                className="h-full w-full"
              />
            </button>
          ))}
          {moreAngles > 0 && (
            <Link
              to={`/product/${slug}`}
              className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              +{moreAngles} more
            </Link>
          )}
        </div>
      )}

      <div className="mt-2 space-y-1">
        <p className="text-xs font-normal text-muted-foreground">{brand}</p>

        <Link to={`/product/${slug}`} className="block">
          <h3 className="text-sm font-normal leading-snug text-foreground line-clamp-2 hover:underline underline-offset-2">
            {name}
          </h3>
        </Link>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-0.5">
          <span className="text-sm text-foreground">{formatPrice(price, siteConfig.currency)}</span>
          {hasDiscount && originalPrice != null && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice, siteConfig.currency)}
            </span>
          )}
          {isSoldOut ? (
            <span className="text-xs text-muted-foreground">Sold out</span>
          ) : product.isOnOffer || hasDiscount ? (
            <span className="text-xs text-muted-foreground">Sale</span>
          ) : null}
          {product.isNew && !isSoldOut && (
            <span className="text-xs text-muted-foreground">New</span>
          )}
        </div>
      </div>
    </article>
  );
}
