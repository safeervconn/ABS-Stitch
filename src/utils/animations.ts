/**
 * Animation Utilities
 * 
 * Centralized animation configurations and utilities for consistent
 * animations across the application using CSS-in-JS and Framer Motion.
 */

/**
 * Standard animation durations in milliseconds
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

/**
 * Easing functions for smooth animations
 */
export const EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Common animation variants for consistent motion
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION_DURATIONS.normal / 1000, ease: EASING.easeOut }
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: ANIMATION_DURATIONS.normal / 1000, ease: EASING.easeOut }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: ANIMATION_DURATIONS.fast / 1000, ease: EASING.easeOut }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

/**
 * CSS animation classes for performance-optimized animations
 */
export const animationClasses = {
  fadeInUp: 'animate-[fadeInUp_0.6s_ease-out_forwards]',
  slideInRight: 'animate-[slideInRight_0.6s_ease-out_forwards]',
  scaleIn: 'animate-[scaleIn_0.3s_ease-out_forwards]',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  shimmer: 'animate-[shimmer_2s_infinite]',
} as const;

/**
 * Hover animation utilities
 */
export const hoverAnimations = {
  lift: 'transform transition-all duration-300 hover:scale-105 hover:shadow-lg',
  glow: 'transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  slideUp: 'transform transition-all duration-300 hover:-translate-y-1',
  rotate: 'transform transition-all duration-300 hover:rotate-3',
} as const;

/**
 * Loading animation component styles
 */
export const loadingSpinner = {
  container: 'flex items-center justify-center',
  spinner: 'w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin',
  text: 'ml-2 text-gray-600 font-medium',
} as const;

/**
 * Stagger animation delay calculator
 * @param index - Item index
 * @param baseDelay - Base delay in milliseconds
 * @returns CSS animation delay
 */
export const getStaggerDelay = (index: number, baseDelay: number = 100): string => {
  return `${index * baseDelay}ms`;
};

/**
 * Generate CSS transform for smooth hover effects
 * @param scale - Scale factor
 * @param translateY - Y translation in pixels
 * @returns CSS transform string
 */
export const generateHoverTransform = (scale: number = 1.05, translateY: number = -2): string => {
  return `scale(${scale}) translateY(${translateY}px)`;
};