import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { openWhatsAppOrderMessage } from "@/lib/whatsapp";
import { FastImage } from "@/components/ui/FastImage";

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Load image immediately (above-the-fold rows) */
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);

  const id = product?.id ?? "";
  const slug = product?.slug ?? product?.id ?? "";
  const name = String(product?.name ?? "Product");
  const brand = String(product?.brand ?? "");
  const category = String(product?.category ?? "running");
  const price = Number(product?.price) || 0;
  const originalPrice = product?.originalPrice != null ? Number(product.originalPrice) : undefined;
  const hasDiscount = originalPrice != null && originalPrice > price;
  const discountPercent = hasDiscount && originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const images = Array.isArray(product?.images) ? product.images : [];
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const availableSizes = variants.filter((v) => Boolean(v?.inStock));

  const getDisplaySize = (size: number | string, cat: string) => {
    if (String(cat) === "accessories" && typeof size === "number") {
      const sizeMap: Record<number, string> = {
        1: "XS", 2: "2XL", 3: "3XL", 4: "4XL", 5: "5XL",
        6: "L", 7: "XL", 8: "M", 9: "S",
      };
      return sizeMap[size] || size.toString();
    }
    return size;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const size = selectedSize ?? availableSizes[0]?.size;
    if (size == null || size === "") {
      toast.error("No sizes available");
      return;
    }

    addToCart(product, size as number, 1);
    toast.success(`${name} added to cart`);
  };

  const handleOrderViaWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const imageUrl = images[0]?.url || "";
    const productUrl = `${window.location.origin}/product/${slug}`;
    openWhatsAppOrderMessage({
      productName: name,
      productPrice: price,
      imageUrl,
      productUrl,
      currency: siteConfig.currency,
    });
  };

  if (!id) return null;

  return (
    <div className={cn("group block product-card", className)}>
      <Link to={`/product/${slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-primary bg-white mb-2">
          <FastImage
            src={images[0]?.url || "/whitelight_logo.webp"}
            alt={
              product.alt_text_main ||
              images[0]?.alt ||
              `${brand} ${name} ${category} — available in Kenya`
            }
            className="transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />

          <div className="absolute top-0 left-0 z-10 flex flex-col items-start gap-1 p-1.5">
            {product?.isOnOffer && (
              <Badge className="rounded-sm border-0 bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase leading-none text-white shadow-sm">
                Sale
              </Badge>
            )}
            {product?.isNew && (
              <Badge className="bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground">
                NEW
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="px-1.5 py-0.5 text-[10px] leading-none">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          <div className="absolute top-1.5 right-1.5 z-10">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-foreground shadow-sm ring-1 ring-border transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Add to cart"
              title="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>

      <div className="space-y-1.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{brand}</p>
        <Link to={`/product/${slug}`}>
          <h3 className="font-medium text-[11px] sm:text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[11px] sm:text-xs text-foreground">
            {formatPrice(price, siteConfig.currency)}
          </span>
          {hasDiscount && originalPrice != null && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPrice(originalPrice, siteConfig.currency)}
            </span>
          )}
        </div>

        <div className="flex gap-1 overflow-x-auto whitespace-nowrap pb-1">
          {availableSizes.slice(0, 5).map((variant) => {
            const displaySize = getDisplaySize(variant?.size ?? "", category);
            return (
              <button
                key={variant?.id ?? `${id}-${variant?.size ?? "s"}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSize(variant.size);
                }}
                className={cn(
                  "text-[10px] px-1.5 py-0.5 border rounded transition-colors flex-shrink-0",
                  selectedSize === variant.size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                )}
              >
                {displaySize}
              </button>
            );
          })}
          {availableSizes.length > 5 && (
            <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground flex-shrink-0">
              +{availableSizes.length - 5}
            </span>
          )}
        </div>

        <div className="mt-1">
          <Button
            size="sm"
            className="w-full h-7 text-[10px] leading-none px-1.5 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
            onClick={handleOrderViaWhatsApp}
            title="Order on WhatsApp"
          >
            Order on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
