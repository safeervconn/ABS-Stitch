/**
 * Services Section Component
 * 
 * Features:
 * - Grid of service cards showing what the business offers
 * - Icons for each service type
 * - Clean, modern design with hover effects
 * - Responsive layout
 */

import React from 'react';
import { Palette, Shirt, Award, Zap, Users, Sparkles } from 'lucide-react';

const Services: React.FC = () => {
  // Services data
  const services = [
    {
      id: 1,
      title: "Custom Embroidery",
      description: "Precision embroidery tailored to your vision and brand",
      icon: Shirt,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Logo Stitching",
      description: "Professional logo embroidery that represents your business",
      icon: Award,
      color: "from-purple-600 to-pink-600"
    },
    {
      id: 3,
      title: "Apparel Customization",
      description: "Custom stitching for any garment or textile",
      icon: Palette,
      color: "from-green-600 to-emerald-600"
    },
    {
      id: 4,
      title: "Quick Turnaround",
      description: "Fast delivery without compromising quality",
      icon: Zap,
      color: "from-yellow-600 to-orange-600"
    },
    {
      id: 5,
      title: "Team Collaboration",
      description: "Work directly with our creative professionals",
      icon: Users,
      color: "from-indigo-600 to-blue-600"
    },
    {
      id: 6,
      title: "Premium Quality",
      description: "High-resolution, print-ready artwork",
      icon: Sparkles,
      color: "from-pink-600 to-rose-600"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white" id="services">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We offer comprehensive embroidery and stitching services to bring your creative vision to life
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={service.id} 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
              >
                {/* Service Icon */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>

                {/* Service Info */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;