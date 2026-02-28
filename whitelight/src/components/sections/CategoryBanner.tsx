import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { bannerService, CategoryImage } from "@/services/bannerService";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";

interface CategoryBannerProps {
  className?: string;
}

const categoryLabels: Record<string, string> = {
  running: "Running Shoes",
  trail: "Trail Shoes",
  gym: "Gym Shoes",
  training: "Training Shoes",
  basketball: "Basketball Shoes",
  orthopedic: "Orthopedic Shoes",
};

const categoryTaglines: Record<string, string> = {
  running: "Chase Nairobi miles with confidence.\nBuilt for marathon days and evening jogs.",
  trail: "Grip Kenya’s rough trails with ease.\nStay steady on mud, rocks and dust.",
  gym: "Lock in your lifts and HIIT sessions.\nSupport where Nairobi lifters need it most.",
  training: "Built for drills, sprints and conditioning.\nOne shoe for your whole training week.",
  basketball: "Explosive take-off, safe landings.\nCourt-ready for Nairobi’s best hoopers.",
  orthopedic: "Comfort for long Nairobi days.\nSupport that’s kind on busy feet.",
};

// Local category images from couresel_images folders
const localCategories: CategoryImage[] = [
  {
    category: "running",
    url: "/couresel_images/running/running2.png",
    alt_text: "Running Shoes"
  },
  {
    category: "trail",
    url: "/couresel_images/trail/trail1.png",
    alt_text: "Trail Shoes"
  },
  {
    category: "gym",
    url: "/couresel_images/gym/gym.png",
    alt_text: "Gym Shoes"
  },
  {
    category: "basketball",
    url: "/couresel_images/basketball/bk1.png",
    alt_text: "Basketball Shoes"
  },
  {
    category: "training",
    url: "/couresel_images/gym/gym3.png",
    alt_text: "Training Shoes"
  },
  {
    category: "orthopedic",
    url: "/couresel_images/orthopedic/orth1.jpg",
    alt_text: "Orthopedic Shoes"
  }
];

export function CategoryBanner({ className }: CategoryBannerProps) {
  const [categories] = useState<CategoryImage[]>(localCategories);



  return (
    <section className={cn("py-12 md:py-16 overflow-hidden", className)}>
      <div className="container">
        <h2 className="font-heading text-4xl md:text-5xl font-black mb-12 text-center bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
          SHOP BY CATEGORY
        </h2>
        
        {/* Scrolling carousel */}
        <div className="relative">
          <div className="flex animate-scroll space-x-6">
            {/* First set */}
            {categories.map((category) => (
              <Link
                key={`first-${category.category}`}
                to={`/category/${category.category}`}
                className="group relative flex-shrink-0 w-80 aspect-[4/5] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <OptimizedImage
                  src={category.url}
                  alt={category.alt_text}
                  className="h-full w-full [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="text-center w-full space-y-2">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
                      {categoryLabels[category.category] || category.category}
                    </h3>
                    <p className="whitespace-pre-line text-sm md:text-base text-white/85 leading-snug">
                      {categoryTaglines[category.category] || ""}
                    </p>
                    <span className="inline-flex items-center gap-2 mt-2 text-white text-sm md:text-base font-semibold group-hover:gap-3 transition-all duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
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
                className="group relative flex-shrink-0 w-80 aspect-[4/5] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <OptimizedImage
                  src={category.url}
                  alt={category.alt_text}
                  className="h-full w-full [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="text-center w-full space-y-2">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
                      {categoryLabels[category.category] || category.category}
                    </h3>
                    <p className="whitespace-pre-line text-sm md:text-base text-white/85 leading-snug">
                      {categoryTaglines[category.category] || ""}
                    </p>
                    <span className="inline-flex items-center gap-2 mt-2 text-white text-sm md:text-base font-semibold group-hover:gap-3 transition-all duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
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
