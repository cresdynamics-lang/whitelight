import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FastImage } from "@/components/ui/FastImage";
import { cn } from "@/lib/utils";
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
  running: "Chase Nairobi miles with confidence.\nBuilt for marathon days and evening jogs.",
  trail: "Grip Kenya’s rough trails with ease.\nStay steady on mud, rocks and dust.",
  gym: "Lock in your lifts and HIIT sessions.\nSupport where Nairobi lifters need it most.",
  training: "Built for drills, sprints and conditioning.\nOne shoe for your whole training week.",
  basketball: "Explosive take-off, safe landings.\nCourt-ready for Nairobi’s best hoopers.",
  tennis: "Lateral support and grip for every rally.\nBuilt for Kenyan courts and club play.",
  orthopedic: "Comfort for long Nairobi days.\nSupport that’s kind on busy feet.",
};

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
        <h2 className="font-heading text-4xl md:text-5xl font-black mb-6 md:mb-8 text-center bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
          SHOP BY CATEGORY
        </h2>
        
        {/* Scrolling carousel */}
        <div className="relative">
          <div className="flex animate-scroll space-x-3">
            {/* First set */}
            {categories.map((category) => (
              <Link
                key={`first-${category.category}`}
                to={`/category/${category.category}`}
                className="group relative flex-shrink-0 w-52 sm:w-60 md:w-64 aspect-[4/5] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <FastImage
                  src={category.url}
                  alt={category.alt_text}
                  variant="hero"
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end p-4">
                  <div className="text-center w-full space-y-2">
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-1">
                      {categoryLabels[category.category] || category.category}
                    </h3>
                    <p className="whitespace-pre-line text-xs md:text-sm text-white/85 leading-snug">
                      {categoryTaglines[category.category] || ""}
                    </p>
                    <span className="inline-flex items-center gap-2 mt-2 text-white text-xs md:text-sm font-semibold group-hover:gap-3 transition-all duration-300 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {categories.map((category) => (
              <Link
                key={`second-${category.category}`}
                to={`/category/${category.category}`}
                className="group relative flex-shrink-0 w-52 sm:w-60 md:w-64 aspect-[4/5] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <FastImage
                  src={category.url}
                  alt={category.alt_text}
                  variant="hero"
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end p-4">
                  <div className="text-center w-full space-y-2">
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-1">
                      {categoryLabels[category.category] || category.category}
                    </h3>
                    <p className="whitespace-pre-line text-xs md:text-sm text-white/85 leading-snug">
                      {categoryTaglines[category.category] || ""}
                    </p>
                    <span className="inline-flex items-center gap-2 mt-2 text-white text-xs md:text-sm font-semibold group-hover:gap-3 transition-all duration-300 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
