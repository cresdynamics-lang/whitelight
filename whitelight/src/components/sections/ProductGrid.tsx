import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  title?: string;
  products: Product[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProductGrid({
  title,
  products,
  columns = 4,
  className,
}: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="container">
        {title && (
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-12 text-center bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
            {title.toUpperCase()}
          </h2>
        )}
        
        <div className={cn("grid gap-6 md:gap-8", gridCols[columns])}>
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
