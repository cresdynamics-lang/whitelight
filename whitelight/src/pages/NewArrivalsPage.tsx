import { useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useNewArrivals } from "@/hooks/useProducts";
import { SEOHead } from "@/components/seo/SEOHead";
import { filterByPreferredSize } from "@/lib/productBlueprint";
import { EU_SIZES, useSizePreference } from "@/context/SizePreferenceContext";
import { cn } from "@/lib/utils";

function weekKey(dateStr: string) {
  const d = new Date(dateStr || Date.now());
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays <= 7) return "This week";
  if (diffDays <= 14) return "Last week";
  return "Earlier this month";
}

export default function NewArrivalsPage() {
  const { data: products = [], isLoading } = useNewArrivals();
  const { preferredSize, setPreferredSize, lastVisitAt } = useSizePreference();

  const grouped = useMemo(() => {
    const filtered = filterByPreferredSize(products, preferredSize);
    const map = new Map<string, typeof filtered>();
    for (const p of filtered) {
      const key = weekKey(p.createdAt || p.updatedAt || "");
      const list = map.get(key) || [];
      list.push(p);
      map.set(key, list);
    }
    return [
      "This week",
      "Last week",
      "Earlier this month",
    ].map((label) => ({ label, items: map.get(label) || [] }));
  }, [products, preferredSize]);

  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      <SEOHead
        title="New Arrivals | The Whitelight Nairobi"
        description="Just landed running, trail, gym and court shoes — newest first, sizes shown. Whitelight Store, Luthuli Avenue."
        canonical="https://whitelightstore.co.ke/new"
      />
      <Header />
      <main className="flex-1">
        <section className="border-b border-border bg-sage/40">
          <div className="container py-10">
            <p className="text-xs font-bold uppercase tracking-wider text-leaf font-ui">New arrivals</p>
            <h1 className="font-heading text-3xl md:text-5xl font-semibold text-forest mt-1">
              Just landed, newest first.
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {EU_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPreferredSize(preferredSize === s ? null : s)}
                  className={cn(
                    "h-9 w-11 rounded-md border text-sm font-semibold font-ui",
                    preferredSize === s
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-card"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="container py-12 animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-secondary rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="container py-10 space-y-10">
            {grouped.map(
              (g) =>
                g.items.length > 0 && (
                  <div key={g.label}>
                    <h2 className="font-heading text-xl font-semibold text-forest mb-4">
                      {g.label}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {g.items.map((p) => {
                        const isNewSinceVisit =
                          lastVisitAt &&
                          p.createdAt &&
                          new Date(p.createdAt) > new Date(lastVisitAt);
                        return (
                          <div key={p.id} className="relative">
                            {isNewSinceVisit && (
                              <span className="absolute left-2 top-2 z-10 h-2 w-2 rounded-full bg-leaf" />
                            )}
                            <ProductCard product={p} enableQuickAdd />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
            )}
            {!grouped.some((g) => g.items.length) && (
              <p className="text-muted-foreground font-ui">No new pairs in this size right now.</p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
