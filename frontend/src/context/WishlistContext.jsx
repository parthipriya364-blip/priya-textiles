import { createContext, useContext, useEffect, useState } from "react";
import { getStoredUser, isAuthenticated } from "../services/authService";

const WishlistContext = createContext(null);
const STORAGE_KEY = "priya-textiles-wishlist";
const USER_STORAGE_KEY = "priya-textiles-user";

const getProductId = (product) => product?._id || product?.id;

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(loadInitial);
  const isAuth = isAuthenticated();

  useEffect(() => {
    if (isAuth) {
      const user = getStoredUser();
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
          ...user,
          wishlistProductIds: wishlist.map(getProductId),
        }));
      }
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, isAuth]);

  const isWishlisted = (id) => wishlist.some((p) => getProductId(p) === id);

  const toggleWishlist = (product) => {
    if (!isAuth) {
      const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
      return false;
    }

    const productId = getProductId(product);
    setWishlist((prev) =>
      prev.some((p) => getProductId(p) === productId)
        ? prev.filter((p) => getProductId(p) !== productId)
        : [...prev, product]
    );
      return true;
  };

  const removeFromWishlist = (id) => setWishlist((prev) => prev.filter((p) => getProductId(p) !== id));

  const clearWishlist = () => setWishlist([]);

  const value = { wishlist, isWishlisted, toggleWishlist, removeFromWishlist, clearWishlist };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
