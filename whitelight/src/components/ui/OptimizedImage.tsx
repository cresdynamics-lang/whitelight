import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { resolveStaticImage } from '@/lib/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  objectFit?: 'cover' | 'contain';
  preload?: boolean;
  onClick?: () => void;
}

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

  const resolvedSrc = src.startsWith('/') ? resolveStaticImage(src) : src;
  const webpSrc = getWebpPath(src) ?? (src.startsWith('/') ? getWebpPath(resolvedSrc) : null);
  const isCdn = src.includes('digitaloceanspaces.com');
  const placeholder =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';

  const getOptimizedUrl = (width: number, quality: number = 60) => {
    if (isCdn) {
      return `${src}?w=${width}&q=${quality}&f=webp&auto=compress&dpr=1`;
    }
    return resolvedSrc;
  };

  const getPlaceholderUrl = () => {
    if (isCdn) {
      return `${src}?w=40&q=20&f=webp&blur=10`;
    }
    return placeholder;
  };

  useEffect(() => {
    if (preload && src && !hasError) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = webpSrc || getOptimizedUrl(400, 80);
      if (webpSrc) link.type = 'image/webp';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [preload, src, webpSrc, hasError]);

  useEffect(() => {
    if (loading === 'lazy' && imgRef.current && !hasError) {
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
        { rootMargin: '200px' }
      );
      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [loading, hasError]);

  useEffect(() => {
    if (!hasError && isCdn && !isLoaded && !placeholderLoaded) {
      const placeholderImg = new Image();
      placeholderImg.src = getPlaceholderUrl();
      placeholderImg.onload = () => setPlaceholderLoaded(true);
    }
  }, [src, isCdn, isLoaded, placeholderLoaded, hasError]);

  const cdnSrcSet = isCdn
    ? [
        `${getOptimizedUrl(200, 55)} 200w`,
        `${getOptimizedUrl(400, 60)} 400w`,
        `${getOptimizedUrl(600, 65)} 600w`,
        `${getOptimizedUrl(800, 70)} 800w`,
        `${getOptimizedUrl(1200, 75)} 1200w`,
      ].join(', ')
    : '';

  const imgClass = cn(
    'w-full h-full transition-opacity duration-200',
    objectFit === 'cover' ? 'object-cover' : 'object-contain',
    isLoaded ? 'opacity-100' : 'opacity-0'
  );

  const handleLoad = () => setIsLoaded(true);

  const imgProps = {
    ref: imgRef,
    alt,
    loading: (loading === 'eager' ? 'eager' : 'lazy') as 'eager' | 'lazy',
    decoding: 'async' as const,
    className: imgClass,
    onLoad: handleLoad,
    onError: () => setHasError(true),
    ...(fetchPriority && { fetchPriority }),
    ...(loading === 'lazy' &&
      !isLoaded &&
      !hasError && {
        'data-src': isCdn ? getOptimizedUrl(600, 65) : (webpSrc || resolvedSrc),
        src: getPlaceholderUrl(),
      }),
  };

  if (hasError) {
    return (
      <div className={cn('bg-gray-200 flex items-center justify-center', className)}>
        <img
          src="/whitelight_logo.webp"
          alt=""
          className="h-1/2 w-1/2 object-contain opacity-40"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', className, onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      {!isLoaded && isCdn && placeholderLoaded && (
        <img
          src={getPlaceholderUrl()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(10px)', transform: 'scale(1.1)' }}
          aria-hidden
        />
      )}
      {!isLoaded && !isCdn && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" aria-hidden />
      )}
      {webpSrc && !isCdn ? (
        <picture>
          <source type="image/webp" srcSet={webpSrc} sizes={sizes} />
          <img src={resolvedSrc} sizes={sizes} {...imgProps} />
        </picture>
      ) : isCdn ? (
        <img
          src={
            loading === 'eager'
              ? getOptimizedUrl(600, 65)
              : isLoaded
                ? getOptimizedUrl(600, 65)
                : getPlaceholderUrl()
          }
          srcSet={cdnSrcSet}
          sizes={sizes}
          {...imgProps}
        />
      ) : (
        <img src={resolvedSrc} {...imgProps} />
      )}
    </div>
  );
}
