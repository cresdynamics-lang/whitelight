import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/hooks/useProducts";
import { useCatalog } from "@/hooks/useCatalog";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SEOHead } from "@/components/seo/SEOHead";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { FastImage } from "@/components/ui/FastImage";
import { getOriginalProductUrl } from "@/lib/imageUtils";
import { trackViewContent } from "@/lib/analytics/events";
import { openWhatsAppOrderMessage } from "@/lib/whatsapp";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: catalog = [] } = useCatalog();

  const { youMayAlsoLike, mostOrdered } = useMemo(() => {
    if (!product?.id) {
      return { youMayAlsoLike: [] as typeof catalog, mostOrdered: [] as typeof catalog };
    }

    const exclude = new Set<string>([product.id]);

    const sameCategory = catalog.filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          (Array.isArray(p.categories) && p.categories.includes(product.category)))
    );

    const alsoLike: typeof catalog = [];
    for (const p of sameCategory) {
      if (alsoLike.length >= 4) break;
      alsoLike.push(p);
      exclude.add(p.id);
    }
    for (const p of catalog) {
      if (alsoLike.length >= 4) break;
      if (!exclude.has(p.id)) {
        alsoLike.push(p);
        exclude.add(p.id);
      }
    }

    const ordered: typeof catalog = [];
    for (const p of catalog) {
      if (ordered.length >= 4) break;
      if (!exclude.has(p.id) && (p.isBestSeller || p.isOnOffer)) {
        ordered.push(p);
        exclude.add(p.id);
      }
    }
    for (const p of catalog) {
      if (ordered.length >= 4) break;
      if (!exclude.has(p.id)) {
        ordered.push(p);
        exclude.add(p.id);
      }
    }

    return { youMayAlsoLike: alsoLike, mostOrdered: ordered };
  }, [catalog, product]);
  
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<(number | string)[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const { addItem } = useCart();
  const trackedViewRef = useRef<string | null>(null);

  useEffect(() => {
    if (product?.id && trackedViewRef.current !== product.id) {
      trackedViewRef.current = product.id;
      trackViewContent(product);
    }
  }, [product]);

  // Prefetch every angle so switching views is instant after first load
  useEffect(() => {
    if (!product?.images?.length) return;
    const links: HTMLLinkElement[] = [];
    product.images.forEach((image) => {
      if (!image?.url) return;
      const href = getOriginalProductUrl(image.url);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
      // Warm browser cache
      const img = new Image();
      img.src = href;
    });
    return () => {
      links.forEach((link) => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
    };
  }, [product?.id, product?.images]);

  // Helper function to display size correctly for accessories
  const getDisplaySize = (size: number | string, category: string) => {
    if (category === 'accessories' && typeof size === 'number') {
      // Map numeric sizes to clothing sizes for accessories based on actual data
      const sizeMap: Record<number, string> = {
        1: 'XS', 2: '2XL', 3: '3XL', 4: '4XL', 5: '5XL', 
        6: 'L', 7: 'XL', 8: 'M', 9: 'S'
      };
      return sizeMap[size] || size.toString();
    }
    return size;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead title="Product Not Found - Whitelight Store Kenya" noindex />
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-heading font-semibold mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper function for category display name
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      running: "Running Shoes",
      trail: "Trail Shoes",
      gym: "Gym Shoes",
      training: "Training Shoes",
      basketball: "Basketball Shoes",
      tennis: "Tennis Shoes",
      accessories: "Accessories",
    };
    return categoryMap[category] || category;
  };

  // Prefer Supabase SEO fields when present, with safe fallbacks
  const computedCategoryName = getCategoryDisplayName(product.category);
  const fallbackSeoTitle = `${product.name} - ${product.brand} ${computedCategoryName} | Buy in Nairobi Kenya`;
  const fallbackSeoDescription = `Buy ${product.name} by ${product.brand} in Nairobi. ${product.description.substring(0, 120)}... Available sizes: ${product.variants.filter(v => v.inStock).map(v => v.size).join(', ')}. Same day delivery in Nairobi CBD.`;
  const fallbackSeoKeywords = `${product.name}, ${product.brand} ${product.category} shoes, ${product.category} shoes Kenya, ${product.category} shoes Nairobi, buy ${product.name} Kenya, ${product.brand} shoes Nairobi`;

  const seoTitle = product.seo_title || fallbackSeoTitle;
  const seoDescription = product.seo_description || fallbackSeoDescription;
  const seoKeywords = product.seo_keywords?.join(", ") || fallbackSeoKeywords;

  const mainImageUrl = product.images[0]?.url || "/whitelight_logo.webp";
  const mainAltText = product.alt_text_main || product.images[0]?.alt || `${product.brand} ${product.name} ${computedCategoryName.toLowerCase()} — available in Kenya`;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleSizeToggle = (size: number | string) => {
    setSizeError(false);
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
    
    // Keep first selected size as primary
    if (!selectedSize && !selectedSizes.includes(size)) {
      setSelectedSize(size);
    } else if (selectedSize === size && selectedSizes.filter(s => s !== size).length > 0) {
      setSelectedSize(selectedSizes.filter(s => s !== size)[0]);
    } else if (selectedSize === size) {
      setSelectedSize(null);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize && selectedSizes.length === 0) {
      setSizeError(true);
      return;
    }
    
    setSizeError(false);
    const allSizes = selectedSize ? [selectedSize, ...selectedSizes.filter(s => s !== selectedSize)] : selectedSizes;
    const sizesParam = allSizes.map((s, i) => `size${i + 1}=${s}`).join('&');
    const referenceLink = `${window.location.origin}/product/${slug}?img=${selectedImageIndex}&${sizesParam}`;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[selectedImageIndex]?.url || product.images[0]?.url,
      size: selectedSize || selectedSizes[0],
      selectedSizes: allSizes,
      referenceLink,
      quantity,
      category: product.category
    });
    
    const sizeText = allSizes.length > 1 ? 
      `Sizes ${allSizes.map(s => getDisplaySize(s, product.category)).join(', ')}` : 
      `Size ${getDisplaySize(allSizes[0], product.category)}`;
    toast.success("Added to cart!", {
      description: `${product.name} - ${sizeText}`,
    });
  };

  const getSelectedSizeLabels = () => {
    const allSizes = selectedSize
      ? [selectedSize, ...selectedSizes.filter((s) => s !== selectedSize)]
      : selectedSizes;
    return allSizes.map((s) => getDisplaySize(s, product.category)).join(", ");
  };

  const hasSizeSelected = selectedSize != null || selectedSizes.length > 0;

  const handleOrderWhatsApp = () => {
    if (!hasSizeSelected) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    const allSizes = selectedSize
      ? [selectedSize, ...selectedSizes.filter((s) => s !== selectedSize)]
      : selectedSizes;
    const sizesParam = allSizes.map((s, i) => `size${i + 1}=${s}`).join("&");
    const productUrl = `${window.location.origin}/product/${slug}?img=${selectedImageIndex}&${sizesParam}`;

    openWhatsAppOrderMessage({
      productName: product.name,
      productPrice: product.price,
      imageUrl: product.images[selectedImageIndex]?.url || product.images[0]?.url,
      productUrl,
      currency: siteConfig.currency,
      quantity,
      sizeLabel: getSelectedSizeLabels(),
    });
  };

  const renderPurchaseControls = (compact: boolean) => (
    <>
      <div
        className={cn(
          compact ? "mb-2" : "mb-4",
          sizeError && "rounded-lg ring-2 ring-red-500/40 p-2 -mx-2"
        )}
      >
        <p className={cn("font-medium mb-1.5", compact ? "text-xs" : "text-sm mb-2")}>
          Select Size(s)
        </p>
        <div className={cn("flex flex-wrap", compact ? "gap-1" : "gap-2")}>
          {product.variants.map((variant) => {
            const displaySize = getDisplaySize(variant.size, product.category);
            const isSelected =
              selectedSizes.includes(variant.size) || selectedSize === variant.size;
            return (
              <button
                key={variant.id}
                disabled={!variant.inStock}
                onClick={() => handleSizeToggle(variant.size)}
                className={cn(
                  "rounded-md border font-medium transition-all duration-200",
                  compact
                    ? "h-8 min-w-[2.25rem] px-2 text-xs"
                    : "h-12 min-w-[3rem] px-4 text-sm",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                    : variant.inStock
                      ? "border-border hover:border-primary hover:scale-105"
                      : "border-border text-muted-foreground opacity-50 cursor-not-allowed"
                )}
              >
                {displaySize}
              </button>
            );
          })}
        </div>
        {(selectedSizes.length > 0 || selectedSize) && (
          <p className={cn("text-muted-foreground mt-1.5", compact ? "text-[10px]" : "text-xs mt-2")}>
            Selected:{" "}
            {selectedSize
              ? [
                  getDisplaySize(selectedSize, product.category),
                  ...selectedSizes
                    .filter((s) => s !== selectedSize)
                    .map((s) => getDisplaySize(s, product.category)),
                ].join(", ")
              : selectedSizes.map((s) => getDisplaySize(s, product.category)).join(", ")}
          </p>
        )}
      </div>

      <div className={compact ? "mb-2" : "mb-6"}>
        <p className={cn("font-medium", compact ? "text-xs mb-1.5" : "text-sm mb-3")}>
          Quantity
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className={cn(
              "rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors",
              compact ? "h-8 w-8" : "h-10 w-10"
            )}
          >
            <Minus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
          <span className={cn("text-center font-medium", compact ? "w-8 text-sm" : "w-12")}>
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className={cn(
              "rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors",
              compact ? "h-8 w-8" : "h-10 w-10"
            )}
          >
            <Plus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <Button
          size={compact ? "sm" : "lg"}
          className={cn(
            "min-w-0 flex-1 px-2",
            compact ? "h-9 text-xs" : "h-14 sm:px-4 sm:text-base"
          )}
          onClick={handleAddToCart}
        >
          <ShoppingBag className={cn("mr-1 shrink-0", compact ? "h-3.5 w-3.5" : "mr-2 h-5 w-5")} />
          <span className="truncate">Add to Cart</span>
        </Button>
        <Button
          size={compact ? "sm" : "lg"}
          type="button"
          className={cn(
            "min-w-0 flex-1 bg-green-600 px-2 text-white hover:bg-green-700",
            compact ? "h-9 text-xs" : "h-14 sm:px-4 sm:text-base"
          )}
          onClick={handleOrderWhatsApp}
        >
          <span className="truncate">{compact ? "WhatsApp" : "Order on WhatsApp"}</span>
        </Button>
      </div>
      {sizeError && (
        <p className={cn("mt-1.5 font-medium text-red-600", compact ? "text-[11px]" : "text-sm mt-2")}>
          Please choose a size before adding to cart or ordering.
        </p>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={product.url_slug ? `https://whitelightstore.co.ke${product.url_slug}` : `https://whitelightstore.co.ke/product/${product.slug}`}
        ogImage={mainImageUrl}
        ogType="product"
        product={product}
        category={product.category}
      />
      <Header />
      
      <main className="flex-1 overflow-x-hidden">
        <div className="container py-8">
          {/* Breadcrumb */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-4 lg:gap-12 items-start">
            {/* Mobile: image stack left, details right. Desktop: full gallery column */}
            <div className="flex gap-3 min-w-0 lg:block lg:sticky lg:top-24 lg:self-start">
              <div className="w-[46%] max-w-[10.5rem] shrink-0 space-y-2 sm:w-[44%] sm:max-w-[12rem] lg:w-full lg:max-w-none">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary group lg:aspect-[4/3]">
                  <FastImage
                    key={`${selectedImageIndex}-${product.images[selectedImageIndex]?.url ?? product.images[0]?.url}`}
                    src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
                    alt={
                      selectedImageIndex === 0
                        ? mainAltText
                        : product.images[selectedImageIndex]?.alt ||
                          `${product.name} angle ${selectedImageIndex + 1}`
                    }
                    variant="detail"
                    priority
                    objectFit="contain"
                    className="h-full w-full cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  />

                  {product.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === 0 ? product.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white lg:left-2 lg:h-10 lg:w-10 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === product.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white lg:right-2 lg:h-10 lg:w-10 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
                      </button>
                    </>
                  )}
                </div>

                {product.images.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 lg:gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          "h-10 w-10 shrink-0 overflow-hidden rounded border transition-all sm:h-11 sm:w-11 lg:h-20 lg:w-20 lg:rounded-md lg:border-2",
                          selectedImageIndex === index
                            ? "border-primary ring-1 ring-primary/20 lg:ring-2"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <FastImage
                          src={image.url}
                          alt={
                            index === 0
                              ? mainAltText
                              : image.alt || `${product.name} angle ${index + 1}`
                          }
                          variant="thumb"
                          priority={index < 4}
                          className="h-full w-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile: title, description, sizes, quantity, actions beside images */}
              <div className="min-w-0 flex-1 space-y-2 lg:hidden">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                      {product.brand}
                    </p>
                    {product.isNew && (
                      <Badge className="bg-accent text-accent-foreground text-[10px]">NEW</Badge>
                    )}
                  </div>
                  <h1 className="font-heading text-sm font-bold leading-snug sm:text-base">
                    {product.name}
                  </h1>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-sm font-semibold sm:text-base">
                      {formatPrice(product.price, siteConfig.currency)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[11px] text-muted-foreground line-through sm:text-xs">
                        {formatPrice(product.originalPrice!, siteConfig.currency)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-4 text-[11px] leading-relaxed text-muted-foreground sm:line-clamp-5 sm:text-xs">
                    {product.description}
                  </p>
                </div>

                {renderPurchaseControls(true)}
              </div>
            </div>

            {/* Desktop details column */}
            <div className="hidden min-w-0 lg:block lg:py-0">
              <div className="mb-2 flex items-center gap-2">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">
                  {product.brand}
                </p>
                {product.isNew && (
                  <Badge className="bg-accent text-accent-foreground text-xs">NEW</Badge>
                )}
              </div>
              <h1 className="font-heading mb-3 text-2xl font-bold md:text-3xl">{product.name}</h1>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xl font-semibold">
                  {formatPrice(product.price, siteConfig.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.originalPrice!, siteConfig.currency)}
                  </span>
                )}
              </div>
              <p className="mb-6 text-muted-foreground">{product.description}</p>

              {renderPurchaseControls(false)}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {youMayAlsoLike.length > 0 && (
          <ProductGrid
            title="You May Also Like"
            products={youMayAlsoLike}
            columns={4}
            className="bg-secondary/30"
          />
        )}

        {mostOrdered.length > 0 && (
          <ProductGrid
            title="What Nairobi Customers Order Most"
            products={mostOrdered}
            columns={4}
          />
        )}
      </main>

      <Footer />
      
      {/* Image Lightbox */}
      {product.images.length > 0 && (
        <ImageLightbox
          images={product.images.map(img => ({ url: img.url, alt: img.alt }))}
          initialIndex={selectedImageIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
