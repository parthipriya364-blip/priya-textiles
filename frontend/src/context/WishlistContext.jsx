import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "priya-textiles-wishlist";

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const isWishlisted = (id) => wishlist.some((p) => getProductId(p) === id);

  const toggleWishlist = (product) => {
    const productId = getProductId(product);
    setWishlist((prev) =>
      prev.some((p) => getProductId(p) === productId)
        ? prev.filter((p) => getProductId(p) !== productId)
        : [...prev, product]
    );
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
