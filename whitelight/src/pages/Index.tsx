import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { BrandHighlightCarousel } from "@/components/sections/BrandHighlightCarousel";
import { CategoryBanner } from "@/components/sections/CategoryBanner";
import { HorizontalProductRow } from "@/components/sections/HorizontalProductRow";
import { useBestSellers, useNewArrivals, useProductsByCategory } from "@/hooks/useProducts";
import { HomePageHead } from "@/components/seo/HomePageHead";

const Index = () => {
  // Key that rotates every 5 minutes to reshuffle "New In"
  const [rotationKey, setRotationKey] = useState(0);

  const { data: bestSellers = [], isLoading: loadingBestSellers, error: bestSellersError } = useBestSellers(12);
  // Fetch full new-arrivals list so the homepage row can pick
  // a changing, randomised subset each time.
  const { data: newArrivals = [], isLoading: loadingNewArrivals, error: newArrivalsError } = useNewArrivals();
  const { data: runningShoes = [], error: runningError } = useProductsByCategory("running");
  const { data: trailShoes = [], error: trailError } = useProductsByCategory("trail");
  const { data: gymShoes = [], error: gymError } = useProductsByCategory("gym");
  const { data: accessories = [], error: accessoriesError } = useProductsByCategory("accessories");
  const { data: basketballShoes = [], error: basketballError } = useProductsByCategory("basketball");

  // Update rotation key every 5 minutes so "New In" reshuffles dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationKey((prev) => prev + 1);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Ensure each product image appears only once across homepage rows,
  // even if a product belongs to multiple categories or collections.
  const {
    uniqueNewArrivals,
    uniqueBestSellers,
    uniqueRunning,
    uniqueTrail,
    uniqueGym,
    uniqueAccessories,
    uniqueBasketball,
  } = useMemo(() => {
    const usedIds = new Set<string>();

    const takeUnique = (products: any[], limit?: number) => {
      const result: any[] = [];
      for (const product of Array.isArray(products) ? products : []) {
        if (!product || !product.id || usedIds.has(product.id)) continue;
        usedIds.add(product.id);
        result.push(product);
        if (limit && result.length >= limit) break;
      }
      return result;
    };

    // Randomise the order of new arrivals so the row feels
    // dynamic; then take a unique subset (max 10 items), and
    // prevent those same products from appearing in later rows.
    const shuffledNewArrivals = Array.isArray(newArrivals)
      ? [...newArrivals].sort(() => Math.random() - 0.5)
      : [];

    const uniqueNewArrivals = takeUnique(shuffledNewArrivals, 10);
    const uniqueBestSellers = takeUnique(bestSellers, 12);
    const uniqueRunning = takeUnique(runningShoes, 12);
    const uniqueTrail = takeUnique(trailShoes, 12);
    const uniqueGym = takeUnique(gymShoes, 12);
    const uniqueAccessories = takeUnique(accessories, 12);
    const uniqueBasketball = takeUnique(basketballShoes, 12);

    return {
      uniqueNewArrivals,
      uniqueBestSellers,
      uniqueRunning,
      uniqueTrail,
      uniqueGym,
      uniqueAccessories,
      uniqueBasketball,
    };
  }, [newArrivals, bestSellers, runningShoes, trailShoes, gymShoes, accessories, basketballShoes, rotationKey]);

  return (
    <div className="min-h-screen flex flex-col">
      <HomePageHead />
      <Header />

      <main className="flex-1">
        {/* Hero carousel: each slide talks about a different Whitelight Store category */}
        <HeroSection />

        {/* Trust strip */}
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

        {/* Category CTA row */}
        <section className="bg-background">
          <div className="container py-6 flex flex-wrap gap-3 md:gap-4">
            <HorizontalProductRow
              title=""
              products={[]}
            />
          </div>
        </section>

        {/* New Arrivals - latest products first, horizontal scroll */}
        <HorizontalProductRow
          title="New In"
          products={uniqueNewArrivals}
          className="bg-secondary/30"
          viewAllHref="/new-arrivals"
          initialDirection="left"
        />

        {/* Brand story carousel using public images */}
        <BrandHighlightCarousel />

        {/* Best Sellers */}
        <HorizontalProductRow
          title="Best Selling"
          products={uniqueBestSellers}
          // Best sellers span all categories; for now, send users to New Arrivals
          // page which highlights the latest catalog across the store.
          viewAllHref="/new-arrivals"
          initialDirection="right"
        />

        {/* Scrolling Category Cards */}
        <CategoryBanner />

        {/* Running Shoes Section */}
        <HorizontalProductRow
          title="Running"
          products={uniqueRunning}
          viewAllHref="/category/running"
          initialDirection="left"
        />

        {/* Trail Shoes Section */}
        <HorizontalProductRow
          title="Trail"
          products={uniqueTrail}
          viewAllHref="/category/trail"
          initialDirection="right"
        />

        {/* Gym Shoes Section */}
        <HorizontalProductRow
          title="Gym"
          products={uniqueGym}
          className="bg-secondary/30"
          viewAllHref="/category/gym"
          initialDirection="left"
        />

        {/* Accessories Section */}
        <HorizontalProductRow
          title="Accessories"
          products={uniqueAccessories}
          viewAllHref="/category/accessories"
          initialDirection="right"
        />

        {/* Basketball Shoes Section */}
        <HorizontalProductRow
          title="Basketball"
          products={uniqueBasketball}
          viewAllHref="/category/basketball"
          initialDirection="left"
        />

        {/* SEO footer paragraph */}
        <section className="border-t border-muted mt-8">
          <div className="container py-8">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              White Light Store is Nairobi&apos;s specialist for{" "}
              <strong>running shoes Nairobi</strong>,{" "}
              <strong>trail shoes Kenya</strong>,{" "}
              <strong>basketball shoes Nairobi</strong> and{" "}
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
