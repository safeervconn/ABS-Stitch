/**
 * Catalog Page Component
 * 
 * Features:
 * - Full catalog of digital artwork for sale
 * - Filter and search functionality
 * - Grid layout with product cards
 * - Pagination for large catalogs
 * - E-commerce style product display
 */

import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Star, Eye, Heart } from 'lucide-react';

const Catalog: React.FC = () => {
  // Sample artwork data - expanded for full catalog
  const allArtwork = [
    {
      id: 1,
      title: "Abstract Waves",
      category: "Digital Art",
      price: "$25",
      originalPrice: "$35",
      rating: 5,
      reviews: 24,
      image: "https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["abstract", "waves", "blue"]
    },
    {
      id: 2,
      title: "Geometric Patterns",
      category: "T-Shirt Design",
      price: "$30",
      rating: 5,
      reviews: 18,
      image: "https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["geometric", "pattern", "modern"]
    },
    {
      id: 3,
      title: "Nature Inspired",
      category: "Logo Design",
      price: "$35",
      rating: 4,
      reviews: 12,
      image: "https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["nature", "organic", "green"]
    },
    {
      id: 4,
      title: "Minimalist Icons",
      category: "Icon Set",
      price: "$20",
      rating: 5,
      reviews: 31,
      image: "https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["minimalist", "icons", "clean"]
    },
    {
      id: 5,
      title: "Vintage Typography",
      category: "T-Shirt Design",
      price: "$28",
      rating: 4,
      reviews: 15,
      image: "https://images.pexels.com/photos/1070542/pexels-photo-1070542.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["vintage", "typography", "retro"]
    },
    {
      id: 6,
      title: "Modern Landscapes",
      category: "Wall Art",
      price: "$40",
      rating: 5,
      reviews: 22,
      image: "https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["landscape", "modern", "art"]
    },
    // Additional items for a fuller catalog
    {
      id: 7,
      title: "Cosmic Dreams",
      category: "Digital Art",
      price: "$32",
      rating: 5,
      reviews: 19,
      image: "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["space", "cosmic", "purple"]
    },
    {
      id: 8,
      title: "Urban Street Art",
      category: "T-Shirt Design",
      price: "$26",
      rating: 4,
      reviews: 27,
      image: "https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["urban", "street", "graffiti"]
    }
  ];

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(allArtwork.map(item => item.category)))];

  // Filter and sort artwork
  const filteredArtwork = allArtwork
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', ''));
        case 'price-high':
          return parseInt(b.price.replace('$', '')) - parseInt(a.price.replace('$', ''));
        case 'rating':
          return b.rating - a.rating;
        default: // popular
          return b.reviews - a.reviews;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 mb-4 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Homepage</span>
          </button>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Digital Artwork Catalog
          </h1>
          <p className="text-xl text-blue-100">
            Browse our complete collection of professional digital artwork
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search artwork..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-600">
              <Filter className="h-5 w-5 mr-2" />
              <span>{filteredArtwork.length} results</span>
            </div>
          </div>
        </div>

        {/* Artwork Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtwork.map((artwork) => (
            <div key={artwork.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
              
              {/* Artwork Image */}
              <div className="relative">
                <img 
                  src={artwork.image} 
                  alt={artwork.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                  <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>

                {/* Sale Badge */}
                {artwork.originalPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    SALE
                  </div>
                )}
              </div>

              {/* Artwork Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {artwork.title}
                  </h3>
                  <div className="text-right">
                    <span className="text-blue-600 font-bold text-lg">{artwork.price}</span>
                    {artwork.originalPrice && (
                      <span className="text-gray-400 line-through text-sm ml-1">{artwork.originalPrice}</span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-500 text-sm mb-3">{artwork.category}</p>
                
                {/* Rating and Reviews */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < artwork.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-gray-500 text-sm ml-1">({artwork.reviews})</span>
                  </div>
                  
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm hover:from-blue-700 hover:to-indigo-700 transition-all">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More / Pagination */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold">
            Load More Artwork
          </button>
        </div>
      </div>
    </div>
  );
};

export default Catalog;