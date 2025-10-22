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
import { getCurrentUser, getUserProfile } from '../lib/supabase';

const Hero: React.FC = () => {
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getUserProfile(user.id);
          if (profile) {
            setCurrentUser(profile);
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
    
    checkUser();
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 overflow-hidden" id="home">
      {/* Background spotlight effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Main Headline */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-full shadow-lg">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-6">
            Where We Stitch
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">Perfection!</span>
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
                className="btn-success btn-large px-8 flex items-center justify-center"
              >
                Place Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            ) : null}
            {!currentUser ? (
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary btn-large px-8 flex items-center justify-center"
              >
                Get Custom Artwork
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            ) : null}
            <button 
              onClick={() => window.location.href = '/stock-designs'}
              className="btn-purple btn-large px-8"
            >
              Browse Stock Designs
            </button>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Quick Turnaround</h3>
              <p className="text-gray-600">Most custom designs completed within 2-3 business days</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">High Quality</h3>
              <p className="text-gray-600">Professional-grade artwork ready for your apparel</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
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