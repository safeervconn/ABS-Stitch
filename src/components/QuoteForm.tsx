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
import { Send, Paperclip } from 'lucide-react';
import '../styles/material3.css';

const QuoteForm: React.FC = () => {
  // Form state management
  const [isQuoteRequest, setIsQuoteRequest] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    designSize: '',
    customWidth: '',
    customHeight: '',
    apparelType: '',
    designInstructions: '',
    message: '',
    file: null as File | null
  });

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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send data to a server
    console.log('Form submitted:', formData);
    alert(isQuoteRequest ? 'Quote request submitted!' : 'Message sent!');
  };

  return (
    <div className="md-card md-card-elevated md-p-6">
      
      {/* Form Header */}
      <div className="mb-6">
        <h2 className="md-headline-medium mb-2" style={{color: 'var(--md-sys-color-on-surface)'}}>
          Get In Touch
        </h2>
        <p className="md-body-medium" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
          Request a custom quote or send us a general message
        </p>
      </div>

      <form onSubmit={handleSubmit} className="md-flex-column md-gap-6">
        
        {/* Quote Request Toggle */}
        <div className="md-flex md-items-center md-gap-3">
          <input
            type="checkbox"
            id="isQuoteRequest"
            checked={isQuoteRequest}
            onChange={(e) => setIsQuoteRequest(e.target.checked)}
            className="w-4 h-4 md-shape-extra-small"
            style={{accentColor: 'var(--md-sys-color-primary)'}}
          />
          <label htmlFor="isQuoteRequest" className="md-body-medium" style={{color: 'var(--md-sys-color-on-surface)'}}>
            This is a quote request (uncheck to use as general contact form)
          </label>
        </div>

        {/* Basic Contact Fields - Always Shown */}
        <div className="md-grid grid-cols-1 md:grid-cols-2 md-gap-4">
          <div className="md-text-field">
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className="md-text-field-input"
              placeholder=" "
            />
            <label className="md-text-field-label">
              Full Name *
            </label>
          </div>
          
          <div className="md-text-field">
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="md-text-field-input"
              placeholder=" "
            />
            <label className="md-text-field-label">
              Email Address *
            </label>
          </div>
        </div>

        <div className="md-grid grid-cols-4 md-gap-2">
          <div>
            <label className="block md-label-medium mb-1" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
              Country
            </label>
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleInputChange}
              className="w-full md-p-4 border border-gray-300 md-shape-extra-small md-surface"
              style={{borderColor: 'var(--md-sys-color-outline)', color: 'var(--md-sys-color-on-surface)'}}
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
          <div className="col-span-3 md-text-field">
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="md-text-field-input"
              placeholder=" "
            />
            <label className="md-text-field-label">
              Phone Number *
            </label>
          </div>
        </div>

        {/* Quote-Specific Fields */}
        {isQuoteRequest && (
          <>
            <div className="md-grid grid-cols-1 md:grid-cols-2 md-gap-4">
              <div>
                <label className="block md-label-medium mb-1" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
                  Design Size
                </label>
                <select
                  name="designSize"
                  value={formData.designSize}
                  onChange={handleInputChange}
                  className="w-full md-p-4 border md-shape-extra-small md-surface"
                  style={{borderColor: 'var(--md-sys-color-outline)', color: 'var(--md-sys-color-on-surface)'}}
                >
                  <option value="">Select Size</option>
                  <option value="small">Small (3" x 3")</option>
                  <option value="medium">Medium (5" x 5")</option>
                  <option value="large">Large (8" x 10")</option>
                  <option value="xl">Extra Large (12" x 12")</option>
                  <option value="custom">Custom Size</option>
                </select>
              </div>

              <div>
                <label className="block md-label-medium mb-1" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
                  Apparel Type
                </label>
                <select
                  name="apparelType"
                  value={formData.apparelType}
                  onChange={handleInputChange}
                  className="w-full md-p-4 border md-shape-extra-small md-surface"
                  style={{borderColor: 'var(--md-sys-color-outline)', color: 'var(--md-sys-color-on-surface)'}}
                >
                  <option value="">Select Type</option>
                  <option value="t-shirt">T-shirt</option>
                  <option value="jacket">Jacket</option>
                  <option value="cap">Cap</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Custom Size Fields - Show when Custom Size is selected */}
            {formData.designSize === 'custom' && (
              <div className="md-grid grid-cols-2 md-gap-4">
                <div className="md-text-field">
                  <input
                    type="number"
                    name="customWidth"
                    step="0.1"
                    value={formData.customWidth}
                    onChange={handleInputChange}
                    className="md-text-field-input"
                    placeholder=" "
                  />
                  <label className="md-text-field-label">
                    Width (inches)
                  </label>
                </div>
                <div className="md-text-field">
                  <input
                    type="number"
                    name="customHeight"
                    step="0.1"
                    value={formData.customHeight}
                    onChange={handleInputChange}
                    className="md-text-field-input"
                    placeholder=" "
                  />
                  <label className="md-text-field-label">
                    Height (inches)
                  </label>
                </div>
              </div>
            )}

            <div className="md-text-field">
              <textarea
                name="designInstructions"
                required
                rows={4}
                value={formData.designInstructions}
                onChange={handleInputChange}
                className="md-text-field-input"
                placeholder=" "
              />
              <label className="md-text-field-label">
                Design Instructions *
              </label>
            </div>
          </>
        )}

        {/* General Contact Message Field */}
        {!isQuoteRequest && (
          <div className="md-text-field">
            <textarea
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              className="md-text-field-input"
              placeholder=" "
            />
            <label className="md-text-field-label">
              Message *
            </label>
          </div>
        )}

        {/* File Attachment - Always Available */}
        <div>
          <label className="block md-label-medium mb-1" style={{color: 'var(--md-sys-color-on-surface-variant)'}}>
            File Attachment (Optional)
          </label>
          <div className="border-2 border-dashed md-p-4 md-shape-medium" style={{borderColor: 'var(--md-sys-color-outline-variant)'}}>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.doc,.docx"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer md-flex md-items-center md-justify-center md-gap-2 md-body-medium"
              style={{color: 'var(--md-sys-color-on-surface-variant)'}}
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
          className="w-full md-filled-button md-flex md-items-center md-justify-center md-gap-2"
        >
          <Send className="h-5 w-5" />
          <span>{isQuoteRequest ? 'Request Quote' : 'Send Message'}</span>
        </button>
      </form>
    </div>
  );
};

export default QuoteForm;