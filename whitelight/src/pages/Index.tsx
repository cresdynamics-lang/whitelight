import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VirtualProductGrid } from "@/components/sections/VirtualProductGrid";
import { useBestSellers, useNewArrivals, useProductsByCategory } from "@/hooks/useProducts";
import { HomePageHead } from "@/components/seo/HomePageHead";

const Index = () => {
  const { data: bestSellers = [], isLoading: loadingBestSellers, error: bestSellersError } = useBestSellers(12);
  const { data: newArrivals = [], isLoading: loadingNewArrivals, error: newArrivalsError } = useNewArrivals(12);
  const { data: runningShoes = [], error: runningError } = useProductsByCategory("running");
  const { data: basketballShoes = [], error: basketballError } = useProductsByCategory("basketball");
  const { data: gymShoes = [], error: gymError } = useProductsByCategory("gym");
  const { data: trainingShoes = [], error: trainingError } = useProductsByCategory("training");

  return (
    <div className="min-h-screen flex flex-col">
      <HomePageHead />
      <Header />

      <main className="flex-1">
        {/* Best Sellers */}
        <VirtualProductGrid
          title="Best Selling"
          products={bestSellers}
          columns={4}
          itemsPerPage={12}
        />

        {/* Running Shoes Section */}
        <VirtualProductGrid
          title="Running Shoes"
          products={runningShoes.slice(0, 8)}
          columns={4}
          itemsPerPage={8}
        />

        {/* New Arrivals */}
        <VirtualProductGrid
          title="New In"
          products={newArrivals}
          columns={4}
          className="bg-secondary/30"
          itemsPerPage={12}
        />

        {/* Basketball Shoes Section */}
        <VirtualProductGrid
          title="Basketball Shoes"
          products={basketballShoes.slice(0, 8)}
          columns={4}
          itemsPerPage={8}
        />

        {/* Gym Shoes Section */}
        <VirtualProductGrid
          title="Gym & Training"
          products={gymShoes.slice(0, 8)}
          columns={4}
          className="bg-secondary/30"
          itemsPerPage={8}
        />

        {/* Training Shoes Section */}
        <VirtualProductGrid
          title="Training Shoes"
          products={trainingShoes.slice(0, 8)}
          columns={4}
          itemsPerPage={8}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
