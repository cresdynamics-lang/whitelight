import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { PENDING_PAYMENT_KEY } from "@/components/cart/CheckoutForm";
import { openWhatsAppCartOrderMessage } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useCart } from "@/context/CartContext";
import { apiFetch, isApiMode } from "@/lib/apiClient";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";

type PendingPayload = {
  cleanPhone: string;
  zoneLabel: string;
  deliveryAddress: string;
  orderNumber?: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  customerName: string;
  items: {
    name: string;
    unitPrice: number;
    quantity: number;
    sizeLabel?: string;
    referenceLink?: string;
    imageUrl?: string;
  }[];
};

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"checking" | "paid" | "pending" | "failed">("checking");
  const [message, setMessage] = useState("Confirming your payment…");

  const trackingId =
    params.get("OrderTrackingId") ||
    params.get("orderTrackingId") ||
    params.get("OrderTrackingID");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
      const pending: PendingPayload | null = raw ? JSON.parse(raw) : null;

      let paid = false;
      if (trackingId && isApiMode()) {
        try {
          const tx = await apiFetch<{
            payment_status_description?: string;
            status_code?: number;
          }>(`/api/payments/pesapal/transaction/${encodeURIComponent(trackingId)}`);
          const desc = String(tx.payment_status_description || "").toLowerCase();
          const code = Number(tx.status_code);
          // Pesapal: 1 = Completed often; also match description
          paid =
            code === 1 ||
            desc.includes("completed") ||
            desc.includes("paid") ||
            desc.includes("success");
          if (!cancelled) {
            if (paid) {
              setStatus("paid");
              setMessage("Payment successful. Opening WhatsApp to confirm your order…");
            } else {
              setStatus("pending");
              setMessage(
                "Payment is still processing. You can confirm with us on WhatsApp using your order details."
              );
            }
          }
        } catch {
          if (!cancelled) {
            setStatus("pending");
            setMessage("Could not verify payment automatically. Continue on WhatsApp so we can confirm.");
          }
        }
      } else {
        if (!cancelled) {
          setStatus(pending ? "paid" : "pending");
          setMessage(
            pending
              ? "Thanks — continuing to WhatsApp to confirm your order."
              : "No pending order found. You can still message us on WhatsApp."
          );
          paid = Boolean(pending);
        }
      }

      if (pending) {
        try {
          openWhatsAppCartOrderMessage({
            customer: {
              name: pending.customerName,
              phone: pending.cleanPhone,
              address: pending.deliveryAddress,
              deliveryLocation: pending.zoneLabel,
              deliveryFee: pending.deliveryFee,
              paymentMethod: paid ? "Pesapal (paid)" : "Pesapal (verify)",
              orderNumber: pending.orderNumber,
              notes: trackingId ? `Pesapal tracking: ${trackingId}` : undefined,
            },
            items: pending.items,
            currency: siteConfig.currency,
            subtotal: pending.subtotal,
            deliveryFee: pending.deliveryFee,
            total: pending.total,
          });
        } catch (e) {
          console.warn(e);
        }
        sessionStorage.removeItem(PENDING_PAYMENT_KEY);
        clearCart();
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [trackingId, clearCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-16 max-w-lg text-center">
        {status === "checking" ? (
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-muted-foreground mb-4" />
        ) : status === "paid" ? (
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
        ) : (
          <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
        )}
        <h1 className="font-heading text-2xl font-semibold mb-2">
          {status === "paid" ? "Payment successful" : "Order update"}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open WhatsApp
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Back to shop</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
