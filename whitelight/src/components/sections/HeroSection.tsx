import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { BannerImage } from "@/services/bannerService";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface CategoryContent {
  title: string;
  description: string;
  link: string;
}

// Local carousel images with category content
const localImages: BannerImage[] = [
  { url: "/couresel_images/running/running2.png", alt_text: "Premium Running Collection" },
  { url: "/couresel_images/trail/trail1.png", alt_text: "Trail Adventures" },
  { url: "/couresel_images/gym/gym.png", alt_text: "Gym Performance" },
  { url: "/couresel_images/basketball/bk1.png", alt_text: "Basketball Excellence" },
  { url: "/couresel_images/orthopedic/orth1.jpg", alt_text: "Orthopedic Comfort" },
];

const categoryContent: CategoryContent[] = [
  {
    title: "RUNNING SHOES",
    description: "Engineered for speed, built for endurance. Every mile matters.",
    link: "/category/running"
  },
  {
    title: "TRAIL SHOES",
    description: "Conquer any terrain with confidence and superior grip.",
    link: "/category/trail"
  },
  {
    title: "GYM SHOES",
    description: "Maximum performance for your toughest workouts.",
    link: "/category/gym"
  },
  {
    title: "BASKETBALL SHOES",
    description: "Dominate the court with explosive power and control.",
    link: "/category/basketball"
  },
  {
    title: "ORTHOPEDIC SHOES",
    description: "Comfort meets support for all-day wellness.",
    link: "/category/orthopedic"
  }
];

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaLink,
}: HeroSectionProps) {
  const [heroImages] = useState<BannerImage[]>(localImages);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Track carousel changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % localImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentContent = categoryContent[currentSlide];
  const displayTitle = title || currentContent.title;
  const displaySubtitle = subtitle || currentContent.description;
  const displayLink = ctaLink || currentContent.link;



  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background carousel */}
      <div className="absolute inset-0">
        <ImageCarousel 
          images={heroImages}
          className="w-full h-full"
          showControls={false}
          showDots={true}
          autoPlay={true}
          interval={6000}
          objectFit="cover"
        />
        <div className="hero-overlay absolute inset-0" />
        {/* Magical gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-pink-600/30 animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center px-4">
        <div className="animate-slide-up">
          <h1 className="font-heading text-5xl md:text-7xl lg:text-9xl font-black text-white mb-6 tracking-tight bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
            {displayTitle}
          </h1>
          <p className="font-body text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-semibold">
            {displaySubtitle}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 px-12 py-6 text-xl font-bold font-body rounded-full shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
          >
            <Link to={displayLink} className="flex items-center gap-3">
              {ctaText || "SHOP NOW"}
              <ArrowRight className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
