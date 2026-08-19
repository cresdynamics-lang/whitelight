import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product, CartItem } from "@/types/product";
import { trackAddToCart } from "@/lib/analytics/events";

interface CartContextType {
  items: CartItem[];
  addItem: (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    size: number | string;
    selectedSizes?: (number | string)[];
    referenceLink: string;
    quantity: number;
    category?: string;
    slug?: string;
  }) => void;
  addToCart: (product: Product, size: number, quantity?: number) => void;
  removeFromCart: (productId: string, size: number | string) => void;
  updateQuantity: (productId: string, size: number | string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  /** When true, cart drawer opens on checkout form (Reserve this) */
  openCheckoutOnNextOpen: boolean;
  setOpenCheckoutOnNextOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "whitelight_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [openCheckoutOnNextOpen, setOpenCheckoutOnNextOpen] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    size: number | string;
    selectedSizes?: (number | string)[];
    referenceLink: string;
    quantity: number;
    category?: string;
    slug?: string;
  }) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (cartItem) =>
          cartItem.product.id === item.id &&
          cartItem.size === item.size &&
          JSON.stringify(cartItem.selectedSizes) === JSON.stringify(item.selectedSizes)
      );

      if (existingIndex >= 0) {
        const updated = [...currentItems];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }

      const cartProduct = {
        id: item.id,
        name: item.name,
        price: item.price,
        slug: item.slug || item.id,
        brand: "",
        category: (item.category || "running") as Product["category"],
        images: [{ id: item.id, url: item.image, alt: item.name }],
        variants: [],
        description: "",
        tags: [],
        createdAt: "",
      } as Product;

      trackAddToCart(cartProduct, item.quantity, item.size);

      return [
        ...currentItems,
        {
          product: cartProduct,
          size: item.size as number,
          selectedSizes: item.selectedSizes as number[] | undefined,
          referenceLink: item.referenceLink,
          quantity: item.quantity,
        },
      ];
    });
    setIsOpen(true);
  };

  const addToCart = (product: Product, size: number, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingIndex >= 0) {
        const updated = [...currentItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      trackAddToCart(product, quantity, size);
      return [...currentItems, { product, size, quantity }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (productId: string, size: number) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.product.id === productId && item.size === size)
      )
    );
  };

  const updateQuantity = (productId: string, size: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        isOpen,
        setIsOpen,
        openCheckoutOnNextOpen,
        setOpenCheckoutOnNextOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
