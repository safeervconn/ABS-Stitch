import React, { useState } from 'react';
import { X, Send, Paperclip, Loader, Trash2, CheckCircle, Eye, Plus } from 'lucide-react';
import { getCurrentUser, getUserProfile, getCategories } from '../lib/supabase';
import { useOrders } from '../contexts/OrderContext';
import { toast } from '../utils/toast';
import { uploadAttachment } from '../lib/attachmentService';

interface PlaceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<{id: string, category_name: string}[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    orderName: '',
    customWidth: '',
    customHeight: '',
    categoryId: '',
    designInstructions: '',
    files: [] as File[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const { addOrder } = useOrders();

  React.useEffect(() => {
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
        
        // Fetch categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
    
    if (isOpen) {
      checkUser();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...selectedFiles] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderName.trim()) {
      toast.error('Please provide an order name');
      return;
    }

    if (!formData.designInstructions.trim()) {
      toast.error('Please provide design instructions');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.customWidth || parseFloat(formData.customWidth) <= 0) {
      toast.error('Please enter a valid width greater than 0');
      return;
    }

    if (!formData.customHeight || parseFloat(formData.customHeight) <= 0) {
      toast.error('Please enter a valid height greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        order_type: 'custom' as const,
        order_name: formData.orderName,
        custom_description: formData.designInstructions,
        category_id: formData.categoryId,
        custom_width: parseFloat(formData.customWidth),
        custom_height: parseFloat(formData.customHeight),
        total_amount: 0,
      };

      const newOrder = await addOrder(orderData);

      if (!newOrder) {
        throw new Error('Order creation failed. Please try again.');
      }

      // Upload attachments if any using S3 attachment service
      if (formData.files.length > 0) {
        const uploadErrors: string[] = [];
        const orderNumber = newOrder.order_number || `ORD-${newOrder.id.slice(0, 8)}`;

        for (let i = 0; i < formData.files.length; i++) {
          const file = formData.files[i];
          try {
            await uploadAttachment(newOrder.id, orderNumber, file);
          } catch (uploadError) {
            console.error(`Error uploading file ${file.name}:`, uploadError);
            uploadErrors.push(file.name);
          }
        }

        if (uploadErrors.length > 0) {
          toast.error(`Failed to upload some files: ${uploadErrors.join(', ')}`);
        }
      }

      setCreatedOrder(newOrder);
      toast.success('Order placed successfully!');
      setShowSuccessMessage(true);
    } catch (error: any) {
      console.error('Error placing order:', error);

      let errorMessage = 'Failed to place order. Please try again.';

      if (error?.message) {
        if (error.message.includes('customer')) {
          errorMessage = 'Unable to verify your account. Please ensure you are logged in.';
        } else if (error.message.includes('sales_rep')) {
          errorMessage = 'No sales representative assigned. Please contact support.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'You do not have permission to place orders.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    // Reset all states when closing
    setShowSuccessMessage(false);
    setCreatedOrder(null);
    setFormData({
      fullName: '',
      email: '',
      countryCode: '+1',
      phoneNumber: '',
      orderName: '',
      customWidth: '',
      customHeight: '',
      categoryId: '',
      designInstructions: '',
      files: []
    });
    onClose();
  };

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
                <p className="text-xl font-bold text-blue-600">
                  {createdOrder?.order_number || `ORD-${createdOrder?.id?.slice(0, 8) || 'PENDING'}`}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = '/customer/dashboard'}
                    className="btn-primary btn-large flex items-center justify-center space-x-2"
                  >
                    <Eye className="h-5 w-5" />
                    <span>View My Orders</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowSuccessMessage(false);
                      setCreatedOrder(null);
                      setFormData({
                        fullName: currentUser?.full_name || '',
                        email: currentUser?.email || '',
                        countryCode: '+1',
                        phoneNumber: '',
                        orderName: '',
                        customWidth: '',
                        customHeight: '',
                       categoryId: '',
                        designInstructions: '',
                        files: []
                      });
                    }}
                    className="btn-success btn-large flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Place Another Order</span>
                  </button>
                </div>
                
                <button
                  onClick={handleCloseModal}
                  className="w-full btn-secondary btn-large"
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
            /* Form */
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
                </>
              )}

              {/* Order Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Name *
                </label>
                <input
                  type="text"
                  name="orderName"
                  required
                  maxLength={32}
                  value={formData.orderName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a name for this order (max 32 characters)"
                />
              </div>

              {/* Order-Specific Fields */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.category_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (inches) *
                  </label>
                  <input
                    type="number"
                    name="customWidth"
                    step="0.1"
                    min="0.1"
                    value={formData.customWidth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Width"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (inches) *
                  </label>
                  <input
                    type="number"
                    name="customHeight"
                    step="0.1"
                    min="0.1"
                    value={formData.customHeight}
                    onChange={handleInputChange}
                    required
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
                  placeholder="Tell us more... fabric, placement, color, description etc."
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
                  className="flex-1 btn-secondary btn-large"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-success btn-large flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner-white"></div>
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
};

export default PlaceOrderModal;