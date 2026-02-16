import { useState } from 'react';
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
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const webpSrc = getWebpPath(src);
  const isCdn = src.includes('digitaloceanspaces.com');

  const getOptimizedUrl = (width: number) => {
    if (isCdn) return `${src}?w=${width}&q=80&f=webp`;
    return src;
  };

  const cdnSrcSet = isCdn
    ? [`${getOptimizedUrl(400)} 400w`, `${getOptimizedUrl(800)} 800w`, `${getOptimizedUrl(1200)} 1200w`].join(', ')
    : '';

  const imgClass = cn(
    'w-full h-full transition-opacity duration-300',
    objectFit === 'cover' ? 'object-cover' : 'object-contain',
    isLoaded ? 'opacity-100' : 'opacity-0'
  );

  const imgProps = {
    alt,
    loading,
    decoding: 'async' as const,
    className: imgClass,
    onLoad: () => setIsLoaded(true),
    onError: () => setHasError(true),
    ...(fetchPriority && { fetchPriority }),
  };

  if (hasError) {
    return (
      <div className={cn('bg-gray-200 flex items-center justify-center', className)}>
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse min-h-[80px]" aria-hidden />
      )}
      {webpSrc ? (
        <picture>
          <source type="image/webp" src={webpSrc} />
          <img src={src} {...imgProps} />
        </picture>
      ) : isCdn ? (
        <img
          src={getOptimizedUrl(800)}
          srcSet={cdnSrcSet}
          sizes={sizes}
          {...imgProps}
        />
      ) : (
        <img src={src} {...imgProps} />
      )}
    </div>
  );
}
