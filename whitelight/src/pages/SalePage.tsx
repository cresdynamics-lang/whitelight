import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CatalogErrorFallback } from "@/components/CatalogErrorFallback";
import { useSaleProducts } from "@/hooks/useProducts";
import { SEOHead } from "@/components/seo/SEOHead";
import { filterByPreferredSize, stockLeftCount } from "@/lib/productBlueprint";
import { EU_SIZES, useSizePreference } from "@/context/SizePreferenceContext";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export default function SalePage() {
  const { data: products = [], isLoading, isError, refetch } = useSaleProducts();
  const { preferredSize, setPreferredSize } = useSizePreference();
  const [phone, setPhone] = useState("");

  const list = useMemo(
    () => filterByPreferredSize(products, preferredSize),
    [products, preferredSize]
  );

  const end = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const add = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + add);
    d.setHours(23, 59, 59, 0);
    return d;
  }, []);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, end.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      <SEOHead
        title="Sale | The Whitelight Nairobi"
        description="Real reductions on authentic running, trail and court shoes. Honest stock counts. Whitelight Store, Luthuli Avenue."
        canonical="https://whitelightstore.co.ke/sale"
      />
      <Header />
      <main className="flex-1">
        <section className="border-b border-sale/20 bg-card">
          <div className="container py-10">
            <p className="text-xs font-bold uppercase tracking-wider text-sale font-ui">
              The sale · ends {end.toLocaleDateString("en-KE")}
            </p>
            <h1 className="font-heading text-3xl md:text-5xl font-semibold text-forest mt-1">
              Real reductions, real pairs.
            </h1>
            <div className="mt-4 flex gap-2">
              {[
                ["DAYS", days],
                ["HRS", hrs],
                ["MIN", mins],
              ].map(([l, v]) => (
                <div key={l as string} className="rounded-md bg-sale px-3 py-2 text-white text-center font-ui">
                  <div className="text-xl font-bold leading-none">{String(v).padStart(2, "0")}</div>
                  <div className="text-[9px] tracking-wider">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {EU_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPreferredSize(preferredSize === s ? null : s)}
                  className={cn(
                    "h-9 w-11 rounded-md border text-sm font-semibold font-ui",
                    preferredSize === s
                      ? "border-sale bg-sale text-white"
                      : "border-border bg-background"
                  )}
                >
                  {s}
                </button>
              ))}
              <span className="text-sm font-semibold text-muted-foreground font-ui self-center ml-1">
                {list.length} pairs on sale
                {preferredSize ? ` in size ${preferredSize}` : ""}
              </span>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm font-ui">
              {[
                ["Prices are real", "Was and now shown. No inflated “was” prices."],
                ["Stock is real", "Bars and counts come from actual stock."],
                ["Ends when it says", "The timer follows the date. It never resets."],
                ["Same promises", "Swap policy and delivery unchanged on sale."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-lg border border-border p-3">
                  <p className="font-semibold text-forest">{t}</p>
                  <p className="text-muted-foreground text-xs mt-1">{d}</p>
                </div>
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
        ) : isError ? (
          <CatalogErrorFallback onRetry={() => refetch()} />
        ) : (
          <div className="container py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((p) => (
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
              </div>
            ))}
          </div>
        )}

        <section className="container pb-12">
          <div className="rounded-xl border border-border bg-sage/30 p-6 max-w-xl">
            <h2 className="font-heading text-xl font-semibold text-forest">
              Missed a size? Get the next markdown first.
            </h2>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const wa = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");
                window.open(
                  `https://wa.me/${wa}?text=${encodeURIComponent(
                    `Alert me (${phone}) for sale restocks in size ${preferredSize || "any"}`
                  )}`,
                  "_blank"
                );
              }}
            >
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp number"
                className="h-11 flex-1 rounded-md border border-border bg-card px-3 text-sm font-ui"
              />
              <button
                type="submit"
                className="h-11 rounded-md bg-whatsapp px-4 text-sm font-semibold text-white font-ui"
              >
                Alert me
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
