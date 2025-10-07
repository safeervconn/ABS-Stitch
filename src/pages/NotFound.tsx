/**
 * 404 Not Found Page Component
 * 
 * SEO-optimized 404 page with helpful navigation options
 * and consistent design with the rest of the application.
 */

import React from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

/**
 * 404 error page with helpful navigation and SEO optimization
 */
const NotFound: React.FC = () => {
  /**
   * Navigate back in browser history
   */
  const goBack = () => {
    window.history.back();
  };

  /**
   * Navigate to homepage
   */
  const goHome = () => {
    window.location.href = '/';
  };

  /**
   * Navigate to catalog
   */
  const goToCatalog = () => {
    window.location.href = '/catalog';
  };

  return (
    <PageLayout
      title="Page Not Found | ABS STITCH"
      description="The page you're looking for doesn't exist. Explore our embroidery services and catalog instead."
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <Card
            background="glass"
            shadow="xl"
            rounded="2xl"
            className="text-center"
            entranceAnimation="scaleIn"
          >
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                404
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track with our embroidery services.
            </p>

            {/* Navigation options */}
            <div className="space-y-3">
              <Button
                onClick={goHome}
                variant="primary"
                fullWidth
                icon={<Home className="h-4 w-4" />}
                animation="lift"
              >
                Go to Homepage
              </Button>
              
              <Button
                onClick={goToCatalog}
                variant="secondary"
                fullWidth
                icon={<Search className="h-4 w-4" />}
                animation="lift"
              >
                Browse Catalog
              </Button>
              
              <Button
                onClick={goBack}
                variant="ghost"
                fullWidth
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Go Back
              </Button>
            </div>

            {/* Helpful links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Popular pages:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <a href="/about" className="text-blue-600 hover:text-blue-700 text-sm transition-colors">About Us</a>
                <span className="text-gray-300">•</span>
                <a href="/#services" className="text-blue-600 hover:text-blue-700 text-sm transition-colors">Services</a>
                <span className="text-gray-300">•</span>
                <a href="/#contact" className="text-blue-600 hover:text-blue-700 text-sm transition-colors">Contact</a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;