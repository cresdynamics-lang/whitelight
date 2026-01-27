import { useMemo, useState, useEffect } from 'react';
import type { Product } from '@/types/product';
import { ProductCard } from '@/components/ProductCard';
import { cn } from '@/lib/utils';
import { useLazyLoading } from '@/hooks/useLazyLoading';

interface VirtualProductGridProps {
  title?: string;
  products: Product[];
  columns?: 2 | 3 | 4;
  className?: string;
  itemsPerPage?: number;
}

export function VirtualProductGrid({
  title,
  products,
  columns = 4,
  className,
  itemsPerPage = 12,
}: VirtualProductGridProps) {
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const { ref, isVisible } = useLazyLoading();

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  const visibleProducts = useMemo(() => 
    products.slice(0, visibleItems), 
    [products, visibleItems]
  );

  const hasMore = visibleItems < products.length;

  useEffect(() => {
    if (isVisible && hasMore) {
      setVisibleItems(prev => Math.min(prev + itemsPerPage, products.length));
    }
  }, [isVisible, hasMore, itemsPerPage, products.length]);

  return (
    <section className={cn('py-12 md:py-16', className)}>
      <div className="container">
        {title && (
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-12 text-center bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
            {title.toUpperCase()}
          </h2>
        )}
        
        <div className={cn('grid gap-6 md:gap-8', gridCols[columns])}>
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Loading trigger */}
        {hasMore && (
          <div ref={ref} className="h-20 flex items-center justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        )}
      </div>
    </section>
  );
}