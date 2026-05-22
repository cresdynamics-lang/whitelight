import type { Product, CartItem } from "@/types/product";
import { catalogConfig, getProductCanonicalUrl } from "@/config/catalog";
import { sha256Normalized } from "./hash";
import { getMetaCookies, trackMeta } from "./metaPixel";
import { setGoogleUserData, trackGtag } from "./googleTag";
import { isAnalyticsEnabled } from "./config";

const CURRENCY = catalogConfig.currency;

function productToItem(product: Pick<Product, "id" | "name" | "price" | "slug" | "category" | "brand">, quantity = 1) {
  return {
    item_id: product.id,
    item_name: product.name,
    price: product.price,
    quantity,
    item_category: product.category,
    item_brand: product.brand,
  };
}

function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function trackViewContent(product: Product): void {
  if (!isAnalyticsEnabled()) return;

  const url = getProductCanonicalUrl(product.slug, product.url_slug);
  const value = product.price;
  const contentIds = [product.id];

  trackMeta("ViewContent", {
    content_ids: contentIds,
    content_type: "product",
    content_name: product.name,
    value,
    currency: CURRENCY,
  });

  trackGtag("view_item", {
    currency: CURRENCY,
    value,
    items: [productToItem(product)],
  });

  void url;
}

export function trackAddToCart(
  product: Product,
  quantity: number,
  size?: number | string
): void {
  if (!isAnalyticsEnabled()) return;

  const value = product.price * quantity;
  const contentIds = [product.id];

  trackMeta("AddToCart", {
    content_ids: contentIds,
    content_type: "product",
    content_name: product.name,
    value,
    currency: CURRENCY,
    contents: [{ id: product.id, quantity }],
  });

  trackGtag("add_to_cart", {
    currency: CURRENCY,
    value,
    items: [{ ...productToItem(product, quantity), item_variant: size != null ? String(size) : undefined }],
  });
}

export function trackInitiateCheckout(items: CartItem[], total: number): void {
  if (!isAnalyticsEnabled()) return;

  const contentIds = items.map((i) => i.product.id);

  trackMeta("InitiateCheckout", {
    content_ids: contentIds,
    num_items: items.reduce((n, i) => n + i.quantity, 0),
    value: total,
    currency: CURRENCY,
  });

  trackGtag("begin_checkout", {
    currency: CURRENCY,
    value: total,
    items: items.map((i) => productToItem(i.product, i.quantity)),
  });
}

export interface PurchaseTrackingInput {
  items: CartItem[];
  total: number;
  orderNumber?: string;
  email?: string;
  phone?: string;
}

/** Fire once per completed order (WhatsApp / backend). Sends browser + server (CAPI) events. */
export async function trackPurchase(input: PurchaseTrackingInput): Promise<void> {
  if (!isAnalyticsEnabled()) return;

  const { items, total, orderNumber, email, phone } = input;
  const eventId = generateEventId();
  const contentIds = items.map((i) => i.product.id);
  const numItems = items.reduce((n, i) => n + i.quantity, 0);

  trackMeta("Purchase", {
    content_ids: contentIds,
    content_type: "product",
    value: total,
    currency: CURRENCY,
    num_items: numItems,
    order_id: orderNumber,
  });

  if (email || phone) {
    const userData: { email?: string; phone_number?: string } = {};
    if (email) userData.email = await sha256Normalized(email);
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits) userData.phone_number = await sha256Normalized(digits);
    }
    await setGoogleUserData(userData);
  }

  trackGtag("purchase", {
    transaction_id: orderNumber || eventId,
    currency: CURRENCY,
    value: total,
    items: items.map((i) => productToItem(i.product, i.quantity)),
  });

  await sendMetaConversionApi({
    event_name: "Purchase",
    event_id: eventId,
    custom_data: {
      currency: CURRENCY,
      value: total,
      content_ids: contentIds,
      order_id: orderNumber,
      num_items: numItems,
    },
    user_data: {
      email,
      phone,
      client_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    },
  });
}

async function sendMetaConversionApi(body: {
  event_name: string;
  event_id: string;
  custom_data: Record<string, unknown>;
  user_data: {
    email?: string;
    phone?: string;
    client_user_agent?: string;
  };
}): Promise<void> {
  const cookies = getMetaCookies();
  try {
    const res = await fetch("/api/conversions/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        event_source_url: window.location.href,
        user_data: { ...body.user_data, ...cookies },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("[analytics] Meta CAPI:", res.status, err);
    }
  } catch (e) {
    console.warn("[analytics] Meta CAPI unreachable (expected in local dev without Vercel):", e);
  }
}
