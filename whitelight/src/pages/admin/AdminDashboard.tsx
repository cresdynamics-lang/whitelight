import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productService } from "@/services/productService";
import { contactService } from "@/services/contactService";
import { Package, MessageSquare, TrendingUp, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [products, messages, unreadCount] = await Promise.all([
        productService.getAll(),
        contactService.getAll(),
        contactService.getUnreadCount(),
      ]);

      setStats({
        totalProducts: products.length,
        totalMessages: messages.length,
        unreadMessages: unreadCount,
        totalValue: products.reduce((sum, p) => sum + p.price, 0),
      });
      setIsLoading(false);
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
      title: "Messages",
      value: stats.totalMessages,
      badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} new` : undefined,
      icon: MessageSquare,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
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
      title: "Categories",
      value: 4,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const CardWrapper = stat.link ? Link : "div";
          return (
            <CardWrapper
              key={stat.title}
              to={stat.link || "#"}
              className={stat.link ? "block transition-transform hover:scale-105" : ""}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.badge && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to="/admin/products/new"
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Package className="h-5 w-5 text-primary" />
              <span>Add New Product</span>
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Manage Products</span>
            </Link>
            <Link
              to="/admin/messages"
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>View Messages</span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Data Source</span>
              <span className="font-medium">Local Storage</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">API Status</span>
              <span className="text-amber-500 font-medium">Not Connected</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
