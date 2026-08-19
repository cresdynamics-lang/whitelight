import { apiFetch, getAdminToken } from "@/lib/apiClient";

export interface CreateOrderItemInput {
  productId: string;
  productSlug?: string;
  productName: string;
  productPrice: number;
  size: number | string;
  quantity: number;
  productImage?: string;
  referenceLink?: string;
  selectedSizes?: (number | string)[];
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryLocation: string;
  deliveryLocationLabel: string;
  deliveryFee: number;
  subtotal: number;
  totalAmount: number;
  orderNotes?: string;
  paymentMethod: string;
  mpesaCode?: string;
  items: CreateOrderItemInput[];
}

export interface OrderRow {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_address: string;
  delivery_location: string;
  delivery_location_label: string;
  delivery_fee: number;
  subtotal: number;
  total_amount: number;
  order_notes?: string | null;
  payment_method?: string | null;
  mpesa_code?: string | null;
  status: string;
  created_at: string;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: string;
  product_slug?: string | null;
  product_name: string;
  product_price: number;
  size: string;
  quantity: number;
  subtotal: number;
  product_image?: string | null;
  reference_link?: string | null;
  selected_sizes?: unknown;
}

export async function createStoreOrder(
  input: CreateOrderInput
): Promise<{ id: number; orderNumber: string }> {
  return apiFetch<{ id: number; orderNumber: string }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchOrders(): Promise<OrderRow[]> {
  const data = await apiFetch<{ orders: OrderRow[] }>("/api/admin/orders", {
    token: getAdminToken(),
  });
  return data.orders || [];
}

export async function fetchOrderItems(orderId: number): Promise<OrderItemRow[]> {
  const data = await apiFetch<{ items: OrderItemRow[] }>("/api/admin/orders", {
    token: getAdminToken(),
  });
  return (data.items || []).filter((i) => Number(i.order_id) === orderId);
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  throw new Error(
    `Order status updates not yet exposed via API (order ${orderId} → ${status})`
  );
}
