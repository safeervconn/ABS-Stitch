/**
 * Quote/Contact Form Component
 * 
 * Features:
 * - Smart form that changes based on checkbox selection
 * - Quote Request mode: includes design-specific fields
 * - General Contact mode: simplified contact form
 * - Form validation and file upload
 */

import React, { useState } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { getApparelTypes } from '../lib/supabase';
import { toast } from '../utils/toast';

const QuoteForm: React.FC = () => {
  // Form state management
  const [isQuoteRequest, setIsQuoteRequest] = useState(true);
  const [apparelTypes, setApparelTypes] = useState<{id: string, type_name: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let fileAttachment = undefined;

      if (formData.file) {
        const base64Content = await fileToBase64(formData.file);
        fileAttachment = {
          name: formData.file.name,
          content: base64Content,
          mimeType: formData.file.type || 'application/octet-stream'
        };
      }

      const selectedApparelType = apparelTypes.find(type => type.id === formData.apparelTypeId);

      const emailData = {
        formType: isQuoteRequest ? 'quote' : 'general',
        fullName: formData.fullName,
        email: formData.email,
        phone: `${formData.countryCode} ${formData.phoneNumber}`,
        apparelType: selectedApparelType?.type_name,
        customWidth: formData.customWidth,
        customHeight: formData.customHeight,
        designInstructions: formData.designInstructions,
        message: formData.message,
        fileAttachment
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      toast.success('Form submitted successfully');

      setFormData({
        fullName: '',
        email: '',
        countryCode: '+1',
        phoneNumber: '',
        customWidth: '',
        customHeight: '',
        apparelTypeId: '',
        designInstructions: '',
        message: '',
        file: null
      });

      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onChange={(e) => setIsQuoteRequest(e.target.checked)}
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
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+61">🇦🇺 +61</option>
              <option value="+55">🇧🇷 +55</option>
              <option value="+34">🇪🇸 +34</option>
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
          disabled={isSubmitting}
          className="w-full btn-success btn-large flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>{isQuoteRequest ? 'Request Quote' : 'Send Message'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default QuoteForm;