import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct, useBestSellers } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SEOHead } from "@/components/seo/SEOHead";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: relatedProducts = [] } = useBestSellers(4);
  
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<(number | string)[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { addItem } = useCart();

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
      basketball: "Basketball Shoes",
      accessories: "Accessories",
    };
    return categoryMap[category] || category;
  };

  // Generate SEO-friendly title and description
  const seoTitle = `${product.name} - ${product.brand} ${getCategoryDisplayName(product.category)} | Buy in Nairobi Kenya`;
  const seoDescription = `Buy ${product.name} by ${product.brand} in Nairobi. ${product.description.substring(0, 120)}... Available sizes: ${product.variants.filter(v => v.inStock).map(v => v.size).join(', ')}. Same day delivery in Nairobi CBD.`;
  const seoKeywords = `${product.name}, ${product.brand} ${product.category} shoes, ${product.category} shoes Kenya, ${product.category} shoes Nairobi, buy ${product.name} Kenya, ${product.brand} shoes Nairobi`;
  const productImage = product.images[0]?.url || "/whitelight_logo.jpeg";

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleSizeToggle = (size: number | string) => {
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
      toast.error("Please select at least one size");
      return;
    }
    
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

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={`https://whitelightstore.co.ke/product/${product.slug}`}
        ogImage={productImage}
        ogType="product"
        product={product}
        category={product.category}
      />
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images with multiple angles */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] lg:aspect-[4/3] overflow-hidden rounded-lg bg-secondary group">
                <OptimizedImage
                  src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
                  alt={product.images[selectedImageIndex]?.alt || product.name}
                  className="h-full w-full cursor-pointer hover:scale-105 transition-transform duration-300"
                  loading="eager"
                  fetchPriority="high"
                  preload={selectedImageIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onClick={() => {
                    // Open lightbox when image is clicked
                    setIsLightboxOpen(true);
                  }}
                />
                
                {/* Navigation arrows - only show if multiple images */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => 
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Image thumbnails - show below on mobile, hidden on desktop */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto lg:hidden">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setIsLightboxOpen(true);
                      }}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <OptimizedImage
                        src={image.url}
                        alt={image.alt || `${product.name} angle ${index + 1}`}
                        className="w-full h-full"
                        loading="lazy"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Desktop thumbnail strip - show on desktop */}
              {product.images.length > 1 && (
                <div className="hidden lg:flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer",
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <OptimizedImage
                        src={image.url}
                        alt={image.alt || `${product.name} angle ${index + 1}`}
                        className="w-full h-full"
                        loading="lazy"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:py-0">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  {product.brand}
                </p>
                {product.isNew && (
                  <Badge className="bg-accent text-accent-foreground text-xs">
                    NEW
                  </Badge>
                )}
              </div>

              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl font-semibold">
                  {formatPrice(product.price, siteConfig.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.originalPrice!, siteConfig.currency)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-6">
                {product.description}
              </p>

              {/* Size selectors */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">
                  {product.category === 'accessories' ? 'Select Size(s) - Available clothing sizes' : 'Select Size(s) - Available shoe sizes'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const displaySize = getDisplaySize(variant.size, product.category);
                    const isSelected = selectedSizes.includes(variant.size) || selectedSize === variant.size;
                    return (
                      <button
                        key={variant.id}
                        disabled={!variant.inStock}
                        onClick={() => handleSizeToggle(variant.size)}
                        className={cn(
                          "h-12 min-w-[3rem] px-4 rounded-md border text-sm font-medium transition-all duration-200",
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {selectedSize ? 
                      [getDisplaySize(selectedSize, product.category), ...selectedSizes.filter(s => s !== selectedSize).map(s => getDisplaySize(s, product.category))].join(', ') : 
                      selectedSizes.map(s => getDisplaySize(s, product.category)).join(', ')}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Image thumbnails - show above add to cart on desktop */}
              {product.images.length > 1 && (
                <div className="hidden lg:flex gap-2 overflow-x-auto mb-6">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <OptimizedImage
                        src={image.url}
                        alt={image.alt || `${product.name} angle ${index + 1}`}
                        className="w-full h-full"
                        loading="lazy"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Add to cart */}
              <Button
                size="lg"
                className="w-full h-14 text-base"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <ProductGrid
          title="You May Also Like"
          products={relatedProducts.filter(p => p.id !== product.id).slice(0, 4)}
          columns={4}
          className="bg-secondary/30"
        />
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
