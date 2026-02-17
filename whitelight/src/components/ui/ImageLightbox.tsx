import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  images: Array<{ url: string; alt?: string }>;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

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
  }, [isOpen, currentIndex, images.length]);

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

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const newIndex = (prev - 1 + images.length) % images.length;
      // Reset image opacity when changing
      setTimeout(() => {
        const img = document.querySelector('.lightbox-image') as HTMLImageElement;
        if (img) {
          img.style.opacity = '0';
        }
      }, 0);
      return newIndex;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = (prev + 1) % images.length;
      // Reset image opacity when changing
      setTimeout(() => {
        const img = document.querySelector('.lightbox-image') as HTMLImageElement;
        if (img) {
          img.style.opacity = '0';
        }
      }, 0);
      return newIndex;
    });
  };

  // Preload next and previous images for smoother navigation
  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const preloadImages = [];
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;

    // Preload next image
    if (images[nextIndex]) {
      const nextImg = new Image();
      nextImg.src = images[nextIndex].url;
      preloadImages.push(nextImg);
    }

    // Preload previous image
    if (images[prevIndex]) {
      const prevImg = new Image();
      prevImg.src = images[prevIndex].url;
      preloadImages.push(prevImg);
    }

    return () => {
      // Cleanup if needed
    };
  }, [isOpen, currentIndex, images]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Main image container */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full flex items-center justify-center min-h-[400px]">
          {/* Loading state */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
          
          {/* Main image - use regular img for lightbox for faster loading */}
          <img
            key={currentIndex} // Force re-render on index change
            src={currentImage.url}
            alt={currentImage.alt || `Image ${currentIndex + 1}`}
            className="lightbox-image max-w-full max-h-[90vh] object-contain relative z-10"
            style={{ 
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
            onLoad={(e) => {
              e.currentTarget.style.opacity = '1';
              // Hide loading spinner
              const spinner = e.currentTarget.parentElement?.querySelector('.animate-spin');
              if (spinner) {
                (spinner as HTMLElement).style.display = 'none';
              }
            }}
            onError={(e) => {
              // Show error state
              e.currentTarget.style.opacity = '0';
              const spinner = e.currentTarget.parentElement?.querySelector('.animate-spin');
              if (spinner) {
                (spinner as HTMLElement).style.display = 'none';
              }
              // Remove existing error message if any
              const existingError = e.currentTarget.parentElement?.querySelector('.error-message');
              if (existingError) {
                existingError.remove();
              }
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error-message text-white text-center p-4';
              errorDiv.textContent = 'Failed to load image';
              e.currentTarget.parentElement?.appendChild(errorDiv);
            }}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
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
            {currentIndex + 1} / {images.length}
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
                }}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  index === currentIndex
                    ? "border-white scale-110"
                    : "border-white/30 hover:border-white/60"
                )}
              >
                <OptimizedImage
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
