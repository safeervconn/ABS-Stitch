import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StockDesignsPreview from "./components/StockDesignsPreview";
import Services from './components/Services';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import QuoteForm from './components/QuoteForm';
import ContactInfo from './components/ContactInfo';
import Footer from './components/Footer';
import PlaceOrderModal from './components/PlaceOrderModal';
import { LoadingSpinner } from './shared/components/LoadingSpinner';

// Lazy-loaded Pages
const StockDesigns = lazy(() => import("./pages/StockDesigns"));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const EmployeeSignup = lazy(() => import('./pages/EmployeeSignup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SalesRepDashboard = lazy(() => import('./pages/SalesRepDashboard'));
const DesignerDashboard = lazy(() => import('./pages/DesignerDashboard'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const AdminModule = lazy(() => import('./admin/AdminDashboard'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));

// Homepage Component
const Homepage: React.FC = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <StockDesignsPreview />
      <Services />
      <Pricing />
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
};

function App() {
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = React.useState(false);

  React.useEffect(() => {
    // Listen for place order modal events
    const handleOpenPlaceOrderModal = () => {
      setIsPlaceOrderOpen(true);
    };

    window.addEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    return () => {
      window.removeEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    };
  }, []);

  return (
    <CartProvider>
      <OrderProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/stock-designs" element={<StockDesigns />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/employee-signup" element={<EmployeeSignup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
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
              onClose={() => setIsPlaceOrderOpen(false)}
            />
          </div>
        </Router>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;