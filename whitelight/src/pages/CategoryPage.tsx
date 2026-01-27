import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { useProductsByCategory } from "@/hooks/useProducts";
import type { ProductCategory } from "@/types/product";
import { siteConfig } from "@/config/site";

const categoryTitles: Record<ProductCategory, string> = {
  running: "Running Shoes",
  trail: "Trail Shoes",
  gym: "Gym Shoes",
  basketball: "Basketball Shoes",
  orthopedic: "Orthopedic Shoes",
};

const categoryDescriptions: Record<ProductCategory, string> = {
  running: "Engineered for speed and comfort on every run",
  trail: "Built for rugged terrain and outdoor adventures",
  gym: "Designed for training, lifting, and high-intensity workouts",
  basketball: "Performance footwear for the court",
  orthopedic: "Medical-grade comfort and support for your feet",
};

// Category-specific images from local folders
const categoryImages: Record<ProductCategory, string[]> = {
  running: [
    "/couresel_images/running/running2.png",
    "/couresel_images/running/running3.jpg",
    "/couresel_images/running/running4.jpg",
    "/couresel_images/running/running5.jpg",
    "/couresel_images/running/running6.jpg",
  ],
  trail: [
    "/couresel_images/trail/trail1.png",
    "/couresel_images/trail/trail2.png",
    "/couresel_images/trail/trail3.png",
    "/couresel_images/trail/trail4.png",
  ],
  gym: [
    "/couresel_images/gym/gym.png",
    "/couresel_images/gym/gym1.jpg",
    "/couresel_images/gym/gym3.png",
    "/couresel_images/gym/gym4.png",
    "/couresel_images/gym/gym5.png",
    "/couresel_images/gym/gym6.png",
  ],
  basketball: [
    "/couresel_images/basketball/bk1.png",
    "/couresel_images/basketball/bk2.png",
    "/couresel_images/basketball/bk3.jpg",
    "/couresel_images/basketball/bk5.jpg",
  ],
  orthopedic: [
    "/couresel_images/orthopedic/orth1.jpg",
    "/couresel_images/orthopedic/orth2.jpg",
    "/couresel_images/orthopedic/orth3.jpg",
    "/couresel_images/orthopedic/orth4.jpg",
  ],
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const validCategory = category as ProductCategory;
  
  const { data: products = [], isLoading } = useProductsByCategory(validCategory);
  
  const title = categoryTitles[validCategory] || "Products";
  const description = categoryDescriptions[validCategory] || "";
  const backgroundImages = categoryImages[validCategory] || [];
  
  const carouselImages = backgroundImages.map((url, index) => ({
    url,
    alt_text: `${title} ${index + 1}`
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Category Header with Carousel Background */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <ImageCarousel 
              images={carouselImages}
              className="w-full h-full"
              showControls={false}
              showDots={true}
              autoPlay={true}
              interval={5000}
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
          </div>
          <div className="container relative z-10 text-center">
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
              {title.toUpperCase()}
            </h1>
            <p className="text-white/90 font-body text-xl md:text-2xl max-w-2xl mx-auto font-semibold">
              {description}
            </p>
          </div>
        </section>

        {/* Products */}
        {isLoading ? (
          <div className="container py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-secondary rounded-lg mb-3" />
                  <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
                  <div className="h-5 bg-secondary rounded w-2/3 mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/4" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ProductGrid products={products} columns={4} />
        )}
      </main>

      <Footer />
    </div>
  );
}
