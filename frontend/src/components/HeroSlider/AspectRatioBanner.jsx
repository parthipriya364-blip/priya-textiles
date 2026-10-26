/**
 * AspectRatioBanner - Variation C
 * Modern aspect-ratio based approach
 * Container uses aspect-ratio, image fills with object-fit
 * Most flexible and maintainable solution
 */
export default function AspectRatioBanner({ slide, isActive }) {
  return (
    <div className={`
      w-full 
      
      /* Responsive aspect ratios: Mobile 4:3 -> Tablet 16:10 -> Desktop 16:9 -> XL 21:9 */
      aspect-[4/3] 
      md:aspect-[16/10] 
      lg:aspect-video 
      xl:aspect-[21/9]
      
      /* Maximum heights to prevent oversized banners */
      max-h-[300px]
      md:max-h-[450px]
      lg:max-h-[600px]
      xl:max-h-[700px]
      
      /* Center on large screens with max width constraint */
      lg:max-w-7xl 
      lg:mx-auto
      
      overflow-hidden 
      
      /* Progressive border radius enhancement */
      rounded-lg 
      md:rounded-xl 
      lg:rounded-2xl
      
      /* Enhanced shadows for depth */
      shadow-md 
      md:shadow-lg 
      lg:shadow-2xl
      
      relative
      
      ${isActive ? 'opacity-100' : 'opacity-0'}
      transition-opacity duration-1000
    `}>
      <img
        className="
          w-full 
          h-full 
          object-cover 
          object-center
          
          /* Subtle zoom effect on hover (desktop only) */
          hover:scale-105 
          transition-transform 
          duration-700 
          ease-out
        "
        srcSet={`
          ${slide.image?.url || slide.image}?w=640 640w,
          ${slide.image?.url || slide.image}?w=768 768w,
          ${slide.image?.url || slide.image}?w=1024 1024w,
          ${slide.image?.url || slide.image}?w=1280 1280w,
          ${slide.image?.url || slide.image}?w=1920 1920w
        `}
        sizes="
          (max-width: 640px) 100vw,
          (max-width: 1024px) 100vw,
          1280px
        "
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
    </div>
  );
}
