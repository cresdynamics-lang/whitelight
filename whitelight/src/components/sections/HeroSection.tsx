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
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    ) : null;

  return (
    <section className="relative overflow-hidden border-b border-border bg-neutral-950">
      <div className="relative h-[min(85vh,720px)] min-h-[480px] sm:min-h-[540px] lg:min-h-[620px] xl:min-h-[680px]">
        {/* Hero background images — full bleed, one at a time */}
        <div className="absolute inset-0">
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
                objectFit="cover"
                className="hero-ken-burns h-full w-full max-h-none max-w-none object-cover"
              />
            </div>
          )}

          {/* Cinematic overlays for readability on all screens */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"
            aria-hidden
          />
          <div className="hero-gloss-sheen pointer-events-none absolute inset-0" aria-hidden />
        </div>

        {/* Copy + CTA — always centred over the image */}
        <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center px-5 text-center">
          <div className="pointer-events-auto w-full max-w-2xl">
            {!useCustomCopy && (
              <div className="relative flex min-h-[6rem] items-center justify-center sm:min-h-[7rem] lg:min-h-[8.5rem]">
                {heroSlides.map((slide, index) => {
                  const active = index === contentIndex;
                  return (
                    <div
                      key={slide.eyebrow}
                      className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center transition-all ease-out",
                        active
                          ? "relative z-10 opacity-100"
                          : "pointer-events-none absolute inset-0 z-0 opacity-0 translate-y-3"
                      )}
                      style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                      aria-hidden={!active}
                    >
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/80 sm:text-xs">
                        {slide.eyebrow}
                      </p>
                      <h1 className="font-heading text-[2rem] font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-6xl xl:text-7xl">
                        {slide.headline}
                      </h1>
                    </div>
                  );
                })}
              </div>
            )}

            {useCustomCopy && (
              <>
                <h1 className="font-heading text-3xl font-black leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-3 text-sm text-white/80 sm:text-base">{subtitle}</p>
                )}
              </>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10">
              <Button
                asChild
                size="lg"
                className="hero-cta-shine h-12 rounded-full border-0 bg-white px-8 text-sm font-semibold text-neutral-950 shadow-xl shadow-black/30 hover:bg-white/95"
              >
                <Link to={activeCopy.link} className="flex items-center gap-2">
                  {activeCopy.ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {slideControls}
            </div>

            {slideCount > 1 && !useCustomCopy && (
              <div className="mt-8 flex items-center justify-center gap-2">
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
                        ? "h-1 w-7 bg-white"
                        : "h-1 w-1 bg-white/50 hover:bg-white/80"
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
