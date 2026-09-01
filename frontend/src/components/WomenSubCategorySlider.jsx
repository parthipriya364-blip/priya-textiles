import { useRef, useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import WomenSubCategoryCard, { slugify } from "./WomenSubCategoryCard";
import { useSubCategories } from "../context/SubCategoryContext";
import "./style/WomenSubCategorySlider.css";

/**
 * Premium horizontal scrollable sub-category slider for the Women category.
 * Reads live data from SubCategoryContext so admin renames/reorders/
 * enable-disables reflect instantly, with no page reload.
 */
export default function WomenSubCategorySlider({ activeSlug }) {
  const { activeWomenSubCategories } = useSubCategories();
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, activeWomenSubCategories.length]);

  const scrollBy = (amount) => {
    trackRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (activeWomenSubCategories.length === 0) return null;

  return (
    <section className="wcs-slider">
      <div className="container">
        <div className="wcs-header">
          <span className="eyebrow">Shop By Category</span>
          <h2>Women's Edit</h2>
        </div>

        <div className="wcs-track-wrap">
          {canScrollLeft && (
            <button
              type="button"
              className="wcs-arrow wcs-arrow-left"
              onClick={() => scrollBy(-260)}
              aria-label="Scroll sub-categories left"
            >
              <FaChevronLeft />
            </button>
          )}

          <div className="wcs-track" ref={trackRef}>
            {activeWomenSubCategories.map((sc) => (
              <WomenSubCategoryCard
                key={sc.id}
                subCategory={sc}
                active={activeSlug === slugify(sc.name)}
              />
            ))}
          </div>

          {canScrollRight && (
            <button
              type="button"
              className="wcs-arrow wcs-arrow-right"
              onClick={() => scrollBy(260)}
              aria-label="Scroll sub-categories right"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
