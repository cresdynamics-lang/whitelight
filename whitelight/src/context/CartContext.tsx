import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product, CartItem } from "@/types/product";

interface CartContextType {
  items: CartItem[];
  addItem: (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    size: number;
    selectedSizes?: number[];
    referenceLink: string;
    quantity: number;
  }) => void;
  addToCart: (product: Product, size: number, quantity?: number) => void;
  removeFromCart: (productId: string, size: number) => void;
  updateQuantity: (productId: string, size: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
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

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    size: number;
    selectedSizes?: number[];
    referenceLink: string;
    quantity: number;
  }) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (cartItem) => cartItem.product.id === item.id && cartItem.size === item.size && JSON.stringify(cartItem.selectedSizes) === JSON.stringify(item.selectedSizes)
      );

      if (existingIndex >= 0) {
        const updated = [...currentItems];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }

      return [...currentItems, {
        product: {
          id: item.id,
          name: item.name,
          price: item.price,
          images: [{ url: item.image, alt: item.name }]
        } as Product,
        size: item.size,
        selectedSizes: item.selectedSizes,
        referenceLink: item.referenceLink,
        quantity: item.quantity
      }];
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
