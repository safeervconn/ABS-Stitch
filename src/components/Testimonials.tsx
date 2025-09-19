/**
 * Testimonials Component
 * 
 * Features:
 * - Continuous sliding carousel with 3-4 visible cards
 * - Smooth right-to-left animation
 * - Auto-play functionality
 * - Responsive design
 */

import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  // Extended testimonials data for continuous carousel
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      company: "Fashion Startup",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "ArtistryDigital transformed my rough sketches into beautiful t-shirt designs. The quality exceeded my expectations!"
    },
    {
      id: 2,
      name: "Mike Chen",
      company: "Tech Company",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "I needed a logo for my startup and they delivered multiple concepts quickly. Perfect brand identity!"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      company: "Local Business",
      image: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4,
      text: "Professional service and great communication. They made my vision even better than I imagined."
    },
    {
      id: 4,
      name: "David Park",
      company: "Marketing Agency",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "Consistent quality, fair pricing, and always on time. They're an essential part of our team."
    },
    {
      id: 5,
      name: "Lisa Thompson",
      company: "E-commerce Store",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "Amazing artwork for our product line. Sales increased 40% after using their designs!"
    },
    {
      id: 6,
      name: "James Wilson",
      company: "Restaurant Chain",
      image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4,
      text: "Creative menu designs and branding materials. Our customers love the new look!"
    }
  ];

  // Duplicate testimonials for seamless loop
  const extendedTestimonials = [...testimonials, ...testimonials];
  
  const [currentOffset, setCurrentOffset] = useState(0);
  const cardWidth = 320; // Width of each card including margin
  const visibleCards = 3; // Number of cards visible at once

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffset(prev => {
        const newOffset = prev + 1;
        // Reset to beginning when we've moved through all original cards
        if (newOffset >= testimonials.length) {
          return 0;
        }
        return newOffset;
      });
    }, 3000); // Move every 3 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

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

        {/* Continuous Carousel Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-1000 ease-in-out"
            style={{ 
              transform: `translateX(-${currentOffset * cardWidth}px)`,
              width: `${extendedTestimonials.length * cardWidth}px`
            }}
          >
            {extendedTestimonials.map((testimonial, index) => (
              <div 
                key={`${testimonial.id}-${Math.floor(index / testimonials.length)}`}
                className="flex-shrink-0 px-3"
                style={{ width: `${cardWidth}px` }}
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm h-80 flex flex-col">
                  
                  {/* Quote Icon */}
                  <div className="text-blue-200 mb-3">
                    <Quote className="h-6 w-6" />
                  </div>

                  {/* Customer Photo */}
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{testimonial.name}</p>
                      <p className="text-gray-500 text-xs">{testimonial.company}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-gray-700 text-sm leading-relaxed flex-grow">
                    "{testimonial.text}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === (currentOffset % testimonials.length) ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;