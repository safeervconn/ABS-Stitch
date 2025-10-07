/**
 * Quote/Contact Form Component
 * 
 * Dual-purpose form component providing:
 * - Quote request mode with design-specific fields
 * - General contact mode for inquiries
 * - Dynamic form fields based on mode selection
 * - File upload support for reference materials
 * - Form validation and submission handling
 * - Responsive design with accessibility features
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { getApparelTypes } from '../../core/api/supabase';

const QuoteForm: React.FC = React.memo(() => {
  // Form state management
  const [isQuoteRequest, setIsQuoteRequest] = useState(true);
  const [apparelTypes, setApparelTypes] = useState<{id: string, type_name: string}[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    customWidth: '',
    customHeight: '',
    apparelTypeId: '',
    designInstructions: '',
    message: '',
    file: null as File | null
  });

  /**
   * Country code options for international support
   */
  const countryOptions = useMemo(() => [
    { value: '+1', label: '🇺🇸 +1' },
    { value: '+44', label: '🇬🇧 +44' },
    { value: '+33', label: '🇫🇷 +33' },
    { value: '+49', label: '🇩🇪 +49' },
    { value: '+81', label: '🇯🇵 +81' },
    { value: '+86', label: '🇨🇳 +86' },
    { value: '+91', label: '🇮🇳 +91' },
    { value: '+61', label: '🇦🇺 +61' },
    { value: '+55', label: '🇧🇷 +55' },
    { value: '+34', label: '🇪🇸 +34' }
  ], []);

  /**
   * Load apparel types on component mount
   */
  React.useEffect(() => {
    const fetchApparelTypes = async () => {
      try {
        const data = await getApparelTypes();
        setApparelTypes(data);
      } catch (error) {
        console.error('Error fetching apparel types:', error);
      }
    };
    fetchApparelTypes();
  }, []);

  /**
   * Handle form input changes with validation
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  /**
   * Handle file upload with validation
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send data to a server
    console.log('Form submitted:', formData);
    alert(isQuoteRequest ? 'Quote request submitted!' : 'Message sent!');
  }, [formData, isQuoteRequest]);

  /**
   * Toggle between quote request and general contact modes
   */
  const handleModeToggle = useCallback((checked: boolean) => {
    setIsQuoteRequest(checked);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      
      {/* Form Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Get In Touch
        </h2>
        <p className="text-gray-600">
          Request a custom quote or send us a general message
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Quote Request Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isQuoteRequest"
            checked={isQuoteRequest}
            onChange={(e) => handleModeToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isQuoteRequest" className="text-gray-700 font-medium">
            This is a quote request (uncheck to use as general contact form)
          </label>
        </div>

        {/* Basic Contact Fields - Always Shown */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Phone Number with Country Code */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quote-Specific Fields */}
        {isQuoteRequest && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apparel Type
                </label>
                <select
                  name="apparelTypeId"
                  value={formData.apparelTypeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  {apparelTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.type_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (inches)
                </label>
                <input
                  type="number"
                  name="customWidth"
                  step="0.1"
                  min="0.1"
                  value={formData.customWidth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Width"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (inches)
                </label>
                <input
                  type="number"
                  name="customHeight"
                  step="0.1"
                  min="0.1"
                  value={formData.customHeight}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Height"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Design Instructions *
              </label>
              <textarea
                name="designInstructions"
                required
                rows={4}
                value={formData.designInstructions}
                onChange={handleInputChange}
                placeholder="Please describe your design ideas, colors, style preferences, and any specific requirements..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {/* General Contact Message Field */}
        {!isQuoteRequest && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              placeholder="How can we help you today?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* File Attachment - Always Available */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Attachment (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.doc,.docx"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <Paperclip className="h-5 w-5" />
              <span>
                {formData.file ? formData.file.name : 'Click to upload reference images or documents'}
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold"
        >
          <Send className="h-5 w-5" />
          <span>{isQuoteRequest ? 'Request Quote' : 'Send Message'}</span>
        </button>
      </form>
    </div>
  );
});

export default QuoteForm;