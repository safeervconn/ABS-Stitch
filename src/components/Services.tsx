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
import '../styles/material3.css';

const Services: React.FC = () => {
  // Services data
  const services = [
    {
      id: 1,
      title: "Custom Embroidery",
      description: "Precision embroidery tailored to your vision and brand",
      icon: Shirt,
      color: "var(--md-sys-color-primary)"
    },
    {
      id: 2,
      title: "Logo Stitching",
      description: "Professional logo embroidery that represents your business",
      icon: Award,
      color: "var(--md-sys-color-secondary)"
    },
    {
      id: 3,
      title: "Apparel Customization",
      description: "Custom stitching for any garment or textile",
      icon: Palette,
      color: "var(--md-sys-color-tertiary)"
    },
    {
      id: 4,
      title: "Quick Turnaround",
      description: "Fast delivery without compromising quality",
      icon: Zap,
      color: "var(--md-sys-color-primary)"
    },
    {
      id: 5,
      title: "Team Collaboration",
      description: "Work directly with our creative professionals",
      icon: Users,
      color: "var(--md-sys-color-secondary)"
    },
    {
      id: 6,
      title: "Premium Quality",
      description: "High-resolution, print-ready artwork",
      icon: Sparkles,
      color: "var(--md-sys-color-tertiary)"
    }
  ];

  return (
    <section className="py-16 md-surface-container-low" id="services">
      <div className="md-container">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="md-headline-large mb-4" style={{color: 'var(--md-sys-color-on-surface)'}}>
            Our Services
          </h2>
          <p className="md-body-large max-w-2xl mx-auto" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
            We offer comprehensive embroidery and stitching services to bring your creative vision to life
          </p>
        </div>

        {/* Services Grid */}
        <div className="md-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md-gap-6">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={service.id} 
                className="md-card md-card-elevated md-p-6"
              >
                {/* Service Icon */}
                <div className="w-12 h-12 md-shape-medium md-flex md-items-center md-justify-center mb-4 md-surface-container-high">
                  <IconComponent className="h-6 w-6" style={{color: service.color}} />
                </div>

                {/* Service Info */}
                <h3 className="md-title-large mb-2" style={{color: 'var(--md-sys-color-on-surface)'}}>
                  {service.title}
                </h3>
                <p className="md-body-medium" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
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