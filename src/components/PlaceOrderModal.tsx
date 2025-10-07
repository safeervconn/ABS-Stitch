/**
 * Place Order Modal Component
 * 
 * Modal interface for placing custom orders featuring:
 * - Dynamic form based on user authentication
 * - File upload with multiple format support
 * - Order specifications (dimensions, apparel type)
 * - Form validation and error handling
 * - Success state with order confirmation
 * - Integration with order management system
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { X, Send, Paperclip, Loader, Trash2, CheckCircle, Eye, Plus } from 'lucide-react';
import { getCurrentUser, getUserProfile, getApparelTypes } from '../core/api/supabase';
import { useOrders } from '../features/orders/OrderContext';
import { toast } from '../core/utils/toast';

interface PlaceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = React.memo(({ isOpen, onClose }) => {
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
    files: [] as File[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const { addOrder } = useOrders();

  /**
   * Country code options for phone number input
   */
  const countryOptions = useMemo(() => [
    { value: '+1', label: '🇺🇸 +1', country: 'US' },
    { value: '+44', label: '🇬🇧 +44', country: 'UK' },
    { value: '+33', label: '🇫🇷 +33', country: 'FR' },
    { value: '+49', label: '🇩🇪 +49', country: 'DE' },
    { value: '+81', label: '🇯🇵 +81', country: 'JP' },
    { value: '+86', label: '🇨🇳 +86', country: 'CN' },
    { value: '+91', label: '🇮🇳 +91', country: 'IN' },
    { value: '+61', label: '🇦🇺 +61', country: 'AU' },
    { value: '+55', label: '🇧🇷 +55', country: 'BR' },
    { value: '+34', label: '🇪🇸 +34', country: 'ES' }
  ], []);

  /**
   * Load user data and apparel types when modal opens
   */
  useEffect(() => {
    if (!isOpen) return;

    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getUserProfile(user.id);
          if (profile) {
            setCurrentUser(profile);
            setFormData(prev => ({
              ...prev,
              fullName: profile.full_name || '',
              email: profile.email || ''
            }));
          }
        }
        
        // Fetch apparel types
        const apparelTypesData = await getApparelTypes();
        setApparelTypes(apparelTypesData);
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
    
    checkUser();
  }, [isOpen]);

  /**
   * Handle form input changes with validation
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Only allow digits for phone number
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  /**
   * Handle file selection with validation
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...selectedFiles] }));
  }, []);

  /**
   * Remove file from selection
   */
  const removeFile = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * Handle form submission with validation and order creation
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      // Prepare order data with proper field mapping
      const orderData = {
        order_type: 'custom' as const,
        custom_description: formData.designInstructions,
        apparel_type_id: formData.apparelTypeId,
        custom_width: parseFloat(formData.customWidth) || undefined,
        custom_height: parseFloat(formData.customHeight) || undefined,
        total_amount: 75.00, // Default amount for custom orders
      };
      
      await addOrder(orderData, formData.files);
      
      // Generate a mock order number for display
      const mockOrderNumber = `ORD-${Date.now().toString().slice(-8)}`;
      setOrderNumber(mockOrderNumber);
      toast.success('Order placed successfully!');
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, addOrder]);

  /**
   * Handle modal close with state reset
   */
  const handleCloseModal = useCallback(() => {
    // Reset all states when closing
    setShowSuccessMessage(false);
    setOrderNumber('');
    setFormData({
      fullName: '',
      email: '',
      countryCode: '+1',
      phoneNumber: '',
      customWidth: '',
      customHeight: '',
      apparelTypeId: '',
      designInstructions: '',
      files: []
    });
    onClose();
  }, [onClose]);

  /**
   * Handle placing another order
   */
  const handlePlaceAnother = useCallback(() => {
    setShowSuccessMessage(false);
    setOrderNumber('');
    setFormData({
      fullName: currentUser?.full_name || '',
      email: currentUser?.email || '',
      countryCode: '+1',
      phoneNumber: '',
      customWidth: '',
      customHeight: '',
      apparelTypeId: '',
      designInstructions: '',
      files: []
    });
  }, [currentUser]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleCloseModal} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {showSuccessMessage ? 'Order Placed Successfully!' : 'Place Order'}
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Success Message */}
          {showSuccessMessage ? (
            <div className="p-6 text-center">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Order Placed Successfully!
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Thank you for your order! We've received your custom embroidery request and our team will begin working on it shortly.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your Order Number:</p>
                <p className="text-xl font-bold text-blue-600">{orderNumber}</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = '/customer/dashboard'}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold"
                  >
                    <Eye className="h-5 w-5" />
                    <span>View My Orders</span>
                  </button>
                  
                  <button
                    onClick={handlePlaceAnother}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Place Another Order</span>
                  </button>
                </div>
                
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all font-semibold"
                >
                  Close
                </button>
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                <p>📧 You'll receive an email confirmation shortly</p>
                <p>⏱️ Expected completion: 2-3 business days</p>
              </div>
            </div>
          ) : (
            /* Order Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
              {/* Customer Info Display - Only show when logged in */}
              {currentUser && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Order for:</h3>
                  <div className="text-gray-800">
                    <p className="font-medium">{currentUser.full_name}</p>
                    <p className="text-sm text-gray-600">{currentUser.email}</p>
                    {currentUser.phone && (
                      <p className="text-sm text-gray-600">{currentUser.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Basic Contact Fields - Only show when not logged in */}
              {!currentUser && (
                <>
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
                </>
              )}

              {/* Order-Specific Fields */}
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

              {/* Design Instructions */}
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

              {/* File Attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload-modal"
                    accept="image/*,.pdf,.doc,.docx,.zip"
                    multiple
                  />
                  <label 
                    htmlFor="file-upload-modal" 
                    className="cursor-pointer flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600"
                  >
                    <Paperclip className="h-5 w-5" />
                    <span>
                      Click to upload reference images, documents, or zip files
                    </span>
                  </label>
                </div>
                
                {/* Display selected files */}
                {formData.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected files:</p>
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          aria-label={`Remove ${file.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
});

export default PlaceOrderModal;