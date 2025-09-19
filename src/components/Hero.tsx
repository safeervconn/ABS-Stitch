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
import { ArrowRight, Palette, Star, CheckCircle } from 'lucide-react';
import { getCurrentUser, getUserProfile } from '../lib/supabase';
import '../styles/material3.css';

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
    <section className="md-surface py-20 overflow-hidden" id="home">
      {/* Material 3 Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 md-shape-extra-large" style={{backgroundColor: 'var(--md-sys-color-primary)'}}></div>
        <div className="absolute top-40 right-20 w-24 h-24 md-shape-medium" style={{backgroundColor: 'var(--md-sys-color-secondary)'}}></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 md-shape-large" style={{backgroundColor: 'var(--md-sys-color-tertiary)'}}></div>
      </div>
      
      <div className="md-container">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Main Headline */}
          <div className="md-flex md-justify-center mb-6">
            <div className="md-surface-container-high md-p-4 md-shape-full md-elevation-1">
              <Palette className="h-8 w-8" style={{color: 'var(--md-sys-color-primary)'}} />
            </div>
          </div>
          
          <h1 className="md-display-large mb-6" style={{color: 'var(--md-sys-color-on-surface)'}}>
            Where We Stitch
            <span className="block" style={{color: 'var(--md-sys-color-primary)'}}>Perfection!</span>
          </h1>

          {/* Description */}
          <p className="md-body-large mb-8 max-w-2xl mx-auto" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
            We specialize in creating stunning custom embroidery and stitching for apparel, 
            promotional items, and personal projects. Submit your vision and watch it come to life 
            with our precision stitching services.
          </p>

          {/* Call to Action Buttons */}
          <div className="md-flex flex-col sm:flex-row md-gap-4 md-justify-center mb-12">
            {currentUser ? (
              <button 
                onClick={() => {
                  const event = new CustomEvent('openPlaceOrderModal');
                  window.dispatchEvent(event);
                }}
                className="md-filled-button md-flex md-items-center md-gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Place Order
              </button>
            ) : (
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="md-filled-button md-flex md-items-center md-gap-2"
              >
                <ArrowRight className="h-5 w-5" />
                Get Custom Artwork
              </button>
            )}
            <button 
              onClick={() => window.location.href = '/catalog'}
              className="md-outlined-button"
            >
              Browse Catalog
            </button>
          </div>

          {/* Key Benefits */}
          <div className="md-grid grid-cols-1 md:grid-cols-3 md-gap-6">
            <div className="md-card md-card-elevated md-p-6 text-center">
              <div className="md-surface-container-high w-12 h-12 md-shape-medium md-flex md-items-center md-justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6" style={{color: 'var(--md-sys-color-primary)'}} />
              </div>
              <h3 className="md-title-medium mb-2" style={{color: 'var(--md-sys-color-on-surface)'}}>Quick Turnaround</h3>
              <p className="md-body-medium" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>Most custom designs completed within 2-3 business days</p>
            </div>
            
            <div className="md-card md-card-elevated md-p-6 text-center">
              <div className="md-surface-container-high w-12 h-12 md-shape-medium md-flex md-items-center md-justify-center mx-auto mb-4">
                <Star className="h-6 w-6" style={{color: 'var(--md-sys-color-secondary)'}} />
              </div>
              <h3 className="md-title-medium mb-2" style={{color: 'var(--md-sys-color-on-surface)'}}>High Quality</h3>
              <p className="md-body-medium" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>Professional-grade artwork ready for your apparel</p>
            </div>
            
            <div className="md-card md-card-elevated md-p-6 text-center">
              <div className="md-surface-container-high w-12 h-12 md-shape-medium md-flex md-items-center md-justify-center mx-auto mb-4">
                <ArrowRight className="h-6 w-6" style={{color: 'var(--md-sys-color-tertiary)'}} />
              </div>
              <h3 className="md-title-medium mb-2" style={{color: 'var(--md-sys-color-on-surface)'}}>Unlimited Revisions</h3>
              <p className="md-body-medium" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>We work until you're completely satisfied</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;