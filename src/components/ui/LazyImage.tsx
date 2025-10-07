/**
 * Lazy Loading Image Component
 * 
 * Performance-optimized image component with lazy loading,
 * fallback handling, and smooth loading animations.
 */

import React, { useState } from 'react';
import { useIntersectionObserver } from '../../utils/performance';
import { animationClasses } from '../../utils/animations';

interface LazyImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  loadingClassName?: string;
  errorClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Lazy loading image component with intersection observer
 * Loads images only when they enter the viewport for better performance
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400',
  className = '',
  containerClassName = '',
  loadingClassName = 'bg-gray-200 animate-pulse',
  errorClassName = 'bg-gray-100',
  onLoad,
  onError,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Load image when it enters viewport
  React.useEffect(() => {
    if (isIntersecting && !imageSrc) {
      setImageSrc(src);
    }
  }, [isIntersecting, src, imageSrc]);

  /**
   * Handle successful image load
   */
  const handleLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.();
  };

  /**
   * Handle image load error with fallback
   */
  const handleError = () => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else {
      setImageError(true);
      setImageLoaded(false);
    }
    onError?.();
  };

  return (
    <div 
      ref={ref}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      {!imageLoaded && !imageError && (
        <div className={`absolute inset-0 ${loadingClassName}`} />
      )}
      
      {imageError && (
        <div className={`absolute inset-0 flex items-center justify-center ${errorClassName}`}>
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            ${className}
            ${imageLoaded ? `opacity-100 ${animationClasses.fadeInUp}` : 'opacity-0'}
            transition-opacity duration-300
          `}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;