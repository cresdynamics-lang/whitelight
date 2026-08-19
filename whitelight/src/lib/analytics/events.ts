import type { Product, CartItem } from "@/types/product";
import { catalogConfig, getProductCanonicalUrl } from "@/config/catalog";
import { sha256Normalized } from "./hash";
import { getMetaCookies, trackMeta } from "./metaPixel";
import { setGoogleUserData, trackGtag } from "./googleTag";
import { isAnalyticsEnabled } from "./config";

const CURRENCY = catalogConfig.currency;

function productToItem(
  product: Pick<Product, "id" | "name" | "price" | "slug" | "category" | "brand">,
  quantity = 1
) {
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

async function sendMetaConversionApi(body: {
  event_name: string;
  event_id: string;
  custom_data: Record<string, unknown>;
  user_data?: {
    email?: string;
    phone?: string;
    client_user_agent?: string;
  };
}): Promise<void> {
  if (typeof window === "undefined") return;
  const cookies = getMetaCookies();
  try {
    const res = await fetch("/api/conversions/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        event_source_url: window.location.href,
        action_source: "website",
        user_data: {
          ...(body.user_data || {}),
          ...cookies,
          client_user_agent: body.user_data?.client_user_agent || navigator.userAgent,
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("[analytics] Meta CAPI:", res.status, err);
    }
  } catch (e) {
    console.warn("[analytics] Meta CAPI unreachable:", e);
  }
}

export function trackMetaEvent(
  eventName: string,
  params: Record<string, unknown> = {},
  eventId = generateEventId()
): void {
  if (!isAnalyticsEnabled() || typeof window === "undefined") return;

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && !(typeof value === "string" && value.trim() === "")
    )
  );

  trackMeta(eventName, cleanParams, eventId);

  void sendMetaConversionApi({
    event_name: eventName,
    event_id: eventId,
    custom_data: cleanParams,
  });
}

export function trackViewContent(product: Product): void {
  if (!isAnalyticsEnabled()) return;

  const eventId = generateEventId();
  const value = product.price;
  const contentIds = [product.id];
  void getProductCanonicalUrl(product.slug, product.url_slug);

  trackMeta(
    "ViewContent",
    {
      content_ids: contentIds,
      content_type: "product",
      content_name: product.name,
      value,
      currency: CURRENCY,
    },
    eventId
  );

  trackGtag("view_item", {
    currency: CURRENCY,
    value,
    items: [productToItem(product)],
  });

  void sendMetaConversionApi({
    event_name: "ViewContent",
    event_id: eventId,
    custom_data: {
      currency: CURRENCY,
      value,
      content_ids: contentIds,
      content_type: "product",
      content_name: product.name,
    },
  });
}

export function trackSearch(searchQuery: string): void {
  const trimmed = searchQuery.trim();
  if (!trimmed) return;

  trackMetaEvent("Search", {
    search_string: trimmed,
    content_category: "product_search",
    content_type: "product",
  });
}

export function trackAddToWishlist(product: Product): void {
  if (!isAnalyticsEnabled()) return;

  trackMetaEvent("AddToWishlist", {
    content_ids: [product.id],
    content_type: "product",
    content_name: product.name,
    value: product.price,
    currency: CURRENCY,
  });
}

export function trackContact(): void {
  trackMetaEvent("Contact", {
    content_name: "Contact Form",
    content_category: "lead",
  });
}

export function trackFindLocation(): void {
  trackMetaEvent("FindLocation", {
    content_name: "Store Location",
    content_category: "physical_store",
    value: 0,
    currency: CURRENCY,
  });
}

export function trackAddToCart(
  product: Product,
  quantity: number,
  size?: number | string
): void {
  if (!isAnalyticsEnabled()) return;

  const eventId = generateEventId();
  const value = product.price * quantity;
  const contentIds = [product.id];

  trackMeta(
    "AddToCart",
    {
      content_ids: contentIds,
      content_type: "product",
      content_name: product.name,
      value,
      currency: CURRENCY,
      contents: [{ id: product.id, quantity }],
    },
    eventId
  );

  trackGtag("add_to_cart", {
    currency: CURRENCY,
    value,
    items: [
      {
        ...productToItem(product, quantity),
        item_variant: size != null ? String(size) : undefined,
      },
    ],
  });

  void sendMetaConversionApi({
    event_name: "AddToCart",
    event_id: eventId,
    custom_data: {
      currency: CURRENCY,
      value,
      content_ids: contentIds,
      content_type: "product",
      contents: [{ id: product.id, quantity }],
    },
  });
}

export function trackInitiateCheckout(items: CartItem[], total: number): void {
  if (!isAnalyticsEnabled()) return;

  const eventId = generateEventId();
  const contentIds = items.map((i) => i.product.id);
  const numItems = items.reduce((n, i) => n + i.quantity, 0);

  trackMeta(
    "InitiateCheckout",
    {
      content_ids: contentIds,
      num_items: numItems,
      value: total,
      currency: CURRENCY,
    },
    eventId
  );

  trackGtag("begin_checkout", {
    currency: CURRENCY,
    value: total,
    items: items.map((i) => productToItem(i.product, i.quantity)),
  });

  void sendMetaConversionApi({
    event_name: "InitiateCheckout",
    event_id: eventId,
    custom_data: {
      currency: CURRENCY,
      value: total,
      content_ids: contentIds,
      num_items: numItems,
    },
  });
}

export interface PurchaseTrackingInput {
  items: CartItem[];
  total: number;
  orderNumber?: string;
  email?: string;
  phone?: string;
}

/** Fire once per completed order. Browser Pixel + server CAPI (same event_id). */
export async function trackPurchase(input: PurchaseTrackingInput): Promise<void> {
  if (!isAnalyticsEnabled()) return;

  const { items, total, orderNumber, email, phone } = input;
  const eventId = generateEventId();
  const contentIds = items.map((i) => i.product.id);
  const numItems = items.reduce((n, i) => n + i.quantity, 0);

  trackMeta(
    "Purchase",
    {
      content_ids: contentIds,
      content_type: "product",
      value: total,
      currency: CURRENCY,
      num_items: numItems,
      order_id: orderNumber,
    },
    eventId
  );

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
