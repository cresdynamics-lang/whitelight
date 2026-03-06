import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

interface HorizontalProductRowProps {
  title: string;
  products: Product[];
  className?: string;
  viewAllHref?: string;
}

export function HorizontalProductRow({ title, products, className, viewAllHref }: HorizontalProductRowProps) {
  const safeProducts = Array.isArray(products)
    ? products.filter((p) => p != null && p.id)
    : [];

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const autoScrollDirectionRef = useRef<1 | -1>(1);

  // Gentle auto-scroll to hint that the row is scrollable.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || userHasInteracted) return;

    const hasOverflow = container.scrollWidth > container.clientWidth + 8;
    if (!hasOverflow) return;

    const speed = 0.5; // pixels per frame

    let frameId: number;
    const step = () => {
      const el = container;
      const dir = autoScrollDirectionRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (maxScroll <= 0) return;

      let next = el.scrollLeft + dir * speed;

      if (next <= 0) {
        next = 0;
        autoScrollDirectionRef.current = 1;
      } else if (next >= maxScroll) {
        next = maxScroll;
        autoScrollDirectionRef.current = -1;
      }

      el.scrollLeft = next;
      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [userHasInteracted, safeProducts.length]);

  const handleUserInteraction = () => {
    if (!userHasInteracted) {
      setUserHasInteracted(true);
    }
  };

  return (
    <section className={cn("py-10 md:py-14", className)}>
      <div className="container">
        <div className="mb-4 md:mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-2xl md:text-3xl font-black bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
            {title.toUpperCase()}
          </h2>
          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="text-sm md:text-base font-medium text-primary underline underline-offset-4 hover:text-primary/80 whitespace-nowrap"
            >
              View all
            </Link>
          )}
        </div>

        <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
          {safeProducts.length > 0 ? (
            <div
              ref={scrollRef}
              className="flex gap-2.5 md:gap-3 overflow-x-auto pb-4 md:pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scroll-smooth"
              onWheel={handleUserInteraction}
              onTouchStart={handleUserInteraction}
              onMouseDown={handleUserInteraction}
            >
              {safeProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-40 sm:w-48 md:w-52 lg:w-56 animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">
              No products available yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

