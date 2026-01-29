import { useState } from "react";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";

// Helper function to convert accessory sizes to valid backend sizes
const getBackendSize = (size: number | string, category?: string): number => {
  if (typeof size === 'string') return 40; // Default for string sizes
  if (category === 'accessories') {
    // Map accessory sizes to valid shoe sizes (≥35)
    const sizeMap: { [key: number]: number } = { 1: 35, 2: 36, 3: 37, 4: 38, 5: 39, 6: 40, 7: 41, 8: 42, 9: 43 };
    return sizeMap[size] || 40;
  }
  return size as number;
};

// Helper function to display correct size labels
const getDisplaySize = (size: number | string, category?: string): string => {
  if (typeof size === 'string') return size;
  if (category === 'accessories') {
    const sizeMap: { [key: number]: string } = { 1: 'XS', 2: '2XL', 3: '3XL', 4: '4XL', 5: '5XL', 6: 'L', 7: 'XL', 8: 'M', 9: 'S' };
    return sizeMap[size] || size.toString();
  }
  return size.toString();
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiService } from "@/services/apiService";

interface CheckoutFormProps {
  onBack: () => void;
}

export function CheckoutForm({ onBack }: CheckoutFormProps) {
  const { items, getTotal, clearCart, setIsOpen } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('Form data:', formData);
    console.log('Cart items:', items);
    
    if (!formData.name || !formData.phone) {
      toast.error("Please fill in name and phone number");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean and format phone number for Kenya
      let cleanPhone = formData.phone.replace(/[^\d+]/g, '');
      
      // Handle Kenyan phone numbers
      if (cleanPhone.startsWith('0')) {
        // Convert 0712345678 to +254712345678
        cleanPhone = '+254' + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith('254')) {
        // Convert 254712345678 to +254712345678
        cleanPhone = '+' + cleanPhone;
      } else if (!cleanPhone.startsWith('+')) {
        // Add +254 if no country code
        cleanPhone = '+254' + cleanPhone;
      }
      
      // Prepare order data for backend
      const orderData = {
        customerName: formData.name.trim(),
        customerPhone: cleanPhone,
        customerEmail: formData.email.trim() || undefined,
        deliveryAddress: formData.address.trim() || undefined,
        orderNotes: formData.notes.trim() || undefined,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productPrice: item.product.price,
          size: getBackendSize(item.size, item.product.category),
          quantity: item.quantity
        }))
      };

      console.log('Sending order data:', orderData);
      const response = await apiService.createOrder(orderData);
      
      if (response.success) {
        toast.success("Order placed successfully!", {
          description: `Order #${response.data.order.orderNumber} has been created.`
        });
        
        // Prepare WhatsApp message with order details
        const orderNumber = response.data.order.orderNumber;
        const total = getTotal();
        
        let message = `NEW ORDER #${orderNumber}\n\n`;
        message += `CUSTOMER DETAILS:\n`;
        message += `Name: ${formData.name}\n`;
        message += `Phone: ${cleanPhone}\n`;
        if (formData.email) message += `Email: ${formData.email}\n`;
        if (formData.address) message += `Address: ${formData.address}\n`;
        
        message += `\nORDER ITEMS:\n`;
        items.forEach((item, index) => {
          message += `${index + 1}. ${item.product.name}\n`;
          message += `   Size: ${getDisplaySize(item.size, item.product.category)} | Qty: ${item.quantity} | ${formatPrice(item.product.price * item.quantity, siteConfig.currency)}\n`;
        });
        
        message += `\nTOTAL: ${formatPrice(total, siteConfig.currency)}\n`;
        
        if (formData.notes) {
          message += `\nNOTES: ${formData.notes}\n`;
        }
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = siteConfig.contact.whatsapp.replace(/[^\d]/g, '');
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp in new window
        window.open(whatsappUrl, '_blank');
        
        clearCart();
        setIsOpen(false);
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Button
        variant="ghost"
        size="sm"
        className="self-start mb-4"
        onClick={onBack}
      >
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
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Delivery Address</Label>
          <Textarea
            id="address"
            placeholder="Your delivery address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Order Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special instructions..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />
        </div>

        <div className="border-t pt-4 mt-4 space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(getTotal(), siteConfig.currency)}</span>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
