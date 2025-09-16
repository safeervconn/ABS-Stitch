/**
 * Hero Section Component
 * 
 * Features:
 * - Large banner with company tagline
 * - Brief explanation of services
 * - Call-to-action buttons
 * - Light, welcoming design
 */

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getTempCurrentUser } from '../lib/auth';

const Hero: React.FC = () => {
  const currentUser = getTempCurrentUser();

  return (
    <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20" id="home">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Main Headline */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-6">
            Where We Stitch
            <span className="text-blue-600 block">Perfection!</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We specialize in creating stunning custom embroidery and stitching for apparel, 
            promotional items, and personal projects. Submit your vision and watch it come to life 
            with our precision stitching services.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentUser && currentUser.role === 'customer' ? (
              <button 
                onClick={() => {
                  const event = new CustomEvent('openPlaceOrderModal');
                  window.dispatchEvent(event);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center shadow-lg font-semibold"
              >
                Place Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            ) : (
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center shadow-lg font-semibold"
              >
                Get Custom Artwork
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            )}
            <button 
              onClick={() => window.location.href = '/catalog'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold"
            >
              Browse Catalog
            </button>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Quick Turnaround</h3>
              <p className="text-gray-600">Most custom designs completed within 2-3 business days</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">High Quality</h3>
              <p className="text-gray-600">Professional-grade artwork ready for any application</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold">∞</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Unlimited Revisions</h3>
              <p className="text-gray-600">We work until you're completely satisfied</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;