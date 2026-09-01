import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls the window to the top on every route change, so navigating
// between pages never leaves the user stranded mid-scroll.
export default function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname]);
}
