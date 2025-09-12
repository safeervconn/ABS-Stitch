/**
 * Navigation Bar Component
 * 
 * Features:
 * - Company logo/name on the left
 * - Navigation links in the center
 * - Login/Signup and Quote buttons on the right
 * - Responsive design with mobile menu
 */

import React, { useState } from 'react';
import { Menu, X, Palette } from 'lucide-react';

const Navbar: React.FC = () => {
  // State to control mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Company Logo and Name - Left Side */}
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Palette className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-800">ArtistryDigital</span>
          </div>

          {/* Navigation Links - Center (Hidden on mobile) */}
          <div className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-600 hover:text-blue-600 transition-colors">Home</a>
            <a href="/catalog" className="text-gray-600 hover:text-blue-600 transition-colors">Catalog</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
          </div>

          {/* Action Buttons - Right Side (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600 transition-colors">Login</button>
            <button className="text-gray-600 hover:text-blue-600 transition-colors">Signup</button>
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get a Quote
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu (Shows when hamburger is clicked) */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#home" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Home</a>
              <a href="/catalog" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Catalog</a>
              <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-blue-600">About</a>
              <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Contact</a>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <button className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600">Login</button>
                <button className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600">Signup</button>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 mt-2"
                >
                  Get a Quote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;