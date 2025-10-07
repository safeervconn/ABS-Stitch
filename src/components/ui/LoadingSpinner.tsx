/**
 * Loading Spinner Component
 * 
 * Reusable loading spinner with customizable size, color, and text.
 * Optimized for performance with CSS animations.
 */

import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'purple' | 'gray';
  text?: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Performance-optimized loading spinner component
 * Uses CSS animations instead of JavaScript for better performance
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text,
  className = '',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600',
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {showIcon && (
        <div
          className={`
            ${sizeClasses[size]}
            ${colorClasses[color]}
            border-2 border-t-transparent rounded-full animate-spin
          `}
        />
      )}
      {text && (
        <span className={`ml-2 font-medium ${textColorClasses[color]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;