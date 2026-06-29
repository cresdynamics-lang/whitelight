import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FastImage } from "@/components/ui/FastImage";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { FALLBACK_MANIFEST, getImageManifest, type BannerImage } from "@/services/imageManifestService";

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

const categoryContent: CategoryContent[] = [
  {
    title: "Run Nairobi's Streets",
    description:
      "Road-running shoes for CBD commutes, evening jogs on Ngong Road, and marathon prep — fitted for how Kenyans actually move.",
    link: "/category/running",
    ctaText: "Browse running shoes",
  },
  {
    title: "Own Every Kenyan Trail",
    description:
      "Trail footwear with real grip for Karura Forest, Ngong Hills, and red-dirt paths — built for mud, rocks, and long weekend hikes.",
    link: "/category/trail",
    ctaText: "Browse trail shoes",
  },
  {
    title: "Train Hard in Nairobi",
    description:
      "Gym and court shoes for lifters, hoopers, and HIIT — stable cushioning for Nairobi gyms, outdoor courts, and daily sessions.",
    link: "/category/gym",
    ctaText: "Browse gym & court",
  },
  {
    title: "Your Luthuli Avenue Stop",
    description:
      "White Light Store — authentic Nike, Adidas, HOKA, ASICS and more. Same-day Nairobi delivery and WhatsApp sizing from our CBD shop.",
    link: "/contact",
    ctaText: "Talk to us on WhatsApp",
  },
];

const SLIDE_INTERVAL = 10000;
const TRANSITION_MS = 1400;

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaLink,
}: HeroSectionProps) {
  const [heroImages, setHeroImages] = useState<BannerImage[]>(FALLBACK_MANIFEST.hero);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;
    getImageManifest().then((manifest) => {
      if (mounted) setHeroImages(manifest.hero);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const slideCount = heroImages.length;

  const resetAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (slideCount <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, SLIDE_INTERVAL);
  }, [slideCount]);

  const goToSlide = useCallback(
    (index: number) => {
      if (!slideCount) return;
      setCurrentSlide(((index % slideCount) + slideCount) % slideCount);
      resetAutoplay();
    },
    [slideCount, resetAutoplay]
  );

  const goNext = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const goPrev = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetAutoplay]);

  const contentIndex = slideCount ? currentSlide % categoryContent.length : 0;

  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      <div className="grid min-h-[260px] grid-cols-2 sm:min-h-[340px] md:min-h-[440px] lg:min-h-[540px] xl:min-h-[600px] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        {/* Left — Whitelight copy */}
        <div className="relative z-20 flex flex-col justify-center bg-white px-3 py-6 sm:px-6 sm:py-8 md:px-10 lg:px-12 xl:px-14">
          <p className="relative z-20 mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary sm:mb-4 sm:text-[10px] md:text-xs">
            White Light Store · Luthuli Avenue, Nairobi
          </p>

          <div className="relative z-20 min-h-[8rem] sm:min-h-[9.5rem] md:min-h-[11rem] lg:min-h-[12rem]">
            {(title
              ? [{ title, description: subtitle ?? "", link: ctaLink ?? "/", ctaText: ctaText ?? "Shop now" }]
              : categoryContent
            ).map((content, index) => {
              const active = title ? index === 0 : index === contentIndex;
              const displayLink = ctaLink || content.link;
              const displayCtaText = ctaText || content.ctaText;

              return (
                <div
                  key={index}
                  className={cn(
                    "absolute inset-0 flex flex-col justify-start transition-all ease-in-out",
                    active
                      ? "pointer-events-auto z-10 translate-x-0 opacity-100"
                      : "pointer-events-none z-0 translate-x-3 opacity-0"
                  )}
                  style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                  aria-hidden={!active}
                >
                  <h1 className="font-heading text-sm font-bold leading-snug tracking-tight text-foreground sm:text-2xl md:text-3xl lg:text-4xl xl:text-[2.65rem]">
                    {content.title}
                  </h1>

                  <p className="mt-2 line-clamp-4 max-w-md text-[10px] leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm md:mt-4 md:text-base md:leading-relaxed">
                    {content.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
                    <Button
                      asChild
                      size="sm"
                      className="h-9 rounded-full bg-primary px-4 text-[10px] font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 sm:h-10 sm:px-6 sm:text-xs md:h-11 md:px-8 md:text-sm"
                    >
                      <Link to={displayLink} className="flex items-center gap-1.5 sm:gap-2">
                        <span className="hidden sm:inline">{displayCtaText}</span>
                        <span className="sm:hidden">Shop now</span>
                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Link>
                    </Button>

                    {slideCount > 1 && !title && (
                      <div className="hidden items-center gap-1.5 sm:flex">
                        <button
                          type="button"
                          onClick={goPrev}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-muted md:h-10 md:w-10"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-muted md:h-10 md:w-10"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {slideCount > 1 && !title && (
            <div className="relative z-20 mt-5 flex items-center gap-2 sm:mt-7">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide ? "true" : undefined}
                  className={cn(
                    "rounded-full transition-all ease-in-out",
                    index === currentSlide
                      ? "h-2 w-6 bg-primary sm:h-2.5 sm:w-8"
                      : "h-2 w-2 bg-border hover:bg-muted-foreground/40 sm:h-2.5 sm:w-2.5"
                  )}
                  style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right — expanded product image with soft edge fade */}
        <div className="relative overflow-hidden bg-neutral-50">
          <div className="relative h-full min-h-[260px] sm:min-h-[340px] md:min-h-[440px] lg:min-h-full">
            {heroImages.map((image, index) => (
              <div
                key={image.url}
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all ease-in-out",
                  index === currentSlide
                    ? "z-[1] scale-100 opacity-100"
                    : "z-0 scale-[1.03] opacity-0"
                )}
                style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                aria-hidden={index !== currentSlide}
              >
                <FastImage
                  src={image.url}
                  alt={image.alt_text}
                  variant="hero"
                  priority={index === 0}
                  objectFit="contain"
                  className="h-[118%] w-[118%] max-h-none max-w-none scale-110 object-contain sm:h-[120%] sm:w-[120%] lg:scale-[1.15]"
                />
              </div>
            ))}

            {/* Soft vignette — hides hard image edges on all sides */}
            <div className="hero-image-vignette pointer-events-none absolute inset-0 z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
