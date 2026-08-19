import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Package,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";
import {
  SHIPPING_ZONES,
  getDeliveryFee,
  getDeliveryZone,
  getResolvedDeliveryAddress,
  isShopPickup,
  formatZoneFee,
  SHOP_PICKUP_ADDRESS,
  type DeliveryMode,
} from "@/config/delivery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createStoreOrder } from "@/services/orderService";
import { openWhatsAppCartOrderMessage } from "@/lib/whatsapp";
import { trackInitiateCheckout, trackPurchase } from "@/lib/analytics/events";
import { Checkbox } from "@/components/ui/checkbox";
import { MPESA_PAYMENT, MPESA_PAYMENT_STEPS } from "@/config/payment";
import { apiFetch, isApiMode } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

const PENDING_PAYMENT_KEY = "wl_pending_payment";

const getBackendSize = (size: number | string, category?: string): number => {
  if (typeof size === "string") return 40;
  if (category === "accessories") {
    const sizeMap: Record<number, number> = {
      1: 35, 2: 36, 3: 37, 4: 38, 5: 39, 6: 40, 7: 41, 8: 42, 9: 43,
    };
    return sizeMap[size] || 40;
  }
  return size;
};

const getDisplaySize = (size: number | string, category?: string): string => {
  if (typeof size === "string") return size;
  if (category === "accessories") {
    const sizeMap: Record<number, string> = {
      1: "XS", 2: "2XL", 3: "3XL", 4: "4XL", 5: "5XL", 6: "L", 7: "XL", 8: "M", 9: "S",
    };
    return sizeMap[size] || size.toString();
  }
  return size.toString();
};

function productPageUrl(slug: string): string {
  if (typeof window === "undefined") return `/product/${slug}`;
  return `${window.location.origin}/product/${slug}`;
}

interface CheckoutFormProps {
  onBack: () => void;
}

export function CheckoutForm({ onBack }: CheckoutFormProps) {
  const { items, getTotal, clearCart, setIsOpen } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("ship");
  const [pesapalReady, setPesapalReady] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    deliveryLocation: "",
    address: "",
    apartment: "",
    city: "",
    notes: "",
    mpesaCode: "",
  });

  const subtotal = getTotal();
  const deliveryFee = useMemo(
    () => (deliveryMode === "pickup" ? 0 : getDeliveryFee(formData.deliveryLocation)),
    [formData.deliveryLocation, deliveryMode]
  );
  const total = subtotal + deliveryFee;
  const selectedZone =
    deliveryMode === "pickup"
      ? getDeliveryZone("pickup_shop")
      : getDeliveryZone(formData.deliveryLocation);

  useEffect(() => {
    if (items.length > 0) trackInitiateCheckout(items, subtotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isApiMode()) {
      setPesapalReady(false);
      return;
    }
    apiFetch<{ configured: boolean }>("/api/payments/pesapal/status")
      .then((d) => setPesapalReady(Boolean(d.configured)))
      .catch(() => setPesapalReady(false));
  }, []);

  useEffect(() => {
    if (deliveryMode === "pickup") {
      setFormData((prev) => ({
        ...prev,
        deliveryLocation: "pickup_shop",
        address: SHOP_PICKUP_ADDRESS,
      }));
    } else if (formData.deliveryLocation === "pickup_shop") {
      setFormData((prev) => ({
        ...prev,
        deliveryLocation: "",
        address: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryMode]);

  const normalizePhone = (phone: string) => {
    let cleanPhone = phone.replace(/[^\d+]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "+254" + cleanPhone.substring(1);
    else if (cleanPhone.startsWith("254")) cleanPhone = "+" + cleanPhone;
    else if (!cleanPhone.startsWith("+")) cleanPhone = "+254" + cleanPhone;
    return cleanPhone;
  };

  const buildOrderPayload = (cleanPhone: string, zoneId: string, zoneLabel: string, deliveryAddress: string) => {
    const orderItems = items.map((item) => {
      const slug = item.product.slug || item.product.id;
      return {
        productId: item.product.id,
        productSlug: slug,
        productName: item.product.name,
        productPrice: item.product.price,
        size: getBackendSize(item.size, item.product.category),
        quantity: item.quantity,
        productImage:
          item.product.images?.length > 0 ? item.product.images[0].url : undefined,
        selectedSizes: item.selectedSizes,
        referenceLink: item.referenceLink || productPageUrl(slug),
      };
    });
    return {
      customerName: formData.name.trim(),
      customerPhone: cleanPhone,
      customerEmail: formData.email.trim() || undefined,
      deliveryAddress,
      deliveryLocation: zoneId,
      deliveryLocationLabel: zoneLabel,
      deliveryFee,
      subtotal,
      totalAmount: total,
      orderNotes: formData.notes.trim() || undefined,
      paymentMethod: pesapalReady ? "pesapal" : MPESA_PAYMENT.methodId,
      mpesaCode: formData.mpesaCode.trim() || undefined,
      items: orderItems,
    };
  };

  const openWhatsAppAfterOrder = (params: {
    cleanPhone: string;
    zoneLabel: string;
    deliveryAddress: string;
    orderNumber?: string;
    paid?: boolean;
  }) => {
    openWhatsAppCartOrderMessage({
      customer: {
        name: formData.name.trim(),
        phone: params.cleanPhone,
        email: formData.email.trim() || undefined,
        address: params.deliveryAddress,
        deliveryLocation: params.zoneLabel,
        deliveryFee,
        paymentMethod: params.paid
          ? "Pesapal (paid)"
          : MPESA_PAYMENT.methodLabel,
        mpesaCode: formData.mpesaCode.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        orderNumber: params.orderNumber,
      },
      items: items.map((item) => ({
        name: item.product.name,
        unitPrice: item.product.price,
        quantity: item.quantity,
        sizeLabel: getDisplaySize(item.size, item.product.category),
        referenceLink:
          item.referenceLink || productPageUrl(item.product.slug || item.product.id),
        imageUrl: item.product.images?.[0]?.url,
      })),
      currency: siteConfig.currency,
      subtotal,
      deliveryFee,
      total,
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please enter your full name and phone number");
      return;
    }

    if (deliveryMode === "ship" && !formData.deliveryLocation) {
      toast.error("Please select a shipping method / delivery zone");
      return;
    }

    const zoneId = deliveryMode === "pickup" ? "pickup_shop" : formData.deliveryLocation;
    const zone = getDeliveryZone(zoneId);
    if (!zone) {
      toast.error("Please select a valid delivery option");
      return;
    }

    const street =
      deliveryMode === "pickup"
        ? SHOP_PICKUP_ADDRESS
        : [formData.address.trim(), formData.apartment.trim(), formData.city.trim()]
            .filter(Boolean)
            .join(", ");
    const deliveryAddress = getResolvedDeliveryAddress(zoneId, street);
    if (deliveryMode === "ship" && !formData.address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Pesapal path does not need Paybill checkbox; manual Paybill does
    if (!pesapalReady && !paymentConfirmed) {
      toast.error("Please confirm you will pay via M-Pesa Paybill before placing your order");
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = normalizePhone(formData.phone);

    try {
      const orderPayload = buildOrderPayload(cleanPhone, zone.id, zone.label, deliveryAddress);
      let orderNumber: string | undefined;

      try {
        const saved = await createStoreOrder(orderPayload);
        orderNumber = saved.orderNumber;
      } catch (err) {
        console.error("Order save failed:", err);
        toast.error("Could not save your order. Please try again.");
        return;
      }

      const whatsappPayload = {
        cleanPhone,
        zoneLabel: zone.label,
        deliveryAddress,
        orderNumber,
      };

      // Prefer Pesapal when configured
      if (pesapalReady && isApiMode()) {
        try {
          const callbackUrl = `${window.location.origin}/payment/success`;
          sessionStorage.setItem(
            PENDING_PAYMENT_KEY,
            JSON.stringify({
              ...whatsappPayload,
              total,
              subtotal,
              deliveryFee,
              customerName: formData.name.trim(),
              items: items.map((item) => ({
                name: item.product.name,
                unitPrice: item.product.price,
                quantity: item.quantity,
                sizeLabel: getDisplaySize(item.size, item.product.category),
                referenceLink:
                  item.referenceLink ||
                  productPageUrl(item.product.slug || item.product.id),
                imageUrl: item.product.images?.[0]?.url,
              })),
            })
          );

          const pay = await apiFetch<{
            redirectUrl: string;
            orderTrackingId: string;
            merchantReference: string;
          }>("/api/payments/pesapal/initiate", {
            method: "POST",
            body: JSON.stringify({
              amount: total,
              merchantReference: orderNumber || `WL-${Date.now()}`,
              description: `Order ${orderNumber || ""} — Whitelight Store`,
              callbackUrl,
              phone: cleanPhone,
              email: formData.email.trim() || undefined,
              customerName: formData.name.trim(),
            }),
          });

          toast.success("Redirecting to secure payment…");
          window.location.href = pay.redirectUrl;
          return;
        } catch (payErr) {
          console.error(payErr);
          toast.error(
            payErr instanceof Error
              ? payErr.message
              : "Payment could not start. Use Paybill or try again."
          );
          // fall through to Paybill + WhatsApp
        }
      }

      toast.success("Order placed — confirm on WhatsApp");
      openWhatsAppAfterOrder({ ...whatsappPayload, paid: false });
      await trackPurchase({
        items: [...items],
        total,
        orderNumber,
        phone: cleanPhone,
      });
      clearCart();
      setIsOpen(false);
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Button variant="ghost" size="sm" className="self-start mb-4" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto pr-1">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0700 000 000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        {/* Delivery: Ship | Pickup */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Delivery</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryMode("ship")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                deliveryMode === "ship"
                  ? "border-foreground bg-background shadow-sm"
                  : "border-transparent bg-muted text-muted-foreground"
              )}
            >
              <Package className="h-4 w-4" />
              Ship
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMode("pickup")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                deliveryMode === "pickup"
                  ? "border-foreground bg-background shadow-sm"
                  : "border-transparent bg-muted text-muted-foreground"
              )}
            >
              <MapPin className="h-4 w-4" />
              Pickup
            </button>
          </div>
        </div>

        {deliveryMode === "ship" && (
          <>
            <div className="space-y-2">
              <Label>Country/Region</Label>
              <Input value="Kenya" readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Street / building"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
              <Input
                id="apartment"
                value={formData.apartment}
                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City / Area *</Label>
              <Input
                id="city"
                placeholder="e.g. Kilimani"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            {/* Shipping method board */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Shipping method</h3>
              <div className="rounded-lg border border-border overflow-hidden divide-y">
                {SHIPPING_ZONES.map((zone) => {
                  const selected = formData.deliveryLocation === zone.id;
                  return (
                    <label
                      key={zone.id}
                      className={cn(
                        "flex items-start gap-3 px-3 py-3 cursor-pointer transition-colors",
                        selected ? "bg-sky-50" : "bg-background hover:bg-muted/40"
                      )}
                    >
                      <input
                        type="radio"
                        name="shippingZone"
                        className="mt-1 accent-sky-600"
                        checked={selected}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            deliveryLocation: zone.id,
                          }))
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{zone.label}</p>
                        {zone.areas && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            ({zone.areas})
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap shrink-0">
                        {formatZoneFee(zone.fee)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {deliveryMode === "pickup" && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Pick up at shop — Free</p>
            <p>{SHOP_PICKUP_ADDRESS}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Order notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special instructions…"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />
        </div>

        {/* Totals */}
        <div className="rounded-lg border p-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal, siteConfig.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Delivery{selectedZone ? ` (${selectedZone.label})` : ""}
            </span>
            <span>{formatZoneFee(deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-1 border-t">
            <span>Total</span>
            <span>{formatPrice(total, siteConfig.currency)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="space-y-3 rounded-lg border border-border p-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary shrink-0" />
            <Label className="text-sm font-semibold">Payment *</Label>
          </div>

          {pesapalReady ? (
            <p className="text-xs text-muted-foreground leading-snug">
              You will pay securely via Pesapal (M-Pesa / card). After a successful payment you
              are redirected to WhatsApp so we can confirm your order.
            </p>
          ) : (
            <>
              <div className="rounded-md border bg-background px-3 py-2 text-sm font-medium space-y-0.5">
                <p>{MPESA_PAYMENT.methodLabel}</p>
                <p>
                  Paybill:{" "}
                  <span className="text-primary">{MPESA_PAYMENT.paybillNumber}</span>
                </p>
                <p>
                  Acc: <span className="text-primary">{MPESA_PAYMENT.accountNumber}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{MPESA_PAYMENT.paybillNote}</p>
              <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5">
                Online Pesapal is not configured yet. Add{" "}
                <code className="text-[10px]">PESAPAL_CONSUMER_KEY</code> /{" "}
                <code className="text-[10px]">PESAPAL_CONSUMER_SECRET</code> on the server for
                card/M-Pesa redirect checkout.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setShowPaymentInstructions((v) => !v)}
              >
                <span>M-Pesa Paybill instructions</span>
                {showPaymentInstructions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {showPaymentInstructions && (
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground px-1">
                  {MPESA_PAYMENT_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="paymentConfirmed"
                  checked={paymentConfirmed}
                  onCheckedChange={(checked) => setPaymentConfirmed(checked === true)}
                />
                <Label htmlFor="paymentConfirmed" className="text-xs font-normal cursor-pointer">
                  I will pay {formatPrice(total, siteConfig.currency)} via Paybill{" "}
                  {MPESA_PAYMENT.paybillNumber} / Acc {MPESA_PAYMENT.accountNumber} *
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesaCode" className="text-sm">
                  M-Pesa code (optional)
                </Label>
                <Input
                  id="mpesaCode"
                  placeholder="e.g. QHK7X2Y9AB"
                  value={formData.mpesaCode}
                  onChange={(e) => setFormData({ ...formData, mpesaCode: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
          <ShoppingBag className="h-4 w-4 mr-2" />
          {isSubmitting
            ? "Processing…"
            : pesapalReady
              ? `Pay ${formatPrice(total, siteConfig.currency)}`
              : `Place order · ${formatPrice(total, siteConfig.currency)}`}
        </Button>
      </form>
    </div>
  );
}

export { PENDING_PAYMENT_KEY };
