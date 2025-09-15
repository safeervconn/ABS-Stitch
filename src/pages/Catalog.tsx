/**
+ * Catalog Page Component
+ * 
+ * Features:
+ * - Full catalog of digital artwork for sale
+ * - Filter and search functionality
+ * - Grid layout with product cards
+ * - Pagination for large catalogs
+ * - E-commerce style product display
+ */

import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Catalog: React.FC = () => {
  const { addToCart } = useCart();

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
      tags: ["abstract", "waves", "blue"],
      description: "Beautiful abstract wave design perfect for modern applications"
    },
    {
      id: 2,
      title: "Geometric Patterns",
      category: "T-Shirt Design",
      price: "$30",
      rating: 5,
      reviews: 18,
      image: "https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["geometric", "pattern", "modern"],
      description: "Clean geometric patterns ideal for apparel and branding"
    },
    {
      id: 3,
      title: "Nature Inspired",
      category: "Logo Design",
      price: "$35",
      rating: 4,
      reviews: 12,
      image: "https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["nature", "organic", "green"],
      description: "Organic nature-inspired design for eco-friendly brands"
    },
    {
      id: 4,
      title: "Minimalist Icons",
      category: "Icon Set",
      price: "$20",
      rating: 5,
      reviews: 31,
      image: "https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["minimalist", "icons", "clean"],
      description: "Clean minimalist icon set for professional applications"
    },
    {
      id: 5,
      title: "Vintage Typography",
      category: "T-Shirt Design",
      price: "$28",
      rating: 4,
      reviews: 15,
      image: "https://images.pexels.com/photos/1070542/pexels-photo-1070542.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["vintage", "typography", "retro"],
      description: "Retro vintage typography perfect for nostalgic designs"
    },
    {
      id: 6,
      title: "Modern Landscapes",
      category: "Wall Art",
      price: "$40",
      rating: 5,
      reviews: 22,
      image: "https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["landscape", "modern", "art"],
      description: "Contemporary landscape art for interior decoration"
    },
    {
      id: 7,
      title: "Cosmic Dreams",
      category: "Digital Art",
      price: "$32",
      rating: 5,
      reviews: 19,
      image: "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["space", "cosmic", "purple"],
      description: "Dreamy cosmic artwork with vibrant space themes"
    },
    {
      id: 8,
      title: "Urban Street Art",
      category: "T-Shirt Design",
      price: "$26",
      rating: 4,
      reviews: 27,
      image: "https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["urban", "street", "graffiti"],
      description: "Bold urban street art style for edgy apparel designs"
    },
    {
      id: 9,
      title: "Floral Elegance",
      category: "Logo Design",
      price: "$38",
      rating: 5,
      reviews: 16,
      image: "https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["floral", "elegant", "feminine"],
      description: "Elegant floral designs perfect for beauty and wellness brands"
    },
    {
      id: 10,
      title: "Tech Circuit",
      category: "Digital Art",
      price: "$29",
      rating: 4,
      reviews: 21,
      image: "https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["tech", "circuit", "digital"],
      description: "High-tech circuit board design for technology companies"
    },
    {
      id: 11,
      title: "Watercolor Splash",
      category: "Wall Art",
      price: "$33",
      rating: 5,
      reviews: 14,
      image: "https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["watercolor", "artistic", "colorful"],
      description: "Vibrant watercolor splash art for creative spaces"
    },
    {
      id: 12,
      title: "Monogram Collection",
      category: "Logo Design",
      price: "$24",
      rating: 4,
      reviews: 18,
      image: "https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["monogram", "classic", "elegant"],
      description: "Classic monogram designs for personal branding"
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
            onClick={() => window.location.href = '/'}
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
                  className="w-full h-48 object-cover"
                />
                
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
                
                <p className="text-gray-500 text-sm mb-2">{artwork.category}</p>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">{artwork.description}</p>
                
                {/* Rating and Reviews */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < artwork.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-gray-500 text-sm ml-1">({artwork.reviews})</span>
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <button 
                  onClick={() => addToCart({
                    id: artwork.id.toString(),
                    title: artwork.title,
                    price: artwork.price,
                    image: artwork.image,
                    category: artwork.category
                  })}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4 mt-12">
          <button className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            Previous
          </button>
          
          <div className="flex space-x-2">
            <button className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg">1</button>
            <button className="px-3 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg">2</button>
            <button className="px-3 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg">3</button>
            <span className="px-3 py-2 text-gray-500">...</span>
            <button className="px-3 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg">8</button>
          </div>
          
          <button className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Catalog;