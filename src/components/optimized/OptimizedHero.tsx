/**
 * Optimized Hero Section Component
 * 
 * Performance-optimized hero section with lazy-loaded animations,
 * memoized calculations, and improved accessibility.
 */

import React, { memo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useOptimizedData } from '../../hooks/useOptimizedData';
import { getCurrentUser, getUserProfile } from '../../lib/supabase';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { animationClasses } from '../../utils/animations';

/**
 * Memoized hero section to prevent unnecessary re-renders
 * Uses optimized data fetching and performance-conscious animations
 */
const OptimizedHero: React.FC = memo(() => {
  // Optimized user data fetching with caching
  const { data: currentUser, loading } = useOptimizedData(
    async () => {
      const user = await getCurrentUser();
      if (user) {
        const profile = await getUserProfile(user.id);
        return profile;
      }
      return null;
    },
    [],
    { cacheKey: 'current-user', cacheDuration: 5 * 60 * 1000 }
  );

  /**
   * Handle scroll to contact section with smooth behavior
   */
  const scrollToContact = React.useCallback(() => {
    document.getElementById('contact')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  /**
   * Handle catalog navigation
   */
  const navigateToCatalog = React.useCallback(() => {
    window.location.href = '/catalog';
  }, []);

  /**
   * Dispatch place order modal event
   */
  const openPlaceOrderModal = React.useCallback(() => {
    const event = new CustomEvent('openPlaceOrderModal');
    window.dispatchEvent(event);
  }, []);

  return (
    <section 
      className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 overflow-hidden" 
      id="home"
      role="banner"
      aria-label="Hero section"
    >
      {/* Optimized background effects with CSS animations */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Animated icon */}
          <div className={`flex justify-center mb-6 ${animationClasses.fadeInUp}`}>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-full shadow-lg">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          {/* Main headline with staggered animation */}
          <h1 className={`text-4xl md:text-6xl font-extrabold text-gray-800 mb-6 ${animationClasses.fadeInUp}`} style={{ animationDelay: '100ms' }}>
            Where We Stitch
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
              Perfection!
            </span>
          </h1>

          {/* Description */}
          <p className={`text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed ${animationClasses.fadeInUp}`} style={{ animationDelay: '200ms' }}>
            We specialize in creating stunning custom embroidery and stitching for apparel, 
            promotional items, and personal projects. Submit your vision and watch it come to life 
            with our precision stitching services.
          </p>

          {/* Call to action buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${animationClasses.fadeInUp}`} style={{ animationDelay: '300ms' }}>
            {!loading && currentUser && currentUser.role === 'customer' && (
              <Button
                onClick={openPlaceOrderModal}
                variant="success"
                size="lg"
                icon={<ArrowRight className="h-5 w-5" />}
                iconPosition="right"
                animation="lift"
              >
                Place Order
              </Button>
            )}
            
            {!loading && !currentUser && (
              <Button
                onClick={scrollToContact}
                variant="primary"
                size="lg"
                icon={<ArrowRight className="h-5 w-5" />}
                iconPosition="right"
                animation="lift"
              >
                Get Custom Artwork
              </Button>
            )}
            
            <Button
              onClick={navigateToCatalog}
              variant="warning"
              size="lg"
              animation="lift"
            >
              Browse Catalog
            </Button>
          </div>

          {/* Key benefits with staggered animations */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: '✓',
                title: 'Quick Turnaround',
                description: 'Most custom designs completed within 2-3 business days',
                color: 'green',
              },
              {
                icon: '⚡',
                title: 'High Quality',
                description: 'Professional-grade artwork ready for your apparel',
                color: 'purple',
              },
              {
                icon: '∞',
                title: 'Unlimited Revisions',
                description: 'We work until you\'re completely satisfied',
                color: 'orange',
              },
            ].map((benefit, index) => (
              <Card
                key={benefit.title}
                background="glass"
                hoverEffect="lift"
                entranceAnimation="fadeInUp"
                delay={400 + (index * 100)}
                className="text-center"
              >
                <div className={`bg-gradient-to-r from-${benefit.color}-100 to-${benefit.color}-200 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-${benefit.color}-600 font-bold text-xl`}>{benefit.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

OptimizedHero.displayName = 'OptimizedHero';

export default OptimizedHero;