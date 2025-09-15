/**
 * Main App Component - Digital Artwork Services Homepage
 * 
 * This is the main component that brings together all sections of the homepage.
 * It renders a complete one-page website for a digital artwork services business.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CatalogPreview from './components/CatalogPreview';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import QuoteForm from './components/QuoteForm';
import ContactInfo from './components/ContactInfo';
import Footer from './components/Footer';
import PlaceOrderModal from './components/PlaceOrderModal';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import SalesRepDashboard from './pages/SalesRepDashboard';
import DesignerDashboard from './pages/DesignerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import { useOrders } from './contexts/OrderContext';
import { getTempCurrentUser } from './lib/auth';

function App() {
  const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpenPlaceOrderModal = () => {
      setIsPlaceOrderModalOpen(true);
    };

    window.addEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
    return () => window.removeEventListener('openPlaceOrderModal', handleOpenPlaceOrderModal);
  }, []);

  return (
    <CartProvider>
      <OrderProvider>
        <AppContent 
          isPlaceOrderModalOpen={isPlaceOrderModalOpen}
          setIsPlaceOrderModalOpen={setIsPlaceOrderModalOpen}
        />
      </OrderProvider>
    </CartProvider>
  );
}

const AppContent: React.FC<{
  isPlaceOrderModalOpen: boolean;
  setIsPlaceOrderModalOpen: (open: boolean) => void;
}> = ({ isPlaceOrderModalOpen, setIsPlaceOrderModalOpen }) => {
  const { addOrder } = useOrders();
  const currentUser = getTempCurrentUser();

  const handlePlaceOrder = (orderData: any) => {
    addOrder(orderData);
    alert('Order placed successfully!');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Navigation bar - stays at top of page */}
        <Navbar />
        
        <Routes>
          {/* Homepage Route */}
          <Route path="/" element={
            <main>
              {/* Hero banner section */}
              <Hero />
              
              {/* Preview of artwork catalog */}
              <CatalogPreview />
              
              {/* Services offered by the business */}
              <Services />
              
              {/* Customer testimonials */}
              <Testimonials />
              
              {/* Quote request and contact form section */}
              <section className="py-16 bg-gradient-to-b from-gray-50 to-white" id="contact">
                <div className="container mx-auto px-4">
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Quote/Contact Form - takes up 2 columns */}
                    <div className="lg:col-span-2">
                      <QuoteForm />
                    </div>
                    
                    {/* Contact Information Card - takes up 1 column */}
                    <div className="lg:col-span-1">
                      <ContactInfo />
                    </div>
                  </div>
                </div>
              </section>
            </main>
          } />
          
          {/* Catalog Page Route */}
          <Route path="/catalog" element={<Catalog />} />
          
          {/* About Page Route */}
          <Route path="/about" element={<About />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Dashboard Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/sales/dashboard" element={<SalesRepDashboard />} />
          <Route path="/designer/dashboard" element={<DesignerDashboard />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        </Routes>
        
        {/* Footer - company info and links */}
        <Footer />

        {/* Place Order Modal */}
        {currentUser && currentUser.role === 'customer' && (
          <PlaceOrderModal
            isOpen={isPlaceOrderModalOpen}
            onClose={() => setIsPlaceOrderModalOpen(false)}
            onSubmit={handlePlaceOrder}
          />
        )}
      </div>
    </Router>
  );
};

// Homepage Component
const Homepage: React.FC = () => {
  return (
    <main>
      {/* Hero banner section */}
      <Hero />
      
      {/* Preview of artwork catalog */}
      <CatalogPreview />
      
      {/* Services offered by the business */}
      <Services />
      
      {/* Customer testimonials */}
      <Testimonials />
      
      {/* Quote request and contact form section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white" id="contact">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quote/Contact Form - takes up 2 columns */}
            <div className="lg:col-span-2">
              <QuoteForm />
            </div>
            
            {/* Contact Information Card - takes up 1 column */}
            <div className="lg:col-span-1">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;
                      </div>
                    </div>
                  </div>
                </section>
              </main>
            } />
            
            {/* Catalog Page Route */}
            <Route path="/catalog" element={<Catalog />} />
            
            {/* About Page Route */}
            <Route path="/about" element={<About />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Dashboard Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/sales/dashboard" element={<SalesRepDashboard />} />
            <Route path="/designer/dashboard" element={<DesignerDashboard />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          </Routes>
          
          {/* Footer - company info and links */}
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

// Homepage Component
const Homepage: React.FC = () => {
  return (
    <main>
      {/* Hero banner section */}
      <Hero />
      
      {/* Preview of artwork catalog */}
      <CatalogPreview />
      
      {/* Services offered by the business */}
      <Services />
      
      {/* Customer testimonials */}
      <Testimonials />
      
      {/* Quote request and contact form section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white" id="contact">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quote/Contact Form - takes up 2 columns */}
            <div className="lg:col-span-2">
              <QuoteForm />
            </div>
            
            {/* Contact Information Card - takes up 1 column */}
            <div className="lg:col-span-1">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;