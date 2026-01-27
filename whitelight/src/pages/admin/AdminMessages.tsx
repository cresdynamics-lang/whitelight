import { useEffect, useState } from "react";
import { apiService } from "@/services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag, Package, Clock, User, Phone, MapPin, ZoomIn } from "lucide-react";
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
  selected_sizes?: number[];
  quantity: number;
  subtotal: number;
  product_image?: string;
  reference_link?: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOrders();
      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: number) => {
    try {
      setIsLoadingItems(true);
      const response = await apiService.getOrder(orderId.toString());
      if (response.success) {
        // Parse selected_sizes JSON strings
        const itemsWithParsedSizes = response.data.items.map(item => ({
          ...item,
          selected_sizes: typeof item.selected_sizes === 'string' 
            ? JSON.parse(item.selected_sizes || '[]')
            : item.selected_sizes || []
        }));
        setOrderItems(itemsWithParsedSizes);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      const response = await apiService.updateOrderStatus(orderId.toString(), newStatus);
      if (response.success) {
        toast.success('Order status updated');
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
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
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

  useEffect(() => {
    fetchOrders();
  }, []);

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
          Manage customer orders and track their status
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
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Package className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.order_number}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_name}
                        </p>
                        <p className="text-sm font-medium">
                          KSh {order.total_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(order.created_at), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
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
                    <span>Order #{selectedOrder.order_number}</span>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
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
                        <span className="text-muted-foreground">Email:</span>
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
                      <h4 className="font-medium mb-2">Order Notes</h4>
                      <p className="text-sm text-muted-foreground">{selectedOrder.order_notes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Order Items</h4>
                    {isLoadingItems ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orderItems.map((item) => (
                          <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            {/* Product Image with Zoom */}
                            <div className="flex-shrink-0">
                              {item.product_image ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <div className="relative cursor-pointer group">
                                      {/* Loading spinner */}
                                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md z-10">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                                      </div>
                                      <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        className="w-16 h-16 object-cover rounded-md border-2 border-gray-200 group-hover:border-primary transition-colors relative z-20"
                                        onLoad={(e) => {
                                          const spinner = e.currentTarget.previousElementSibling;
                                          if (spinner) spinner.style.display = 'none';
                                        }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-md flex items-center justify-center transition-all z-30">
                                        <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[95vh] p-0 overflow-hidden">
                                    <div className="relative min-h-[400px] flex items-center justify-center">
                                      {/* Loading spinner for dialog image */}
                                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                      </div>
                                      <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        className="w-full h-auto max-h-[80vh] object-contain relative z-20"
                                        onLoad={(e) => {
                                          const container = e.currentTarget.parentElement;
                                          const spinner = container?.querySelector('.absolute');
                                          if (spinner) spinner.style.display = 'none';
                                          container?.classList.remove('min-h-[400px]');
                                        }}
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-30">
                                        <h3 className="font-heading text-xl font-bold text-white mb-2">{item.product_name}</h3>
                                        <p className="text-white/90 mb-1">
                                          Sizes: {item.selected_sizes?.join(', ') || item.size} × {item.quantity}
                                        </p>
                                        {item.reference_link && (
                                          <p className="text-xs text-white/70 break-all">
                                            Reference: {item.reference_link}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Sizes: {item.selected_sizes?.join(', ') || item.size} × {item.quantity}
                              </p>
                              {item.reference_link && (
                                <p className="text-xs text-blue-600 truncate" title={item.reference_link}>
                                  Ref: {item.reference_link.split('?')[1] || 'N/A'}
                                </p>
                              )}
                            </div>
                            
                            {/* Price */}
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                KSh {item.subtotal.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t font-semibold">
                          <span>Total</span>
                          <span>KSh {selectedOrder.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
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
