import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FastImage } from "@/components/ui/FastImage";
import { cn } from "@/lib/utils";

interface CarouselImage {
  url: string;
  alt_text: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  showControls?: boolean;
  showDots?: boolean;
  objectFit?: "cover" | "contain";
}

/** Only loads the active slide — not every carousel image at once */
export function ImageCarousel({
  images,
  autoPlay = true,
  interval = 5000,
  className,
  showControls = true,
  showDots = true,
  objectFit = "cover",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (!images.length) {
    return (
      <div className={cn("aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center", className)}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const slide = images[currentIndex];

  return (
    <div className={cn("relative overflow-hidden rounded-lg h-full w-full", className)}>
      <FastImage
        key={slide.url}
        src={slide.url}
        alt={slide.alt_text}
        className="w-full h-full min-h-[280px]"
        variant="hero"
        priority={currentIndex === 0}
        objectFit={objectFit}
      />

      {showControls && images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-white" : "bg-white/50"
              )}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
