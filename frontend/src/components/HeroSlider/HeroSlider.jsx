import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useBanners } from "../../context/BannerContext";
import "./HeroSlider.css";

const AUTO_SLIDE_MS = 5000;

/**
 * Reusable, self-contained hero image slider.
 * Reads active (enabled) banners from BannerContext, so admin changes to
 * banner order/visibility/images are reflected instantly without a reload.
 * Pure background-layer component — renders no text of its own so it can
 * sit behind existing hero copy/overlays unchanged.
 */
export default function HeroSlider({ className = "" }) {
  const { activeBanners } = useBanners();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const slides = activeBanners;
  const count = slides.length;

  // Preload every slide image once so later transitions never show a blank
  // frame, while still marking non-first images loading="lazy" in markup.
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, [slides]);

  // Keep the active index valid if the banner list shrinks (e.g. admin
  // deletes a banner while it's showing).
  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  const goTo = useCallback(
    (i) => {
      if (count === 0) return;
      setIndex(((i % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || count <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, count]);

  if (count === 0) return null;

  return (
    <div
      className={`hero-slider ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <Fragment key={slide._id || slide.id}>
          <img
          src={slide.image?.url || slide.image}
          alt={slide.title || "Priya Textiles banner"}
          className={`hero-slide ${i === index ? "active" : ""}`}
          loading={i === 0 ? "eager" : "lazy"}
          fetchpriority={i === 0 ? "high" : "auto"}
          decoding="async"
          />
          {(slide.title || slide.subtitle) && (
            <a
              className={`hero-slide-content ${i === index ? "active" : ""}`}
              href={slide.link || undefined}
              onClick={(event) => { if (!slide.link) event.preventDefault(); }}
            >
              {slide.title && <h2>{slide.title}</h2>}
              {slide.subtitle && <p>{slide.subtitle}</p>}
            </a>
          )}
        </Fragment>
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            className="hero-slider-arrow prev"
            onClick={prev}
            aria-label="Previous banner"
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            className="hero-slider-arrow next"
            onClick={next}
            aria-label="Next banner"
          >
            <FaChevronRight />
          </button>

          <div className="hero-slider-dots">
            {slides.map((slide, i) => (
              <button
                key={slide._id || slide.id}
                type="button"
                className={`hero-slider-dot ${i === index ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
