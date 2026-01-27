import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { useNewArrivals } from "@/hooks/useProducts";

export default function NewArrivalsPage() {
  const { data: products = [], isLoading } = useNewArrivals();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Header */}
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
              New Arrivals
            </h1>
            <p className="text-muted-foreground text-lg">
              The latest additions to our collection
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
