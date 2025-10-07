/**
 * Footer Component
 * 
 * Global footer component that provides:
 * - Company information and branding
 * - Organized navigation links
 * - Service listings for SEO
 * - Contact information
 * - Social media links
 * - Copyright and legal links
 */

import React from 'react';
import { Palette, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = React.memo(() => {
  /**
   * Service list for SEO and user information
   */
  const services = [
    'Custom Embroidery',
    'Logo Stitching', 
    'Apparel Customization',
    'Promotional Items',
    'Corporate Branding',
    'Patches & Badges',
    'Monogramming',
    'Design Consultations'
  ];

  /**
   * Quick navigation links
   */
  const quickLinks = [
    { href: '#home', label: 'Home' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/about', label: 'About Us' },
    { href: '/#services', label: 'Services' },
    { href: '#contact', label: 'Contact' }
  ];

  /**
   * Contact information configuration
   */
  const contactInfo = [
    { icon: Phone, text: '(123) 456-7890', href: 'tel:+1234567890' },
    { icon: Mail, text: 'hello@absstitch.com', href: 'mailto:hello@absstitch.com' },
    { icon: MapPin, text: 'Remote & Worldwide', href: null }
  ];

  /**
   * Social media links (placeholder)
   */
  const socialLinks = [
    { name: 'FB', label: 'Facebook' },
    { name: 'IG', label: 'Instagram' },
    { name: 'TW', label: 'Twitter' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ABS STITCH</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Where We Stitch Perfection! Transforming your creative vision into stunning custom embroidery and stitching for apparel, promotional items, and personal projects.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <div 
                  key={social.name}
                  className="bg-gray-800 p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  title={social.label}
                >
                  <span className="text-sm">{social.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-blue-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Our Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Details</h3>
            <div className="space-y-3">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                const content = (
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-4 w-4 text-blue-400" />
                    <span>{contact.text}</span>
                  </div>
                );
                
                return contact.href ? (
                  <a key={index} href={contact.href} className="block hover:text-blue-400 transition-colors">
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>
            
            {/* Business Hours */}
            <div className="mt-4">
              <h4 className="font-semibold text-white mb-2">Business Hours</h4>
              <p className="text-sm">Monday - Friday: 9AM - 6PM EST</p>
              <p className="text-sm">Weekend: By appointment</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-6">
          <div className="md:flex justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 ABS STITCH. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;