import { Link } from "react-router-dom";
import { SHOP_BRANDS } from "@/config/brands";
import { cn } from "@/lib/utils";

interface ShopByBrandProps {
  className?: string;
  title?: string;
}

export function ShopByBrand({
  className,
  title = "The Brands We Keep for You",
}: ShopByBrandProps) {
  return (
    <section className={cn("border-b border-border bg-white py-8 md:py-10", className)}>
      <div className="container">
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          At our Luthuli Avenue shop we don&apos;t carry every logo — we carry the ones Nairobi
          customers come back for. Choose a name below and see every pair we hold for that brand,
          from road runs to gym floors and weekend trails.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6 md:gap-4">
          {SHOP_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              to={`/brand/${brand.slug}`}
              className="group flex min-h-[3.75rem] flex-col items-center justify-center rounded-xl border border-border bg-muted/30 px-2 py-3 text-center transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm sm:min-h-[4.5rem] sm:rounded-2xl sm:px-3 sm:py-4 md:min-h-[5rem]"
            >
              <span className="font-heading text-[10px] font-bold uppercase leading-tight tracking-wide text-foreground transition-colors group-hover:text-primary sm:text-sm md:text-base">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
