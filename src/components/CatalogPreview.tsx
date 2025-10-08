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
import { Loader } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { getProducts } from '../lib/supabase';

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
    <section className="py-16 bg-gradient-to-b from-white to-gray-50" id="catalog">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Ready-Made Embroidery Designs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our collection of professionally designed embroidery patterns, ready for immediate stitching.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading designs...</p>
            </div>
          </div>
        )}

        {/* No Products State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <div className="text-gray-300 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Designs Available</h3>
              <p className="text-gray-600 mb-6">Check back soon for new embroidery designs!</p>
              
            </div>
          </div>
        )}
        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                
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
                </div>

               {/* Product Info - Flex layout to push button to bottom */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
                      {product.title}
                    </h3>
                    <div className="text-right">
                      <span className="text-blue-600 font-bold text-xl">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <p className="text-blue-500 text-sm mb-2 font-medium">{product.category?.name}</p>
                  <p className="text-blue-500 text-sm mb-2 font-medium">{product.apparel_type?.type_name}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">{product.description}</p>
                  
                  {/* Add to Cart Button */}
                  <AddToCartButton
                    item={{
                      id: product.id,
                      title: product.title,
                      price: `$${product.price.toFixed(2)}`,
                      image: product.image_url,
                      apparelType: product.apparel_type?.type_name || 'Uncategorized'
                    }}
                    className="w-full shadow-lg transform hover:scale-105 mt-auto"
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
              className="btn-purple btn-large px-8"
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