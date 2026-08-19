import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { useCatalog } from "@/hooks/useCatalog";
import { SEOHead } from "@/components/seo/SEOHead";

/** Full catalogue listing (footer “All Collections” /products). */
export default function AllProductsPage() {
  const { data: products = [], isLoading, isError, refetch } = useCatalog();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="All Products — Whitelight Store Nairobi"
        description="Browse all running, trail, gym, training, basketball and tennis shoes at Whitelight Store Nairobi CBD."
        canonical="https://whitelightstore.co.ke/products"
      />
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/60 bg-secondary/30">
          <div className="container py-8 md:py-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
              All Products
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Every style in stock — tap a product to view all photo angles, sizes, and buy options.
            </p>
          </div>
        </section>

        {isError ? (
          <div className="container py-12 text-center">
            <p className="text-muted-foreground mb-4">Couldn’t load products.</p>
            <button
              type="button"
              className="underline"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="container py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary rounded-lg mb-3" />
                  <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
                  <div className="h-5 bg-secondary rounded w-2/3" />
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
