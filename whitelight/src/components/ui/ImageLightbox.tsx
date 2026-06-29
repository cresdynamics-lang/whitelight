import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOptimizedProductUrl, getOriginalProductUrl } from "@/lib/imageUtils";
import { FastImage } from "@/components/ui/FastImage";

interface ImageLightboxProps {
  images: Array<{ url: string; alt?: string }>;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageError, setImageError] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);

  const imageSrc = (url: string, original = false) =>
    original ? getOriginalProductUrl(url) : getOptimizedProductUrl(url, 1200, 80);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setImageError(false);
    setUseOriginal(false);
  }, [initialIndex]);
  
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
      setUseOriginal(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setImageError(false);
    setUseOriginal(false);
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setImageError(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setImageError(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || images.length === 0) return;
    const currentImage = images[currentIndex];
    if (currentImage?.url) {
      const img = new Image();
      img.src = imageSrc(currentImage.url);
    }
  }, [isOpen, currentIndex, images]);

  useEffect(() => {
    if (!isOpen || images.length === 0) return;
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    [nextIndex, prevIndex].forEach((i) => {
      const url = images[i]?.url;
      if (url) {
        const img = new Image();
        img.src = imageSrc(url);
      }
    });
  }, [isOpen, currentIndex, images]);

  if (!isOpen || images.length === 0) return null;

  // Ensure currentIndex is valid
  const validIndex = currentIndex >= 0 && currentIndex < images.length ? currentIndex : 0;
  const currentImage = images[validIndex];
  
  // Safety check
  if (!currentImage || !currentImage.url) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="text-white text-center p-4">
          <p className="text-lg mb-2">No image available</p>
          <p className="text-sm text-gray-400 mb-4">Images: {images.length}, Index: {currentIndex}</p>
          <Button
            variant="outline"
            className="mt-4 text-white border-white hover:bg-white/20"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(4px)',
        // Prevent Android double-tap / pinch zoom from making the whole page zoom
        touchAction: 'none',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-[10000] text-white hover:bg-white/20"
        onClick={onClose}
        style={{ zIndex: 10000 }}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Main image container */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 10000 }}
      >
        <div className="relative w-full h-full flex items-center justify-center min-h-[400px]">
          {imageError && (
            <div className="flex flex-col items-center justify-center z-20 p-8">
              <div className="text-white text-center p-6 bg-black/90 rounded-lg border border-white/20 max-w-md">
                <p className="text-lg mb-2 font-semibold">Failed to load image</p>
                <Button
                  variant="outline"
                  className="text-white border-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageError(false);
                    setUseOriginal(true);
                  }}
                >
                  Retry Loading
                </Button>
              </div>
            </div>
          )}

          {!imageError && currentImage?.url && (
            <img
              key={`lightbox-${validIndex}-${useOriginal ? "orig" : "opt"}`}
              src={imageSrc(currentImage.url, useOriginal)}
              alt={currentImage.alt || `Image ${validIndex + 1}`}
              className="lightbox-image max-w-full max-h-[90vh] object-contain"
              style={{
                zIndex: 15,
                position: "relative",
                maxWidth: "100%",
                maxHeight: "90vh",
                width: "auto",
                height: "auto",
                touchAction: "none",
              }}
              onError={() => {
                if (!useOriginal) {
                  setUseOriginal(true);
                  return;
                }
                setImageError(true);
              }}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          )}
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                "text-white hover:bg-white/20",
                "h-12 w-12 rounded-full"
              )}
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                "text-white hover:bg-white/20",
                "h-12 w-12 rounded-full"
              )}
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {validIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-full overflow-x-auto px-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  setImageError(false);
                  setUseOriginal(false);
                }}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  index === validIndex
                    ? "border-white scale-110"
                    : "border-white/30 hover:border-white/60"
                )}
              >
                <FastImage
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  variant="thumb"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
