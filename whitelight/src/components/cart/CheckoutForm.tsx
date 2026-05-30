import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, ShoppingBag, Smartphone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";
import {
  DELIVERY_ZONES,
  getDeliveryFee,
  getDeliveryZone,
  getResolvedDeliveryAddress,
  isShopPickup,
  SHOP_PICKUP_ADDRESS,
} from "@/config/delivery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiService } from "@/services/apiService";
import { createStoreOrder } from "@/services/orderService";
import { openWhatsAppCartOrderMessage } from "@/lib/whatsapp";
import { trackInitiateCheckout, trackPurchase } from "@/lib/analytics/events";
import { Checkbox } from "@/components/ui/checkbox";
import { MPESA_PAYMENT, MPESA_PAYMENT_STEPS } from "@/config/payment";

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
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    deliveryLocation: "",
    address: "",
    notes: "",
    mpesaCode: "",
  });

  const subtotal = getTotal();
  const deliveryFee = useMemo(
    () => getDeliveryFee(formData.deliveryLocation),
    [formData.deliveryLocation]
  );
  const total = subtotal + deliveryFee;
  const selectedZone = getDeliveryZone(formData.deliveryLocation);
  const isPickup = isShopPickup(formData.deliveryLocation);

  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout(items, subtotal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please enter your full name and phone number");
      return;
    }

    if (!formData.deliveryLocation) {
      toast.error("Please select a delivery location");
      return;
    }

    const deliveryAddress = getResolvedDeliveryAddress(
      formData.deliveryLocation,
      formData.address
    );
    if (!deliveryAddress) {
      toast.error("Please enter your delivery address (building, street, area)");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!paymentConfirmed) {
      toast.error("Please confirm you will pay via M-Pesa Paybill before placing your order");
      return;
    }

    const zone = getDeliveryZone(formData.deliveryLocation);
    if (!zone) {
      toast.error("Please select a valid delivery location");
      return;
    }

    setIsSubmitting(true);

    try {
      let cleanPhone = formData.phone.replace(/[^\d+]/g, "");
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "+254" + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith("254")) {
        cleanPhone = "+" + cleanPhone;
      } else if (!cleanPhone.startsWith("+")) {
        cleanPhone = "+254" + cleanPhone;
      }

      const orderItems = items.map((item) => {
        const slug = item.product.slug || item.product.id;
        const referenceLink =
          item.referenceLink || productPageUrl(slug);
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
          referenceLink,
        };
      });

      const orderPayload = {
        customerName: formData.name.trim(),
        customerPhone: cleanPhone,
        deliveryAddress,
        deliveryLocation: zone.id,
        deliveryLocationLabel: zone.label,
        deliveryFee,
        subtotal,
        totalAmount: total,
        orderNotes: formData.notes.trim() || undefined,
        paymentMethod: MPESA_PAYMENT.methodId,
        mpesaCode: formData.mpesaCode.trim() || undefined,
        items: orderItems,
      };

      const mpesaCode = formData.mpesaCode.trim() || undefined;
      let orderNumber: string | undefined;
      let orderSaved = false;

      try {
        const saved = await createStoreOrder(orderPayload);
        orderNumber = saved.orderNumber;
        orderSaved = true;
      } catch (supabaseError) {
        console.error("Supabase order save failed:", supabaseError);
        try {
          const response = await apiService.createOrder({
            ...orderPayload,
            deliveryAddress: isPickup
              ? `${zone.label}: ${deliveryAddress}`
              : `${zone.label}: ${formData.address.trim()}`,
            items: orderItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              size: typeof item.size === "number" ? item.size : Number(item.size) || 40,
              quantity: item.quantity,
              productImage: item.productImage,
              selectedSizes: item.selectedSizes as number[] | undefined,
              referenceLink: item.referenceLink,
            })),
          });
          if (response?.success && (response as { data?: { order?: { orderNumber?: string } } })?.data?.order?.orderNumber) {
            orderNumber = (response as { data: { order: { orderNumber: string } } }).data.order.orderNumber;
            orderSaved = true;
          }
        } catch (apiError) {
          console.error("Backend order create failed:", apiError);
        }
      }

      if (!orderSaved) {
        toast.error("Could not save your order. Please try again or contact us on WhatsApp.");
        return;
      }

      toast.success("Order placed successfully!", {
        description: orderNumber
          ? `Order #${orderNumber} received. Pay ${formatPrice(total, siteConfig.currency)} via M-Pesa if you have not already.`
          : `Pay ${formatPrice(total, siteConfig.currency)} via M-Pesa if you have not already.`,
      });

      try {
        openWhatsAppCartOrderMessage({
        customer: {
          name: formData.name.trim(),
          phone: cleanPhone,
          address: deliveryAddress,
          deliveryLocation: zone.label,
          deliveryFee,
          paymentMethod: MPESA_PAYMENT.methodLabel,
          mpesaCode,
          notes: formData.notes.trim() || undefined,
          orderNumber,
        },
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
        currency: siteConfig.currency,
        subtotal,
        deliveryFee,
        total,
      });
      } catch (waErr) {
        console.warn("WhatsApp open failed:", waErr);
      }

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

      <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto">
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
            placeholder="254712345678 or +254712345678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryLocation">Delivery Location *</Label>
          <Select
            value={formData.deliveryLocation}
            onValueChange={(value) => {
              const zone = getDeliveryZone(value);
              setFormData((prev) => ({
                ...prev,
                deliveryLocation: value,
                address:
                  zone?.pickupAddress ??
                  (isShopPickup(prev.deliveryLocation) ? "" : prev.address),
              }));
            }}
            required
          >
            <SelectTrigger id="deliveryLocation">
              <SelectValue placeholder="Delivery or pick-up" />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_ZONES.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.id === "pickup_shop"
                    ? `${zone.label} — Rware Bldg, Shop 410, 4th Floor (Free)`
                    : `${zone.label}${
                        zone.fee === 0
                          ? " — Free"
                          : ` — ${siteConfig.currency} ${zone.fee.toLocaleString()}`
                      }`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedZone?.description && (
            <p className="text-xs text-muted-foreground leading-snug">
              {selectedZone.description}
            </p>
          )}
        </div>

        {isPickup ? (
          <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Label className="text-sm font-medium">Collection point</Label>
            <p className="text-sm text-foreground leading-snug">{SHOP_PICKUP_ADDRESS}</p>
            <p className="text-xs text-muted-foreground">
              We will confirm when your order is ready for collection. Payment on pickup
              available in-store.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              placeholder="Building, street, estate, landmarks…"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Order Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special instructions…"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-3 rounded-lg border border-border p-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary shrink-0" />
            <Label className="text-sm font-semibold">Payment method *</Label>
          </div>

          <div className="rounded-md border bg-background px-3 py-2 text-sm font-medium">
            {MPESA_PAYMENT.methodLabel} — Till {MPESA_PAYMENT.tillNumber}
          </div>
          <p className="text-xs text-muted-foreground leading-snug">{MPESA_PAYMENT.paybillNote}</p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-between"
            onClick={() => setShowPaymentInstructions((v) => !v)}
          >
            <span>M-Pesa payment instructions</span>
            {showPaymentInstructions ? (
              <ChevronUp className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" />
            )}
          </Button>

          {showPaymentInstructions && (
            <div className="rounded-md border bg-background p-3 space-y-2 text-sm">
              <p className="font-medium text-foreground">
                Pay {formatPrice(total, siteConfig.currency)} to Till{" "}
                <span className="text-primary">{MPESA_PAYMENT.tillNumber}</span>
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground text-xs leading-relaxed">
                {MPESA_PAYMENT_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex items-start gap-2 pt-1">
            <Checkbox
              id="paymentConfirmed"
              checked={paymentConfirmed}
              onCheckedChange={(checked) => setPaymentConfirmed(checked === true)}
            />
            <Label
              htmlFor="paymentConfirmed"
              className="text-xs leading-snug font-normal cursor-pointer"
            >
              I will pay the order total via M-Pesa (Lipa na M-Pesa) before my order is
              processed *
            </Label>
          </div>

          <div className="space-y-2 pt-1">
            <Label htmlFor="mpesaCode" className="text-sm">
              M-Pesa confirmation code (optional)
            </Label>
            <Input
              id="mpesaCode"
              placeholder="e.g. QHK7X2Y9AB"
              value={formData.mpesaCode}
              onChange={(e) =>
                setFormData({ ...formData, mpesaCode: e.target.value.toUpperCase() })
              }
              maxLength={20}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Paste the code from your M-Pesa SMS after paying — helps us confirm faster.
            </p>
          </div>
        </div>

        <div className="border-t pt-4 mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal, siteConfig.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isPickup ? "Pick-up" : "Delivery"}
              {selectedZone ? ` (${selectedZone.label})` : ""}
            </span>
            <span>
              {deliveryFee === 0
                ? "Free"
                : formatPrice(deliveryFee, siteConfig.currency)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
            <span>Total</span>
            <span>{formatPrice(total, siteConfig.currency)}</span>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <ShoppingBag className="h-5 w-5 mr-2" />
          {isSubmitting ? "Placing Order…" : "Place Order"}
        </Button>
      </form>
    </div>
  );
}
