/**
 * Button Component
 * 
 * Reusable button component with consistent styling, animations,
 * and accessibility features across the application.
 */

import React from 'react';
import { Loader } from 'lucide-react';
import { hoverAnimations } from '../../utils/animations';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  gradient?: boolean;
  animation?: 'lift' | 'glow' | 'none';
}

/**
 * Optimized button component with consistent styling and animations
 * Includes loading states, icons, and accessibility features
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = true,
  animation = 'lift',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 shadow-lg'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: gradient
      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 focus:ring-gray-500 shadow-lg'
      : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: gradient
      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 shadow-lg'
      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: gradient
      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg'
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: gradient
      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-700 hover:to-orange-700 focus:ring-yellow-500 shadow-lg'
      : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500 border border-gray-300',
  };

  const animationClasses = animation !== 'none' ? hoverAnimations[animation] : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${animationClasses}
        ${widthClasses}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader className="w-4 h-4 animate-spin mr-2" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;