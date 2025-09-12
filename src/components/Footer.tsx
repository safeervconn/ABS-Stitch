/**
 * Footer Component
 * 
 * Features:
 * - Company information and branding
 * - Navigation links organized in columns
 * - Services list
 * - Contact details
 * - Copyright information
 */

import React from 'react';
import { Palette, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
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
              <span className="text-xl font-bold text-white">ArtistryDigital</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Transforming your creative vision into stunning digital artwork for apparel, marketing, and personal projects.
            </p>
            <div className="flex space-x-4">
              {/* Social media links would go here */}
              <div className="bg-gray-800 p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <span className="text-sm">FB</span>
              </div>
              <div className="bg-gray-800 p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <span className="text-sm">IG</span>
              </div>
              <div className="bg-gray-800 p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <span className="text-sm">TW</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="#catalog" className="hover:text-blue-400 transition-colors">Catalog</a></li>
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Portfolio</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>Custom T-Shirt Designs</li>
              <li>Logo & Brand Identity</li>
              <li>Digital Illustrations</li>
              <li>Apparel Graphics</li>
              <li>Marketing Materials</li>
              <li>Icon & Symbol Design</li>
              <li>Print-Ready Artwork</li>
              <li>Design Consultations</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Details</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>(123) 456-7890</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>hello@artistrydigital.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>Remote & Worldwide</span>
              </div>
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
              © 2025 ArtistryDigital. All rights reserved.
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
};

export default Footer;