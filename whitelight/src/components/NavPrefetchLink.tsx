import { Link, type LinkProps } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchCatalog } from "@/hooks/useCatalog";

type NavPrefetchLinkProps = LinkProps & React.RefAttributes<HTMLAnchorElement>;

const LEGACY_CATEGORIES = new Set([
  "/running",
  "/trail",
  "/gym",
  "/training",
  "/basketball",
  "/tennis",
]);

function pathFromTo(to: LinkProps["to"]): string {
  if (typeof to === "string") return to.split("?")[0];
  return to.pathname ?? "/";
}

/** Prefetch lazy route chunks on hover / touch for snappier navigation */
function prefetchRoute(path: string) {
  if (path === "/") return;

  if (path.startsWith("/product/")) {
    void import("../pages/ProductDetail");
    return;
  }

  if (path.startsWith("/category/") || LEGACY_CATEGORIES.has(path)) {
    void import("../pages/CategoryPage");
    return;
  }
  if (path.startsWith("/brand/")) {
    void import("../pages/BrandPage");
    return;
  }
  if (path.startsWith("/blog/")) {
    void import("../pages/BlogPostPage");
    return;
  }

  const loaders: Record<string, () => Promise<unknown>> = {
    "/sale": () => import("../pages/SalePage"),
    "/products": () => import("../pages/AllProductsPage"),
    "/blog": () => import("../pages/BlogPage"),
    "/about": () => import("../pages/AboutPage"),
    "/contact": () => import("../pages/ContactPage"),
    "/buying-guide": () => import("../pages/BuyingGuidePage"),
    "/new-arrivals": () => import("../pages/NewArrivalsPage"),
    "/accessories": () => import("../pages/AccessoriesPage"),
    "/terms": () => import("../pages/TermsOfServicePage"),
    "/admin": () => import("../pages/admin/AdminLogin"),
  };

  const load = loaders[path];
  if (load) void load();
}

/** Prefetch catalog + route chunk on hover for instant category navigation */
export function NavPrefetchLink({ onMouseEnter, onFocus, onTouchStart, to, ...props }: NavPrefetchLinkProps) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    void prefetchCatalog(queryClient);
    prefetchRoute(pathFromTo(to));
  };

  return (
    <Link
      to={to}
      onMouseEnter={(e) => {
        prefetch();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        prefetch();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        prefetch();
        onTouchStart?.(e);
      }}
      {...props}
    />
  );
}
