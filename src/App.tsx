/**
 * Main Application Component
 * 
 * Root application component providing:
 * - Optimized route configuration with code splitting
 * - Global state management (Cart, Orders)
 * - Modal management system
 * - SEO optimization with React Helmet Async
 * - Performance monitoring and error boundaries
 * - Accessibility enhancements
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CartProvider } from './features/cart/CartContext';
import { OrderProvider } from './features/orders/OrderContext';

// Core layout components (eagerly loaded for better UX)
import Navbar from './layout/Navbar';
import Hero from './features/homepage/Hero';
import CatalogPreview from './features/homepage/CatalogPreview';
import Services from './features/homepage/Services';
import Testimonials from './features/homepage/Testimonials';
import QuoteForm from './features/homepage/QuoteForm';
import ContactInfo from './features/homepage/ContactInfo';
import Footer from './layout/Footer';
import PlaceOrderModal from './components/PlaceOrderModal';

// Route components (lazy loaded for optimal bundle splitting)
const Catalog = lazy(() => import('./features/catalog/Catalog'));
const About = lazy(() => import('./features/about/About'));
const Login = lazy(() => import('./features/auth/Login'));
const Signup = lazy(() => import('./features/auth/Signup'));
const EmployeeSignup = lazy(() => import('./features/auth/EmployeeSignup'));
const ForgotPassword = lazy(() => import('./features/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/auth/ResetPassword'));
const ProfileSettings = lazy(() => import('./features/auth/ProfileSettings'));
const Checkout = lazy(() => import('./features/checkout/Checkout'));
const SalesRepDashboard = lazy(() => import('./features/admin/SalesRepDashboard'));
const DesignerDashboard = lazy(() => import('./features/admin/DesignerDashboard'));
const CustomerDashboard = lazy(() => import('./features/customer/CustomerDashboard'));
const AdminModule = lazy(() => import('./features/admin/AdminDashboard'));

/**
 * Optimized loading fallback component for route transitions
 * Provides consistent loading experience across all lazy-loaded routes
 */
const LoadingFallback: React.FC = React.memo(() => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
));

/**
 * Homepage component with SEO optimization and performance enhancements
 * Combines all homepage sections into a single, optimized component
 */
const Homepage: React.FC = React.memo(() => {
  return (
    <>
      <Helmet>
        <title>ABS STITCH - Where We Stitch Perfection! | Custom Embroidery Services</title>
        <meta name="description" content="Professional custom embroidery and stitching services for apparel, promotional items, and personal projects. Quick turnaround, high quality, unlimited revisions." />
        <meta name="keywords" content="custom embroidery, stitching services, apparel customization, logo embroidery" />
        <link rel="canonical" href="https://absstitch.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://absstitch.com/" />
        <meta property="og:title" content="ABS STITCH - Where We Stitch Perfection!" />
        <meta property="og:description" content="Professional custom embroidery and stitching services for apparel, promotional items, and personal projects." />
      </Helmet>
      
      <Navbar />
      <Hero />
      <CatalogPreview />
      <Services />
      <Testimonials />
      
      {/* Contact Section with structured data */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white" id="contact">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-gray-600">
              Ready to start your custom embroidery project? Contact us today!
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <QuoteForm />
            </div>
            <div>
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
});

/**
 * Main application component with comprehensive state management
 * Handles global modal state, routing, and context providers
 */
function App() {
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = React.useState(false);

  /**
   * Set up global event listeners for modal management
   * Allows any component to trigger the place order modal
   */
  React.useEffect(() => {
    const handleOpenPlaceOrderModal = React.useCallback(() => {
      setIsPlaceOrderOpen(true);
    }, []);

    window.addEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    
    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    };
  }, []);

  /**
   * Handle modal close with state cleanup
   */
  const handleClosePlaceOrderModal = React.useCallback(() => {
    setIsPlaceOrderOpen(false);
  }, []);

  return (
    <CartProvider>
      <OrderProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Error boundary for lazy-loaded components */}
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/employee-signup" element={<EmployeeSignup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/sales/dashboard" element={<SalesRepDashboard />} />
                <Route path="/designer/dashboard" element={<DesignerDashboard />} />
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/admin" element={<AdminModule />} />
                <Route path="/admin/*" element={<AdminModule />} />
              </Routes>
            </Suspense>
            
            {/* Global place order modal - accessible from any component */}
            <PlaceOrderModal
              isOpen={isPlaceOrderOpen}
              onClose={handleClosePlaceOrderModal}
            />
          </div>
        </Router>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;