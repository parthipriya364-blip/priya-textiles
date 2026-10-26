/**
 * ArtDirectedBanner - Variation B
 * <picture> element with art direction
 * Loads completely different cropped images for desktop vs mobile
 * Best for banners where subject positioning differs by device
 */
export default function ArtDirectedBanner({ slide, isActive }) {
  return (
    <picture className="block w-full">
      {/* Desktop (≥1024px): Load wide cinematic banner */}
      <source
        media="(min-width: 1024px)"
        srcSet={`
          ${slide.image?.url || slide.image}?w=1920&h=700&c=fill&g=center 1920w,
          ${slide.image?.url || slide.image}?w=1280&h=467&c=fill&g=center 1280w
        `}
        sizes="(min-width: 1280px) 1280px, 100vw"
      />
      
      {/* Tablet (768px-1023px): Medium-sized banner with balanced crop */}
      <source
        media="(min-width: 768px)"
        srcSet={`
          ${slide.image?.url || slide.image}?w=1024&h=640&c=fill&g=center 1024w,
          ${slide.image?.url || slide.image}?w=768&h=480&c=fill&g=center 768w
        `}
        sizes="100vw"
      />
      
      {/* Mobile (<768px): Portrait-optimized crop focusing on center subject */}
      <source
        media="(max-width: 767px)"
        srcSet={`
          ${slide.image?.url || slide.image}?w=640&h=480&c=fill&g=face 640w,
          ${slide.image?.url || slide.image}?w=480&h=360&c=fill&g=face 480w,
          ${slide.image?.url || slide.image}?w=375&h=280&c=fill&g=face 375w
        `}
        sizes="100vw"
      />
      
      {/* Fallback image with responsive Tailwind classes */}
      <img
        className={`
          w-full 
          h-64 
          md:h-80 
          lg:h-[500px] 
          xl:h-[600px]
          
          object-cover 
          object-center 
          lg:object-top
          
          rounded-lg 
          md:rounded-xl 
          lg:rounded-2xl
          
          lg:shadow-xl
          lg:max-w-7xl 
          lg:mx-auto
          
          transition-all 
          duration-300
          
          ${isActive ? 'opacity-100' : 'opacity-0'}
        `}
        src={slide.image?.url || slide.image}
        alt={`${slide.title || 'PRIYA TEXTILES collection'} banner`}
        loading={isActive ? "eager" : "lazy"}
        fetchPriority={isActive ? "high" : "auto"}
        decoding="async"
        onError={(e) => {
          console.error(`Failed to load banner: ${slide.image?.url || slide.image}`);
          e.target.style.display = 'none';
        }}
      />
    </picture>
  );
}
