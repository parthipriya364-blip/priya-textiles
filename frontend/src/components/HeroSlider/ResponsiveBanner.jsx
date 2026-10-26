/**
 * ResponsiveBanner - Variation A
 * Single <img> tag with responsive Tailwind utilities
 * Uses srcset/sizes for bandwidth optimization
 */
export default function ResponsiveBanner({ slide, isActive }) {
  return (
    <img
      // Responsive sizing across breakpoints
      // Mobile: h-64 (256px) | Tablet: h-80 (320px) | Desktop: h-[500px] | XL: h-[600px]
      className={`
        w-full h-64 
        md:h-80 
        lg:h-[500px] 
        xl:h-[600px] 
        
        object-cover object-center
        
        rounded-lg 
        md:rounded-xl 
        lg:rounded-2xl
        
        lg:shadow-xl 
        lg:max-w-7xl 
        lg:mx-auto
        
        transition-all duration-300
        
        ${isActive ? 'opacity-100' : 'opacity-0'}
      `}
      
      // Bandwidth optimization - browser loads appropriate size
      srcSet={`
        ${slide.image?.url || slide.image}?w=640 640w,
        ${slide.image?.url || slide.image}?w=768 768w,
        ${slide.image?.url || slide.image}?w=1024 1024w,
        ${slide.image?.url || slide.image}?w=1280 1280w,
        ${slide.image?.url || slide.image}?w=1920 1920w
      `}
      
      // Tells browser which image to load based on viewport
      sizes="
        (max-width: 640px) 640px,
        (max-width: 768px) 768px,
        (max-width: 1024px) 1024px,
        (max-width: 1280px) 1280px,
        1920px
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
  );
}
