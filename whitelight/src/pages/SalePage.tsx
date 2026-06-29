import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { CatalogErrorFallback } from "@/components/CatalogErrorFallback";
import { useSaleProducts } from "@/hooks/useProducts";
import { SEOHead } from "@/components/seo/SEOHead";
import { seoConfig } from "@/config/seo";
import { resolveStaticImage } from "@/lib/imageUtils";

function ProductsSkeleton() {
  return (
    <div className="container py-12">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-3 aspect-square rounded-lg bg-secondary" />
            <div className="mb-2 h-4 w-1/3 rounded bg-secondary" />
            <div className="mb-2 h-5 w-2/3 rounded bg-secondary" />
            <div className="h-4 w-1/4 rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalePage() {
  const { data: products = [], isLoading, isError, refetch } = useSaleProducts();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={seoConfig.pages.sale.title}
        description={seoConfig.pages.sale.description}
        keywords={seoConfig.pages.sale.keywords}
        canonical="https://whitelightstore.co.ke/sale"
        ogImage="/couresel_images/running/running2.webp"
      />
      <Header />

      <main className="flex-1">
        <section className="relative min-h-[220px] overflow-hidden py-16">
          <div className="absolute inset-0">
            <ImageCarousel
              images={[
                {
                  url: resolveStaticImage("/couresel_images/running/running2.webp"),
                  alt_text: "Sale running shoes Nairobi",
                },
                {
                  url: resolveStaticImage("/couresel_images/gym/gym.webp"),
                  alt_text: "Sale gym shoes Nairobi",
                },
              ]}
              className="h-full w-full"
              showControls={false}
              showDots={true}
              autoPlay={true}
              interval={5000}
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black/55" />
          </div>
          <div className="container relative z-10 text-center">
            <span className="inline-block rounded-full bg-red-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Sale
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold text-white md:text-5xl">
              Sale — Nairobi CBD
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-white/90">
              Hand-picked offers on running, trail, gym and court shoes. Same-day delivery across
              Nairobi from Luthuli Avenue.
            </p>
          </div>
        </section>

        {isLoading ? (
          <ProductsSkeleton />
        ) : isError ? (
          <CatalogErrorFallback onRetry={() => refetch()} />
        ) : (
          <ProductGrid
            products={products}
            columns={4}
            title={
              products.length
                ? `${products.length} product${products.length === 1 ? "" : "s"} on sale`
                : "No sale items right now — check back soon"
            }
            className="py-8"
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
