import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { useNewArrivals } from "@/hooks/useProducts";
import { SEOHead } from "@/components/seo/SEOHead";
import { seoConfig } from "@/config/seo";
import { resolveStaticImage } from "@/lib/imageUtils";

export default function NewArrivalsPage() {
  const { data: products = [], isLoading } = useNewArrivals();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={seoConfig.pages.newArrivals.title}
        description={seoConfig.pages.newArrivals.description}
        keywords={seoConfig.pages.newArrivals.keywords}
        canonical="https://whitelightstore.co.ke/new-arrivals"
        ogImage="/couresel_images/running/running2.webp"
      />
      <Header />
      
      <main className="flex-1">
        <section className="relative py-16 overflow-hidden min-h-[220px]">
          <div className="absolute inset-0">
            <ImageCarousel
              images={[
                { url: resolveStaticImage("/couresel_images/running/running2.webp"), alt_text: "New running shoes Nairobi" },
                { url: resolveStaticImage("/couresel_images/gym/gym.webp"), alt_text: "New gym shoes Nairobi" },
              ]}
              className="w-full h-full"
              showControls={false}
              showDots={true}
              autoPlay={true}
              interval={5000}
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="container relative z-10 text-center">
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-3">
              New Arrivals in Nairobi
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Latest running, trail, gym and training shoes — trusted picks at Whitelight Store Nairobi CBD
            </p>
          </div>
        </section>

        {/* Products after carousel */}
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
