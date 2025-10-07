/**
 * Optimized Navigation Bar Component
 * 
 * Performance-optimized navbar with memoized components,
 * efficient state management, and smooth animations.
 */

import React, { memo, useCallback } from 'react';
import { Menu, X, Palette, User, Settings, LayoutDashboard, LogOut, ChevronDown, Home } from 'lucide-react';
import { useOptimizedData } from '../../hooks/useOptimizedData';
import { signOut, getCurrentUser, getUserProfile, getDashboardRoute } from '../../lib/supabase';
import CartDropdown from '../CartDropdown';
import NotificationDropdown from '../NotificationDropdown';
import Button from '../ui/Button';

/**
 * Memoized mobile menu component
 */
const MobileMenu = memo<{
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  shouldShowCart: boolean;
  onSignOut: () => void;
}>(({ isOpen, onClose, currentUser, shouldShowCart, onSignOut }) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <a href="/" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-bold transition-colors">Home</a>
        <a href="/catalog" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-bold transition-colors">Catalog</a>
        <a href="/#services" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-bold transition-colors">Services</a>
        <a href="/about" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-bold transition-colors">About</a>
        <a href="/#contact" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-bold transition-colors">Contact</a>
        
        <div className="border-t border-gray-100 pt-2 mt-2">
          {shouldShowCart && (
            <div className="px-3 py-2">
              <CartDropdown />
            </div>
          )}
          
          {currentUser && (
            <div className="px-3 py-2">
              <NotificationDropdown />
            </div>
          )}
          
          {currentUser ? (
            <>
              <div className="px-3 py-2 text-gray-500 text-sm font-medium">
                {currentUser.full_name}
              </div>
              <button 
                onClick={() => window.location.href = '/profile'}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 font-bold transition-colors"
              >
                Profile Settings
              </button>
              <button 
                onClick={() => window.location.href = getDashboardRoute(currentUser.role)}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 font-bold transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={onSignOut}
                className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 font-bold transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="px-3 py-2">
              <Button
                onClick={() => window.location.href = '/login'}
                variant="primary"
                fullWidth
                size="sm"
              >
                Sign In / Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MobileMenu.displayName = 'MobileMenu';

/**
 * Memoized profile dropdown component
 */
const ProfileDropdown = memo<{
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onSignOut: () => void;
}>(({ isOpen, onClose, currentUser, onSignOut }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[60] animate-[scaleIn_0.2s_ease-out]">
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
            onClick={onSignOut}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
});

ProfileDropdown.displayName = 'ProfileDropdown';

/**
 * Optimized navigation bar with performance enhancements
 * Uses memoization and optimized data fetching
 */
const OptimizedNavbar: React.FC = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  // Optimized user data fetching with caching
  const { data: currentUser } = useOptimizedData(
    async () => {
      const user = await getCurrentUser();
      if (user) {
        const profile = await getUserProfile(user.id);
        return profile ? {
          id: user.id,
          email: user.email,
          full_name: profile.full_name,
          role: profile.role,
        } : null;
      }
      return null;
    },
    [],
    { cacheKey: 'navbar-user', cacheDuration: 5 * 60 * 1000 }
  );

  /**
   * Handle user sign out with optimized cleanup
   */
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      // Clear user cache
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  /**
   * Check if cart should be visible for current user and page
   */
  const shouldShowCart = useCallback(() => {
    if (!currentUser || currentUser.role !== 'customer') return false;
    
    const currentPath = window.location.pathname;
    const relevantPages = ['/', '/catalog', '/checkout'];
    return relevantPages.includes(currentPath) || currentPath.startsWith('/catalog');
  }, [currentUser]);

  /**
   * Dispatch place order modal event
   */
  const openPlaceOrderModal = useCallback(() => {
    const event = new CustomEvent('openPlaceOrderModal');
    window.dispatchEvent(event);
  }, []);

  /**
   * Navigate to contact section
   */
  const navigateToContact = useCallback(() => {
    window.location.href = '/#contact';
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Company logo and name */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ABS STITCH
            </span>
          </div>

          {/* Desktop navigation links */}
          <div className="hidden md:flex space-x-8">
            {[
              { href: '/', label: 'Home' },
              { href: '/catalog', label: 'Catalog' },
              { href: '/#services', label: 'Services' },
              { href: '/about', label: 'About' },
              { href: '/#contact', label: 'Contact' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:bg-clip-text transition-all font-bold"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {shouldShowCart() && <CartDropdown />}
            {currentUser && <NotificationDropdown />}
            
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {currentUser.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                <ProfileDropdown
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                  currentUser={currentUser}
                  onSignOut={handleSignOut}
                />
              </div>
            ) : (
              <Button
                onClick={() => window.location.href = '/login'}
                variant="primary"
                size="sm"
                animation="lift"
              >
                Sign In / Sign Up
              </Button>
            )}
            
            {currentUser && currentUser.role === 'customer' ? (
              <Button
                onClick={openPlaceOrderModal}
                variant="warning"
                size="sm"
                animation="lift"
              >
                Place Order
              </Button>
            ) : !currentUser ? (
              <Button
                onClick={navigateToContact}
                variant="warning"
                size="sm"
                animation="lift"
              >
                Get a Quote
              </Button>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          currentUser={currentUser}
          shouldShowCart={shouldShowCart()}
          onSignOut={handleSignOut}
        />
      </div>
    </nav>
  );
});

OptimizedNavbar.displayName = 'OptimizedNavbar';

export default OptimizedNavbar;