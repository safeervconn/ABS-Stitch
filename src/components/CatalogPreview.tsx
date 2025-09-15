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
import { Eye, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CatalogPreview: React.FC = () => {
  const { addToCart } = useCart();

  // Sample artwork data - in a real app, this would come from an API
  const sampleArtwork = [
    {
      id: 1,
      title: "Abstract Waves",
      category: "Digital Art",
      price: "$25",
      rating: 5,
      image: "https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      title: "Geometric Patterns",
      category: "T-Shirt Design",
      price: "$30",
      rating: 5,
      image: "https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 3,
      title: "Nature Inspired",
      category: "Logo Design",
      price: "$35",
      rating: 4,
      image: "https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 4,
      title: "Minimalist Icons",
      category: "Icon Set",
      price: "$20",
      rating: 5,
      image: "https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 5,
      title: "Vintage Typography",
      category: "T-Shirt Design",
      price: "$28",
      rating: 4,
      image: "https://images.pexels.com/photos/1070542/pexels-photo-1070542.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 6,
      title: "Modern Landscapes",
      category: "Wall Art",
      price: "$40",
      rating: 5,
      image: "https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50" id="catalog">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Ready-Made Digital Artwork
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our collection of professionally designed digital artwork, ready for immediate download and use.
          </p>
        </div>

        {/* Artwork Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sampleArtwork.map((artwork) => (
            <div key={artwork.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Artwork Image */}
              <div className="relative group">
                <img 
                  src={artwork.image} 
                  alt={artwork.title}
                  className="w-full h-48 object-cover"
                />
                
                {/* Overlay on Hover */}
              </div>

              {/* Artwork Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{artwork.title}</h3>
                  <span className="text-blue-600 font-bold">{artwork.price}</span>
                </div>
                
                <p className="text-gray-500 text-sm mb-3">{artwork.category}</p>
                
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < artwork.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-gray-500 text-sm ml-2">({artwork.rating}.0)</span>
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
                  className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 text-sm shadow-lg"
                >
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button 
            onClick={() => window.location.href = '/catalog'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold"
          >
            View All Artwork
          </button>
        </div>
      </div>
    </section>
  );
};

export default CatalogPreview;