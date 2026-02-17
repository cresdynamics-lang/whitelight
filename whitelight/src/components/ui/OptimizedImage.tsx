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
  const imgRef = useRef<HTMLImageElement>(null);

  const webpSrc = getWebpPath(src);
  const isCdn = src.includes('digitaloceanspaces.com');

  // Ultra-optimized CDN URL with aggressive compression
  const getOptimizedUrl = (width: number, quality: number = 75) => {
    if (isCdn) {
      // Use CDN optimization parameters for fastest loading
      return `${src}?w=${width}&q=${quality}&f=webp&auto=compress`;
    }
    return src;
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

  // Intersection Observer for lazy loading optimization
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
        { rootMargin: '50px' } // Start loading 50px before image enters viewport
      );
      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [loading]);

  const cdnSrcSet = isCdn
    ? [
        `${getOptimizedUrl(300, 70)} 300w`,
        `${getOptimizedUrl(600, 75)} 600w`,
        `${getOptimizedUrl(800, 80)} 800w`,
        `${getOptimizedUrl(1200, 85)} 1200w`
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

  const imgProps = {
    ref: imgRef,
    alt,
    loading: loading === 'eager' ? 'eager' : 'lazy',
    decoding: 'async' as const,
    className: imgClass,
    onLoad: handleLoad,
    onError: () => setHasError(true),
    ...(fetchPriority && { fetchPriority }),
    ...(loading === 'lazy' && !isLoaded && { 'data-src': webpSrc || getOptimizedUrl(600, 75) }),
  };

  if (hasError) {
    return (
      <div className={cn('bg-gray-200 flex items-center justify-center', className)}>
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  // Ultra-lightweight placeholder (1x1 transparent pixel)
  const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';

  return (
    <div 
      className={cn('relative overflow-hidden', className, onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      {/* Minimal placeholder - removed immediately on load */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-100"
          style={{ 
            backgroundImage: `url("${placeholder}")`,
            backgroundSize: 'cover',
            transition: 'opacity 0.1s'
          }}
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
          src={loading === 'eager' ? getOptimizedUrl(600, 80) : placeholder}
          srcSet={cdnSrcSet}
          sizes={sizes}
          {...imgProps}
          style={{ 
            ...imgProps.style,
            contentVisibility: 'auto',
            containIntrinsicSize: '400px 400px'
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
