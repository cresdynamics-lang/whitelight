import { useEffect, useState } from "react";
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
import { ShoppingBag, User, Phone, Mail, MapPin, Clock, Package } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Order {
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

interface OrderItem {
  id: number;
  product_name: string;
  product_price: number;
  size: number;
  quantity: number;
  subtotal: number;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getOrders();
      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    }
    setIsLoading(false);
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await apiService.getOrder(orderId.toString());
      if (response.success) {
        setOrderItems(response.data.items);
      }
    } catch (error) {
      toast.error("Failed to fetch order details");
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await apiService.updateOrderStatus(orderId.toString(), newStatus);
      if (response.success) {
        toast.success("Order status updated");
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">
          Manage customer orders and track deliveries
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No orders yet</h3>
            <p className="text-muted-foreground">
              Customer orders will appear here
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
                  selectedOrder?.id === order.id
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => handleSelectOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">#{order.order_number}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      <p className="text-sm font-medium">KSh {order.total_amount.toLocaleString()}</p>
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
                  <CardTitle className="flex items-center justify-between">
                    Order #{selectedOrder.order_number}
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
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
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.customer_phone}</span>
                    </div>
                    {selectedOrder.customer_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedOrder.customer_email}</span>
                      </div>
                    )}
                    {selectedOrder.delivery_address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{selectedOrder.delivery_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(selectedOrder.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>

                  {selectedOrder.order_notes && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Order Notes:</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.order_notes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Order Items</span>
                    </div>
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Size {item.size} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium">
                            KSh {item.subtotal.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t font-semibold">
                      <span>Total:</span>
                      <span>KSh {selectedOrder.total_amount.toLocaleString()}</span>
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