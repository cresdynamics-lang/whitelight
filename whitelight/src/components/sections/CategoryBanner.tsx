import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FastImage } from "@/components/ui/FastImage";
import { cn } from "@/lib/utils";
import { resolveStaticImage } from "@/lib/imageUtils";
import { FALLBACK_MANIFEST, getImageManifest, type CategoryImage } from "@/services/imageManifestService";

interface CategoryBannerProps {
  className?: string;
}

const categoryLabels: Record<string, string> = {
  running: "Running Shoes",
  trail: "Trail Shoes",
  gym: "Gym Shoes",
  training: "Training Shoes",
  basketball: "Basketball Shoes",
  tennis: "Tennis Shoes",
  orthopedic: "Orthopedic Shoes",
};

const categoryTaglines: Record<string, string> = {
  running: "Come this way — our running wall.\nRoad shoes for CBD commutes, jogs, and marathon prep.",
  trail: "Step over here for trails.\nGrip built for Karura, Ngong Hills, and Kenya's red dirt.",
  gym: "Through here for gym and lifting.\nStable pairs for squats, HIIT, and heavy sessions.",
  training: "This aisle is all training.\nDrills, sprints, conditioning — one shoe for the full week.",
  basketball: "Courtside — basketball picks.\nExplosive take-off and safe landings for Nairobi hoopers.",
  tennis: "Club players, this way.\nLateral support and grip for every rally on Kenyan courts.",
  orthopedic: "Need all-day comfort?\nSupportive pairs for long Nairobi days on your feet.",
};

function CategoryCard({
  category,
  decorative = false,
}: {
  category: CategoryImage;
  decorative?: boolean;
}) {
  const label = categoryLabels[category.category] || category.category;
  const tagline = categoryTaglines[category.category] || "";
  const cardClass =
    "group relative flex-shrink-0 w-56 sm:w-60 md:w-64 aspect-[4/5] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105";

  const overlay = (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex items-end p-4">
        <div className="text-center w-full space-y-2">
          <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-1">{label}</h3>
          <p className="whitespace-pre-line text-xs md:text-sm text-white/85 leading-snug">{tagline}</p>
          {!decorative && (
            <span className="inline-flex items-center gap-2 mt-2 text-white text-xs md:text-sm font-semibold group-hover:gap-3 transition-all duration-300 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              Step inside →
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (decorative) {
    const bgUrl = resolveStaticImage(category.url);
    return (
      <div
        aria-hidden
        className={cardClass}
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {overlay}
      </div>
    );
  }

  return (
    <Link to={`/category/${category.category}`} className={cardClass}>
      <FastImage
        src={category.url}
        alt={category.alt_text}
        variant="card"
        className="transition-transform duration-500 group-hover:scale-110"
      />
      {overlay}
    </Link>
  );
}

export function CategoryBanner({ className }: CategoryBannerProps) {
  const [categories, setCategories] = useState<CategoryImage[]>(FALLBACK_MANIFEST.category);

  useEffect(() => {
    let mounted = true;
    getImageManifest().then((manifest) => {
      if (mounted) setCategories(manifest.category);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className={cn("py-6 md:py-8 overflow-hidden", className)}>
      <div className="container">
        <div className="mb-6 md:mb-8 text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Explore Our Store Categories
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            Walk through Whitelight like you&apos;re at our Luthuli Avenue shop — tap a section and
            we&apos;ll show you what we keep on each shelf.
          </p>
        </div>

        <div className="relative">
          <div className="flex animate-scroll space-x-3">
            {categories.map((category) => (
              <CategoryCard key={category.category} category={category} />
            ))}
            {categories.map((category) => (
              <CategoryCard
                key={`dup-${category.category}`}
                category={category}
                decorative
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
