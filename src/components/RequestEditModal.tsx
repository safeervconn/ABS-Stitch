import React, { useState } from 'react';
import { X, Upload, FileIcon } from 'lucide-react';
import { notifyAboutEditRequest } from '../services/notificationService';
import { supabase } from '../lib/supabase';
import { toast } from '../utils/toast';
import { uploadAttachment } from '../lib/attachmentService';

interface RequestEditModalProps {
  orderId: string;
  orderNumber: string;
  orderName: string;
  orderStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestEditModal({
  orderId,
  orderNumber,
  orderName,
  orderStatus,
  onClose,
  onSuccess
}: RequestEditModalProps) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please provide a description of the changes you need');
      return;
    }

    if (orderStatus !== 'completed') {
      toast.error('Edit requests are only allowed for completed orders');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      for (const file of selectedFiles) {
        try {
          await uploadAttachment(orderId, orderNumber, file);
        } catch (uploadError) {
          console.error('Error uploading file:', file.name, uploadError);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      const { error: commentError } = await supabase
        .from('edit_comments')
        .insert({
          order_id: orderId,
          author_id: user.id,
          content: description.trim()
        });

      if (commentError) {
        console.error('Error creating edit comment:', commentError);
        throw commentError;
      }

      const { data: order, error: orderFetchError } = await supabase
        .from('orders')
        .select('edits, assigned_sales_rep_id, order_number, order_name')
        .eq('id', orderId)
        .maybeSingle();

      if (orderFetchError) {
        throw orderFetchError;
      }

      const currentEdits = order?.edits || 0;
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'new',
          edits: currentEdits + 1
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status and edits:', updateError);
        throw updateError;
      }

      await notifyAboutEditRequest(
        order?.order_number || orderId.slice(0, 8),
        order?.order_name || orderName,
        order?.assigned_sales_rep_id
      );

      toast.success('Edit request submitted successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating edit request:', error);
      toast.error('Failed to submit edit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Request Edit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">
              Order Number: <span className="font-medium text-gray-900">{orderNumber}</span>
            </p>
            <p className="text-sm text-gray-600">
              Order Name: <span className="font-medium text-gray-900">{orderName}</span>
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Describe the changes you need
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about the changes you would like to make to this order..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Be as specific as possible so our designers can better understand your requirements.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSubmitting}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Maximum file size: 10MB per file
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      disabled={isSubmitting}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
