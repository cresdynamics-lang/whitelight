import { useEffect, useRef } from "react";
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
  const autoScrollDirectionRef = useRef<1 | -1>(1);
  const pauseUntilRef = useRef(0);

  // Continuous auto-scroll (left <-> right) to keep rows active.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth + 8;
    if (!hasOverflow) return;

    const speed = 0.6; // pixels per frame

    let frameId: number;
    const step = () => {
      const el = container;
      const now = Date.now();

      // Briefly pause after user interaction, then continue.
      if (now < pauseUntilRef.current) {
        frameId = window.requestAnimationFrame(step);
        return;
      }

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
  }, [safeProducts.length]);

  const handleUserInteraction = () => {
    pauseUntilRef.current = Date.now() + 2500;
  };

  // If there are no products for this row, skip rendering the section
  if (safeProducts.length === 0) {
    return null;
  }

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
                className="flex-shrink-0 w-[22vw] min-w-[5.2rem] max-w-[6.4rem] sm:w-32 sm:min-w-32 sm:max-w-32 md:w-44 md:min-w-44 md:max-w-44 lg:w-52 lg:min-w-52 lg:max-w-52 animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

