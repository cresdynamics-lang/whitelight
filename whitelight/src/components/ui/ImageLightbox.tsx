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
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Helper function to get optimized image URL for faster loading
  const getOptimizedImageUrl = (url: string, width: number = 1200, quality: number = 80) => {
    if (url.includes('digitaloceanspaces.com')) {
      // Use CDN optimization parameters for faster loading
      // For lightbox, use 1200px width (good for most screens) with WebP format
      return `${url}?w=${width}&q=${quality}&f=webp&auto=compress&dpr=1`;
    }
    return url;
  };

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setImageError(false);
    setImageLoaded(false);
  }, [initialIndex]);
  
  // Reset states when lightbox opens/closes
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [isOpen]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const newIndex = (prev - 1 + images.length) % images.length;
      setImageLoaded(false);
      setImageError(false);
      return newIndex;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = (prev + 1) % images.length;
      setImageLoaded(false);
      setImageError(false);
      return newIndex;
    });
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => {
          const newIndex = (prev - 1 + images.length) % images.length;
          setImageLoaded(false);
          setImageError(false);
          return newIndex;
        });
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => {
          const newIndex = (prev + 1) % images.length;
          setImageLoaded(false);
          setImageError(false);
          return newIndex;
        });
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

  // Preload current image immediately when lightbox opens
  useEffect(() => {
    if (!isOpen || images.length === 0) return;
    
    const currentImage = images[currentIndex];
    if (currentImage?.url) {
      // Preload optimized version immediately
      const optimizedUrl = getOptimizedImageUrl(currentImage.url, 1200, 80);
      const img = new Image();
      img.src = optimizedUrl;
      console.log('ImageLightbox: Preloading current image', optimizedUrl.substring(0, 60));
    }
  }, [isOpen, currentIndex, images]);

  // Preload next and previous images for smoother navigation (with optimized URLs)
  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const preloadImages = [];
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;

    // Preload next image (optimized)
    if (images[nextIndex]?.url) {
      const nextImg = new Image();
      nextImg.src = getOptimizedImageUrl(images[nextIndex].url, 1200, 80);
      preloadImages.push(nextImg);
    }

    // Preload previous image (optimized)
    if (images[prevIndex]?.url) {
      const prevImg = new Image();
      prevImg.src = getOptimizedImageUrl(images[prevIndex].url, 1200, 80);
      preloadImages.push(prevImg);
    }

    return () => {
      // Cleanup if needed
    };
  }, [isOpen, currentIndex, images]);

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('ImageLightbox opened:', { 
        isOpen, 
        imagesLength: images.length, 
        currentIndex, 
        images: images.map(img => ({ url: img.url?.substring(0, 50), alt: img.alt }))
      });
    }
  }, [isOpen, images, currentIndex]);

  if (!isOpen || images.length === 0) {
    console.log('ImageLightbox: Not rendering - isOpen:', isOpen, 'images.length:', images.length);
    return null;
  }

  // Ensure currentIndex is valid
  const validIndex = currentIndex >= 0 && currentIndex < images.length ? currentIndex : 0;
  const currentImage = images[validIndex];
  
  // Safety check
  if (!currentImage || !currentImage.url) {
    console.error('ImageLightbox: Invalid image data', { currentImage, currentIndex, validIndex, images });
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
  
  console.log('ImageLightbox: Rendering image', { validIndex, url: currentImage.url?.substring(0, 50), imageLoaded, imageError });

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
        backdropFilter: 'blur(4px)'
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
          {/* Always show loading or content - never blank */}
          {!imageLoaded && !imageError && (
            <div className="flex flex-col items-center justify-center z-10" style={{ zIndex: 10 }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-white text-sm">Loading image...</p>
            </div>
          )}
          
          {/* Error message container */}
          {imageError && (
            <div className="flex flex-col items-center justify-center z-20 p-8" style={{ zIndex: 20 }}>
              <div className="text-white text-center p-6 bg-black/90 rounded-lg border border-white/20 max-w-md">
                <p className="text-lg mb-2 font-semibold">Failed to load image</p>
                <p className="text-xs text-gray-400 break-all mb-4 font-mono">{currentImage.url}</p>
                <Button
                  variant="outline"
                  className="text-white border-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageError(false);
                    setImageLoaded(false);
                    // Force reload by updating currentIndex slightly
                    const current = currentIndex;
                    setCurrentIndex(-1);
                    setTimeout(() => setCurrentIndex(current), 10);
                  }}
                >
                  Retry Loading
                </Button>
              </div>
            </div>
          )}
          
          {/* Main image - use optimized URL for faster loading */}
          {!imageError && (
            <img
              key={`lightbox-img-${validIndex}`} // Force re-render on index change
              src={getOptimizedImageUrl(currentImage.url, 1200, 80)}
              alt={currentImage.alt || `Image ${validIndex + 1}`}
              className="lightbox-image max-w-full max-h-[90vh] object-contain"
              style={{ 
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out',
                zIndex: 15,
                position: 'relative',
                maxWidth: '100%',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto'
              }}
              onLoad={(e) => {
                console.log('ImageLightbox: Image loaded successfully');
                setImageLoaded(true);
                setImageError(false);
                e.currentTarget.style.opacity = '1';
              }}
              onError={(e) => {
                console.error('ImageLightbox: Image failed to load, trying fallback', currentImage.url);
                // Try fallback to original URL if optimized fails
                if (e.currentTarget.src !== currentImage.url) {
                  e.currentTarget.src = currentImage.url;
                  return;
                }
                setImageError(true);
                setImageLoaded(false);
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
                  setImageLoaded(false);
                  setImageError(false);
                }}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  index === validIndex
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
