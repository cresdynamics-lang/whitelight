import { useMemo, useState } from "react";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import { FastImage } from "@/components/ui/FastImage";
import {
  enrichProduct,
  PURPOSE_LABELS,
  stockLeftCount,
} from "@/lib/productBlueprint";
import { useSizePreference } from "@/context/SizePreferenceContext";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  enableWhatsAppOrder?: boolean;
  /** Kept for call-site compat — card always shows View Details */
  enableQuickAdd?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  const enriched = useMemo(() => enrichProduct(product), [product]);
  const { preferredSize } = useSizePreference();
  const [hoverSole, setHoverSole] = useState(false);

  const id = enriched?.id ?? "";
  const slug = enriched?.slug ?? "";
  const name = String(enriched?.name ?? "Product");
  const brand = String(enriched?.brand ?? "");
  const price = Number(enriched?.price) || 0;
  const originalPrice =
    enriched?.originalPrice != null ? Number(enriched.originalPrice) : undefined;
  const hasDiscount = originalPrice != null && originalPrice > price;
  const images = Array.isArray(enriched?.images) ? enriched.images : [];
  const variants = Array.isArray(enriched?.variants) ? enriched.variants : [];
  const left = stockLeftCount(enriched);
  const sideImg = images.find((i) => i.angleRole === "side") || images[0];
  const soleImg = images.find((i) => i.angleRole === "sole") || images[1] || images[0];
  const activeImage = hoverSole && soleImg ? soleImg : sideImg;
  const purpose = enriched.purpose || "daily";

  const mainAlt =
    enriched.alt_text_main ||
    activeImage?.alt ||
    `${brand} ${name} ${enriched.category} shoes Nairobi`;

  if (!id) return null;

  return (
    <article
      className={cn("group product-card flex flex-col relative", className)}
      onMouseEnter={() => setHoverSole(true)}
      onMouseLeave={() => setHoverSole(false)}
    >
      <NavPrefetchLink to={`/shoes/${slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-paper rounded-lg">
          <FastImage
            src={activeImage?.url || "/whitelight_logo.webp"}
            alt={mainAlt}
            objectFit="contain"
            className="product-image h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            priority={priority}
          />
          {enriched.isNew && (
            <span className="absolute left-2 top-2 rounded bg-leaf px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white font-ui">
              New
            </span>
          )}
          {enriched.isBestSeller && (
            <span className="absolute left-2 top-2 rounded bg-forest px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white font-ui">
              Bestseller
            </span>
          )}
          {hasDiscount && (
            <span className="absolute right-2 top-2 rounded bg-sale px-2 py-0.5 text-[10px] font-bold text-white font-ui">
              -{Math.round(((originalPrice! - price) / originalPrice!) * 100)}%
            </span>
          )}
          {left > 0 && left <= 3 && (
            <span className="absolute bottom-2 left-2 rounded bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-sale font-ui">
              {left} left
            </span>
          )}
        </div>
      </NavPrefetchLink>

      <div className="mt-2 flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-ui uppercase tracking-wider text-moss">
            {PURPOSE_LABELS[purpose]}
          </p>
          <p className="text-xs font-ui text-muted-foreground">{brand}</p>
        </div>

        <NavPrefetchLink to={`/shoes/${slug}`} className="block">
          <h3 className="font-heading text-base font-semibold leading-snug text-forest line-clamp-2">
            {name}
          </h3>
        </NavPrefetchLink>

        <div className="flex items-baseline gap-2 font-ui">
          <span className="font-semibold text-forest">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice!)}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap gap-1">
          {variants.slice(0, 8).map((v) => {
            const preferred = preferredSize != null && String(v.size) === String(preferredSize);
            return (
              <span
                key={v.id || String(v.size)}
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-[11px] font-ui",
                  !v.inStock && "line-through text-muted-foreground/50",
                  preferred && v.inStock && "bg-primary text-primary-foreground",
                  !preferred && v.inStock && "bg-sage text-forest"
                )}
              >
                {v.size}
              </span>
            );
          })}
        </div>

        <div className="mt-2">
          <NavPrefetchLink
            to={`/shoes/${slug}`}
            className="flex w-full h-9 items-center justify-center rounded-full border border-border text-xs font-semibold font-ui hover:border-primary hover:bg-primary hover:text-white transition-colors"
          >
            View Details
          </NavPrefetchLink>
        </div>
      </div>
    </article>
  );
}
