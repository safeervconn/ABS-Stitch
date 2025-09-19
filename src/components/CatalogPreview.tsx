/**
 * Catalog Preview Component
 * 
 * Features:
 * - Shows sample pre-made artwork
 * - Grid layout responsive to screen size
 * - "View All" button for future catalog page
 * - Placeholder images for artwork samples
 */

import React from 'react';
import { Star, Loader, ShoppingCart } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { getProducts } from '../lib/supabase';
import '../styles/material3.css';

const CatalogPreview: React.FC = () => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts({ 
          limit: 6,
          sortBy: 'newest'
        });
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Set fallback data if database fails
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-16 md-surface-container-lowest" id="catalog">
      <div className="md-container">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="md-headline-large mb-4" style={{color: 'var(--md-sys-color-on-surface)'}}>
            Ready-Made Embroidery Designs
          </h2>
          <p className="md-body-large max-w-2xl mx-auto" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
            Browse our collection of professionally designed embroidery patterns, ready for immediate stitching.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="md-flex md-items-center md-justify-center py-16">
            <div className="text-center">
              <div className="md-circular-progress mx-auto mb-4"></div>
              <p className="md-body-medium" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>Loading designs...</p>
            </div>
          </div>
        )}

        {/* No Products State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="md-card md-card-elevated md-p-8 max-w-md mx-auto">
              <div className="mb-4" style={{color: 'var(--md-sys-color-outline)'}}>
                <svg className="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="md-title-large mb-2" style={{color: 'var(--md-sys-color-on-surface)'}}>No Designs Available</h3>
              <p className="md-body-medium mb-6" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>Check back soon for new embroidery designs!</p>
              
            </div>
          </div>
        )}
        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="md-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md-gap-6 mb-12">
            {products.map((product) => (
              <div key={product.id} className="md-card md-card-elevated overflow-hidden">
                
                {/* Product Image */}
                <div className="relative group">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                  
                  {/* Sale Badge */}
                  {product.original_price && product.original_price > product.price && (
                    <div className="absolute top-2 left-2 md-shape-small md-p-2" style={{backgroundColor: 'var(--md-sys-color-error)', color: 'var(--md-sys-color-on-error)'}}>
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="md-p-4">
                  <div className="md-flex md-justify-between items-start mb-2">
                    <h3 className="md-title-medium" style={{color: 'var(--md-sys-color-on-surface)'}}>{product.title}</h3>
                    <div className="text-right">
                      <span className="md-title-medium" style={{color: 'var(--md-sys-color-primary)'}}>${product.price.toFixed(2)}</span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="md-body-small line-through ml-1" style={{color: 'var(--md-sys-color-outline)'}}>${product.original_price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="md-body-small mb-3" style={{color: 'var(--md-sys-color-secondary)'}}>{product.category}</p>
                  
                  {/* Rating */}
                  <div className="md-flex md-items-center md-gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < 5 ? 'fill-current' : ''}`}
                        style={{color: i < 5 ? '#FFC107' : 'var(--md-sys-color-outline)'}}
                      />
                    ))}
                    <span className="md-body-small ml-2" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>(5.0)</span>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <AddToCartButton
                    item={{
                      id: product.id,
                      title: product.title,
                      price: `$${product.price.toFixed(2)}`,
                      image: product.image_url,
                      category: product.category
                    }}
                    className="w-full mt-3"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {!loading && products.length > 0 && (
          <div className="text-center">
            <button 
              onClick={() => window.location.href = '/catalog'}
              className="md-filled-button"
            >
              View All Designs
            </button>
          </div>
        )}
        
        
        
      </div>
    </section>
  );
};

export default CatalogPreview;