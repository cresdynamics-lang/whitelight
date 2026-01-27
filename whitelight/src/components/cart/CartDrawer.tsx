import { X, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { CheckoutForm } from "./CheckoutForm";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, getTotal, getItemCount } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;

    const orderDetails = items
      .map(
        (item) =>
          `• ${item.product.name} (Size: ${item.size}${item.size2 ? ` & ${item.size2}` : ''}) x${item.quantity} - ${formatPrice(item.product.price * item.quantity, siteConfig.currency)}${item.referenceLink ? `\nRef: ${item.referenceLink}` : ''}`
      )
      .join("\n\n");

    const message = `Hello! I'd like to order:\n\n${orderDetails}\n\nTotal: ${formatPrice(getTotal(), siteConfig.currency)}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodedMessage}`, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-left font-heading">
            Your Cart ({getItemCount()})
          </SheetTitle>
        </SheetHeader>

        {showCheckout ? (
          <CheckoutForm onBack={() => setShowCheckout(false)} />
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-4 p-3 border border-primary/20 rounded-lg bg-card"
                  >
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Size: {item.size}{item.size2 ? ` & ${item.size2}` : ''}
                      </p>
                      {item.referenceLink && (
                        <p className="text-xs text-blue-600 truncate">
                          Ref: {item.referenceLink}
                        </p>
                      )}
                      <p className="font-semibold text-primary mt-1">
                        {formatPrice(item.product.price, siteConfig.currency)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-destructive"
                          onClick={() => removeFromCart(item.product.id, item.size)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(getTotal(), siteConfig.currency)}</span>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
