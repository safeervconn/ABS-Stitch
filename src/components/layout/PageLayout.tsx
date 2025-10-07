/**
 * Page Layout Component
 * 
 * Standardized layout wrapper for all pages with SEO optimization,
 * loading states, and consistent structure.
 */

import React from 'react';
import SEOHead from '../ui/SEOHead';
import LoadingSpinner from '../ui/LoadingSpinner';
import { seoConfigs } from '../../utils/seo';

interface PageLayoutProps {
  children: React.ReactNode;
  seoPage?: keyof typeof seoConfigs;
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  includeBusinessData?: boolean;
}

/**
 * Standardized page layout with SEO and loading state management
 * Provides consistent structure and performance optimizations
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  seoPage,
  title,
  description,
  loading = false,
  error,
  className = '',
  includeBusinessData = false,
}) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        page={seoPage}
        title={title}
        description={description}
        includeBusinessData={includeBusinessData}
      />
      <div className={`min-h-screen ${className}`}>
        {children}
      </div>
    </>
  );
};

export default PageLayout;