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
import Navbar from '../components/Navbar';
import AddToCartButton from '../components/AddToCartButton';
import { getProducts, getApparelTypes } from '../lib/supabase';

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

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [apparelTypes, setApparelTypes] = useState<ApparelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApparelType, setSelectedApparelType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch products and apparel types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productsData, apparelTypesData] = await Promise.all([
          getProducts({
            apparelType: selectedApparelType,
            search: searchTerm,
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
  }, [selectedApparelType, searchTerm, sortBy]);

  const handleSearch = (term: string) => setSearchTerm(term);
  const handleApparelTypeChange = (type: string) => setSelectedApparelType(type);
  const handleSortChange = (sort: string) => setSortBy(sort);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Navigation */}
      <Navbar />

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
        <div className="glass rounded-2xl shadow-2xl p-6 mb-8">
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass rounded-2xl shadow-2xl p-6 mb-8 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading products...</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="glass rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group transform hover:scale-105 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
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
                    className="w-full shadow-lg transform hover:scale-105 mt-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <div className="glass rounded-2xl shadow-2xl p-12 max-w-md mx-auto">
              <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedApparelType('All');
                  setSortBy('newest');
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold transform hover:scale-105"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
