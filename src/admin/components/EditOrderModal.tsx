import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Paperclip, Trash2, Upload, Download, MessageSquare, Send } from 'lucide-react';
import { updateOrder, getSalesReps, getDesigners, getOrderComments, addOrderComment } from '../api/supabaseHelpers';
import { AdminOrder, AdminUser } from '../types';
import { supabase, getCurrentUser, getUserProfile } from '../../lib/supabase';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  onSuccess: () => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    order_type: '',
    status: '',
    design_size: '',
    apparel_type: '',
    assigned_sales_rep_id: '',
    assigned_designer_id: '',
    total_amount: 0,
    custom_width: 0,
    custom_height: 0,
  });

  const [existingFileUrls, setExistingFileUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [salesReps, setSalesReps] = useState<AdminUser[]>([]);
  const [designers, setDesigners] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [orderComments, setOrderComments] = useState<any[]>([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      // Initialize form data
      setFormData({
        order_type: order.order_type || 'custom',
        status: order.status,
        design_size: order.design_size || '',
        apparel_type: order.apparel_type || '',
        assigned_sales_rep_id: order.assigned_sales_rep_id || '',
        assigned_designer_id: order.assigned_designer_id || '',
        total_amount: order.total_amount || 0,
        custom_width: order.custom_width || 0,
        custom_height: order.custom_height || 0,
      });

      // Initialize file URLs
      setExistingFileUrls(order.file_urls || []);
      setNewFiles([]);
      setFilesToDelete([]);
      setError('');

      // Fetch assignment options
      fetchAssignmentOptions();
      
      // Fetch current user
      fetchCurrentUser();
      
      // Fetch order comments
      fetchOrderComments();
    }
  }, [isOpen, order]);

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

  const handleAddComment = async () => {
    if (!order || !newCommentContent.trim() || !currentUser) return;
    
    try {
      setAddingComment(true);
      await addOrderComment(order.id, currentUser.id, newCommentContent.trim());
      setNewCommentContent('');
      await fetchOrderComments(); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setAddingComment(false);
    }
  };

  const fetchAssignmentOptions = async () => {
    try {
      setLoading(true);
      const [salesRepsData, designersData] = await Promise.all([
        getSalesReps(),
        getDesigners(),
      ]);
      setSalesReps(salesRepsData);
      setDesigners(designersData);
    } catch (error) {
      console.error('Error fetching assignment options:', error);
      setError('Failed to load assignment options');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setNewFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (fileUrl: string) => {
    setExistingFileUrls(prev => prev.filter(url => url !== fileUrl));
    setFilesToDelete(prev => [...prev, fileUrl]);
  };

  const uploadNewFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of newFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `order-files/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('order-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Failed to upload file: ${file.name}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('order-files')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const deleteFiles = async (fileUrls: string[]) => {
    for (const fileUrl of fileUrls) {
      try {
        // Extract file path from URL
        const urlParts = fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `order-files/${fileName}`;

        const { error } = await supabase.storage
          .from('order-files')
          .remove([filePath]);

        if (error) {
          console.error('Error deleting file:', error);
          // Don't throw here, just log the error
        }
      } catch (error) {
        console.error('Error processing file deletion:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;

    setSubmitting(true);
    setError('');

    try {
      // Upload new files
      const newFileUrls = await uploadNewFiles();

      // Delete files marked for deletion
      if (filesToDelete.length > 0) {
        await deleteFiles(filesToDelete);
      }

      // Combine existing and new file URLs
      const finalFileUrls = [...existingFileUrls, ...newFileUrls];

      // Update order
      await updateOrder(order.id, {
        ...formData,
        file_urls: finalFileUrls.length > 0 ? finalFileUrls : null,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      setError('Failed to update order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFileName = (fileUrl: string) => {
    const urlParts = fileUrl.split('/');
    return urlParts[urlParts.length - 1];
  };

  if (!isOpen || !order) return null;

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
              <h2 className="text-xl font-semibold text-gray-900">Edit Order</h2>
              <p className="text-gray-600">{order.order_number}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
                <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Loading order data...</span>
              </div>
            ) : (
              <>
                {/* Customer Info (Read-only) */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{order.customer_email}</p>
                      </div>
                    )}
                    {currentUser?.role === 'admin' && order.customer_phone && (
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

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Type
                    </label>
                    <select
                      name="order_type"
                      value={formData.order_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="custom">Custom</option>
                      <option value="catalog">Catalog</option>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="under_review">Under Review</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Design Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Design Size
                    </label>
                    <select
                      name="design_size"
                      value={formData.design_size}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Size</option>
                      <option value="small">Small (3" x 3")</option>
                      <option value="medium">Medium (5" x 5")</option>
                      <option value="large">Large (8" x 10")</option>
                      <option value="xl">Extra Large (12" x 12")</option>
                      <option value="custom">Custom Size</option>
                    </select>
                  </div>

                  {/* Apparel Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apparel Type
                    </label>
                    <select
                      name="apparel_type"
                      value={formData.apparel_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Type</option>
                      <option value="t-shirt">T-shirt</option>
                      <option value="jacket">Jacket</option>
                      <option value="cap">Cap</option>
                      <option value="other">Other</option>
                    </select>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to Designer
                    </label>
                    <select
                      name="assigned_designer_id"
                      value={formData.assigned_designer_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Unassigned</option>
                      {designers.map(designer => (
                        <option key={designer.id} value={designer.id}>{designer.full_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Total Amount */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Custom Size Fields */}
                {formData.design_size === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

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

                {/* File Attachments */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Attachments
                  </label>
                  
                  {/* Existing Files */}
                  {existingFileUrls.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Current Files:</h4>
                      <div className="space-y-2">
                        {existingFileUrls.map((fileUrl, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Paperclip className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-700 truncate">
                                {getFileName(fileUrl)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                               onClick={() => {
                                 const link = document.createElement('a');
                                 link.href = fileUrl;
                                 link.download = getFileName(fileUrl);
                                 document.body.appendChild(link);
                                 link.click();
                                 document.body.removeChild(link);
                               }}
                               className="text-blue-600 hover:text-blue-800 transition-colors"
                               title="Download File"
                              >
                               <Download className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExistingFile(fileUrl)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Remove File"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Files */}
                  {newFiles.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">New Files to Upload:</h4>
                      <div className="space-y-2">
                        {newFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Upload className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewFile(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Remove File"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload-edit"
                      accept="image/*,.pdf,.doc,.docx,.zip"
                      multiple
                    />
                    <label 
                      htmlFor="file-upload-edit" 
                      className="cursor-pointer flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Click to add more files</span>
                    </label>
                  </div>
                </div>

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
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        placeholder="Add a comment about this order..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddComment}
                        disabled={!newCommentContent.trim() || addingComment}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {addingComment ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
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
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Update Order</span>
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