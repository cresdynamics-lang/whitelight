import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";

type Props = { products: Product[]; shoe?: Product | null };

export function BlueprintAccessories({ products, shoe }: Props) {
  const accessories = products.filter((p) => p.category === "accessories").slice(0, 4);
  if (!accessories.length) return null;

  return (
    <section className="container py-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-semibold text-forest">
            Training & gym accessories
          </h2>
          <p className="text-sm text-muted-foreground font-ui">
            Everything for the session, in one order.
          </p>
        </div>
        <NavPrefetchLink to="/accessories" className="text-sm font-semibold text-primary font-ui">
          All accessories →
        </NavPrefetchLink>
      </div>
      {shoe && (
        <p className="mb-4 inline-flex rounded-full border border-leaf/30 bg-sage/50 px-3 py-1 text-xs font-semibold text-leaf font-ui">
          + Pair with {shoe.brand} {shoe.name} — add from the bag
        </p>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {accessories.map((p) => (
          <ProductCard key={p.id} product={p} enableQuickAdd />
        ))}
      </div>
    </section>
  );
}
