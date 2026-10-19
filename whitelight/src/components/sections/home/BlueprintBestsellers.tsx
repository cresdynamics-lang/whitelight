import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";
import { filterByPreferredSize } from "@/lib/productBlueprint";
import { useSizePreference } from "@/context/SizePreferenceContext";

type Props = { products: Product[] };

export function BlueprintBestsellers({ products }: Props) {
  const { preferredSize } = useSizePreference();
  const list = filterByPreferredSize(products, preferredSize).slice(0, 4);

  if (!list.length) return null;

  return (
    <section className="py-10 md:py-12 border-t border-border/60">
      <div className="container">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf font-ui">
              Bestsellers
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-forest">
              Most bought <span className="text-moss italic">this month.</span>
            </h2>
          </div>
          <NavPrefetchLink
            to="/products"
            className="text-sm font-semibold text-primary font-ui shrink-0"
          >
            See all bestsellers →
          </NavPrefetchLink>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {list.map((p, i) => (
            <div key={p.id} className="relative">
              <span className="absolute -left-1 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-forest text-sm font-bold text-white font-ui shadow">
                {i + 1}
              </span>
              <ProductCard product={p} priority={i < 2} enableQuickAdd />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
