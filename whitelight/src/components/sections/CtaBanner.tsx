import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/site";
import { FALLBACK_MANIFEST, getImageManifest, type BannerImage } from "@/services/imageManifestService";

interface CtaBannerProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export function CtaBanner({
  title = "TIME TO MOVE",
  subtitle = "Step into style. Elevate your game with the latest drops.",
  ctaText = "SHOP COLLECTION",
}: CtaBannerProps) {
  const [ctaImages, setCtaImages] = useState<BannerImage[]>(FALLBACK_MANIFEST.cta);

  useEffect(() => {
    let mounted = true;
    getImageManifest().then((manifest) => {
      if (mounted) setCtaImages(manifest.cta);
    });
    return () => {
      mounted = false;
    };
  }, []);


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
