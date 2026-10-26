import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useBanners } from "../../context/BannerContext";
import AspectRatioBanner from "./AspectRatioBanner"; // Change to ResponsiveBanner or ArtDirectedBanner as needed

const AUTO_SLIDE_MS = 5000;

/**
 * Tailwind-styled HeroSlider with responsive banner images
 * 
 * Breakpoints:
 * - Mobile (default): < 768px - h-64 (256px)
 * - Tablet (md:): ≥ 768px - h-80 (320px)
 * - Desktop (lg:): ≥ 1024px - h-[500px]
 * - Large Desktop (xl:): ≥ 1280px - h-[600px]
 * 
 * Choose banner variation by importing:
 * - ResponsiveBanner - Single <img> with srcset/sizes
 * - ArtDirectedBanner - <picture> with different crops per device
 * - AspectRatioBanner - Modern aspect-ratio based (RECOMMENDED)
 */
export default function HeroSliderTailwind({ className = "" }) {
  const { activeBanners } = useBanners();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const slides = activeBanners;
  const count = slides.length;

  // Preload all banner images
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image?.url || slide.image;
    });
  }, [slides]);

  // Keep index valid if banner list changes
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

  // Auto-slide timer
  useEffect(() => {
    if (paused || count <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, count]);

  if (count === 0) return null;

  return (
    <section
      className={`relative w-full overflow-hidden bg-gray-50 ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero banner slider"
    >
      {/* Slides Container */}
      <div className="relative w-full">
        {slides.map((slide, i) => (
          <div
            key={slide._id || slide.id}
            className={`
              transition-opacity duration-1000 ease-in-out
              ${i === index ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'}
            `}
            aria-hidden={i !== index}
          >
            <AspectRatioBanner slide={slide} isActive={i === index} />
          </div>
        ))}
      </div>

      {/* Navigation Controls - Only show if multiple slides */}
      {count > 1 && (
        <>
          {/* Previous Button */}
          <button
            type="button"
            className="
              absolute left-2 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20
              
              w-10 h-10 
              md:w-12 md:h-12 
              lg:w-14 lg:h-14
              
              rounded-full 
              bg-black/30 
              backdrop-blur-md 
              border border-white/30
              
              flex items-center justify-center
              text-white text-sm md:text-base lg:text-lg
              
              hover:bg-amber-600 
              hover:border-amber-600 
              hover:scale-110
              active:scale-95
              
              transition-all duration-300
              
              focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
              
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            onClick={prev}
            aria-label="Previous banner"
          >
            <FaChevronLeft />
          </button>
          
          {/* Next Button */}
          <button
            type="button"
            className="
              absolute right-2 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20
              
              w-10 h-10 
              md:w-12 md:h-12 
              lg:w-14 lg:h-14
              
              rounded-full 
              bg-black/30 
              backdrop-blur-md 
              border border-white/30
              
              flex items-center justify-center
              text-white text-sm md:text-base lg:text-lg
              
              hover:bg-amber-600 
              hover:border-amber-600 
              hover:scale-110
              active:scale-95
              
              transition-all duration-300
              
              focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
              
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            onClick={next}
            aria-label="Next banner"
          >
            <FaChevronRight />
          </button>

          {/* Pagination Dots */}
          <div 
            className="
              absolute bottom-4 md:bottom-6 lg:bottom-8 
              left-1/2 -translate-x-1/2 
              z-20
              
              flex items-center gap-2 md:gap-3
              
              px-3 py-2
              rounded-full
              bg-black/20
              backdrop-blur-sm
            "
            role="tablist"
            aria-label="Banner pagination"
          >
            {slides.map((slide, i) => (
              <button
                key={slide._id || slide.id}
                type="button"
                role="tab"
                className={`
                  h-2 
                  rounded-full
                  border border-white/75
                  transition-all duration-300
                  
                  hover:bg-white/55
                  
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20
                  
                  ${i === index 
                    ? 'w-8 md:w-10 bg-amber-500 border-amber-500 scale-110' 
                    : 'w-2 bg-white/25'
                  }
                `}
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
                aria-selected={i === index}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
