/**
 * Main App Component - Digital Artwork Services Homepage
 * 
 * This is the main component that brings together all sections of the homepage.
 * It renders a complete one-page website for a digital artwork services business.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CatalogPreview from './components/CatalogPreview';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import QuoteForm from './components/QuoteForm';
import ContactInfo from './components/ContactInfo';
import Footer from './components/Footer';
import Catalog from './pages/Catalog';

function App() {
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
        </Routes>
        
        {/* Footer - company info and links */}
        <Footer />
      </div>
    </Router>
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

              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer - company info and links */}
      <Footer />
    </div>
  );
}

export default App;