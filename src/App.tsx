/**
 * Main App Component
 * 
 * This is the root component of our entire application. It sets up:
 * 
 * 1. React Router - handles navigation between different pages
 * 2. Context Providers - manage global state (cart, orders)
 * 3. Route Definitions - maps URLs to specific page components
 * 4. Global Modals - components that can appear on any page
 * 
 * The app structure:
 * - Homepage: Hero, catalog preview, services, testimonials, contact
 * - Catalog: Browse all products with filtering
 * - Authentication: Login, signup, password reset
 * - Dashboards: Different interfaces for admin, sales, designer, customer
 * - Profile: User settings and account management
 * 
 * Context providers wrap everything to provide global state management:
 * - CartProvider: Manages shopping cart across all pages
 * - OrderProvider: Manages order data and operations
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';

// Homepage Components - these make up the main landing page
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CatalogPreview from './components/CatalogPreview';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import QuoteForm from './components/QuoteForm';
import ContactInfo from './components/ContactInfo';
import Footer from './components/Footer';
import PlaceOrderModal from './components/PlaceOrderModal';

// Individual Page Components - each represents a different URL/page
import Catalog from './pages/Catalog';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeSignup from './pages/EmployeeSignup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SalesRepDashboard from './pages/SalesRepDashboard';
import DesignerDashboard from './pages/DesignerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminModule from './admin/AdminDashboard';
import ProfileSettings from './pages/ProfileSettings';
import Checkout from './pages/Checkout';

// Homepage Component - combines all homepage sections into one page
const Homepage: React.FC = () => {
  return (
    <>
      {/* Navigation bar at top */}
      <Navbar />
      {/* Main hero banner */}
      <Hero />
      {/* Preview of catalog products */}
      <CatalogPreview />
      {/* Services we offer */}
      <Services />
      {/* Customer testimonials */}
      <Testimonials />
      
      {/* Contact section with quote form and contact info */}
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
          
          {/* Two-column layout: quote form on left, contact info on right */}
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
      
      {/* Footer at bottom */}
      <Footer />
    </>
  );
};

// Main App Component
function App() {
  // State to control the global "Place Order" modal
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = React.useState(false);

  // Listen for events to open the place order modal
  React.useEffect(() => {
    // Function to handle opening the modal
    const handleOpenPlaceOrderModal = () => {
      setIsPlaceOrderOpen(true);
    };

    // Listen for custom event from navbar or other components
    window.addEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    // Cleanup event listener when component unmounts
    return () => {
      window.removeEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    };
  }, []);

  return (
    Context providers wrap entire app to provide global state
    <CartProvider>
      <OrderProvider>
        {/* Router enables navigation between different pages */}
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Route definitions - maps URLs to page components */}
            <Routes>
              {/* Homepage route */}
              <Route path="/" element={<Homepage />} />
              {/* Product catalog page */}
              <Route path="/catalog" element={<Catalog />} />
              {/* About us page */}
              <Route path="/about" element={<About />} />
              {/* Authentication pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/employee-signup" element={<EmployeeSignup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* User account pages */}
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* Role-specific dashboard pages */}
              <Route path="/sales/dashboard" element={<SalesRepDashboard />} />
              <Route path="/designer/dashboard" element={<DesignerDashboard />} />
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              {/* Admin pages - handles multiple admin routes */}
              <Route path="/admin" element={<AdminModule />} />
              <Route path="/admin/*" element={<AdminModule />} />
            </Routes>
            
            {/* Global Place Order Modal - can be opened from any page */}
            <PlaceOrderModal
              isOpen={isPlaceOrderOpen}
              onClose={() => setIsPlaceOrderOpen(false)}
            />
          </div>
        </Router>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;