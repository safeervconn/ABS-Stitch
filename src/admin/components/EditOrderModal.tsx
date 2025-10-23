import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Paperclip, Trash2, Upload, Download, MessageSquare, Send } from 'lucide-react';
import { updateOrder, getSalesReps, getDesigners, getOrderComments, addOrderComment, getCategories } from '../api/supabaseHelpers';
import { AdminOrder, AdminUser, OrderAttachment } from '../types';
import { supabase, getCurrentUser, getUserProfile } from '../../lib/supabase';
import { toast } from '../../utils/toast';
import { AttachmentList } from '../../components/AttachmentList';
import { fetchOrderAttachments, uploadAttachment, deleteAttachment } from '../../lib/attachmentService';
import { editCommentsService } from '../../services/editCommentsService';
interface EditOrderModalProps {
isOpen: boolean;
onClose: () => void;
order: AdminOrder | null;
currentUser?: any;
onSuccess: () => void;
}
const EditOrderModal: React.FC;
<EditOrderModalProps>
= ({
isOpen,
onClose,
order,
currentUser: propCurrentUser,
onSuccess,
}) => {
const [formData, setFormData] = useState({
order_type: '',
order_name: '',
status: '',
category_id: '',
assigned_sales_rep_id: '',
assigned_designer_id: '',
total_amount: 0,
custom_width: 0,
custom_height: 0,
});
const [salesReps, setSalesReps] = useState<AdminUser[]>([]);
const [designers, setDesigners] = useState<AdminUser[]>([]);
const [categories, setCategories] = useState<{id: string, category_name: string}[]>([]);
const [currentUser, setCurrentUser] = useState
<any>
(propCurrentUser || null);
const [loading, setLoading] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState('');
const [loadingComments, setLoadingComments] = useState(false);
const [orderComments, setOrderComments] = useState<any[]>([]);
const [newCommentContent, setNewCommentContent] = useState('');
const [addingComment, setAddingComment] = useState(false);
const [attachments, setAttachments] = useState<OrderAttachment[]>([]);
const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
const [editComments, setEditComments] = useState<any[]>([]);
const [loadingEditComments, setLoadingEditComments] = useState(false);
const [newEditComment, setNewEditComment] = useState('');
const [submittingEditComment, setSubmittingEditComment] = useState(false);
useEffect(() => {
// Use prop currentUser if provided, otherwise fetch it
if (propCurrentUser) {
setCurrentUser(propCurrentUser);
} else {
fetchCurrentUser();
}
if (isOpen && order) {
// Initialize form data
setFormData({
order_type: order.order_type || 'custom',
order_name: order.order_name || '',
status: order.status,
category_id: order.category_id || '',
assigned_sales_rep_id: order.assigned_sales_rep_id || '',
assigned_designer_id: order.assigned_designer_id || '',
total_amount: order.total_amount || 0,
custom_width: order.custom_width || 0,
custom_height: order.custom_height || 0,
});
setError('');
// Fetch assignment options
fetchAssignmentOptions();
// Fetch current user only if not provided as prop
if (!propCurrentUser) {
fetchCurrentUser();
}
// Fetch order comments
fetchOrderComments();
// Fetch attachments
fetchAttachments();
// Fetch edit comments
fetchEditComments();
}
}, [isOpen, order, propCurrentUser]);
const fetchCurrentUser = async () => {
try {
const user = await getCurrentUser();
if (user) {
const profile = await getUserProfile(user.id);
setCurrentUser(profile);
}
} catch (error) {
console.error('Error fetching current user:', error);
}
};
const fetchOrderComments = async () => {
if (!order) return;
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
const fetchAttachments = async () => {
if (!order) return;
try {
const orderAttachments = await fetchOrderAttachments(order.id);
setAttachments(orderAttachments);
} catch (error) {
console.error('Error fetching attachments:', error);
}
};
const fetchEditComments = async () => {
if (!order) return;
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
const handleAddComment = async () => {
if (!order || !newCommentContent.trim() || !currentUser) return;
try {
setAddingComment(true);
await addOrderComment(order.id, currentUser.id, newCommentContent.trim());
toast.success('Comment added successfully');
setNewCommentContent('');
await fetchOrderComments();
} catch (error) {
console.error('Error adding comment:', error);
toast.error('Failed to add comment');
setError('Failed to add comment. Please try again.');
} finally {
setAddingComment(false);
}
};
const handleSubmitEditComment = async (e: React.FormEvent) => {
e.preventDefault();
if (!newEditComment.trim() || !order?.id) return;
setSubmittingEditComment(true);
try {
await editCommentsService.createEditComment({
order_id: order.id,
content: newEditComment.trim()
});
toast.success('Reply posted successfully');
const updatedComments = await editCommentsService.getEditCommentsByOrder(order.id);
setEditComments(updatedComments);
setNewEditComment('');
} catch (error) {
console.error('Error submitting edit comment:', error);
toast.error('Failed to post reply');
} finally {
setSubmittingEditComment(false);
}
};
const fetchAssignmentOptions = async () => {
try {
setLoading(true);
const [salesRepsData, designersData, categoriesData] = await Promise.all([
getSalesReps(),
getDesigners(),
getCategories(),
]);
setSalesReps(salesRepsData);
setDesigners(designersData);
setCategories(categoriesData);
} catch (error) {
console.error('Error fetching assignment options:', error);
setError('Failed to load assignment options');
} finally {
setLoading(false);
}
};
const handleInputChange = (e: React.ChangeEvent
<HTMLInputElement | HTMLSelectElement>
) => {
const { name, value } = e.target;
setFormData(prev => ({
...prev,
[name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
}));
};
const handleConfirmDelete = async () => {
if (pendingDeletions.length === 0) return;
let deletedCount = 0;
let failedCount = 0;
for (const attachmentId of pendingDeletions) {
try {
await deleteAttachment(attachmentId);
deletedCount++;
} catch (error) {
console.error('Error deleting attachment:', error);
failedCount++;
}
}
if (deletedCount > 0) {
toast.success(`Successfully deleted ${deletedCount} attachment(s)`);
setPendingDeletions([]);
await fetchAttachments();
}
if (failedCount > 0) {
toast.error(`Failed to delete ${failedCount} attachment(s)`);
}
};
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
if (!order) return;
// Validate edit permissions for completed/cancelled orders
if ((order.status === 'completed' || order.status === 'cancelled') &&
currentUser?.role !== 'admin' && currentUser?.role !== 'sales_rep') {
setError('Only administrators and sales representatives can edit completed or cancelled orders.');
return;
}
// Validate required fields
if (!formData.category_id) {
setError('Category is required.');
return;
}
if (!formData.custom_width || formData.custom_width <= 0) {
setError('Custom width must be greater than 0.');
return;
}
if (!formData.custom_height || formData.custom_height <= 0) {
setError('Custom height must be greater than 0.');
return;
}
// Validate designer assignment for in_progress orders
if (formData.status === 'in_progress' && !formData.assigned_designer_id) {
setError('Please assign a designer before setting order to "In Progress".');
return;
}
// Convert empty strings to null for UUID fields to prevent database errors
const sanitizedData = {
...formData,
assigned_sales_rep_id: formData.assigned_sales_rep_id || null,
assigned_designer_id: formData.assigned_designer_id || null,
};
setSubmitting(true);
setError('');
try {
// Update order
await updateOrder(order.id, sanitizedData);
toast.success('Order updated successfully');
onSuccess();
onClose();
} catch (error: any) {
console.error('Error updating order:', error);
let errorMessage = 'Failed to update order. Please try again.';
if (error.message) {
const msg = error.message.toLowerCase();
// Handle UUID-related errors
if (msg.includes('invalid input syntax for type uuid') || msg.includes('uuid')) {
if (msg.includes('designer') || formData.assigned_designer_id === '') {
errorMessage = 'Please select a designer';
} else if (msg.includes('sales_rep') || msg.includes('sales rep') || formData.assigned_sales_rep_id === '') {
errorMessage = 'Please select a sales representative';
} else if (msg.includes('category') || formData.category_id === '') {
errorMessage = 'Please select an apparel type';
} else {
errorMessage = 'Please fill in all required fields correctly';
}
}
// Handle other validation errors
else if (msg.includes('designer')) {
errorMessage = 'Please assign a designer';
} else if (msg.includes('sales_rep') || msg.includes('sales rep')) {
errorMessage = 'Please assign a sales representative';
} else if (msg.includes('category_id') || msg.includes('category')) {
errorMessage = 'Please select an apparel type';
} else if (msg.includes('total_amount') || msg.includes('total amount')) {
errorMessage = 'Total amount must be a valid positive number';
} else if (msg.includes('permission')) {
errorMessage = 'You do not have permission to perform this action';
} else if (msg.includes('foreign key')) {
errorMessage = 'Please ensure all selections are valid';
} else {
errorMessage = error.message;
}
}
toast.error(errorMessage);
setError(errorMessage);
} finally {
setSubmitting(false);
}
};
if (!isOpen || !order) return null;
const isDesigner = currentUser?.role === 'designer';
const isCompletedOrCancelled = order.status === 'completed' || order.status === 'cancelled';
const canEditCompletedOrder = currentUser?.role === 'admin' || currentUser?.role === 'sales_rep';
const isFormDisabled = isCompletedOrCancelled && !canEditCompletedOrder;
const isAssignedSalesRep = currentUser?.role === 'sales_rep' && order.assigned_sales_rep_id === currentUser.id;
const canDeleteAttachment = currentUser?.role === 'admin' || isAssignedSalesRep;
return (
<>
{/* Backdrop */}
<div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
{/* Modal */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
   <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
         <div className="flex-1 flex items-center justify-between">
            <div>
               <h2 className="text-xl font-semibold text-gray-900">Edit Order</h2>
               <p className="text-gray-600">{order.order_number}</p>
               <p className="text-sm text-gray-500 mt-1">{order.order_name || 'No Order Name'}</p>
            </div>
            {order.edits && order.edits > 0 && (
            <div className="flex items-center justify-center mx-4">
               <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-md">
                  <p className="text-sm font-bold whitespace-nowrap">
                     Edit No. {order.edits}
                  </p>
               </div>
            </div>
            )}
         </div>
         <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            disabled={submitting}
            >
            <X className="h-6 w-6" />
         </button>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
         {/* Error Display */}
         {error && (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
         </div>
         )}
         {loading ? (
         <div className="flex items-center justify-center py-12">
            <div className="loading-spinner mr-2"></div>
            <span className="text-gray-600">Loading order data...</span>
         </div>
         ) : (
         <>
         {/* Order Status Warning */}
         {isFormDisabled && (
         <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
               <div className="bg-orange-100 p-1 rounded">
                  <X className="h-4 w-4 text-orange-600" />
               </div>
               <div>
                  <p className="text-orange-800 font-medium text-sm">Edit Restricted</p>
                  <p className="text-orange-700 text-sm">
                     Only administrators and sales representatives can edit {order.status} orders.
                  </p>
               </div>
            </div>
         </div>
         )}
         {/* Customer Info (Read-only) - Hide from designers */}
         {currentUser && currentUser.role !== 'designer' && (
         <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
               <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
               </div>
               {currentUser.role === 'admin' && (
               <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{order.customer_email}</p>
               </div>
               )}
               {currentUser.role === 'admin' && order.customer_phone && (
               <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{order.customer_phone}</p>
               </div>
               )}
               {order.customer_company_name && (
               <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">{order.customer_company_name}</p>
               </div>
               )}
            </div>
         </div>
         )}
         <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Order Name */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'sales_rep') && (
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-2">
               Order Name *
               </label>
               <input
                  type="text"
                  name="order_name"
                  value={formData.order_name}
                  onChange={handleInputChange}
                  maxLength={32}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isFormDisabled}
                  placeholder="Enter order name (max 32 characters)"
                  required
                  />
            </div>
            )}
            {/* Order Type */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
               Order Type
               </label>
               <select
               name="order_type"
               value={formData.order_type}
               onChange={handleInputChange}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
               disabled={isDesigner || isFormDisabled}
               >
               <option value="custom">Custom</option>
               <option value="stock_design">Stock Design</option>
               </select>
            </div>
            {/* Status */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
               Status *
               </label>
               <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isFormDisabled}
                  required
                  >
                  {!isDesigner && 
                  <option value="new">New</option>
                  }
                  <option value="in_progress">In Progress</option>
                  <option value="under_review">Under Review</option>
                  {!isDesigner && 
                  <option value="completed">Completed</option>
                  }
                  {!isDesigner && 
                  <option value="cancelled">Cancelled</option>
                  }
               </select>
            </div>
            {/* Apparel Type */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
               Category
               </label>
               <select
               name="category_id"
               value={formData.category_id}
               onChange={handleInputChange}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
               disabled={isDesigner || isFormDisabled}
               >
               <option value="">Select Category</option>
               {categories.map(category => (
               <option key={category.id} value={category.id}>{category.category_name}</option>
               ))}
               </select>
            </div>
            {/* Custom Width */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
               Width (inches)
               </label>
               <input
               type="number"
               name="custom_width"
               value={formData.custom_width}
               onChange={handleInputChange}
               step="0.1"
               min="0"
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
               disabled={isDesigner || isFormDisabled}
               placeholder="Width"
               />
            </div>
            {/* Custom Height */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
               Height (inches)
               </label>
               <input
               type="number"
               name="custom_height"
               value={formData.custom_height}
               onChange={handleInputChange}
               step="0.1"
               min="0"
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
               disabled={isDesigner || isFormDisabled}
               placeholder="Height"
               />
            </div>
            {/* Assigned Sales Rep */}
            {/* Only show sales rep assignment to admin users */}
            {currentUser?.role === 'admin' && (
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
               Assign to Sales Rep
               </label>
               <select
                  name="assigned_sales_rep_id"
                  value={formData.assigned_sales_rep_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                  <option value="">Unassigned</option>
                  {salesReps.map(rep => (
                  <option key={rep.id} value={rep.id}>{rep.full_name}</option>
                  ))}
               </select>
            </div>
            )}
            {/* Assigned Designer */}
            {!isDesigner && (
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
               Assign to Designer
               </label>
               <select
                  name="assigned_designer_id"
                  value={formData.assigned_designer_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isFormDisabled}
                  >
                  <option value="">Unassigned</option>
                  {designers.map(designer => (
                  <option key={designer.id} value={designer.id}>{designer.full_name}</option>
                  ))}
               </select>
            </div>
            )}
            {/* Total Amount */}
            {!isDesigner && (
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
               Total Amount
               </label>
               <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isFormDisabled}
                  />
            </div>
            )}
         </div>
         {/* Design Description (Read-only) */}
         {order.custom_description && (
         <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Design Description
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
               <p className="text-gray-700">{order.custom_description}</p>
            </div>
         </div>
         )}
         {/* Order Comments - Only for admin, sales_rep, designer */}
         {currentUser && ['admin', 'sales_rep', 'designer'].includes(currentUser.role) && (
         <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
               <MessageSquare className="h-4 w-4 inline mr-1" />
               Order Comments
            </label>
            {/* Existing Comments */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
               {loadingComments ? (
               <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-gray-600 text-sm">Loading comments...</span>
               </div>
               ) : orderComments.length > 0 ? (
               <div className="space-y-3">
                  {orderComments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-lg p-3 shadow-sm">
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
            {/* Add New Comment */}
            <div className="space-y-3">
               <textarea
                  value={newCommentContent}
                  onChange={(e) =>
               setNewCommentContent(e.target.value)}
               placeholder="Add a comment about this order..."
               rows={3}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
               />
               <button
               type="button"
               onClick={handleAddComment}
               disabled={!newCommentContent.trim() || addingComment}
               className="btn-primary text-sm flex items-center space-x-2"
               >
               {addingComment ? (
               <>
               <div className="loading-spinner-white w-4 h-4"></div>
               <span>Adding...</span>
               </>
               ) : (
               <>
               <Send className="h-4 w-4" />
               <span>Add Comment</span>
               </>
               )}
               </button>
            </div>
         </div>
         )}
         {/* Edit Comments Section */} {editComments.length > 0 && ( <div className="mb-6"> <label className="block text-sm font-medium text-gray-700 mb-2"> <MessageSquare className="h-4 w-4 inline mr-1" /> Edit Comments </label> <div className="bg-white border border-gray-200 rounded-lg p-4"> {loadingEditComments ? ( <div className="flex items-center justify-center py-4"> <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div> <span className="text-gray-600 text-sm">Loading edit comments...</span> </div> ) : ( <div className="space-y-4"> <div className="max-h-96 overflow-y-auto space-y-4"> {editComments.map((comment) => ( <div key={comment.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100"> <div className="flex items-center justify-between mb-2"> <div className="flex items-center space-x-2"> <MessageSquare className="h-4 w-4 text-blue-600" /> <span className="font-medium text-gray-800 text-sm">{comment.author_name}</span> </div> <span className="text-xs text-gray-500"> {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} </span> </div> <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p> </div> ))} </div> {currentUser && ['admin', 'sales_rep'].includes(currentUser.role) && ( <form onSubmit={handleSubmitEditComment} className="mt-4 pt-4 border-t border-gray-200"> <textarea value={newEditComment} onChange={(e) => setNewEditComment(e.target.value)} placeholder="Add a reply to this edit request..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm" disabled={submittingEditComment} /> <div className="flex justify-end mt-2"> <button type="submit" disabled={submittingEditComment || !newEditComment.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" > {submittingEditComment ? 'Posting...' : 'Post Reply'} </button> </div> </form> )} </div> )} </div> </div> )}
           
      {/* Attachments Section */}
      <div className="mb-6">
         <AttachmentList
            orderId={order.id}
            orderNumber={order.order_number}
            attachments={attachments}
            onAttachmentsChange={fetchAttachments}
            canUpload={!isFormDisabled}
            canDelete={canDeleteAttachment}
            pendingDeletions={pendingDeletions}
            onPendingDeletionsChange={setPendingDeletions}
            deferDeletion={true}
            onConfirmDelete={handleConfirmDelete}
            />
      </div>
      </>
      )}
      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
         <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm"
            disabled={submitting}
            >
         Cancel
         </button>
         <button
         type="submit"
         className="btn-primary text-sm flex items-center space-x-2"
         disabled={submitting || loading || isFormDisabled}
         >
         {submitting ? (
         <>
         <div className="loading-spinner-white w-4 h-4"></div>
         <span>Updating...</span>
         </>
         ) : (
         <>
         <Save className="h-4 w-4" />
         <span>{isFormDisabled ? 'Edit Restricted' : 'Update Order'}</span>
         </>
         )}
         </button>
      </div>
      </form>
   </div>
</div>
</>
);
};
export default EditOrderModal;