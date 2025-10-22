import React, { useState } from 'react';
import { X, Calendar, User, Package, FileText, Paperclip, MessageSquare, Edit } from 'lucide-react';
import { getCurrentUser, getUserProfile } from '../lib/supabase';
import { Order } from '../contexts/OrderContext';
import { OrderComment, OrderAttachment } from '../admin/types';
import { getOrderComments } from '../admin/api/supabaseHelpers';
import { AttachmentList } from './AttachmentList';
import { fetchOrderAttachments } from '../lib/attachmentService';
import { RequestEditModal } from './RequestEditModal';
import { editCommentsService } from '../services/editCommentsService';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdate?: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdate
}) => {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [orderComments, setOrderComments] = React.useState<OrderComment[]>([]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [attachments, setAttachments] = React.useState<OrderAttachment[]>([]);
  const [showRequestEditModal, setShowRequestEditModal] = React.useState(false);
  const [editComments, setEditComments] = React.useState<any[]>([]);
  const [loadingEditComments, setLoadingEditComments] = React.useState(false);
  const [newEditComment, setNewEditComment] = React.useState('');
  const [submittingEditComment, setSubmittingEditComment] = React.useState(false);

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

    const fetchEditData = async () => {
      if (!order?.id) return;

      try {
        setLoadingEditComments(true);
        const comments = await editCommentsService.getEditCommentsByOrder(order.id);
        setEditComments(comments);
      } catch (error) {
        console.error('Error fetching edit comments:', error);
      } finally {
        setLoadingEditComments(false);
      }
    };

    if (isOpen) {
      checkUser();
      fetchComments();
      fetchAttachmentsData();
      fetchEditData();
    }
  }, [isOpen, order?.id]);

  const handleSubmitEditComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEditComment.trim() || !order?.id) return;

    setSubmittingEditComment(true);
    try {
      await editCommentsService.createEditComment({
        order_id: order.id,
        content: newEditComment.trim()
      });

      const updatedComments = await editCommentsService.getEditCommentsByOrder(order.id);
      setEditComments(updatedComments);
      setNewEditComment('');
    } catch (error) {
      console.error('Error submitting edit comment:', error);
    } finally {
      setSubmittingEditComment(false);
    }
  };

  const handleRequestEditSuccess = () => {
    if (onOrderUpdate) {
      onOrderUpdate();
    }

    if (order?.id) {
      editCommentsService.getEditCommentsByOrder(order.id).then(comments => {
        setEditComments(comments);
      });

      fetchOrderAttachments(order.id).then(orderAttachments => {
        setAttachments(orderAttachments);
      });
    }
  };

  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
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

  const isCustomer = currentUser?.role === 'customer';
  const canRequestEdit = isCustomer && order.status === 'completed';

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <p className="text-gray-600">{order.order_number}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.order_name || 'No Order Name'}</p>
                </div>
                {order.edits && order.edits > 0 && (
                  <div className="bg-blue-50 px-3 py-1 rounded-full">
                    <p className="text-sm font-medium text-blue-700">
                      Requested Edits: {order.edits}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2 space-y-6">

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
                          {order.order_type === 'custom' ? 'Custom Design' : 'Stock Design'}
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

                    {['admin', 'customer'].includes(currentUser?.role) && (
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
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

                {canRequestEdit && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">
                          Need changes to this order?
                        </h4>
                        <p className="text-xs text-blue-700">
                          Submit an edit request to revise this completed order
                        </p>
                      </div>
                      <button
                        onClick={() => setShowRequestEditModal(true)}
                        className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Request Edit
                      </button>
                    </div>
                  </div>
                )}

                {order.custom_description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Design Requirements</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{order.custom_description}</p>
                    </div>
                  </div>
                )}

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

                {currentUser && ['admin', 'sales_rep', 'designer'].includes(currentUser.role) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Comments</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
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

                {editComments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Edit Comments</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      {loadingEditComments ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-gray-600 text-sm">Loading edit comments...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="max-h-96 overflow-y-auto space-y-4">
                            {editComments.map((comment) => (
                              <div key={comment.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
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

                          
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

              <div className="space-y-6">

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Total</h3>
                  <div className="text-2xl font-bold text-blue-600">${order.total_amount?.toFixed(2) || '0.00'}</div>
                </div>

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

      {showRequestEditModal && (
        <RequestEditModal
          orderId={order.id}
          orderNumber={order.order_number}
          orderName={order.order_name}
          orderStatus={order.status}
          onClose={() => setShowRequestEditModal(false)}
          onSuccess={handleRequestEditSuccess}
        />
      )}
    </>
  );
};

export default OrderDetailsModal;
