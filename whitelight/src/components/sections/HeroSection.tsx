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
  ctaText: string;
}

// Local carousel images with category content
const localImages: BannerImage[] = [
  {
    url: "/couresel_images/running/running2.png",
    alt_text: "Whitelight running shoes in Nairobi CBD",
  },
  {
    url: "/gymshoes.jpg",
    alt_text: "Whitelight gym and training shoes in Nairobi",
  },
  {
    url: "/trainning.jpg",
    alt_text: "Whitelight training shoes and multi-sport footwear",
  },
  {
    url: "/ourstoryimage.jpeg",
    alt_text: "Inside Whitelight Store Nairobi - our story",
  },
];

const categoryContent: CategoryContent[] = [
  {
    title: "WHITELIGHT RUNNING",
    description:
      "Premium running shoes for Nairobi runners – from easy jogs on Thika Road to full marathon days on Ngong Road.",
    link: "/category/running",
    ctaText: "Shop Running Shoes",
  },
  {
    title: "WHITELIGHT GYM",
    description:
      "Serious gym and training shoes for Nairobi lifters – lock in stability for squats, deadlifts & HIIT sessions.",
    link: "/category/gym",
    ctaText: "Shop Gym Shoes",
  },
  {
    title: "WHITELIGHT TRAINING",
    description:
      "Multi-sport training shoes for drills, conditioning and speed work – trusted by Nairobi’s most active athletes.",
    link: "/category/training",
    ctaText: "Shop Training Shoes",
  },
  {
    title: "ABOUT WHITELIGHT STORE",
    description:
      "Visit us in Nairobi CBD – Rware Building, Luthuli Avenue, Shop 410. Try on authentic footwear with real sizing help.",
    link: "/about",
    ctaText: "Discover Our Story",
  },
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
  const displayCtaText = ctaText || currentContent.ctaText;



  return (
    <section className="relative py-20 overflow-hidden">
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
      <div className="relative flex items-center justify-center px-4 py-12">
        <div
          key={currentSlide}
          className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 md:flex-row"
        >
          {/* Left: big slanted Whitelight heading */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-4 animate-in slide-in-from-left-10 fade-in-0 duration-700">
            <p className="text-sm font-semibold tracking-[0.3em] text-white/70 uppercase">
              Whitelight Store • Nairobi CBD
            </p>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-black italic skew-x-[-6deg] md:skew-x-[-8deg] text-white tracking-tight bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
              {displayTitle}
            </h1>
          </div>

          {/* Right: description + CTA animating from the right */}
          <div className="w-full md:w-1/2 text-center md:text-right space-y-6 animate-in slide-in-from-right-10 fade-in-0 duration-700">
            <p className="font-body text-lg md:text-xl text-white/90 max-w-xl md:ml-auto font-semibold">
              {displaySubtitle}
            </p>
            <div className="flex justify-center md:justify-end">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 px-10 py-5 text-base md:text-lg font-bold font-body rounded-full shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
              >
                <Link to={displayLink} className="flex items-center gap-2 md:gap-3">
                  {displayCtaText}
                  <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
