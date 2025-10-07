import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import PageLayout from './components/layout/PageLayout';

// Components
import OptimizedNavbar from './components/optimized/OptimizedNavbar';
import OptimizedHero from './components/optimized/OptimizedHero';
import OptimizedCatalogPreview from './components/optimized/OptimizedCatalogPreview';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import QuoteForm from './components/QuoteForm';
import ContactInfo from './components/ContactInfo';
import Footer from './components/Footer';
import PlaceOrderModal from './components/PlaceOrderModal';

// Pages
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
import NotFound from './pages/NotFound';

/**
 * Homepage component with optimized components and SEO
 */
const Homepage: React.FC = () => {
  return (
    <PageLayout seoPage="home" includeBusinessData>
      <OptimizedNavbar />
      <main>
        <OptimizedHero />
        <OptimizedCatalogPreview />
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
      </main>
      <Footer />
    </PageLayout>
  );
};

/**
 * Main App component with error boundary and optimized routing
 */
function App() {
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = React.useState(false);

  /**
   * Handle place order modal events
   */
  React.useEffect(() => {
    const handleOpenPlaceOrderModal = () => {
      setIsPlaceOrderOpen(true);
    };

    window.addEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    return () => {
      window.removeEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    };
  }, []);

  return (
    <ErrorBoundary>
      <CartProvider>
        <OrderProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
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
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Place Order Modal - Available globally */}
              <PlaceOrderModal
                isOpen={isPlaceOrderOpen}
                onClose={() => setIsPlaceOrderOpen(false)}
              />
            </div>
          </Router>
        </OrderProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;