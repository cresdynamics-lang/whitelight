import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { SEOHead } from "@/components/seo/SEOHead";
import { seoConfig } from "@/config/seo";

const AccessoriesPage = () => {
  const { data: products = [], isLoading, error } = useProducts();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead
          title={seoConfig.pages.accessories.title}
          description={seoConfig.pages.accessories.description}
          keywords={seoConfig.pages.accessories.keywords}
          canonical="https://whitelightstore.co.ke/accessories"
        />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead
          title={seoConfig.pages.accessories.title}
          description={seoConfig.pages.accessories.description}
          keywords={seoConfig.pages.accessories.keywords}
          canonical="https://whitelightstore.co.ke/accessories"
        />
        <Header />
        <main className="flex-1">
          <div className="container py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Shoe Accessories</h1>
              <p className="text-muted-foreground mb-8">
                Unable to load accessories at the moment. Please try again later.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const accessories = Array.isArray(products) ? products.filter(product => product.category === "accessories") : [];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={seoConfig.pages.accessories.title}
        description={seoConfig.pages.accessories.description}
        keywords={seoConfig.pages.accessories.keywords}
        canonical="https://whitelightstore.co.ke/accessories"
        ogImage="/couresel_images/running/running2.webp"
      />
      <Header />
      
      <main className="flex-1">
        <div className="container py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Shoe Accessories</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete your footwear experience with our premium accessories. 
              From care products to comfort enhancers, we have everything you need.
            </p>
          </div>

          {accessories.length > 0 ? (
            <ProductGrid
              title=""
              products={accessories}
              columns={3}
              showTitle={false}
            />
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium mb-2">No accessories available yet</h3>
              <p className="text-muted-foreground">
                Check back soon for our latest accessories collection.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccessoriesPage;