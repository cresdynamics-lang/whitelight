import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { SHOP_BRANDS } from "@/config/brands";

/** Brand filter buttons — Nike / Asics / Adidas → brand PLPs. */
export function BlueprintPromiseBar() {
  return (
    <section className="border-b border-border bg-card">
      <div className="container flex flex-wrap items-center justify-center gap-2 py-4 sm:gap-3 sm:py-5">
        <p className="w-full text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground font-ui sm:w-auto sm:mr-2 sm:text-left">
          Shop by brand
        </p>
        {SHOP_BRANDS.map((b) => (
          <NavPrefetchLink
            key={b.slug}
            to={`/brand/${b.slug}`}
            className="inline-flex h-10 items-center rounded-full border border-forest/20 bg-background px-5 text-sm font-semibold uppercase tracking-[0.1em] text-forest font-ui transition hover:border-forest hover:bg-forest hover:text-white"
          >
            {b.name}
          </NavPrefetchLink>
        ))}
      </div>
    </section>
  );
}
