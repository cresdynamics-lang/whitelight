import { Link } from "react-router-dom";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

interface HomeSaleSectionProps {
  products: Product[];
  className?: string;
}

export function HomeSaleSection({ products, className }: HomeSaleSectionProps) {
  const display = products.filter((p) => p?.id).slice(0, 4);

  if (display.length === 0) return null;

  return (
    <section className={cn("py-10 md:py-14", className)}>
      <div className="container">
        <div className="mb-4 md:mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-2xl md:text-3xl font-black bg-gradient-to-r from-red-700 via-red-600 to-red-700 bg-clip-text text-transparent">
            SALE
          </h2>
          <Link
            to="/sale"
            className="text-sm md:text-base font-medium text-primary underline underline-offset-4 hover:text-primary/80 whitespace-nowrap"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-4">
          {display.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}
