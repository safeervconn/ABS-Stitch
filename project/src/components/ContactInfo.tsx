/**
 * Contact Information Card Component
 * 
 * Features:
 * - Quick access contact details
 * - Phone and email with click-to-contact links
 * - Business hours
 * - Social media links (placeholder)
 */

import React from 'react';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';

const ContactInfo: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 h-fit shadow-sm">
      
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-extrabold text-gray-800 mb-2">
          Contact Information
        </h3>
        <p className="text-gray-600">
          Get in touch with us directly
        </p>
      </div>

      {/* Contact Details */}
      <div className="space-y-4">
        
        {/* Phone */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <a 
              href="tel:+1234567890" 
              className="text-gray-800 hover:text-blue-600 transition-colors"
            >
              (123) 456-7890
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <a 
              href="mailto:hello@artistrydigital.com" 
              className="text-gray-800 hover:text-blue-600 transition-colors"
            >
              hello@artistrydigital.com
            </a>
          </div>
        </div>

        {/* Business Hours */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Business Hours</p>
            <p className="text-gray-800">Mon-Fri: 9AM-6PM EST</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-gray-800">Remote & Worldwide</p>
          </div>
        </div>
      </div>

      {/* Response Time Notice */}
      <div className="mt-6 bg-white p-4 rounded-lg border-l-4 border-blue-600">
        <p className="text-sm text-gray-600">
          We typically respond to all inquiries within 2-4 hours during business hours.
        </p>
      </div>
    </div>
  );
};

export default ContactInfo;