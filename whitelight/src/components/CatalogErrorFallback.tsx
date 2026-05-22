import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface CatalogErrorFallbackProps {
  onRetry?: () => void;
  message?: string;
}

/** Shown when the product catalog fails to load — rest of site still works */
export function CatalogErrorFallback({
  onRetry,
  message = "We couldn't load products right now. Check your connection and try again.",
}: CatalogErrorFallbackProps) {
  return (
    <>
      <section className="container py-12 text-center">
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{message}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {onRetry && (
            <Button type="button" onClick={onRetry}>
              Retry loading products
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

/** Full-page catalog failure on homepage */
export function HomepageCatalogFallback({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <CatalogErrorFallback onRetry={onRetry} />
      </main>
      <Footer />
    </div>
  );
}
