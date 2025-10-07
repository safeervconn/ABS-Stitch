/**
 * Hero Section Component
 * 
 * Main landing section featuring:
 * - Company tagline and value proposition
 * - Dynamic call-to-action buttons based on user authentication
 * - Animated background effects
 * - Key benefit highlights
 * - Responsive design with optimized animations
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getCurrentUser, getUserProfile } from '../../core/api/supabase';

const Hero: React.FC = React.memo(() => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  /**
   * Check user authentication status and load profile
   */
  useEffect(() => {
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

  /**
   * Handle place order action
   */
  const handlePlaceOrder = useCallback(() => {
    const event = new CustomEvent('openPlaceOrderModal');
    window.dispatchEvent(event);
  }, []);

  /**
   * Handle scroll to contact section
   */
  const handleScrollToContact = useCallback(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /**
   * Navigate to catalog
   */
  const handleNavigateToCatalog = useCallback(() => {
    window.location.href = '/catalog';
  }, []);

  /**
   * Key benefits configuration
   */
  const benefits = useMemo(() => [
    {
      icon: '✓',
      title: 'Quick Turnaround',
      description: 'Most custom designs completed within 2-3 business days',
      gradient: 'from-green-100 to-emerald-100',
      iconColor: 'text-green-600'
    },
    {
      icon: '⚡',
      title: 'High Quality',
      description: 'Professional-grade artwork ready for your apparel',
      gradient: 'from-purple-100 to-pink-100',
      iconColor: 'text-purple-600'
    },
    {
      icon: '∞',
      title: 'Unlimited Revisions',
      description: 'We work until you\'re completely satisfied',
      gradient: 'from-orange-100 to-red-100',
      iconColor: 'text-orange-600'
    }
  ], []);

  /**
   * Render call-to-action buttons based on user state
   */
  const renderActionButtons = useMemo(() => {
    if (currentUser && currentUser.role === 'customer') {
      return (
        <button 
          onClick={handlePlaceOrder}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center shadow-xl font-semibold transform hover:scale-105"
        >
          Place Order
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      );
    }
    
    if (!currentUser) {
      return (
        <button 
          onClick={handleScrollToContact}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center shadow-xl font-semibold transform hover:scale-105"
        >
          Get Custom Artwork
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      );
    }
    
    return null;
  }, [currentUser, handlePlaceOrder, handleScrollToContact]);

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 overflow-hidden" id="home">
      {/* Optimized background effects with GPU acceleration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl gpu-accelerated"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse gpu-accelerated"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000 gpu-accelerated"></div>
      
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
            {renderActionButtons}
            <button 
              onClick={handleNavigateToCatalog}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl font-semibold transform hover:scale-105"
            >
              Browse Catalog
            </button>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 card-hover"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`bg-gradient-to-r ${benefit.gradient} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <span className={`${benefit.iconColor} font-bold`}>{benefit.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default Hero;