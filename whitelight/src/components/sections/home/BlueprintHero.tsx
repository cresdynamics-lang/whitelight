import { useEffect, useMemo, useState } from "react";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/products";
import { enrichProduct } from "@/lib/productBlueprint";
import { getHeroImageUrl } from "@/lib/imageUtils";

type Props = { products: Product[] };

export function BlueprintHero({ products }: Props) {
  const featured = useMemo(() => {
    const preferred = /nike|asics|adidas/i;
    const pool = products.filter((p) => p.isNew || p.isBestSeller);
    const primary = pool.filter((p) => preferred.test(p.brand || ""));
    const list = (primary.length >= 3 ? primary : pool).slice(0, 4);
    return list.map(enrichProduct);
  }, [products]);
  const [idx, setIdx] = useState(0);
  const current = featured[idx] || featured[0];
  const newThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const byDate = products.filter((p) => {
      const t = Date.parse(p.createdAt || "");
      return Number.isFinite(t) && t >= weekAgo;
    }).length;
    if (byDate > 0) return byDate;
    return Math.min(products.filter((p) => p.isNew).length, 12);
  }, [products]);

  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % featured.length), 6000);
    return () => clearInterval(t);
  }, [featured.length]);

  const heroImg = current?.images?.[0];

  const sizeLabel = useMemo(() => {
    const sizes = (current?.variants || [])
      .filter((v) => v.inStock)
      .map((v) => Number(v.size))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    if (!sizes.length) return "sizes in stock";
    return `sizes ${sizes[0]}–${sizes[sizes.length - 1]} in stock`;
  }, [current]);

  return (
    <section className="relative overflow-hidden border-b border-forest/20 bg-forest text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 72% 42%, hsl(var(--leaf) / 0.4), transparent 60%)",
        }}
      />
      <div className="container relative grid gap-10 py-12 md:py-16 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold font-ui backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf animate-pulse" />
            Just landed · {newThisWeek || featured.length} new pairs this week
          </p>
          <h1 className="mt-5 font-heading text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08] tracking-tight text-white">
            Find the shoe that moves like you.
          </h1>
          <p className="mt-4 max-w-md text-base md:text-lg text-white/80 font-ui leading-relaxed">
            Running, trail, training and court shoes, photographed from every angle, with your size
            and the real price shown up front.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <NavPrefetchLink
              to="/new"
              className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-forest font-ui hover:bg-paper"
            >
              Shop new arrivals →
            </NavPrefetchLink>
            <NavPrefetchLink
              to="/size-guide"
              className="inline-flex h-11 items-center rounded-full border border-white/50 px-6 text-sm font-semibold text-white font-ui hover:bg-white/10"
            >
              Find my size
            </NavPrefetchLink>
          </div>
          <p className="mt-5 text-sm text-white/70 font-ui">
            Same-day delivery, Nairobi CBD · Luthuli Avenue
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-x-4 bottom-10 top-8 rounded-full bg-[radial-gradient(circle,hsl(var(--moss)/0.55),transparent_70%)] blur-2xl" />
          <div className="relative aspect-square rounded-full bg-gradient-to-b from-white/15 to-white/5 p-10 ring-1 ring-white/20 shadow-inner">
            {heroImg && (
              <img
                src={getHeroImageUrl(heroImg.url, 720, 78)}
                alt={current ? `${current.brand} ${current.name}` : "Featured shoe"}
                className="h-full w-full object-contain drop-shadow-2xl"
                decoding="async"
                fetchPriority="high"
                width={720}
                height={720}
              />
            )}
          </div>

          {current && (
            <div className="absolute -bottom-2 right-0 left-8 sm:left-auto sm:w-64 rounded-xl border border-white/20 bg-white p-3.5 text-forest shadow-lg">
              <p className="text-[10px] uppercase tracking-wider text-moss font-ui">
                {current.brand}
              </p>
              <p className="font-heading text-lg font-semibold leading-tight line-clamp-1">
                {current.name}
              </p>
              <p className="mt-0.5 text-xs font-ui text-muted-foreground">
                {formatPrice(current.price)} · {sizeLabel}
              </p>
              <NavPrefetchLink
                to={`/shoes/${current.slug}`}
                className="mt-2 inline-flex h-8 items-center rounded-full bg-forest px-3 text-xs font-semibold text-white font-ui"
              >
                View →
              </NavPrefetchLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
