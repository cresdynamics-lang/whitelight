import { useParams, useLocation, useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { useCatalogByCategory } from "@/hooks/useCatalog";
import { CatalogErrorFallback } from "@/components/CatalogErrorFallback";
import { resolveStaticImage } from "@/lib/imageUtils";
import { useSearch } from "@/context/SearchContext";
import type { ProductCategory } from "@/types/product";
import { SEOHead } from "@/components/seo/SEOHead";
import { SeoContentSections } from "@/components/seo/SeoContentSections";
import { seoConfig, categoryPageH1, categoryPageSubtext } from "@/config/seo";
import { categorySeoContent, getCategoryMetaDescription } from "@/config/categorySeoContent";
import { SHOP_BRANDS, getBrandBySlug } from "@/config/brands";
import { filterByBrand } from "@/lib/products";

const LEGACY_PATH_TO_CATEGORY: Record<string, ProductCategory> = {
  "/running": "running",
  "/trail": "trail",
  "/gym": "gym",
  "/training": "training",
  "/basketball": "basketball",
  "/tennis": "tennis",
};

const categoryImages: Record<ProductCategory, string[]> = {
  running: [
    "/couresel_images/running/running2.webp",
    "/couresel_images/running/running3.webp",
    "/couresel_images/running/running4.webp",
    "/couresel_images/running/running5.webp",
    "/couresel_images/running/running6.webp",
  ],
  trail: [
    "/couresel_images/trail/trail1.webp",
    "/couresel_images/trail/trail2.webp",
    "/couresel_images/trail/trail3.webp",
    "/couresel_images/trail/trail4.webp",
  ],
  gym: [
    "/couresel_images/gym/gym.webp",
    "/couresel_images/gym/gym1.webp",
    "/couresel_images/gym/gym3.webp",
    "/couresel_images/gym/gym4.webp",
    "/couresel_images/gym/gym5.webp",
    "/couresel_images/gym/gym6.webp",
  ],
  basketball: [
    "/couresel_images/basketball/bk1.webp",
    "/couresel_images/basketball/bk2.webp",
    "/couresel_images/basketball/bk3.webp",
    "/couresel_images/basketball/bk5.webp",
  ],
  tennis: [
    "/couresel_images/basketball/bk2.webp",
    "/couresel_images/basketball/bk3.webp",
    "/couresel_images/gym/gym.webp",
    "/couresel_images/running/running2.webp",
  ],
  training: [
    "/couresel_images/gym/gym.webp",
    "/couresel_images/gym/gym1.webp",
    "/couresel_images/gym/gym3.webp",
    "/couresel_images/gym/gym4.webp",
  ],
  accessories: [
    "/couresel_images/running/running2.webp",
    "/couresel_images/gym/gym.webp",
    "/guide_images/guide5.webp",
  ],
};

function ProductsSkeleton() {
  return (
    <div className="container py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-secondary rounded-lg mb-3" />
            <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
            <div className="h-5 bg-secondary rounded w-2/3 mb-2" />
            <div className="h-4 bg-secondary rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const brandSlug = searchParams.get("brand") ?? "";
  const activeBrand = brandSlug ? getBrandBySlug(brandSlug) : undefined;
  const validCategory =
    (category as ProductCategory) ||
    LEGACY_PATH_TO_CATEGORY[pathname] ||
    ("running" as ProductCategory);
  const { searchQuery, filteredProducts, isSearching } = useSearch();

  const { data: products = [], isLoading, isError, refetch } = useCatalogByCategory(validCategory);

  const displayProducts = (() => {
    let list =
      isSearching && searchQuery
        ? filteredProducts.filter(
            (p) =>
              p.category === validCategory ||
              (Array.isArray(p.categories) && p.categories.includes(validCategory))
          )
        : products;

    if (activeBrand) {
      list = filterByBrand(list, activeBrand.slug);
    }
    return list;
  })();

  const h1Title = categoryPageH1[validCategory] || "Best Athletic Shoes in Nairobi";
  const heroSubtext = categoryPageSubtext[validCategory] || "";
  const backgroundImages = categoryImages[validCategory] || [];
  const seoBody = categorySeoContent[validCategory];
  const metaDescription = getCategoryMetaDescription(validCategory);

  const categorySEO = seoConfig.pages[validCategory as keyof typeof seoConfig.pages] || seoConfig.pages.running;

  const carouselImages = backgroundImages.map((url, index) => ({
    url: resolveStaticImage(url),
    alt_text: `${h1Title} — image ${index + 1}`,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={categorySEO.title}
        description={metaDescription}
        keywords={categorySEO.keywords}
        canonical={`https://whitelightstore.co.ke/category/${validCategory}`}
        ogImage={backgroundImages[0] ? resolveStaticImage(backgroundImages[0]) : "/whitelight_logo.webp"}
        category={validCategory}
      />
      <Header />

      <main className="flex-1">
        {/* Hero carousel */}
        <section className="relative py-20 overflow-hidden min-h-[280px]">
          <div className="absolute inset-0">
            <ImageCarousel
              images={carouselImages}
              className="w-full h-full"
              showControls={false}
              showDots={true}
              autoPlay={true}
              interval={5000}
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>
          <div className="container relative z-10 text-center">
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              {h1Title}
            </h1>
            <p className="text-white/90 font-body text-lg md:text-xl max-w-2xl mx-auto font-semibold">
              {heroSubtext}
            </p>
            {isSearching && searchQuery && (
              <p className="text-white/80 text-lg mt-4">
                Showing results for &quot;{searchQuery}&quot; in {h1Title}
              </p>
            )}
          </div>
        </section>

        {/* Products immediately after carousel */}
        {isLoading ? (
          <ProductsSkeleton />
        ) : isError ? (
          <CatalogErrorFallback onRetry={() => refetch()} />
        ) : (
          <>
            <div className="container pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Brand
                </span>
                <Link
                  to={`/category/${validCategory}`}
                  className={
                    !activeBrand
                      ? "rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background"
                      : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  }
                >
                  All
                </Link>
                {SHOP_BRANDS.map((b) => (
                  <Link
                    key={b.slug}
                    to={`/category/${validCategory}?brand=${b.slug}`}
                    className={
                      activeBrand?.slug === b.slug
                        ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                        : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }
                  >
                    {b.name}
                  </Link>
                ))}
                {activeBrand && (
                  <Link
                    to={`/brand/${activeBrand.slug}`}
                    className="ml-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    View all {activeBrand.name} →
                  </Link>
                )}
              </div>
            </div>
            <ProductGrid
              products={displayProducts}
              columns={4}
              title={
                activeBrand
                  ? `${activeBrand.name} in ${h1Title}`
                  : isSearching && searchQuery
                    ? `Search in ${h1Title}`
                    : "Shop Now"
              }
              className="pt-4 pb-4"
            />
          </>
        )}

        {/* SEO sections below products */}
        {seoBody && (
          <section className="bg-secondary/20 border-t border-border">
            <div className="container py-10 md:py-14 max-w-4xl">
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-foreground">
                Why Shop {h1Title} at White Light Store
              </h2>
              <SeoContentSections content={seoBody} />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
