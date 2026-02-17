import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  /** Use "high" for LCP image (e.g. first hero slide) */
  fetchPriority?: 'high' | 'low' | 'auto';
  objectFit?: 'cover' | 'contain';
  /** Preload image for instant display */
  preload?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/** Local static path that has a generated .webp next to it */
function getWebpPath(path: string): string | null {
  if (!path.startsWith('/')) return null;
  const match = path.match(/\.(png|jpe?g)$/i);
  return match ? path.replace(/\.(png|jpe?g)$/i, '.webp') : null;
}

export function OptimizedImage({
  src,
  alt,
  className,
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fetchPriority,
  objectFit = 'cover',
  preload = false,
  onClick,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const webpSrc = getWebpPath(src);
  const isCdn = src.includes('digitaloceanspaces.com');
  
  // Ultra-lightweight placeholder (1x1 transparent pixel) - defined early to avoid hoisting issues
  const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';

  // Ultra-optimized CDN URL with aggressive compression for fastest loading
  const getOptimizedUrl = (width: number, quality: number = 60) => {
    if (isCdn) {
      // Use CDN optimization parameters for fastest loading
      // Lower quality (60) for faster loading, WebP format, auto compression
      return `${src}?w=${width}&q=${quality}&f=webp&auto=compress&dpr=1`;
    }
    return src;
  };

  // Generate low-quality placeholder URL for blur-up effect
  const getPlaceholderUrl = () => {
    if (isCdn) {
      // Ultra-low quality (20) tiny image for instant blur-up placeholder
      return `${src}?w=40&q=20&f=webp&blur=10`;
    }
    return placeholder; // Use placeholder for non-CDN images
  };

  // Preload critical images
  useEffect(() => {
    if (preload && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = webpSrc || getOptimizedUrl(400, 80);
      if (webpSrc) {
        link.type = 'image/webp';
      }
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [preload, src, webpSrc]);

  // Intersection Observer for lazy loading optimization - start loading earlier
  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '200px' } // Start loading 200px before image enters viewport for faster perceived loading
      );
      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [loading]);

  // Optimized srcset with lower quality for faster loading
  const cdnSrcSet = isCdn
    ? [
        `${getOptimizedUrl(200, 55)} 200w`,
        `${getOptimizedUrl(400, 60)} 400w`,
        `${getOptimizedUrl(600, 65)} 600w`,
        `${getOptimizedUrl(800, 70)} 800w`,
        `${getOptimizedUrl(1200, 75)} 1200w`
      ].join(', ')
    : '';

  const imgClass = cn(
    'w-full h-full transition-opacity duration-200',
    objectFit === 'cover' ? 'object-cover' : 'object-contain',
    isLoaded ? 'opacity-100' : 'opacity-0'
  );

  const handleLoad = () => {
    setIsLoaded(true);
    // Remove placeholder immediately
    if (imgRef.current) {
      imgRef.current.style.backgroundColor = 'transparent';
    }
  };

  // Determine the actual src to use
  const getActualSrc = () => {
    if (loading === 'eager') {
      return isCdn ? getOptimizedUrl(600, 65) : (webpSrc || src);
    }
    // For lazy loading, use placeholder initially, will be replaced by IntersectionObserver
    if (!isLoaded) {
      return getPlaceholderUrl();
    }
    return isCdn ? getOptimizedUrl(600, 65) : (webpSrc || src);
  };

  const imgProps = {
    ref: imgRef,
    alt,
    loading: loading === 'eager' ? 'eager' : 'lazy',
    decoding: 'async' as const,
    className: imgClass,
    onLoad: handleLoad,
    onError: () => setHasError(true),
    ...(fetchPriority && { fetchPriority }),
    ...(loading === 'lazy' && !isLoaded && { 
      'data-src': isCdn ? getOptimizedUrl(600, 65) : (webpSrc || src),
      src: getPlaceholderUrl()
    }),
  };

  if (hasError) {
    return (
      <div className={cn('bg-gray-200 flex items-center justify-center', className)}>
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  // Load blur-up placeholder immediately for CDN images
  useEffect(() => {
    if (isCdn && !isLoaded && !placeholderLoaded) {
      const placeholderImg = new Image();
      placeholderImg.src = getPlaceholderUrl();
      placeholderImg.onload = () => {
        setPlaceholderLoaded(true);
      };
    }
  }, [src, isCdn, isLoaded, placeholderLoaded]);

  return (
    <div 
      className={cn('relative overflow-hidden', className, onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      {/* Blur-up placeholder - shows low-quality version instantly */}
      {!isLoaded && isCdn && placeholderLoaded && (
        <img
          src={getPlaceholderUrl()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            filter: 'blur(10px)',
            transition: 'opacity 0.3s',
            opacity: isLoaded ? 0 : 1,
            transform: 'scale(1.1)'
          }}
          aria-hidden 
        />
      )}
      {/* Fallback placeholder for non-CDN images */}
      {!isLoaded && !isCdn && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse"
          aria-hidden 
        />
      )}
      {webpSrc ? (
        <picture>
          <source 
            type="image/webp" 
            srcSet={isCdn ? cdnSrcSet : webpSrc}
            sizes={sizes}
          />
          <img 
            src={src} 
            srcSet={isCdn ? cdnSrcSet : undefined}
            sizes={sizes}
            {...imgProps}
            style={{ 
              ...imgProps.style,
              contentVisibility: 'auto',
              containIntrinsicSize: '400px 400px'
            }}
          />
        </picture>
      ) : isCdn ? (
        <img
          src={loading === 'eager' ? getOptimizedUrl(600, 65) : (isLoaded ? getOptimizedUrl(600, 65) : getPlaceholderUrl())}
          srcSet={cdnSrcSet}
          sizes={sizes}
          {...imgProps}
          style={{ 
            ...imgProps.style,
            contentVisibility: 'auto',
            containIntrinsicSize: '400px 400px',
            position: 'relative',
            zIndex: 1
          }}
        />
      ) : (
        <img 
          src={src} 
          {...imgProps}
          style={{ 
            ...imgProps.style,
            contentVisibility: 'auto'
          }}
        />
      )}
    </div>
  );
}
