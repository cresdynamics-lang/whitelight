import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PromotionBanner } from "@/components/PromotionBanner";
import { HeroSection } from "@/components/sections/HeroSection";
import { VirtualProductGrid } from "@/components/sections/VirtualProductGrid";
import { CategoryBanner } from "@/components/sections/CategoryBanner";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Newsletter } from "@/components/sections/Newsletter";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { useBestSellers, useNewArrivals } from "@/hooks/useProducts";
import { siteConfig } from "@/config/site";

const Index = () => {
  const { data: bestSellers = [], isLoading: loadingBestSellers } = useBestSellers(4);
  const { data: newArrivals = [], isLoading: loadingNewArrivals } = useNewArrivals(4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PromotionBanner />
      
      <main className="flex-1">
        {/* Hero */}
        <HeroSection />

        {/* Best Sellers */}
        <VirtualProductGrid
          title="Best Selling"
          products={bestSellers}
          columns={4}
          itemsPerPage={8}
        />

        {/* CTA Banner - Time to Move */}
        <CtaBanner />

        {/* Category Banners */}
        <CategoryBanner />

        {/* New Arrivals */}
        <VirtualProductGrid
          title="New In"
          products={newArrivals}
          columns={4}
          className="bg-secondary/30"
          itemsPerPage={8}
        />

        {/* Newsletter */}
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
