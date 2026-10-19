import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";
import { filterByPreferredSize } from "@/lib/productBlueprint";
import { useSizePreference } from "@/context/SizePreferenceContext";

type Props = {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  viewAllLabel?: string;
};

export function BlueprintProductRail({
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = "See all →",
}: Props) {
  const { preferredSize } = useSizePreference();
  const list = filterByPreferredSize(products, preferredSize).slice(0, 10);

  if (!list.length) return null;

  return (
    <section className="py-10 md:py-12 border-t border-border/60">
      <div className="container">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf font-ui">
              New arrivals
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-forest">
              {title.includes("landed") ? (
                <>
                  Just <span className="text-moss italic">landed.</span>
                </>
              ) : (
                title
              )}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground font-ui">{subtitle}</p>
            )}
          </div>
          <NavPrefetchLink to={viewAllHref} className="text-sm font-semibold text-primary font-ui shrink-0">
            {viewAllLabel}
          </NavPrefetchLink>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {list.map((p, i) => (
            <div key={p.id} className="w-[46%] sm:w-[30%] lg:w-[22%] shrink-0 snap-start">
              <ProductCard product={p} priority={i < 2} enableQuickAdd />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
