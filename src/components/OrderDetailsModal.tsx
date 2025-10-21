import React, { useState } from 'react';
import { X, Calendar, User, Package, FileText, Paperclip, MessageSquare } from 'lucide-react';
import { getCurrentUser, getUserProfile } from '../lib/supabase';
import { Order } from '../contexts/OrderContext';
import { OrderComment, OrderAttachment } from '../admin/types';
import { getOrderComments } from '../admin/api/supabaseHelpers';
import { AttachmentList } from './AttachmentList';
import { fetchOrderAttachments } from '../lib/attachmentService';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  order
}) => {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [orderComments, setOrderComments] = React.useState<OrderComment[]>([]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [attachments, setAttachments] = React.useState<OrderAttachment[]>([]);

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
    
    const fetchComments = async () => {
      if (!order?.id) return;

      try {
        setLoadingComments(true);
        const comments = await getOrderComments(order.id);
        setOrderComments(comments);
      } catch (error) {
        console.error('Error fetching order comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    const fetchAttachmentsData = async () => {
      if (!order?.id) return;

      try {
        const orderAttachments = await fetchOrderAttachments(order.id);
        setAttachments(orderAttachments);
      } catch (error) {
        console.error('Error fetching attachments:', error);
      }
    };

    if (isOpen) {
      checkUser();
      fetchComments();
      fetchAttachmentsData();
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
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
              <p className="text-gray-600">{order.order_number}</p>
              <p className="text-sm text-gray-500 mt-1">{order.order_name || 'No Order Name'}</p>
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
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-800">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Order Type</p>
                        <p className="font-medium text-gray-800 capitalize">
                          {order.order_type === 'custom' ? 'Custom Design' : 'Catalog Item'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {(order.status || 'unknown').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Only show payment status for admin or customer users */}
{['admin', 'customer'].includes(currentUser?.role) && (
  <div className="flex items-center space-x-3">
    <FileText className="h-5 w-5 text-indigo-600" />
    <div>
      <p className="text-sm text-gray-500">Payment Status</p>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status || 'unpaid')}`}
      >
        {(order.payment_status || 'unpaid').replace('_', ' ')}
      </span>
    </div>
  </div>
)}

                  </div>
                </div>

                {/* Design Requirements */}
                {order.custom_description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Design Requirements</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{order.custom_description}</p>
                    </div>
                  </div>
                )}


                {/* Order Specifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {order.category_name && (
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium text-gray-800 capitalize">{order.category_name}</p>
                        </div>
                      )}
                      {order.custom_width && order.custom_height && (
                        <div>
                          <p className="text-sm text-gray-500">Custom Dimensions</p>
                          <p className="font-medium text-gray-800">{order.custom_width}" x {order.custom_height}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Comments - Only for admin, sales_rep, designer */}
                {currentUser && ['admin', 'sales_rep', 'designer'].includes(currentUser.role) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Comments</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      {loadingComments ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-gray-600 text-sm">Loading comments...</span>
                        </div>
                      ) : orderComments.length > 0 ? (
                        <div className="space-y-4">
                          {orderComments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <MessageSquare className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-gray-800 text-sm">{comment.author_name}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No comments yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Attachments Section */}
                <div>
                  <AttachmentList
                    orderId={order.id}
                    orderNumber={order.order_number}
                    attachments={attachments}
                    onAttachmentsChange={async () => {
                      try {
                        const orderAttachments = await fetchOrderAttachments(order.id);
                        setAttachments(orderAttachments);
                      } catch (error) {
                        console.error('Error refreshing attachments:', error);
                      }
                    }}
                    canUpload={true}
                    canDelete={false}
                  />
                </div>

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Order Total */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Total</h3>
                  <div className="text-2xl font-bold text-blue-600">${order.total_amount?.toFixed(2) || '0.00'}</div>
                </div>

                {/* Assignment Info */}
                {currentUser?.role === 'admin' && (order.assigned_sales_rep_name || order.assigned_designer_name) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Assignment</h3>
                    <div className="space-y-3">
                      {order.assigned_sales_rep_name && order.assigned_sales_rep_name !== 'Unassigned' && (
                        <div>
                          <p className="text-sm text-gray-500">Sales Representative</p>
                          <p className="font-medium text-gray-800">{order.assigned_sales_rep_name}</p>
                        </div>
                      )}
                      {order.assigned_designer_name && order.assigned_designer_name !== 'Unassigned' && (
                        <div>
                          <p className="text-sm text-gray-500">Designer</p>
                          <p className="font-medium text-gray-800">{order.assigned_designer_name}</p>
                        </div>
                      )}
                      {(!order.assigned_sales_rep_name || order.assigned_sales_rep_name === 'Unassigned') && 
                       (!order.assigned_designer_name || order.assigned_designer_name === 'Unassigned') && (
                        <div>
                          <p className="text-sm text-gray-500">Assignment Status</p>
                          <p className="font-medium text-gray-400">Unassigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information - Only show to admin, sales_rep, and customer */}
                {currentUser && ['admin', 'sales_rep', 'customer'].includes(currentUser.role) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Info</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-500">Name:</span><br />
                        <span className="text-gray-800">{order.customer_name}</span>
                      </p>
                      {order.customer_company_name && (
                        <p className="text-sm">
                          <span className="text-gray-500">Company:</span><br />
                          <span className="text-gray-800">{order.customer_company_name}</span>
                        </p>
                      )}
                      {currentUser.role === 'admin' && (
                        <>
                          <p className="text-sm">
                            <span className="text-gray-500">Email:</span><br />
                            <span className="text-gray-800">{order.customer_email}</span>
                          </p>
                          {order.customer_phone && (
                            <p className="text-sm">
                              <span className="text-gray-500">Phone:</span><br />
                              <span className="text-gray-800">{order.customer_phone}</span>
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsModal;