/**
 * Navigation Bar Component
 * 
 * Global navigation component that provides:
 * - Company branding and logo
 * - Main navigation links
 * - User authentication state management
 * - Role-based UI elements (cart, notifications, dashboard access)
 * - Responsive mobile menu
 * - Profile dropdown for authenticated users
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu, X, Palette, User, Settings, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import CartDropdown from '../features/cart/CartDropdown';
import NotificationDropdown from '../components/NotificationDropdown';
import { signOut, getCurrentUser, getUserProfile, getDashboardRoute } from '../core/api/supabase';

const Navbar: React.FC = React.memo(() => {
  // State management for mobile menu and user profile
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  /**
   * Check for authenticated user and load profile data
   */
  useEffect(() => {
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

  /**
   * Handle user sign out with cleanup
   */
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setCurrentUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  /**
   * Determine if cart should be visible based on user role and current page
   */
  const shouldShowCart = useMemo(() => {
    if (!currentUser || currentUser.role !== 'customer') return false;
    
    const currentPath = window.location.pathname;
    const relevantPages = ['/', '/catalog', '/checkout'];
    return relevantPages.includes(currentPath) || currentPath.startsWith('/catalog');
  }, [currentUser]);

  /**
   * Navigation links configuration
   */
  const navigationLinks = useMemo(() => [
    { href: '/', label: 'Home' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/#services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/#contact', label: 'Contact' }
  ], []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Company Logo and Name - Left Side */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ABS STITCH
            </span>
          </div>

          {/* Navigation Links - Center (Hidden on mobile) */}
          <div className="hidden md:flex space-x-8">
            {navigationLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-600 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:bg-clip-text transition-all font-bold"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Action Buttons - Right Side (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart - Only show for customers on relevant pages */}
            {shouldShowCart && <CartDropdown />}
            
            {/* Notifications - Show for all authenticated users */}
            {currentUser && <NotificationDropdown />}
            
            {/* Authentication Section */}
            {currentUser ? (
              /* Profile Dropdown for signed-in users */
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{currentUser.full_name?.split(' ')[0]}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[60]">
                      <div className="p-2">
                        <button
                          onClick={() => window.location.href = '/profile'}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Profile Settings</span>
                        </button>
                        <button
                          onClick={() => window.location.href = getDashboardRoute(currentUser.role)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Dashboard</span>
                        </button>
                        <hr className="my-2" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg"
              >
                Sign In / Sign Up
              </button>
            )}
            
            {/* Action buttons based on user state */}
            {currentUser && currentUser.role === 'customer' ? (
              <button 
                onClick={() => {
                  const event = new CustomEvent('openPlaceOrderModal');
                  window.dispatchEvent(event);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg"
              >
                Place Order
              </button>
            ) : !currentUser ? (
              <button 
                onClick={() => window.location.href = '/#contact'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg"
              >
                Get a Quote
              </button>
            ) : null}
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
              {navigationLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-bold"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2">
                {/* Cart for mobile - Only show for customers on relevant pages */}
                {shouldShowCart && (
                  <div className="px-3 py-2">
                    <CartDropdown />
                  </div>
                )}
                
                {/* Notifications for mobile - Show for all authenticated users */}
                {currentUser && (
                  <div className="px-3 py-2">
                    <NotificationDropdown />
                  </div>
                )}
                
                {currentUser ? (
                  /* Mobile Profile Menu */
                  <>
                    <div className="px-3 py-2 text-gray-500 text-sm font-medium">
                      {currentUser.full_name}
                    </div>
                    <button 
                      onClick={() => window.location.href = '/profile'}
                      className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 font-bold"
                    >
                      Profile Settings
                    </button>
                    <button 
                      onClick={() => window.location.href = getDashboardRoute(currentUser.role)}
                      className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 font-bold"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 font-bold"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  /* Mobile Authentication Button */
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="w-full text-left bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 mt-2 font-bold"
                  >
                    Sign In / Sign Up
                  </button>
                )}
                
                {/* Action buttons for mobile */}
                {currentUser ? (
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('openPlaceOrderModal');
                      window.dispatchEvent(event);
                    }}
                    className="w-full text-left bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 mt-2 font-bold"
                  >
                    Place Order
                  </button>
                ) : (
                  <button 
                    onClick={() => window.location.href = '/#contact'}
                    className="w-full text-left bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 mt-2 font-bold"
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
});

export default Navbar;