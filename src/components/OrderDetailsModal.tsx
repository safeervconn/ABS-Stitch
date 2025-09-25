import React, { useState } from 'react';
import { X, Calendar, User, Package, FileText, Paperclip } from 'lucide-react';
import { getCurrentUser, getUserProfile } from '../lib/supabase';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  order
}) => {
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getUserProfile(user.id);
          if (profile) {
            setCurrentUser(profile);
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
    
    if (isOpen) {
      checkUser();
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'review': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <p className="text-gray-600">{order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Order Information */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Order Type</p>
                        <p className="font-medium text-gray-800 capitalize">{order.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-800">{order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium text-gray-800">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Design Requirements */}
                {order.designInstructions && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Design Requirements</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{order.designInstructions}</p>
                    </div>
                  </div>
                )}

                {/* Attached Files */}
                {order.file_urls && order.file_urls.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Attached Files</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="space-y-2">
                        {order.file_urls.map((fileUrl, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Attachment {index + 1}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Specifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {order.designSize && (
                        <div>
                          <p className="text-sm text-gray-500">Design Size</p>
                          <p className="font-medium text-gray-800 capitalize">{order.designSize}</p>
                        </div>
                      )}
                      {order.apparelType && (
                        <div>
                          <p className="text-sm text-gray-500">Apparel Type</p>
                          <p className="font-medium text-gray-800 capitalize">{order.apparelType}</p>
                        </div>
                      )}
                      {order.customWidth && order.customHeight && (
                        <div>
                          <p className="text-sm text-gray-500">Custom Dimensions</p>
                          <p className="font-medium text-gray-800">{order.customWidth}" x {order.customHeight}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Order Total */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Total</h3>
                  <div className="text-2xl font-bold text-blue-600">{order.amount}</div>
                </div>

                {/* Assignment Info */}
                {(order.salesRep || order.designer) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Assignment</h3>
                    <div className="space-y-3">
                      {order.salesRep && (
                        <div>
                          <p className="text-sm text-gray-500">Sales Representative</p>
                          <p className="font-medium text-gray-800">{order.salesRep}</p>
                        </div>
                      )}
                      {order.designer && (
                        <div>
                          <p className="text-sm text-gray-500">Designer</p>
                          <p className="font-medium text-gray-800">{order.designer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Info</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Email:</span><br />
                      <span className="text-gray-800">{order.email}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Phone:</span><br />
                      <span className="text-gray-800">{order.phone}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsModal;