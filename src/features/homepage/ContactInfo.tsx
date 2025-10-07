/**
 * Contact Information Card Component
 * 
 * Displays company contact details including:
 * - Phone and email with click-to-contact functionality
 * - Business hours and location information
 * - Response time expectations
 * - Structured layout with icons
 * - SEO-friendly contact information
 */

import React, { useMemo } from 'react';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';

const ContactInfo: React.FC = React.memo(() => {
  /**
   * Contact information configuration
   */
  const contactDetails = useMemo(() => [
    {
      icon: Phone,
      label: 'Phone',
      value: '(123) 456-7890',
      href: 'tel:+1234567890',
      color: 'blue'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@absstitch.com',
      href: 'mailto:hello@absstitch.com',
      color: 'blue'
    },
    {
      icon: Clock,
      label: 'Business Hours',
      value: 'Mon-Fri: 9AM-6PM EST',
      href: null,
      color: 'blue'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Remote & Worldwide',
      href: null,
      color: 'blue'
    }
  ], []);

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
        {contactDetails.map((detail, index) => {
          const IconComponent = detail.icon;
          const content = (
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <IconComponent className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{detail.label}</p>
                <span className="text-gray-800 hover:text-blue-600 transition-colors">
                  {detail.value}
                </span>
              </div>
            </div>
          );

          return detail.href ? (
            <a 
              key={index}
              href={detail.href}
              className="block"
            >
              {content}
            </a>
          ) : (
            <div key={index}>
              {content}
            </div>
          );
        })}
      </div>

      {/* Response Time Notice */}
      <div className="mt-6 bg-white p-4 rounded-lg border-l-4 border-blue-600">
        <p className="text-sm text-gray-600">
          We typically respond to all inquiries within 2-4 hours during business hours.
        </p>
      </div>
    </div>
  );
});

export default ContactInfo;