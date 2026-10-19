import { useParams, useLocation, useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/sections/ProductGrid";
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
import {
  countProductsInSize,
  enrichProduct,
  filterByPreferredSize,
  PURPOSE_LABELS,
} from "@/lib/productBlueprint";
import type { ProductPurpose } from "@/types/product";
import { EU_SIZES, useSizePreference } from "@/context/SizePreferenceContext";
import { cn } from "@/lib/utils";

const LEGACY_PATH_TO_CATEGORY: Record<string, ProductCategory> = {
  "/running": "running",
  "/trail": "trail",
  "/gym": "gym",
  "/training": "training",
  "/basketball": "basketball",
  "/tennis": "tennis",
  "/accessories": "accessories",
};

const PURPOSE_CHIPS: Partial<Record<ProductCategory, ProductPurpose[]>> = {
  running: ["race_day", "daily", "long_run"],
  trail: ["trail"],
  gym: ["gym"],
  training: ["gym"],
  basketball: ["court"],
  tennis: ["court"],
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
  const purposeParam = searchParams.get("purpose") as ProductPurpose | null;
  const activeBrand = brandSlug ? getBrandBySlug(brandSlug) : undefined;
  const validCategory =
    (category as ProductCategory) ||
    LEGACY_PATH_TO_CATEGORY[pathname] ||
    ("running" as ProductCategory);
  const { searchQuery, filteredProducts, isSearching } = useSearch();
  const { preferredSize, setPreferredSize } = useSizePreference();

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
    if (purposeParam) {
      list = list.map(enrichProduct).filter((p) => p.purpose === purposeParam);
    }
    list = filterByPreferredSize(list, preferredSize);
    return list;
  })();

  const inSizeCount = countProductsInSize(
    activeBrand ? filterByBrand(products, activeBrand.slug) : products,
    preferredSize
  );
  const purposeChips = PURPOSE_CHIPS[validCategory] || [];

  const h1Title = categoryPageH1[validCategory] || "Best Athletic Shoes in Nairobi";
  const heroSubtext = categoryPageSubtext[validCategory] || "";
  const backgroundImages = categoryImages[validCategory] || [];
  const seoBody = categorySeoContent[validCategory];
  const metaDescription = getCategoryMetaDescription(validCategory);

  const categorySEO = seoConfig.pages[validCategory as keyof typeof seoConfig.pages] || seoConfig.pages.running;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={categorySEO.title}
        description={metaDescription}
        keywords={categorySEO.keywords}
        canonical={`https://whitelightstore.co.ke/${validCategory}`}
        ogImage={backgroundImages[0] ? resolveStaticImage(backgroundImages[0]) : "/whitelight_logo.webp"}
        category={validCategory}
      />
      <Header />

      <main className="flex-1 pb-16 lg:pb-0">
        <section className="border-b border-border bg-sage/40">
          <div className="container py-8 md:py-10">
            <p className="text-xs font-ui text-muted-foreground mb-2">
              Home › {h1Title}
            </p>
            <h1 className="font-heading text-3xl md:text-5xl font-semibold text-forest">
              {h1Title}
              {preferredSize ? ` in your size.` : "."}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground font-ui">
              {displayProducts.length} pairs
              {preferredSize ? ` · in stock in size ${preferredSize}` : ""} · {heroSubtext}
            </p>
            {preferredSize && (
              <p className="mt-1 text-sm font-semibold text-leaf font-ui">
                {inSizeCount} pairs available in size {preferredSize}
              </p>
            )}
          </div>
        </section>

        {isLoading ? (
          <ProductsSkeleton />
        ) : isError ? (
          <CatalogErrorFallback onRetry={() => refetch()} />
        ) : (
          <>
            <div className="sticky top-[7.5rem] z-30 border-b border-border bg-background/95 backdrop-blur">
              <div className="container py-3 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground font-ui">
                    Your size
                  </span>
                  {EU_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPreferredSize(preferredSize === s ? null : s)}
                      className={cn(
                        "h-8 min-w-8 rounded-md border px-2 text-xs font-semibold font-ui",
                        preferredSize === s
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-card"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {purposeChips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground font-ui">
                      Purpose
                    </span>
                    <Link
                      to={`/${validCategory}${brandSlug ? `?brand=${brandSlug}` : ""}`}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium font-ui",
                        !purposeParam ? "bg-forest text-white" : "border border-border"
                      )}
                    >
                      All
                    </Link>
                    {purposeChips.map((p) => (
                      <Link
                        key={p}
                        to={`/${validCategory}?purpose=${p}${brandSlug ? `&brand=${brandSlug}` : ""}`}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium font-ui",
                          purposeParam === p
                            ? "bg-primary text-white"
                            : "border border-border text-muted-foreground"
                        )}
                      >
                        {PURPOSE_LABELS[p]}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground font-ui">
                    Brand
                  </span>
                  <Link
                    to={`/${validCategory}${purposeParam ? `?purpose=${purposeParam}` : ""}`}
                    className={
                      !activeBrand
                        ? "rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background font-ui"
                        : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground font-ui"
                    }
                  >
                    All
                  </Link>
                  {SHOP_BRANDS.map((b) => (
                    <Link
                      key={b.slug}
                      to={`/${validCategory}?brand=${b.slug}${purposeParam ? `&purpose=${purposeParam}` : ""}`}
                      className={
                        activeBrand?.slug === b.slug
                          ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground font-ui"
                          : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground font-ui"
                      }
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <ProductGrid
              products={displayProducts}
              columns={4}
              title=""
              className="pt-4 pb-4"
              enableWhatsAppOrder={false}
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
