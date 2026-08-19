import { useState } from "react";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { FastImage } from "@/components/ui/FastImage";
import { Button } from "@/components/ui/button";
import { openWhatsAppOrderMessage } from "@/lib/whatsapp";
import { trackAddToCart } from "@/lib/analytics/events";

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Load image immediately (above-the-fold rows) */
  priority?: boolean;
  /** Show size picker + WhatsApp order (sale sections) */
  enableWhatsAppOrder?: boolean;
}

function getDisplaySize(size: number | string, category: string) {
  if (String(category) === "accessories" && typeof size === "number") {
    const sizeMap: Record<number, string> = {
      1: "XS",
      2: "2XL",
      3: "3XL",
      4: "4XL",
      5: "5XL",
      6: "L",
      7: "XL",
      8: "M",
      9: "S",
    };
    return sizeMap[size] || size.toString();
  }
  return size;
}

export function ProductCard({
  product,
  className,
  priority = false,
  enableWhatsAppOrder = false,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [sizeError, setSizeError] = useState(false);

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
  const showOrder = enableWhatsAppOrder && !isSoldOut;

  // Listing cards: one hero image only — all angles live on the product page after click.
  const activeImage = images[0];
  const mainAlt =
    product.alt_text_main ||
    activeImage?.alt ||
    `${brand} ${name} ${category} — available in Kenya`;

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inStockVariants.length > 0 && selectedSize == null) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    const sizeLabel =
      selectedSize != null
        ? String(getDisplaySize(selectedSize, category))
        : undefined;
    const imageUrl = activeImage?.url || images[0]?.url || "";
    const productUrl = `${window.location.origin}/product/${slug}`;

    // Sale / WhatsApp order counts as AddToCart for Meta (+ CAPI)
    trackAddToCart(product, 1, selectedSize ?? undefined);

    openWhatsAppOrderMessage({
      productName: name,
      productPrice: price,
      imageUrl,
      productUrl,
      currency: siteConfig.currency,
      quantity: 1,
      sizeLabel,
    });
  };

  if (!id) return null;

  return (
    <article className={cn("group product-card flex flex-col", className)}>
      <NavPrefetchLink to={`/product/${slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <FastImage
            src={activeImage?.url || images[0]?.url || "/whitelight_logo.webp"}
            alt={mainAlt}
            objectFit="contain"
            className="product-image h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            priority={priority}
          />
        </div>
      </NavPrefetchLink>

      <div className="mt-2 flex flex-1 flex-col space-y-1">
        <p className="text-xs font-normal text-muted-foreground">{brand}</p>

        <NavPrefetchLink to={`/product/${slug}`} className="block">
          <h3 className="text-sm font-normal leading-snug text-foreground line-clamp-2 hover:underline underline-offset-2">
            {name}
          </h3>
        </NavPrefetchLink>

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

        {showOrder && (
          <div className="mt-auto space-y-2 pt-2">
            {inStockVariants.length > 0 && (
              <div
                className={cn(
                  "rounded-md",
                  sizeError && "ring-2 ring-red-500/50 p-1 -mx-1"
                )}
              >
                <p className="mb-1 text-[10px] font-medium text-muted-foreground sm:text-xs">
                  Choose size
                </p>
                <div className="flex flex-wrap gap-1">
                  {inStockVariants.map((variant) => {
                    const displaySize = getDisplaySize(variant.size, category);
                    const selected = selectedSize === variant.size;
                    return (
                      <button
                        key={variant.id ?? `${id}-${variant.size}`}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSize(variant.size);
                          setSizeError(false);
                        }}
                        className={cn(
                          "h-7 min-w-[1.85rem] rounded border px-1.5 text-[10px] font-medium transition-colors sm:h-8 sm:min-w-[2.25rem] sm:text-xs",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white hover:border-primary"
                        )}
                      >
                        {displaySize}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              type="button"
              size="sm"
              className="h-8 w-full bg-green-600 px-2 text-[10px] font-semibold text-white hover:bg-green-700 sm:h-9 sm:text-xs"
              onClick={handleWhatsAppOrder}
            >
              Order on WhatsApp
            </Button>

            {sizeError && (
              <p className="text-[11px] font-medium text-red-600">
                Choose a size first, then order.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
