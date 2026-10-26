import { useState } from 'react';

/**
 * SafeImage - A wrapper component that handles broken image URLs gracefully
 * 
 * Features:
 * - Automatically hides broken images
 * - Shows placeholder for missing images
 * - Handles Cloudinary 404 errors
 * - Logs errors for debugging
 * 
 * @param {string} src - Image URL
 * @param {string} alt - Alt text
 * @param {string} fallback - Optional fallback image URL
 * @param {function} onError - Optional error callback
 * @param {object} ...props - Other img attributes
 */
export default function SafeImage({ 
  src, 
  alt = '', 
  fallback = null, 
  onError = null,
  className = '',
  style = {},
  ...props 
}) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = (e) => {
    console.warn(`Failed to load image: ${currentSrc}`);
    
    // If there's a fallback and we haven't tried it yet
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      return;
    }

    // Mark as error and hide
    setImageError(true);
    e.target.style.display = 'none';

    // Call custom error handler if provided
    if (onError) {
      onError(e);
    }
  };

  // Don't render anything if image failed and no fallback
  if (imageError && !fallback) {
    return null;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}
