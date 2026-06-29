import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CartProvider } from "@/context/CartContext";
import { SearchProvider } from "@/context/SearchContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { CatalogPrefetch } from "@/components/CatalogPrefetch";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";

const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const BrandPage = lazy(() => import("./pages/BrandPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const NewArrivalsPage = lazy(() => import("./pages/NewArrivalsPage"));
const SalePage = lazy(() => import("./pages/SalePage"));
const AccessoriesPage = lazy(() => import("./pages/AccessoriesPage"));
const BuyingGuidePage = lazy(() => import("./pages/BuyingGuidePage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AdminAuthProvider>
      <SearchProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <ScrollToTop />
              <CatalogPrefetch />
              <AnalyticsScripts />
              <CartDrawer />
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/brand/:brand" element={<BrandPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/accessories" element={<AccessoriesPage />} />
              <Route path="/buying-guide" element={<BuyingGuidePage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/new-arrivals" element={<NewArrivalsPage />} />
              <Route path="/sale" element={<SalePage />} />
              
              {/* Legacy routes redirect */}
              <Route path="/running" element={<CategoryPage />} />
              <Route path="/trail" element={<CategoryPage />} />
              <Route path="/gym" element={<CategoryPage />} />
              <Route path="/training" element={<CategoryPage />} />
              <Route path="/basketball" element={<CategoryPage />} />
              <Route path="/tennis" element={<CategoryPage />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminProducts />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/new"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminProductForm />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/edit/:id"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminProductForm />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminOrders />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminMessages />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </SearchProvider>
    </AdminAuthProvider>
    </HelmetProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
