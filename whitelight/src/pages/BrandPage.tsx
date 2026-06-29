import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { CatalogErrorFallback } from "@/components/CatalogErrorFallback";
import { ShopByBrand } from "@/components/sections/ShopByBrand";
import { SEOHead } from "@/components/seo/SEOHead";
import { useCatalogByBrand } from "@/hooks/useCatalog";
import { getBrandBySlug, SHOP_BRANDS } from "@/config/brands";
import { siteConfig } from "@/config/site";
import NotFound from "./NotFound";

function ProductsSkeleton() {
  return (
    <div className="container py-12">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-3 aspect-square rounded-lg bg-secondary" />
            <div className="mb-2 h-4 w-1/3 rounded bg-secondary" />
            <div className="mb-2 h-5 w-2/3 rounded bg-secondary" />
            <div className="h-4 w-1/4 rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandPage() {
  const { brand: brandSlug = "" } = useParams<{ brand: string }>();
  const brand = getBrandBySlug(brandSlug);
  const { data: products = [], isLoading, isError, refetch } = useCatalogByBrand(brandSlug);

  if (!brand) {
    return <NotFound />;
  }

  const title = `${brand.name} Shoes Nairobi | ${siteConfig.name}`;
  const description = `${brand.description} Shop ${brand.name} across all categories at ${siteConfig.contact.address}, Nairobi.`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={title}
        description={description}
        keywords={`${brand.name} shoes Nairobi, ${brand.name} running shoes Kenya, ${brand.name} gym shoes`}
        canonical={`https://whitelightstore.co.ke/brand/${brand.slug}`}
        ogImage="/whitelight_logo.webp"
      />
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/20">
          <div className="container py-10 md:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              All categories
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {brand.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
              {brand.description}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Running · Trail · Gym · Training · Basketball · Tennis · Accessories
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {SHOP_BRANDS.map((b) => (
                <Link
                  key={b.slug}
                  to={`/brand/${b.slug}`}
                  className={
                    b.slug === brand.slug
                      ? "rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
                      : "rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  }
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {isLoading ? (
          <ProductsSkeleton />
        ) : isError ? (
          <CatalogErrorFallback onRetry={() => refetch()} />
        ) : (
          <ProductGrid
            products={products}
            columns={4}
            title={
              products.length
                ? `${products.length} ${brand.name} product${products.length === 1 ? "" : "s"}`
                : `No ${brand.name} products right now`
            }
            className="py-8"
          />
        )}

        <ShopByBrand className="border-t" title="More names on our shelves" />
      </main>

      <Footer />
    </div>
  );
}
