import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { siteConfig } from "@/config/site";
import type { Product } from "@/types/product";
import { EU_SIZES, useSizePreference } from "@/context/SizePreferenceContext";
import { countProductsInSize } from "@/lib/productBlueprint";
import { cn } from "@/lib/utils";

const tileImages: Record<string, { side: string; sole: string }> = {
  running: {
    side: "/couresel_images/running/running2.webp",
    sole: "/couresel_images/running/running3.webp",
  },
  trail: { side: "/trailshoes.webp", sole: "/trail2.webp" },
  training: { side: "/gymshoes.webp", sole: "/couresel_images/gym/gym1.webp" },
  basketball: {
    side: "/couresel_images/basketball/bk1.webp",
    sole: "/couresel_images/basketball/bk2.webp",
  },
  tennis: {
    side: "/couresel_images/basketball/bk3.webp",
    sole: "/couresel_images/gym/gym.webp",
  },
  accessories: {
    side: "/guide_images/guide5.webp",
    sole: "/couresel_images/running/running2.webp",
  },
};

type Props = { products: Product[] };

export function BlueprintActivityTiles({ products }: Props) {
  const { preferredSize, setPreferredSize } = useSizePreference();
  const inSize = countProductsInSize(products, preferredSize);

  const tiles = siteConfig.categories.filter((c) =>
    ["running", "trail", "training", "basketball", "tennis", "accessories"].includes(c.id)
  );

  return (
    <section className="container py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf font-ui">
            Shop by what you do
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-forest">
            Start with your <span className="text-moss italic">sport.</span>
          </h2>
        </div>
        <NavPrefetchLink to="/products" className="text-sm font-semibold text-primary font-ui">
          All shoes →
        </NavPrefetchLink>
      </div>

      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory lg:overflow-visible lg:pb-0">
        {tiles.map((tile) => {
          const count = products.filter(
            (p) => p.category === tile.id || (tile.id === "training" && p.category === "gym")
          ).length;
          const imgs = tileImages[tile.id] || tileImages.running;
          return (
            <NavPrefetchLink
              key={tile.id}
              to={tile.href}
              className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-sage w-[42%] sm:w-[30%] lg:w-auto lg:flex-1 shrink-0 snap-start"
            >
              <img
                src={imgs.side}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
              />
              <img
                src={imgs.sole}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                <p className="font-heading text-base md:text-lg xl:text-xl font-semibold leading-tight">
                  {tile.label}
                </p>
                <p className="text-[11px] md:text-xs opacity-90 font-ui line-clamp-1">{tile.blurb}</p>
                <p className="mt-1 text-xs md:text-sm font-semibold font-ui">{count} pairs</p>
              </div>
            </NavPrefetchLink>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl bg-sage/70 px-4 py-3">
        <span className="text-sm text-forest font-ui mr-1">
          Know your size? Tap it to see only what fits:
        </span>
        {EU_SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setPreferredSize(preferredSize === s ? null : s)}
            className={cn(
              "h-9 w-11 rounded-md border text-sm font-semibold font-ui",
              preferredSize === s
                ? "border-primary bg-primary text-white"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            {s}
          </button>
        ))}
        {preferredSize && (
          <NavPrefetchLink
            to="/products"
            className="text-sm font-semibold text-leaf font-ui ml-auto"
          >
            {inSize} pairs in size {preferredSize} →
          </NavPrefetchLink>
        )}
      </div>
    </section>
  );
}
