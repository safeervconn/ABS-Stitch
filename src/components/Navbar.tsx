/**
 * Navigation Bar Component
 * 
 * Features:
 * - Company logo/name on the left
 * - Navigation links in the center
 * - Combined authentication button or profile dropdown for signed-in users
 * - Role-based cart visibility
 * - Responsive design with mobile menu
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Palette, User, Settings, LayoutDashboard, LogOut, ChevronDown, ShoppingBag } from 'lucide-react';
import CartDropdown from './CartDropdown';
import { signOut, getCurrentUser, getUserProfile, getDashboardRoute } from '../lib/supabase';
import '../styles/material3.css';

const Navbar: React.FC = () => {
  // State to control mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check for current user on component mount
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getUserProfile(user.id);
          if (profile) {
            setCurrentUser({
              id: user.id,
              email: user.email,
              full_name: profile.full_name,
              role: profile.role,
              avatar_url: profile.avatar_url
            });
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
    
    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check if cart should be visible (only for customers on relevant pages)
  const shouldShowCart = () => {
    if (!currentUser || currentUser.role !== 'customer') return false;
    
    const currentPath = window.location.pathname;
    const relevantPages = ['/', '/catalog', '/checkout'];
    return relevantPages.includes(currentPath) || currentPath.startsWith('/catalog');
  };

  return (
    <nav className="md-navigation-bar md-surface md-elevation-1 sticky top-0 z-50">
      <div className="md-container">
        <div className="md-flex md-justify-between md-items-center h-16">
          
          {/* Company Logo and Name - Left Side */}
          <div className="md-flex md-items-center md-gap-3">
            <div className="md-surface-container-high md-p-2 md-shape-medium">
              <Palette className="h-6 w-6" style={{color: 'var(--md-sys-color-primary)'}} />
            </div>
            <span className="md-title-large" style={{color: 'var(--md-sys-color-primary)'}}>
              ABS STITCH
            </span>
          </div>

          {/* Navigation Links - Center (Hidden on mobile) */}
          <div className="hidden md:flex md-gap-6">
            <a href="/" className="md-text-button">Home</a>
            <a href="/catalog" className="md-text-button">Catalog</a>
            <a href="/#services" className="md-text-button">Services</a>
            <a href="/about" className="md-text-button">About</a>
            <a href="/#contact" className="md-text-button">Contact</a>
          </div>

          {/* Action Buttons - Right Side (Hidden on mobile) */}
          <div className="hidden md:flex md-items-center md-gap-3">
            {/* Cart - Only show for customers on relevant pages */}
            {shouldShowCart() && <CartDropdown />}
            
            {/* Authentication Section */}
            {currentUser ? (
              /* Profile Dropdown for signed-in users */
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="md-flex md-items-center md-gap-2 md-p-2 md-shape-small hover:md-surface-container transition-colors"
                >
                  <div className="w-8 h-8 md-surface-container-high md-shape-full md-flex md-items-center md-justify-center">
                    <User className="h-4 w-4" style={{color: 'var(--md-sys-color-primary)'}} />
                  </div>
                  <span className="md-label-large" style={{color: 'var(--md-sys-color-on-surface)'}}>{currentUser.full_name?.split(' ')[0]}</span>
                  <ChevronDown className="h-4 w-4" style={{color: 'var(--md-sys-color-on-surface-variant)'}} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 md-surface-container md-shape-medium md-elevation-3 z-[60]">
                      <div className="md-p-2">
                        <button
                          onClick={() => window.location.href = '/profile'}
                          className="w-full md-flex md-items-center md-gap-3 md-p-3 text-left hover:md-surface-container-high md-shape-small transition-colors"
                        >
                          <Settings className="h-4 w-4" style={{color: 'var(--md-sys-color-on-surface-variant)'}} />
                          <span className="md-body-medium" style={{color: 'var(--md-sys-color-on-surface)'}}>Profile Settings</span>
                        </button>
                        <button
                          onClick={() => window.location.href = getDashboardRoute(currentUser.role)}
                          className="w-full md-flex md-items-center md-gap-3 md-p-3 text-left hover:md-surface-container-high md-shape-small transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" style={{color: 'var(--md-sys-color-on-surface-variant)'}} />
                          <span className="md-body-medium" style={{color: 'var(--md-sys-color-on-surface)'}}>Dashboard</span>
                        </button>
                        <div className="my-2 h-px" style={{backgroundColor: 'var(--md-sys-color-outline-variant)'}}></div>
                        <button
                          onClick={handleSignOut}
                          className="w-full md-flex md-items-center md-gap-3 md-p-3 text-left hover:md-surface-container-high md-shape-small transition-colors"
                          style={{color: 'var(--md-sys-color-error)'}}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Combined Authentication Button for non-signed-in users */
              <button 
                onClick={() => window.location.href = '/login'}
                className="md-filled-button"
              >
                Sign In / Sign Up
              </button>
            )}
            
            {currentUser ? (
              <button 
                onClick={() => {
                  const event = new CustomEvent('openPlaceOrderModal');
                  window.dispatchEvent(event);
                }}
                className="md-outlined-button"
              >
                Place Order
              </button>
            ) : (
              <button 
                onClick={() => window.location.href = '/#contact'}
                className="md-outlined-button"
              >
                Get a Quote
              </button>
            )}
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
          <div className="md:hidden" style={{borderTop: '1px solid var(--md-sys-color-outline-variant)'}}>
            <div className="md-p-2 space-y-1">
              <a href="/" className="block md-p-3 md-text-button w-full text-left">Home</a>
              <a href="/catalog" className="block md-p-3 md-text-button w-full text-left">Catalog</a>
              <a href="/#services" className="block md-p-3 md-text-button w-full text-left">Services</a>
              <a href="/about" className="block md-p-3 md-text-button w-full text-left">About</a>
              <a href="/#contact" className="block md-p-3 md-text-button w-full text-left">Contact</a>
              <div className="pt-2 mt-2" style={{borderTop: '1px solid var(--md-sys-color-outline-variant)'}}>
                {/* Cart for mobile - Only show for customers on relevant pages */}
                {shouldShowCart() && (
                  <div className="md-p-3">
                    <CartDropdown />
                  </div>
                )}
                
                {currentUser ? (
                  /* Mobile Profile Menu */
                  <>
                    <div className="md-p-3 md-body-small" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
                      {currentUser.full_name}
                    </div>
                    <button 
                      onClick={() => window.location.href = '/profile'}
                      className="block w-full text-left md-p-3 md-text-button"
                    >
                      Profile Settings
                    </button>
                    <button 
                      onClick={() => window.location.href = getDashboardRoute(currentUser.role)}
                      className="block w-full text-left md-p-3 md-text-button"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left md-p-3 md-text-button"
                      style={{color: 'var(--md-sys-color-error)'}}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  /* Mobile Authentication Button */
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="w-full text-left md-filled-button mt-2"
                  >
                    Sign In / Sign Up
                  </button>
                )}
                
                {currentUser ? (
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('openPlaceOrderModal');
                      window.dispatchEvent(event);
                    }}
                    className="w-full text-left md-outlined-button mt-2"
                  >
                    Place Order
                  </button>
                ) : (
                  <button 
                    onClick={() => window.location.href = '/#contact'}
                    className="w-full text-left md-outlined-button mt-2"
                  >
                    Get a Quote
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;