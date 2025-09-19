import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CatalogPreview from './components/CatalogPreview';
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
import AdminDashboard from './pages/AdminDashboard';
import SalesRepDashboard from './pages/SalesRepDashboard';
import DesignerDashboard from './pages/DesignerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// Homepage Component
const Homepage: React.FC = () => {
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

  const handlePlaceOrder = (orderData: any) => {
    // This would integrate with the order context
    console.log('Order placed:', orderData);
    setIsPlaceOrderOpen(false);
    alert('Order placed successfully!');
  };

  return (
    <>
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
      
      {/* Place Order Modal */}
      <PlaceOrderModal
        isOpen={isPlaceOrderOpen}
        onClose={() => setIsPlaceOrderOpen(false)}
        onSubmit={handlePlaceOrder}
      />
    </>
  );
};

function App() {
  return (
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
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/sales/dashboard" element={<SalesRepDashboard />} />
              <Route path="/designer/dashboard" element={<DesignerDashboard />} />
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            </Routes>
          </div>
        </Router>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;