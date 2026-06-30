import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FastImage } from "@/components/ui/FastImage";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { getHeroImageUrl } from "@/lib/imageUtils";
import { FALLBACK_MANIFEST, getImageManifest, type BannerImage } from "@/services/imageManifestService";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroSlide {
  eyebrow: string;
  headline: string;
  link: string;
  ctaText: string;
}

const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Running",
    headline: "The road is yours.",
    link: "/category/running",
    ctaText: "Shop running",
  },
  {
    eyebrow: "Trail",
    headline: "Go where others stop.",
    link: "/category/trail",
    ctaText: "Shop trail",
  },
  {
    eyebrow: "Gym & court",
    headline: "Power in every rep.",
    link: "/category/gym",
    ctaText: "Shop gym",
  },
  {
    eyebrow: "Whitelight",
    headline: "Step into light.",
    link: "/sale",
    ctaText: "Shop now",
  },
];

const SLIDE_INTERVAL = 9000;
const TRANSITION_MS = 1000;

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaLink,
}: HeroSectionProps) {
  const [heroImages, setHeroImages] = useState<BannerImage[]>(FALLBACK_MANIFEST.hero);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const useCustomCopy = Boolean(title);

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
    if (slideCount <= 1 || useCustomCopy) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, SLIDE_INTERVAL);
  }, [slideCount, useCustomCopy]);

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

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const next = heroImages[(currentSlide + 1) % heroImages.length];
    const href = getHeroImageUrl(next.url);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.href = href;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [currentSlide, heroImages]);

  const contentIndex = slideCount ? currentSlide % heroSlides.length : 0;
  const activeImage = heroImages[currentSlide];
  const activeCopy = useCustomCopy
    ? { eyebrow: "", headline: title!, link: ctaLink ?? "/", ctaText: ctaText ?? "Shop now" }
    : heroSlides[contentIndex];

  const slideControls =
    slideCount > 1 && !useCustomCopy ? (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 lg:border-border lg:bg-white lg:text-foreground lg:hover:border-primary/30 lg:hover:bg-muted"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 lg:border-border lg:bg-white lg:text-foreground lg:hover:border-primary/30 lg:hover:bg-muted"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    ) : null;

  return (
    <section className="relative overflow-hidden border-b border-border bg-neutral-950 lg:bg-white">
      <div className="relative h-[min(78vh,680px)] min-h-[420px] sm:min-h-[480px] lg:grid lg:h-auto lg:min-h-[560px] lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] xl:min-h-[620px]">
        {/* Hero image — full bleed mobile, right panel desktop */}
        <div className="absolute inset-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-1/2">
          <div className="hero-pearl-bg absolute inset-0" aria-hidden />

          {activeImage && (
            <div
              key={`${currentSlide}-${activeImage.url}`}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FastImage
                src={activeImage.url}
                alt={activeImage.alt_text}
                variant="hero"
                priority
                objectFit="contain"
                className="hero-ken-burns h-[108%] w-[108%] max-h-none max-w-none object-contain drop-shadow-2xl lg:h-[112%] lg:w-[112%]"
              />
            </div>
          )}

          <div className="hero-gloss-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="hero-image-shimmer pointer-events-none absolute inset-0 opacity-30" aria-hidden />

          {/* Mobile — cinematic fade for overlaid copy */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10 lg:hidden"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent lg:hidden"
            aria-hidden
          />

          {/* Desktop — soft blend into copy column */}
          <div className="hero-desktop-blend pointer-events-none absolute inset-0 hidden lg:block" aria-hidden />
        </div>

        {/* Copy — overlaid on mobile, clean column on desktop */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end px-5 pb-8 pt-28 sm:px-8 sm:pb-10 lg:pointer-events-auto lg:static lg:min-h-[560px] lg:items-stretch lg:justify-center lg:px-12 lg:py-16 xl:min-h-[620px] xl:px-16">
          <div className="pointer-events-auto w-full lg:flex lg:max-w-md lg:flex-col lg:justify-center xl:max-w-lg">
            {!useCustomCopy && (
              <div className="relative min-h-[4.5rem] sm:min-h-[5.5rem] lg:min-h-[7.5rem] xl:min-h-[8.5rem]">
                {heroSlides.map((slide, index) => {
                const active = index === contentIndex;
                return (
                  <div
                    key={slide.eyebrow}
                    className={cn(
                      "transition-all ease-out",
                      active
                        ? "relative z-10 opacity-100"
                        : "pointer-events-none absolute inset-0 z-0 opacity-0 translate-y-3"
                    )}
                    style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                    aria-hidden={!active}
                  >
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/70 sm:text-[11px] lg:text-primary/80">
                      {slide.eyebrow}
                    </p>
                    <h1 className="font-heading text-[2rem] font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:text-foreground xl:text-[3.75rem]">
                      {slide.headline}
                    </h1>
                  </div>
                );
              })}
              </div>
            )}

            {useCustomCopy && (
              <>
                <h1 className="font-heading text-3xl font-black leading-tight text-white lg:text-5xl lg:text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-3 text-sm text-white/75 lg:text-muted-foreground">{subtitle}</p>
                )}
              </>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              <Button
                asChild
                size="lg"
                className="hero-cta-shine h-11 rounded-full border-0 bg-white px-7 text-sm font-semibold text-neutral-950 shadow-lg shadow-black/20 hover:bg-white/95 lg:bg-primary lg:text-primary-foreground lg:shadow-primary/25 lg:hover:bg-primary/90"
              >
                <Link to={activeCopy.link} className="flex items-center gap-2">
                  {activeCopy.ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {slideControls}
            </div>

            {slideCount > 1 && !useCustomCopy && (
              <div className="mt-6 flex items-center gap-2 lg:mt-8">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === currentSlide ? "true" : undefined}
                    className={cn(
                      "rounded-full transition-all duration-500",
                      index === currentSlide
                        ? "h-1 w-7 bg-white lg:bg-primary"
                        : "h-1 w-1 bg-white/40 hover:bg-white/70 lg:bg-border lg:hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
