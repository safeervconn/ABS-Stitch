/**
 * Optimized Catalog Preview Component
 * 
 * Performance-optimized catalog preview with lazy loading,
 * memoized product rendering, and smooth animations.
 */

import React, { memo } from 'react';
import { useOptimizedData } from '../../hooks/useOptimizedData';
import { getProducts } from '../../lib/supabase';
import LoadingSpinner from '../ui/LoadingSpinner';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LazyImage from '../ui/LazyImage';
import AddToCartButton from '../AddToCartButton';
import { animationClasses } from '../../utils/animations';

interface Product {
  id: string;
  title: string;
  description: string;
  apparel_type: { type_name: string } | null;
  price: number;
  image_url: string;
  created_at: string;
}

/**
 * Memoized product card component to prevent unnecessary re-renders
 */
const ProductCard = memo<{ product: Product; index: number }>(({ product, index }) => (
  <Card
    hoverEffect="lift"
    entranceAnimation="fadeInUp"
    delay={index * 100}
    className="overflow-hidden flex flex-col h-full"
  >
    {/* Lazy-loaded product image */}
    <div className="relative h-48">
      <LazyImage
        src={product.image_url}
        alt={product.title}
        className="w-full h-full object-cover"
        containerClassName="w-full h-full"
      />
    </div>

    {/* Product info with flex-grow for consistent card heights */}
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
          {product.title}
        </h3>
        <span className="text-blue-600 font-bold text-xl">
          ${product.price.toFixed(2)}
        </span>
      </div>

      <p className="text-blue-500 text-sm mb-2 font-medium">
        {product.apparel_type?.type_name}
      </p>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
        {product.description}
      </p>

      {/* Add to cart button pushed to bottom */}
      <AddToCartButton
        item={{
          id: product.id,
          title: product.title,
          price: `$${product.price.toFixed(2)}`,
          image: product.image_url,
          apparelType: product.apparel_type?.type_name || 'Uncategorized',
        }}
        className="w-full mt-auto"
      />
    </div>
  </Card>
));

ProductCard.displayName = 'ProductCard';

/**
 * Optimized catalog preview with performance enhancements
 * Uses memoization and lazy loading for better performance
 */
const OptimizedCatalogPreview: React.FC = memo(() => {
  // Optimized data fetching with caching
  const { data: products, loading, error } = useOptimizedData(
    () => getProducts({ limit: 6, sortBy: 'newest' }),
    [],
    { 
      cacheKey: 'catalog-preview',
      cacheDuration: 10 * 60 * 1000, // 10 minutes cache
      refetchOnWindowFocus: true
    }
  );

  /**
   * Navigate to full catalog page
   */
  const navigateToCatalog = React.useCallback(() => {
    window.location.href = '/catalog';
  }, []);

  return (
    <section 
      className="py-16 bg-gradient-to-b from-white to-gray-50" 
      id="catalog"
      aria-label="Catalog preview section"
    >
      <div className="container mx-auto px-4">
        
        {/* Section header with animation */}
        <div className={`text-center mb-12 ${animationClasses.fadeInUp}`}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Ready-Made Embroidery Designs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our collection of professionally designed embroidery patterns, ready for immediate stitching.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" text="Loading designs..." />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <Card background="white" className="max-w-md mx-auto text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                size="sm"
              >
                Retry
              </Button>
            </Card>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && (!products || products.length === 0) && (
          <div className="text-center py-16">
            <Card background="white" className="max-w-md mx-auto text-center">
              <div className="text-gray-300 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Designs Available</h3>
              <p className="text-gray-600 mb-6">Check back soon for new embroidery designs!</p>
            </Card>
          </div>
        )}

        {/* Products grid with optimized rendering */}
        {!loading && !error && products && products.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>

            {/* View all button */}
            <div className={`text-center ${animationClasses.fadeInUp}`} style={{ animationDelay: '600ms' }}>
              <Button
                onClick={navigateToCatalog}
                variant="warning"
                size="lg"
                animation="lift"
              >
                View All Designs
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
});

OptimizedCatalogPreview.displayName = 'OptimizedCatalogPreview';

export default OptimizedCatalogPreview;