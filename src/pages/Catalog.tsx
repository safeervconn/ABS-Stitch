/**
 * Catalog Page Component
 * 
 * Features:
 * - Database-driven product catalog
 * - Filter and search functionality
 * - Consistent design with sign-in page
 * - Responsive grid layout
 * - Real-time data fetching
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import OptimizedNavbar from '../components/optimized/OptimizedNavbar';
import AddToCartButton from '../components/AddToCartButton';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LazyImage from '../components/ui/LazyImage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getProducts, getApparelTypes } from '../lib/supabase';
import { useOptimizedSearch } from '../hooks/useOptimizedData';
import { useDebounce } from '../utils/performance';

interface Product {
  id: string;
  title: string;
  description: string;
  apparel_type: { type_name: string } | null;
  price: number;
  image_url: string;
  created_at: string;
}

interface ApparelType {
  id: string;
  type_name: string;
}

/**
 * Optimized catalog page with performance enhancements and SEO
 */
const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [apparelTypes, setApparelTypes] = useState<ApparelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApparelType, setSelectedApparelType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  /**
   * Fetch products and apparel types with error handling
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productsData, apparelTypesData] = await Promise.all([
          getProducts({
            apparelType: selectedApparelType,
            search: debouncedSearchTerm,
            sortBy: sortBy,
          }),
          getApparelTypes(),
        ]);

        setProducts(productsData || []);
        setApparelTypes(apparelTypesData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedApparelType, debouncedSearchTerm, sortBy]);

  /**
   * Handle search input changes
   */
  const handleSearch = (term: string) => setSearchTerm(term);
  
  /**
   * Handle apparel type filter changes
   */
  const handleApparelTypeChange = (type: string) => setSelectedApparelType(type);
  
  /**
   * Handle sort option changes
   */
  const handleSortChange = (sort: string) => setSortBy(sort);

  return (
    <PageLayout seoPage="catalog">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        <OptimizedNavbar />

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 relative z-10 shadow-2xl">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Embroidery Design Catalog
            </h1>
            <p className="text-lg text-blue-100">
              Browse our complete collection of professional embroidery designs
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Search and Filter Bar */}
          <Card
            background="glass"
            shadow="xl"
            rounded="2xl"
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search designs..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Apparel Type Filter */}
              <select
                value={selectedApparelType}
                onChange={(e) => handleApparelTypeChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
              >
                <option value="All">All Types</option>
                {apparelTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.type_name}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
              >
                <option value="newest">Newest First</option>
                <option value="title">Alphabetical</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center text-gray-600">
                <Filter className="h-5 w-5 mr-2" />
                <span>{products.length} results</span>
              </div>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <Card
              background="white"
              shadow="xl"
              rounded="2xl"
              className="mb-8 border-l-4 border-red-500"
            >
              <p className="text-red-700">{error}</p>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="lg" text="Loading products..." />
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <Card
                  key={product.id}
                  background="glass"
                  shadow="xl"
                  rounded="2xl"
                  hoverEffect="lift"
                  entranceAnimation="fadeInUp"
                  delay={index * 50}
                  className="overflow-hidden flex flex-col"
                >
                  {/* Product Image with lazy loading */}
                  <div className="relative h-48">
                    <LazyImage
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
                        {product.title}
                      </h3>
                      <div className="text-right">
                        <span className="text-blue-600 font-bold text-xl">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-blue-500 text-sm mb-2 font-medium">
                      {product.apparel_type?.type_name}
                    </p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
                      {product.description}
                    </p>

                    {/* Add to Cart */}
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
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16">
              <Card
                background="glass"
                shadow="xl"
                rounded="2xl"
                className="max-w-md mx-auto text-center"
                entranceAnimation="scaleIn"
              >
                <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedApparelType('All');
                    setSortBy('newest');
                  }}
                  variant="primary"
                  animation="lift"
                >
                  Clear Filters
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Catalog;
