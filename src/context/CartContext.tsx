"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock?: number;
  isCustomDesign?: boolean;
  uploadedDesignUrl?: string;
  uploadedDesignUrls?: string[];
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        setItems(JSON.parse(saved) as CartItem[]);
      }
    } catch {
      // ignore
    }
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const dispatchCartUpdateEvent = useCallback((cartItems: CartItem[]) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<CartItem[]>('cartUpdated', { detail: cartItems }));
    }
  }, []);

  const storeLocalCart = useCallback((cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    dispatchCartUpdateEvent(cartItems);
  }, [dispatchCartUpdateEvent]);

  useEffect(() => {
    const syncHandler = (event: Event) => {
      const customEvent = event as CustomEvent<CartItem[]>;
      if (customEvent?.detail) {
        setItems(customEvent.detail);
        storeLocalCart(customEvent.detail);
      }
    };

    window.addEventListener('userCartSync', syncHandler as EventListener);
    return () => {
      window.removeEventListener('userCartSync', syncHandler as EventListener);
    };
  }, [storeLocalCart]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
      );
      const updated = existing
        ? prev.map((i) =>
            i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
              ? { ...i, quantity: i.quantity + quantity, stock: newItem.stock ?? i.stock }
              : i
          )
        : [...prev, { ...newItem, quantity }];
      storeLocalCart(updated);
      return updated;
    });
    setIsOpen(true); // auto-open cart on add
  }, [storeLocalCart]);

  const removeItem = useCallback((id: string, size: string, color: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => !(i.id === id && i.size === size && i.color === color));
      storeLocalCart(updated);
      return updated;
    });
  }, [storeLocalCart]);

  const updateQuantity = useCallback(
    (id: string, size: string, color: string, quantity: number) => {
      setItems((prev) => {
        const updated = prev.map((i) => {
          if (i.id !== id || i.size !== size || i.color !== color) return i;
          if (quantity <= 0) return null;
          const finalQty = i.stock !== undefined ? Math.min(quantity, i.stock) : quantity;
          return { ...i, quantity: finalQty };
        }).filter(Boolean) as CartItem[];

        if (updated.length !== prev.length) {
          storeLocalCart(updated);
          return updated;
        }

        storeLocalCart(updated);
        return updated;
      });
    },
    [storeLocalCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    storeLocalCart([]);
  }, [storeLocalCart]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(() => ({
    items,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
  }), [items, isOpen, openCart, closeCart, toggleCart, addItem, removeItem, updateQuantity, clearCart, total, itemCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
