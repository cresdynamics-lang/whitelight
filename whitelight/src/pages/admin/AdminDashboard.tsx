import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminProductsService } from "@/services/adminSupabaseProducts";
import { contactService } from "@/services/contactService";
import { fetchOrders } from "@/services/orderService";
import { buildBrandInventory, formatAdminDate } from "@/lib/adminBrandInventory";
import { SHOP_BRANDS } from "@/config/brands";
import type { Product } from "@/types/product";
import {
  Package,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Tag,
  ExternalLink,
} from "lucide-react";

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalValue: 0,
    onSale: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  const brandInventory = useMemo(() => buildBrandInventory(products), [products]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productList, messages, unreadCount] = await Promise.all([
          adminProductsService.getAll(),
          contactService.getAll(),
          contactService.getUnreadCount(),
        ]);

        setProducts(productList);

        let totalOrders = 0;
        let pendingOrders = 0;
        try {
          const orders = await fetchOrders();
          totalOrders = orders.length;
          pendingOrders = orders.filter((o) => o.status === "pending").length;
        } catch (orderErr) {
          console.warn("Could not load order stats:", orderErr);
        }

        setStats({
          totalProducts: productList.length,
          totalOrders,
          pendingOrders,
          totalMessages: messages.length,
          unreadMessages: unreadCount,
          totalValue: productList.reduce((sum, p) => sum + p.price, 0),
          onSale: productList.filter((p) => p.isOnOffer).length,
        });
        setApiStatus("connected");
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        setApiStatus("disconnected");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/admin/products",
    },
    {
      title: "On Sale",
      value: stats.onSale,
      icon: Tag,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      link: "/admin/products?sale=1",
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : undefined,
      icon: ShoppingBag,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      link: "/admin/orders",
    },
    {
      title: "Contact Messages",
      value: stats.totalMessages,
      badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} new` : undefined,
      icon: MessageSquare,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      link: "/admin/messages",
    },
    {
      title: "Inventory Value",
      value: `KSh ${stats.totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Store Brands",
      value: brandInventory.length,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      link: "/admin/products",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Store overview — products by brand, sale items, and recent updates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => {
          const CardWrapper = stat.link ? Link : "div";
          return (
            <CardWrapper
              key={stat.title}
              to={stat.link || "#"}
              className={stat.link ? "block transition-transform hover:scale-[1.02]" : ""}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {stat.badge}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardWrapper>
          );
        })}
      </div>

      {/* Brand inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Products by Brand</CardTitle>
          <p className="text-sm text-muted-foreground">
            How your catalogue splits across Nike, Adidas, Brooks, and other brands on the
            storefront.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {brandInventory.map((group) => (
              <Link
                key={group.key}
                to={`/admin/products?brand=${group.key}`}
                className="rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{group.label}</h3>
                  <Badge variant="secondary">{group.total}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {group.onSale} on sale
                </p>
                <p className="mt-2 text-[10px] font-medium text-primary">View in admin →</p>
              </Link>
            ))}
          </div>
          {brandInventory.length === 0 && (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Recently updated by brand */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Updated by Brand</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest changes per brand — useful when refreshing Nike, Adidas, Brooks, and other
            shelves.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {brandInventory.map((group) =>
            group.recentlyUpdated.length > 0 ? (
              <div key={group.key}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{group.label}</h3>
                  <Link
                    to={`/admin/products?brand=${group.key}`}
                    className="text-xs text-primary hover:underline"
                  >
                    See all {group.total}
                  </Link>
                </div>
                <div className="space-y-2">
                  {group.recentlyUpdated.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 p-2"
                    >
                      <img
                        src={product.images[0]?.url || "/whitelight_logo.webp"}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Updated {formatAdminDate(product.updatedAt || product.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {product.isOnOffer && (
                          <Badge className="bg-red-600 text-[10px] hover:bg-red-600">Sale</Badge>
                        )}
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="text-muted-foreground hover:text-foreground"
                          title="Edit product"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to="/admin/products/new"
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <Package className="h-5 w-5 text-primary" />
              <span>Add New Product</span>
            </Link>
            <Link
              to="/admin/products?sale=1"
              className="flex items-center gap-3 rounded-lg bg-red-50 p-3 transition-colors hover:bg-red-100 dark:bg-red-950/30"
            >
              <Tag className="h-5 w-5 text-red-600" />
              <span>Manage Sale Products</span>
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Manage All Products</span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span>View Orders</span>
            </Link>
            <Link
              to="/sale"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <ExternalLink className="h-5 w-5 text-primary" />
              <span>Preview Sale Page</span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storefront Brand Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SHOP_BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                to={`/brand/${brand.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
              >
                <span>{brand.name}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
            <Link
              to="/sale"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
            >
              <span>Sale page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
