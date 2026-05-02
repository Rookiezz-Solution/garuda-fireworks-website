import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ApiProduct } from "@/hooks/use-products";

export interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string | null;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: ApiProduct) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("garuda_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("garuda_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: ApiProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      const imageUrl = product.images?.[0]?.imageUrl ?? null;
      const image = imageUrl
        ? imageUrl.startsWith("http")
          ? imageUrl
          : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${imageUrl}`
        : null;
      const price = Number(product.offerPrice ?? product.actualPrice);
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category?.name ?? "Uncategorized",
          price,
          image,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
