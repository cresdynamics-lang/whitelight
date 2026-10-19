import { lazy, Suspense, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCatalogPartitions } from "@/hooks/useCatalog";
import { HomePageHead } from "@/components/seo/HomePageHead";
import { CatalogErrorFallback } from "@/components/CatalogErrorFallback";
import { BlueprintHero } from "@/components/sections/home/BlueprintHero";
import { BlueprintPromiseBar } from "@/components/sections/home/BlueprintPromiseBar";
import { BlueprintActivityTiles } from "@/components/sections/home/BlueprintActivityTiles";
import { BlueprintProductRail } from "@/components/sections/home/BlueprintProductRail";

const BlueprintBestsellers = lazy(() =>
  import("@/components/sections/home/BlueprintBestsellers").then((m) => ({
    default: m.BlueprintBestsellers,
  }))
);
const BlueprintAngleViewer = lazy(() =>
  import("@/components/sections/home/BlueprintAngleViewer").then((m) => ({
    default: m.BlueprintAngleViewer,
  }))
);
const BlueprintFindMyPair = lazy(() =>
  import("@/components/sections/home/BlueprintFindMyPair").then((m) => ({
    default: m.BlueprintFindMyPair,
  }))
);
const BlueprintAccessories = lazy(() =>
  import("@/components/sections/home/BlueprintAccessories").then((m) => ({
    default: m.BlueprintAccessories,
  }))
);
const BlueprintSaleStrip = lazy(() =>
  import("@/components/sections/home/BlueprintSaleStrip").then((m) => ({
    default: m.BlueprintSaleStrip,
  }))
);
const BlueprintHowItWorks = lazy(() =>
  import("@/components/sections/home/BlueprintTrustClose").then((m) => ({
    default: m.BlueprintHowItWorks,
  }))
);
const BlueprintReviewsFaq = lazy(() =>
  import("@/components/sections/home/BlueprintTrustClose").then((m) => ({
    default: m.BlueprintReviewsFaq,
  }))
);
const BlueprintVisitUs = lazy(() =>
  import("@/components/sections/home/BlueprintTrustClose").then((m) => ({
    default: m.BlueprintVisitUs,
  }))
);
const BlogUpdatesSection = lazy(() =>
  import("@/components/sections/BlogUpdatesSection").then((m) => ({
    default: m.BlogUpdatesSection,
  }))
);

const Index = () => {
  const { partitions, products, isLoading, isSuccess, isError, error, refetch } =
    useCatalogPartitions();

  const rows = useMemo(() => {
    if (!partitions) return null;
    return {
      all: partitions.all,
      newArrivals: partitions.newArrivals.slice(0, 8),
      bestSellers: partitions.bestSellers.slice(0, 4),
      accessories: partitions.accessories.slice(0, 6),
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
            <Suspense fallback={null}>
              <BlueprintBestsellers products={rows.bestSellers} />
              <BlueprintAngleViewer product={rows.featured} />
              <BlueprintFindMyPair products={rows.all} />
              <BlueprintAccessories products={rows.accessories} shoe={rows.featured} />
              <BlueprintSaleStrip products={rows.all} />
            </Suspense>
          </>
        )}

        <Suspense fallback={null}>
          <BlueprintHowItWorks />
          <BlueprintReviewsFaq />
          <BlogUpdatesSection />
          <BlueprintVisitUs />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
