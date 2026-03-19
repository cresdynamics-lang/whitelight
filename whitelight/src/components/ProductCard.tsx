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
import { useLazyLoading } from "@/hooks/useLazyLoading";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const { ref, isVisible } = useLazyLoading();

  // Defensive: ensure we never throw when products load (missing/null from API)
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
  const getOptimizedCardImageUrl = (url?: string, width: number = 420, quality: number = 75) => {
    if (!url) return "/whitelight_logo.jpeg";
    if (url.includes("digitaloceanspaces.com")) {
      return `${url}?w=${width}&q=${quality}&f=webp&auto=compress&dpr=1`;
    }
    return url;
  };

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const availableSizes = variants.filter((v) => Boolean(v?.inStock ?? (v as any)?.in_stock));

  // Helper function to display size correctly for accessories
  const getDisplaySize = (size: number | string, cat: string) => {
    if (String(cat) === "accessories" && typeof size === "number") {
      const sizeMap: Record<number, string> = {
        1: 'XS', 2: '2XL', 3: '3XL', 4: '4XL', 5: '5XL', 
        6: 'L', 7: 'XL', 8: 'M', 9: 'S'
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

    addToCart(product, size, 1);
    toast.success(`${name} added to cart`);
  };

  // Skip rendering if product has no id (should not happen if list is filtered)
  if (!id) return null;

  return (
    <div ref={ref} className={cn("group block product-card", className)}>
      <Link to={`/product/${slug}`}>
        {/* Image container with green border */}
        <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-primary bg-white mb-2">
          {isVisible ? (
            <img
              src={getOptimizedCardImageUrl(images[0]?.url)}
              alt={
                product.alt_text_main ||
                images[0]?.alt ||
                `${brand} ${name} ${category} — available in Kenya`
              }
              className="h-full w-full transition-transform duration-500 group-hover:scale-105 object-cover"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={(e) => {
                e.currentTarget.src = "/whitelight_logo.jpeg";
              }}
            />
          ) : (
            <div className="h-full w-full bg-gray-200 animate-pulse" />
          )}
          
          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {product?.isNew && (
              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">
                NEW
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 leading-none">
                -{discountPercent}%
              </Badge>
            )}
          </div>
          
          {/* Offer Badge - Top Right */}
          {product?.isOnOffer && (
            <div className="absolute top-1.5 right-1.5">
              <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 leading-none">
                OFFER
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Product info */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {brand}
        </p>
        <Link to={`/product/${slug}`}>
          <h3 className="font-medium text-[11px] sm:text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
            {name}
          </h3>
        </Link>
        
        {/* Price */}
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

        {/* Sizes */}
        <div className="flex gap-1 overflow-x-auto whitespace-nowrap pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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

        {/* Add to Cart button */}
        <Button
          size="sm"
          className="w-full mt-1 h-7 text-[10px] px-2"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
