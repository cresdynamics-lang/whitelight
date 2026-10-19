import { Link } from "react-router-dom";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";

interface HomeProductRowProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function HomeProductRow({
  title,
  products,
  viewAllHref,
  viewAllLabel = "Shop all",
}: HomeProductRowProps) {
  const display = products.filter((p) => p?.id);

  if (display.length === 0) return null;

  return (
    <section className="wh-section wh-shell">
      <div className="wh-section__head">
        <h2>{title}</h2>
        {viewAllHref && <Link to={viewAllHref}>{viewAllLabel} →</Link>}
      </div>
      <div className="wh-product-grid">
        {display.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
    </section>
  );
}
