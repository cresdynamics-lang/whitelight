import { supabase } from "@/lib/supabaseClient";

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

function ensureSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
}

export async function createStoreOrder(
  input: CreateOrderInput
): Promise<{ id: number; orderNumber: string }> {
  ensureSupabase();

  const itemsPayload = input.items.map((item) => ({
    productId: item.productId,
    productSlug: item.productSlug ?? item.productId,
    productName: item.productName,
    productPrice: item.productPrice,
    size: String(item.size),
    quantity: item.quantity,
    subtotal: item.productPrice * item.quantity,
    productImage: item.productImage ?? null,
    referenceLink: item.referenceLink ?? null,
    selectedSizes: item.selectedSizes ?? null,
  }));

  const { data, error } = await supabase!.rpc("create_store_order", {
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
    p_customer_email: input.customerEmail ?? null,
    p_delivery_address: input.deliveryAddress,
    p_delivery_location: input.deliveryLocation,
    p_delivery_location_label: input.deliveryLocationLabel,
    p_delivery_fee: input.deliveryFee,
    p_subtotal: input.subtotal,
    p_total_amount: input.totalAmount,
    p_order_notes: input.orderNotes ?? null,
    p_payment_method: input.paymentMethod,
    p_mpesa_code: input.mpesaCode?.trim() || null,
    p_items: itemsPayload,
  });

  if (error) {
    console.error("create_store_order error:", error);
    throw new Error(error.message || "Failed to save order");
  }

  const result = data as { id?: number; order_number?: string } | null;
  if (!result?.order_number) {
    throw new Error("Order was not created");
  }

  return {
    id: Number(result.id),
    orderNumber: result.order_number,
  };
}

export async function fetchOrders(): Promise<OrderRow[]> {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to load orders");
  }

  return (data ?? []) as OrderRow[];
}

export async function fetchOrderItems(orderId: number): Promise<OrderItemRow[]> {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message || "Failed to load order items");
  }

  return (data ?? []) as OrderItemRow[];
}

export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<void> {
  ensureSupabase();

  const { error } = await supabase!
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message || "Failed to update order status");
  }
}
