import React, { useState } from 'react';
import { X } from 'lucide-react';
import { editRequestService } from '../services/editRequestService';
import { notifyDesignerAboutEditRequest } from '../services/notificationService';
import { supabase } from '../lib/supabase';
import { toast } from '../utils/toast';

interface RequestEditModalProps {
  orderId: string;
  orderName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestEditModal({ orderId, orderName, onClose, onSuccess }: RequestEditModalProps) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please provide a description of the changes you need');
      return;
    }

    setIsSubmitting(true);

    try {
      await editRequestService.createEditRequest({
        order_id: orderId,
        description: description.trim()
      });

      const { data: order } = await supabase
        .from('orders')
        .select('assigned_designer_id, order_number, order_name')
        .eq('id', orderId)
        .maybeSingle();

      if (order?.assigned_designer_id) {
        await notifyDesignerAboutEditRequest(
          order.assigned_designer_id,
          order.order_number || orderId.slice(0, 8),
          order.order_name || orderName
        );
      }

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
            <p className="text-sm text-gray-600 mb-2">
              Order: <span className="font-medium text-gray-900">{orderName}</span>
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
