/**
 * Animated Card Component
 * 
 * Reusable card component with smooth hover animations and
 * intersection observer for entrance animations.
 */

import React from 'react';
import { useIntersectionObserver } from '../../utils/performance';
import { animationClasses, hoverAnimations } from '../../utils/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'slideUp' | 'rotate' | 'none';
  entranceAnimation?: 'fadeInUp' | 'slideInRight' | 'scaleIn' | 'none';
  delay?: number;
  onClick?: () => void;
}

/**
 * Performance-optimized animated card with intersection observer
 * Only animates when visible in viewport to improve performance
 */
const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverEffect = 'lift',
  entranceAnimation = 'fadeInUp',
  delay = 0,
  onClick,
}) => {
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  const getHoverClasses = () => {
    if (hoverEffect === 'none') return '';
    return hoverAnimations[hoverEffect];
  };

  const getEntranceClasses = () => {
    if (entranceAnimation === 'none') return '';
    if (!hasIntersected) return 'opacity-0 translate-y-4';
    return animationClasses[entranceAnimation];
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`
        ${className}
        ${getHoverClasses()}
        ${getEntranceClasses()}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;