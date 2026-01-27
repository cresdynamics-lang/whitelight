import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { BannerImage } from "@/services/bannerService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/site";

interface CtaBannerProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

// Local CTA images
const localCtaImages: BannerImage[] = [
  { url: "/couresel_images/running/running2.png", alt_text: "Running Performance" },
  { url: "/couresel_images/gym/gym.png", alt_text: "Gym Excellence" },
  { url: "/couresel_images/basketball/bk1.png", alt_text: "Basketball Power" },
  { url: "/couresel_images/trail/trail1.png", alt_text: "Trail Adventures" },
];

export function CtaBanner({
  title = "TIME TO MOVE",
  subtitle = "Step into style. Elevate your game with the latest drops.",
  ctaText = "SHOP COLLECTION",
}: CtaBannerProps) {
  const [ctaImages] = useState<BannerImage[]>(localCtaImages);



  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        <ImageCarousel 
          images={ctaImages}
          className="w-full h-full"
          showControls={false}
          showDots={false}
          autoPlay={true}
          interval={7000}
          objectFit="cover"
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      
      {/* Content */}
      <div className="container relative z-10 text-center md:text-left max-w-4xl">
        <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl mx-auto md:mx-0">
          {subtitle}
        </p>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-medium px-8 h-12 group"
            >
              {ctaText}
              <ChevronDown className="ml-2 h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-56 bg-background border border-border shadow-lg z-50"
          >
            {siteConfig.categories.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link 
                  to={category.href}
                  className="flex items-center justify-between cursor-pointer"
                >
                  {category.label}
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
