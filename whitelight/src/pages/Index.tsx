import { useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCatalogPartitions } from "@/hooks/useCatalog";
import { HomePageHead } from "@/components/seo/HomePageHead";
import { CatalogErrorFallback } from "@/components/CatalogErrorFallback";
import { BlueprintHero } from "@/components/sections/home/BlueprintHero";
import { BlueprintPromiseBar } from "@/components/sections/home/BlueprintPromiseBar";
import { BlueprintActivityTiles } from "@/components/sections/home/BlueprintActivityTiles";
import { BlueprintProductRail } from "@/components/sections/home/BlueprintProductRail";
import { BlueprintBestsellers } from "@/components/sections/home/BlueprintBestsellers";
import { BlueprintAngleViewer } from "@/components/sections/home/BlueprintAngleViewer";
import { BlueprintFindMyPair } from "@/components/sections/home/BlueprintFindMyPair";
import { BlueprintAccessories } from "@/components/sections/home/BlueprintAccessories";
import { BlueprintSaleStrip } from "@/components/sections/home/BlueprintSaleStrip";
import {
  BlueprintHowItWorks,
  BlueprintReviewsFaq,
  BlueprintVisitUs,
} from "@/components/sections/home/BlueprintTrustClose";
import { BlogUpdatesSection } from "@/components/sections/BlogUpdatesSection";

const Index = () => {
  const { partitions, products, isLoading, isSuccess, isError, error, refetch } =
    useCatalogPartitions();

  const rows = useMemo(() => {
    if (!partitions) return null;
    return {
      all: partitions.all,
      newArrivals: partitions.newArrivals.slice(0, 12),
      bestSellers: partitions.bestSellers.slice(0, 4),
      accessories: partitions.accessories,
      featured: partitions.bestSellers[0] || partitions.newArrivals[0] || partitions.all[0],
    };
  }, [partitions]);

  return (
    <div className="wh-home min-h-screen flex flex-col pb-14 lg:pb-0">
      <HomePageHead />
      <Header />

      <main className="flex-1">
        <BlueprintHero products={products} />
        <BlueprintPromiseBar />
        <BlueprintActivityTiles products={products} />

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

        {isLoading && (
          <div className="container py-12 animate-pulse space-y-4" aria-hidden>
            <div className="h-8 w-48 bg-secondary rounded" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 w-48 shrink-0 bg-secondary rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {isSuccess && rows && (
          <>
            <BlueprintProductRail
              title="Just landed."
              subtitle="Updated daily · newest first · sizes on every card"
              products={rows.newArrivals}
              viewAllHref="/new"
              viewAllLabel="See all new →"
            />
            <BlueprintBestsellers products={rows.bestSellers} />
            <BlueprintAngleViewer product={rows.featured} />
            <BlueprintFindMyPair products={rows.all} />
            <BlueprintAccessories products={rows.accessories} shoe={rows.featured} />
            <BlueprintSaleStrip products={rows.all} />
          </>
        )}

        <BlueprintHowItWorks />
        <BlueprintReviewsFaq />
        <BlogUpdatesSection />
        <BlueprintVisitUs />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
