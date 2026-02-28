import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { Button } from "@/components/ui/button";
import type { BannerImage } from "@/services/bannerService";

interface BrandSlide {
  title: string;
  description: string;
  link: string;
  ctaText: string;
}

const brandImages: BannerImage[] = [
  {
    url: "/whychooseus.png",
    alt_text: "Why Nairobi runners choose Whitelight Store",
  },
  {
    url: "/gymshoes.jpg",
    alt_text: "Gym and training shoes from Whitelight Store Nairobi",
  },
  {
    url: "/ourstoryimage.jpeg",
    alt_text: "Inside Whitelight Store – Nairobi CBD",
  },
  {
    url: "/whitelight_logo.webp",
    alt_text: "Whitelight Store logo – premium footwear Nairobi",
  },
];

const brandSlides: BrandSlide[] = [
  {
    title: "Trusted by Nairobi Runners",
    description:
      "Real Nairobi customers, real distances. We fit shoes for daily commuters, evening joggers and marathon finishers across the city.",
    link: "/category/running",
    ctaText: "See Nairobi Bestsellers",
  },
  {
    title: "Expert Fitting & Honest Advice",
    description:
      "Visit us at Rware Building, Luthuli Avenue, Shop 410. We help you choose the right size, support and cushioning – not just the trend.",
    link: "/buying-guide",
    ctaText: "View Buying Guide",
  },
  {
    title: "Same-Day Delivery in CBD",
    description:
      "Order before 4pm and get your shoes delivered around Nairobi CBD the same day – fast, reliable, and carefully packaged.",
    link: "/contact",
    ctaText: "Arrange Delivery",
  },
  {
    title: "Quality-Checked Brands",
    description:
      "We focus on shoes from trusted sources and check for build quality, fit and comfort so your pair can keep up with Nairobi streets.",
    link: "/about",
    ctaText: "Learn About Whitelight",
  },
];

export function BrandHighlightCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % brandImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = brandSlides[currentSlide];

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Background carousel */}
      <div className="absolute inset-0">
        <ImageCarousel
          images={brandImages}
          className="w-full h-full"
          showControls={false}
          showDots={true}
          autoPlay={true}
          interval={7000}
          objectFit="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50" />
      </div>

      {/* Foreground content */}
      <div className="relative container flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left: spinning badge + title */}
        <div
          key={currentSlide + "-left"}
          className="flex w-full md:w-1/2 flex-col items-center md:items-start gap-4 animate-in slide-in-from-left-8 fade-in-0 duration-700"
        >
          <div className="relative flex items-center justify-center">
            {/* Static logo filling the circle */}
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border border-white/40 bg-black/40 flex items-center justify-center overflow-hidden">
              <img
                src="/whitelight_logo.webp"
                alt="Whitelightstore logo"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            {/* Spinning Whitelight Store text (slower spin) */}
            <div
              className="absolute -bottom-7 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-white/80 animate-spin"
              style={{ animationDuration: "10s" }}
            >
              <div>Whitelight</div>
              <div>Store</div>
            </div>
          </div>
          <h2 className="mt-2 font-heading text-3xl md:text-4xl lg:text-5xl font-black italic skew-x-[-6deg] text-white tracking-tight drop-shadow-2xl text-center md:text-left">
            {slide.title}
          </h2>
        </div>

        {/* Right: description + CTA */}
        <div
          key={currentSlide + "-right"}
          className="w-full md:w-1/2 space-y-6 text-center md:text-right animate-in slide-in-from-right-8 fade-in-0 duration-700"
        >
          <p className="font-body text-base md:text-lg text-white/90 max-w-xl md:ml-auto">
            {slide.description}
          </p>
          <div className="flex justify-center md:justify-end">
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-sm md:text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link to={slide.link} className="flex items-center gap-2">
                {slide.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

