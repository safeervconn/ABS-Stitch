/**
 * Card Component
 * 
 * Reusable card component with consistent styling, hover effects,
 * and optional animations for better user experience.
 */

import React from 'react';
import AnimatedCard from './AnimatedCard';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'white' | 'gray' | 'gradient' | 'glass';
  hoverEffect?: 'lift' | 'glow' | 'slideUp' | 'rotate' | 'none';
  entranceAnimation?: 'fadeInUp' | 'slideInRight' | 'scaleIn' | 'none';
  delay?: number;
  onClick?: () => void;
}

/**
 * Flexible card component with performance-optimized animations
 * Supports various styling options and hover effects
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  rounded = 'lg',
  background = 'white',
  hoverEffect = 'lift',
  entranceAnimation = 'fadeInUp',
  delay = 0,
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    glass: 'bg-white/80 backdrop-blur-sm border-white/20',
  };

  const borderClasses = border ? 'border border-gray-200' : '';

  return (
    <AnimatedCard
      className={`
        ${backgroundClasses[background]}
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${roundedClasses[rounded]}
        ${borderClasses}
        ${className}
      `}
      hoverEffect={hoverEffect}
      entranceAnimation={entranceAnimation}
      delay={delay}
      onClick={onClick}
    >
      {children}
    </AnimatedCard>
  );
};

export default Card;