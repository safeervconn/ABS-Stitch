/**
 * Testimonials Component
 * 
 * Features:
 * - Customer testimonials carousel
 * - Simple click-through navigation
 * - Customer photos and ratings
 * - Responsive design
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  // Sample testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      company: "Fashion Startup",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "ArtistryDigital transformed my rough sketches into beautiful t-shirt designs. The quality exceeded my expectations and the turnaround time was incredible!"
    },
    {
      id: 2,
      name: "Mike Chen",
      company: "Tech Company",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "I needed a logo for my startup and they delivered multiple concepts quickly. The final design perfectly captures our brand identity. Highly recommended!"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      company: "Local Business",
      image: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4,
      text: "Professional service and great communication throughout the project. They took my vision and made it even better than I imagined."
    },
    {
      id: 4,
      name: "David Park",
      company: "Marketing Agency",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "We use ArtistryDigital for all our client projects. Consistent quality, fair pricing, and always on time. They're an essential part of our team."
    }
  ];

  // State to track current testimonial
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600">
            Don't just take our word for it - hear from satisfied customers
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 md:p-12 relative shadow-lg">
            
            {/* Quote Icon */}
            <div className="absolute top-6 left-6 text-blue-200">
              <Quote className="h-12 w-12" />
            </div>

            {/* Current Testimonial */}
            <div className="text-center">
              
              {/* Customer Photo */}
              <img 
                src={testimonials[currentIndex].image} 
                alt={testimonials[currentIndex].name}
                className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
              />

              {/* Rating */}
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < testimonials[currentIndex].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-lg md:text-xl text-gray-700 mb-6 italic leading-relaxed font-medium">
                "{testimonials[currentIndex].text}"
              </blockquote>

              {/* Customer Info */}
              <div>
                <p className="font-bold text-gray-800 text-lg">{testimonials[currentIndex].name}</p>
                <p className="text-gray-500">{testimonials[currentIndex].company}</p>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            
            <button 
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;