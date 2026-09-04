import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { isAuthenticated } from "../services/authService";
import * as cartService from "../services/cartService";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);
const STORAGE_KEY = "priya-textiles-cart";
const USER_STORAGE_KEY = "priya-textiles-user";

// Load cart from localStorage (for guests)
function loadLocalCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const isAuth = isAuthenticated();

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [isAuth]);

  const loadCart = async () => {
    setLoading(true);
    try {
      if (isAuth) {
        // Load from database
        const data = await cartService.getCart();
        const formattedItems = (data.cart?.items || []).map((item) => ({
          lineId: `${item._id}`,
          itemId: item._id,
          id: item.product._id,
          name: item.product.name,
          image: item.product.image?.url || item.product.image,
          price: item.product.price,
          oldPrice: item.product.oldPrice,
          size: item.size,
          qty: item.quantity,
          stock: item.product.stock,
          inStock: item.product.inStock,
          paymentMethods: item.product.paymentMethods || { card: true, upi: true, cod: true },
        }));
        setItems(formattedItems);
        const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "null");
        if (user) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
            ...user,
            cartProductIds: formattedItems.map((item) => item.id),
          }));
        }
      } else {
        // Load from localStorage
        setItems(loadLocalCart());
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      if (!isAuth) {
        setItems(loadLocalCart());
      }
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage for guests
  useEffect(() => {
    if (!isAuth && items.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isAuth]);

  // Sync local cart to database on login
  const syncLocalCart = useCallback(async () => {
    const localItems = loadLocalCart();
    if (localItems.length > 0) {
      try {
        await cartService.syncCart(localItems);
        localStorage.removeItem(STORAGE_KEY);
        await loadCart();
      } catch (error) {
        console.error('Failed to sync cart:', error);
      }
    }
  }, []);

  const addToCart = async (product, size = product.sizes?.[0] || "Free Size", qty = 1) => {
    if (!isAuth) {
      const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
      return false;
    }

    try {
      const productId = product._id || product.id;
      await cartService.addToCart(productId, qty, size);
      await loadCart();
      return true;
    } catch (error) {
      showToast?.(error.message || 'Failed to add to cart', 'error');
      throw error;
    }
  };

  const removeFromCart = async (lineId) => {
    try {
      if (isAuth) {
        // Remove from database
        const item = items.find((i) => i.lineId === lineId);
        if (item?.itemId) {
          await cartService.removeFromCart(item.itemId);
          await loadCart();
        }
      } else {
        // Remove from localStorage
        setItems(items.filter((item) => item.lineId !== lineId));
      }
    } catch (error) {
      showToast?.(error.message || 'Failed to remove item', 'error');
      throw error;
    }
  };

  const updateQty = async (lineId, qty) => {
    try {
      if (isAuth) {
        // Update in database
        const item = items.find((i) => i.lineId === lineId);
        if (item?.itemId) {
          await cartService.updateCartItem(item.itemId, qty);
          await loadCart();
        }
      } else {
        // Update in localStorage
        setItems(items.map((item) =>
          item.lineId === lineId ? { ...item, qty: Math.max(1, qty) } : item
        ));
      }
    } catch (error) {
      showToast?.(error.message || 'Failed to update quantity', 'error');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      if (isAuth) {
        await cartService.clearCart();
        setItems([]);
      } else {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      showToast?.(error.message || 'Failed to clear cart', 'error');
      throw error;
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const savings = items.reduce(
    (sum, item) => sum + Math.max(0, (item.oldPrice || item.price) - item.price) * item.qty,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  const value = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    syncLocalCart,
    refreshCart: loadCart,
    subtotal,
    savings,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
