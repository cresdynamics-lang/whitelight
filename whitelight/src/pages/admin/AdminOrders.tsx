import { useEffect, useState } from "react";
import {
  fetchOrderItems,
  fetchOrders,
  updateOrderStatus,
  type OrderItemRow,
  type OrderRow,
} from "@/services/orderService";
import { apiService } from "@/services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Package,
  ExternalLink,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { siteConfig } from "@/config/site";

const getDisplaySize = (size: string, productName: string): string => {
  if (
    productName.toLowerCase().includes("wilma") ||
    productName.toLowerCase().includes("hall")
  ) {
    const n = Number(size);
    const sizeMap: Record<number, string> = {
      35: "XS",
      36: "2XL",
      37: "3XL",
      38: "4XL",
      39: "5XL",
      40: "L",
      41: "XL",
      42: "M",
      43: "S",
    };
    return sizeMap[n] || size;
  }
  return size;
};

/** Legacy API order shape (fallback if Supabase orders table missing) */
interface LegacyOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address?: string;
  order_notes?: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface LegacyOrderItem {
  id: number;
  product_name: string;
  product_price: number;
  size: number;
  quantity: number;
  subtotal: number;
}

function normalizeLegacyOrder(o: LegacyOrder): OrderRow {
  return {
    ...o,
    delivery_address: o.delivery_address ?? "",
    delivery_location: "",
    delivery_location_label: "",
    delivery_fee: 0,
    subtotal: o.total_amount,
  };
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useLegacyApi, setUseLegacyApi] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const rows = await fetchOrders();
      setOrders(rows);
      setUseLegacyApi(false);
    } catch (error) {
      console.warn("Supabase orders failed, trying legacy API:", error);
      try {
        const response = await apiService.getOrders();
        if (response.success && (response as { data?: { orders?: LegacyOrder[] } }).data?.orders) {
          const legacy = (response as { data: { orders: LegacyOrder[] } }).data.orders.map(
            normalizeLegacyOrder
          );
          setOrders(legacy);
          setUseLegacyApi(true);
        } else {
          setOrders([]);
        }
      } catch {
        toast.error(
          "Failed to load orders. Run Supabase migration 0006_orders.sql if this is a new setup."
        );
        setOrders([]);
      }
    }
    setIsLoading(false);
  };

  const loadOrderItems = async (orderId: number) => {
    if (useLegacyApi) {
      try {
        const response = await apiService.getOrder(orderId.toString());
        if (response.success && (response as { data?: { items?: LegacyOrderItem[] } }).data?.items) {
          const items = (response as { data: { items: LegacyOrderItem[] } }).data.items;
          setOrderItems(
            items.map((item) => ({
              id: item.id,
              order_id: orderId,
              product_id: "",
              product_name: item.product_name,
              product_price: item.product_price,
              size: String(item.size),
              quantity: item.quantity,
              subtotal: item.subtotal,
            }))
          );
        }
      } catch {
        toast.error("Failed to fetch order details");
      }
      return;
    }

    try {
      const items = await fetchOrderItems(orderId);
      setOrderItems(items);
    } catch {
      toast.error("Failed to fetch order details");
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      if (useLegacyApi) {
        const response = await apiService.updateOrderStatus(orderId.toString(), newStatus);
        if (!response.success) throw new Error("Update failed");
      } else {
        await updateOrderStatus(orderId, newStatus);
      }
      toast.success("Order status updated");
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch {
      toast.error("Failed to update order status");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSelectOrder = (order: OrderRow) => {
    setSelectedOrder(order);
    loadOrderItems(order.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Customer checkout details, delivery location, and product links
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders}>
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No orders yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Orders from checkout will appear here with customer name, phone, delivery
              location, and product links.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {orders.map((order) => (
              <Card
                key={order.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedOrder?.id === order.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleSelectOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-medium">#{order.order_number}</span>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <p className="text-sm font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      {order.delivery_location_label && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Truck className="inline h-3 w-3 mr-1" />
                          {order.delivery_location_label}
                        </p>
                      )}
                      <p className="text-sm font-medium mt-1">
                        {siteConfig.currency} {Number(order.total_amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(order.created_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:sticky lg:top-6 h-fit">
            {selectedOrder ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                    <span>Order #{selectedOrder.order_number}</span>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${selectedOrder.customer_phone}`}
                        className="hover:underline"
                      >
                        {selectedOrder.customer_phone}
                      </a>
                    </div>
                    {selectedOrder.customer_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={`mailto:${selectedOrder.customer_email}`}
                          className="hover:underline break-all"
                        >
                          {selectedOrder.customer_email}
                        </a>
                      </div>
                    )}
                    {selectedOrder.delivery_location_label && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>
                          {selectedOrder.delivery_location_label}
                          {Number(selectedOrder.delivery_fee) > 0 && (
                            <span className="text-muted-foreground">
                              {" "}
                              (+{siteConfig.currency}{" "}
                              {Number(selectedOrder.delivery_fee).toLocaleString()})
                            </span>
                          )}
                          {Number(selectedOrder.delivery_fee) === 0 && (
                            <span className="text-muted-foreground"> (Free delivery)</span>
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span>{selectedOrder.delivery_address}</span>
                    </div>
                    {selectedOrder.payment_method && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Payment: </span>
                        <span className="font-medium capitalize">
                          {selectedOrder.payment_method.replace(/_/g, " ")}
                        </span>
                        {selectedOrder.mpesa_code && (
                          <span className="block text-xs mt-0.5">
                            M-Pesa code:{" "}
                            <span className="font-mono font-semibold">{selectedOrder.mpesa_code}</span>
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      {format(
                        new Date(selectedOrder.created_at),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </div>
                  </div>

                  {selectedOrder.order_notes && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Order notes</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.order_notes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Order items</span>
                    </div>
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-gray-50 rounded-lg space-y-2"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Size {getDisplaySize(item.size, item.product_name)} ×{" "}
                                {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-medium shrink-0">
                              {siteConfig.currency} {Number(item.subtotal).toLocaleString()}
                            </p>
                          </div>
                          {item.reference_link && (
                            <a
                              href={item.reference_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline break-all"
                            >
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              Product link
                            </a>
                          )}
                          {item.product_image && (
                            <a
                              href={item.product_image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline break-all ml-3"
                            >
                              Image
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1 pt-3 mt-3 border-t text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>
                          {siteConfig.currency}{" "}
                          {Number(selectedOrder.subtotal).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery</span>
                        <span>
                          {Number(selectedOrder.delivery_fee) === 0
                            ? "Free"
                            : `${siteConfig.currency} ${Number(selectedOrder.delivery_fee).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold pt-1">
                        <span>Total</span>
                        <span>
                          {siteConfig.currency}{" "}
                          {Number(selectedOrder.total_amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select an order to view details</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
