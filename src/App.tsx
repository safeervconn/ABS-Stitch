/**
 * Main Application Component
 * 
 * This is the root component that handles:
 * - Route configuration with lazy loading for performance
 * - Global context providers (Cart, Orders)
 * - Global modal management
 * - SEO optimization with React Helmet
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CartProvider } from './features/cart/CartContext';
import { OrderProvider } from './features/orders/OrderContext';

// Layout components (not lazy loaded as they're used frequently)
import Navbar from './layout/Navbar';
import Hero from './features/homepage/Hero';
import CatalogPreview from './features/homepage/CatalogPreview';
import Services from './features/homepage/Services';
import Testimonials from './features/homepage/Testimonials';
import QuoteForm from './features/homepage/QuoteForm';
import ContactInfo from './features/homepage/ContactInfo';
import Footer from './layout/Footer';
import PlaceOrderModal from './components/PlaceOrderModal';

// Lazy loaded components for better performance
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
 * Loading component for lazy loaded routes
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
 * Homepage component with optimized structure
 */
const Homepage: React.FC = React.memo(() => {
  return (
    <>
      <Helmet>
        <title>ABS STITCH - Where We Stitch Perfection! | Custom Embroidery Services</title>
        <meta name="description" content="Professional custom embroidery and stitching services for apparel, promotional items, and personal projects. Quick turnaround, high quality, unlimited revisions." />
        <meta name="keywords" content="custom embroidery, stitching services, apparel customization, logo embroidery" />
        <link rel="canonical" href="https://absstitch.com/" />
      </Helmet>
      
      <Navbar />
      <Hero />
      <CatalogPreview />
      <Services />
      <Testimonials />
      
      {/* Contact Section */}
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
 * Main App component with global state management and routing
 */
function App() {
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = React.useState(false);

  // Handle global place order modal events
  React.useEffect(() => {
    /**
     * Event handler for opening place order modal
     */
    const handleOpenPlaceOrderModal = React.useCallback(() => {
      setIsPlaceOrderOpen(true);
    }, []);

    window.addEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    return () => {
      window.removeEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    };
  }, []);

  /**
   * Close place order modal handler
   */
  const handleClosePlaceOrderModal = React.useCallback(() => {
    setIsPlaceOrderOpen(false);
  }, []);

  return (
    <CartProvider>
      <OrderProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
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
            
            {/* Place Order Modal - Available globally */}
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