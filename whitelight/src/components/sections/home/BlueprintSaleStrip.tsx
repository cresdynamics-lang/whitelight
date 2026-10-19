import { useEffect, useMemo, useState } from "react";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";
import { filterByPreferredSize, stockLeftCount } from "@/lib/productBlueprint";
import { useSizePreference } from "@/context/SizePreferenceContext";

type Props = { products: Product[] };

function useCountdown(end: Date | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!end) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [end]);
  if (!end) return null;
  const diff = Math.max(0, end.getTime() - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, done: diff <= 0 };
}

export function BlueprintSaleStrip({ products }: Props) {
  const { preferredSize } = useSizePreference();
  const sale = useMemo(() => {
    const list = products.filter((p) => p.isOnOffer || (p.originalPrice && p.originalPrice > p.price));
    return filterByPreferredSize(list, preferredSize).slice(0, 4);
  }, [products, preferredSize]);

  const endDate = useMemo(() => {
    const withEnd = sale.find((p) => p.saleEndsAt);
    if (withEnd?.saleEndsAt) return new Date(withEnd.saleEndsAt);
    // Honest weekly window ending Sunday 23:59 Nairobi — not a fake reset timer
    const d = new Date();
    const day = d.getDay();
    const add = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + add);
    d.setHours(23, 59, 59, 0);
    return d;
  }, [sale]);

  const cd = useCountdown(endDate);

  if (!sale.length) return null;

  return (
    <section className="border-y border-sale/20 bg-card py-12">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sale font-ui">
              Sale · this week only
            </p>
            <h2 className="font-heading text-3xl font-semibold text-forest">
              Real reductions, <span className="italic text-moss">in your size.</span>
            </h2>
          </div>
          {cd && !cd.done && (
            <div className="text-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-sale font-ui">
                Ends in
              </p>
              <div className="flex gap-2 font-ui">
                {[
                  ["HRS", cd.h],
                  ["MIN", cd.m],
                  ["SEC", cd.s],
                ].map(([label, val]) => (
                  <div
                    key={label as string}
                    className="rounded-md bg-forest px-2.5 py-1.5 text-white"
                  >
                    <div className="text-lg font-bold leading-none">
                      {String(val).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] tracking-wider opacity-90">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sale.map((p) => (
            <div key={p.id}>
              <ProductCard product={p} enableQuickAdd />
              <div className="mt-2 h-1.5 rounded-full bg-sage overflow-hidden">
                <div
                  className="h-full bg-sale"
                  style={{
                    width: `${Math.min(100, Math.max(8, stockLeftCount(p) * 12))}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground font-ui">
                {stockLeftCount(p)} pairs left
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <NavPrefetchLink
            to="/sale"
            className="inline-flex h-12 items-center rounded-full bg-sale px-8 text-sm font-semibold text-white font-ui shadow-sm"
          >
            Shop the sale{preferredSize ? ` in size ${preferredSize}` : ""} →
          </NavPrefetchLink>
        </div>
      </div>
    </section>
  );
}
