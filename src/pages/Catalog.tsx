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
import { ArrowLeft, Search, Filter, Star, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import AddToCartButton from '../components/AddToCartButton';
import { getProducts, getProductCategories } from '../lib/supabase';

interface Product {
  id: string;
  title: string;
  description: string;
  category: string | { name: string };
  price: number;
  original_price?: number;
  image_url: string;
  tags: string[];
  created_at: string;
}

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts({
            category: selectedCategory,
            search: searchTerm,
            sortBy: sortBy
          }),
          getProductCategories()
        ]);
        
        setProducts(productsData || []);
        setCategories(categoriesData || ['All']);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchTerm, sortBy]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  // Generate star rating display
  const renderStars = (rating: number = 5) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <Navbar />
      
      {/* Background spotlight effects */}
      <div className="absolute inset-0 -z-10">
        <div className="spotlight spotlight-1"></div>
        <div className="spotlight spotlight-2"></div>
        <div className="spotlight spotlight-3"></div>
      </div>

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
          <div className="grid md:grid-cols-4 gap-4">
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

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
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
              <div key={product.id} className="glass rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group transform hover:scale-105">
                
                {/* Product Image */}
                <div className="relative">
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
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
                      {product.title}
                    </h3>
                    <div className="text-right">
                      <span className="text-blue-600 font-bold text-xl">${product.price.toFixed(2)}</span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-gray-400 line-through text-sm ml-2">${product.original_price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-blue-500 text-sm mb-2 font-medium">{product.category}</p>
                  <p className="text-blue-500 text-sm mb-2 font-medium">
                    {typeof product.category === 'object' ? product.category?.name : product.category}
                  </p>
                   <p className="text-blue-500 text-sm mb-2 font-medium">{product.category.name}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(5)}
                      <span className="text-gray-500 text-sm ml-2">(5.0)</span>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Add to Cart Button */}
                  <AddToCartButton
                    item={{
                      id: product.id,
                      title: product.title,
                      price: `$${product.price.toFixed(2)}`,
                      image: product.image_url,
                      category: typeof product.category === 'object' ? product.category.name : product.category
                    }}
                    className="w-full shadow-lg transform hover:scale-105"
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
                  setSelectedCategory('All');
                  setSortBy('newest');
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold transform hover:scale-105"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && products.length > 0 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            <button className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold">
              Previous
            </button>
            
            <div className="flex space-x-2">
              <button className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg font-semibold">1</button>
              <button className="px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg font-semibold">2</button>
              <button className="px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg font-semibold">3</button>
            </div>
            
            <button className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg font-semibold">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;