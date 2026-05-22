import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { BrandHighlightCarousel } from "@/components/sections/BrandHighlightCarousel";
import { CategoryBanner } from "@/components/sections/CategoryBanner";
import { HorizontalProductRow } from "@/components/sections/HorizontalProductRow";
import { useCatalogPartitions } from "@/hooks/useCatalog";
import { HomePageHead } from "@/components/seo/HomePageHead";
import { CatalogErrorFallback } from "@/components/CatalogErrorFallback";
import type { Product } from "@/types/product";

function ProductRowsSkeleton() {
  return (
    <div className="container py-8 space-y-10" aria-hidden>
      {[1, 2, 3].map((row) => (
        <div key={row}>
          <div className="h-8 w-40 bg-secondary rounded mb-4 animate-pulse" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-32 aspect-square rounded-lg bg-secondary animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const Index = () => {
  const [rotationKey, setRotationKey] = useState(0);
  const { partitions, isLoading, isSuccess, isError, error, refetch } = useCatalogPartitions();

  useEffect(() => {
    const interval = setInterval(() => {
      setRotationKey((prev) => prev + 1);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const rows = useMemo(() => {
    if (!partitions) return null;

    const {
      newArrivals,
      bestSellers,
      running,
      trail,
      gym,
      accessories,
      basketball,
      tennis,
    } = partitions;

    const usedIds = new Set<string>();

    const takeUnique = (products: Product[], limit?: number) => {
      const result: Product[] = [];
      for (const product of products) {
        if (!product?.id || usedIds.has(product.id)) continue;
        usedIds.add(product.id);
        result.push(product);
        if (limit && result.length >= limit) break;
      }
      return result;
    };

    const shuffledNew = [...newArrivals].sort(() => Math.random() - 0.5);

    return {
      uniqueNewArrivals: takeUnique(shuffledNew, 10),
      uniqueBestSellers: takeUnique(bestSellers, 12),
      uniqueRunning: takeUnique(running, 12),
      uniqueTrail: takeUnique(trail, 12),
      uniqueGym: takeUnique(gym, 12),
      uniqueAccessories: takeUnique(accessories, 12),
      uniqueBasketball: takeUnique(basketball, 12),
      uniqueTennis: takeUnique(tennis, 12),
    };
  }, [partitions, rotationKey]);

  const showProducts = isSuccess && rows;

  return (
    <div className="min-h-screen flex flex-col">
      <HomePageHead />
      <Header />

      <main className="flex-1">
        <HeroSection />

        <section className="border-b border-muted/40 bg-background/80">
          <div className="container py-3 flex flex-row flex-wrap items-center justify-center md:justify-between gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span>Fast Nairobi delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Genuine performance brands</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Order via WhatsApp or checkout</span>
            </div>
          </div>
        </section>

        {isLoading && <ProductRowsSkeleton />}

        {isError && !isLoading && (
          <CatalogErrorFallback
            onRetry={() => refetch()}
            message={
              error instanceof Error
                ? `Products unavailable: ${error.message}`
                : "Products unavailable. Please retry."
            }
          />
        )}

        {showProducts && (
          <>
            <HorizontalProductRow
              title="New In"
              products={rows.uniqueNewArrivals}
              className="bg-secondary/30"
              viewAllHref="/new-arrivals"
              initialDirection="left"
            />

            <BrandHighlightCarousel />

            <HorizontalProductRow
              title="Best Selling"
              products={rows.uniqueBestSellers}
              viewAllHref="/new-arrivals"
              initialDirection="right"
            />

            <CategoryBanner />

            <HorizontalProductRow
              title="Running"
              products={rows.uniqueRunning}
              viewAllHref="/category/running"
              initialDirection="left"
            />

            <HorizontalProductRow
              title="Trail"
              products={rows.uniqueTrail}
              viewAllHref="/category/trail"
              initialDirection="right"
            />

            <HorizontalProductRow
              title="Gym"
              products={rows.uniqueGym}
              className="bg-secondary/30"
              viewAllHref="/category/gym"
              initialDirection="left"
            />

            <HorizontalProductRow
              title="Accessories"
              products={rows.uniqueAccessories}
              viewAllHref="/category/accessories"
              initialDirection="right"
            />

            <HorizontalProductRow
              title="Basketball"
              products={rows.uniqueBasketball}
              viewAllHref="/category/basketball"
              initialDirection="left"
            />

            <HorizontalProductRow
              title="Tennis"
              products={rows.uniqueTennis}
              className="bg-secondary/30"
              viewAllHref="/category/tennis"
              initialDirection="right"
            />
          </>
        )}

        <section className="border-t border-muted mt-8">
          <div className="container py-8">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              White Light Store is Nairobi&apos;s specialist for{" "}
              <strong>running shoes Nairobi</strong>,{" "}
              <strong>trail shoes Kenya</strong>,{" "}
              <strong>basketball shoes Nairobi</strong>,{" "}
              <strong>tennis shoes Kenya</strong> and{" "}
              <strong>gym shoes Kenya</strong>. We stock performance models from Nike, Adidas, HOKA,
              ASICS, New Balance and more, fitted for Kenyan runners and athletes. Order your next
              pair online or via WhatsApp for fast delivery across Nairobi and shipping to the rest
              of Kenya.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
