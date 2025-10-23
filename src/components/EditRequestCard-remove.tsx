import React, { useState } from 'react';
import { Edit3, Check, X, MessageSquare } from 'lucide-react';
import { EditRequest, editRequestService } from '../services/editRequestService';
import { notifyCustomerAboutEditRequestResponse } from '../services/notificationService';
import { toast } from '../utils/toast';

interface EditRequestCardProps {
  request: EditRequest;
  orderName?: string;
  orderNumber?: string;
  onUpdate: () => void;
}

export function EditRequestCard({ request, orderName, orderNumber, onUpdate }: EditRequestCardProps) {
  const [isResponding, setIsResponding] = useState(false);
  const [designerNotes, setDesignerNotes] = useState(request.designer_notes || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await editRequestService.updateEditRequest(request.id, {
        status: 'approved',
        designer_notes: designerNotes.trim() || undefined,
      });

      await notifyCustomerAboutEditRequestResponse(
        request.customer_id,
        orderNumber || request.order_id.slice(0, 8),
        orderName || 'Your order',
        'approved'
      );

      toast.success('Edit request approved');
      onUpdate();
    } catch (error) {
      console.error('Error approving edit request:', error);
      toast.error('Failed to approve edit request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!designerNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      await editRequestService.updateEditRequest(request.id, {
        status: 'rejected',
        designer_notes: designerNotes.trim(),
      });

      await notifyCustomerAboutEditRequestResponse(
        request.customer_id,
        orderNumber || request.order_id.slice(0, 8),
        orderName || 'Your order',
        'rejected'
      );

      toast.success('Edit request rejected');
      onUpdate();
    } catch (error) {
      console.error('Error rejecting edit request:', error);
      toast.error('Failed to reject edit request');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Edit3 className="h-4 w-4 text-gray-400" />
            <h4 className="font-semibold text-gray-900">
              {orderName || 'Order'} {orderNumber && `(${orderNumber})`}
            </h4>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(request.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description}</p>
      </div>

      {request.status === 'pending' && (
        <>
          {!isResponding ? (
            <button
              onClick={() => setIsResponding(true)}
              className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Respond to Request
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={designerNotes}
                onChange={(e) => setDesignerNotes(e.target.value)}
                placeholder="Add your notes or response (required for rejection)..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    setIsResponding(false);
                    setDesignerNotes(request.designer_notes || '');
                  }}
                  disabled={isProcessing}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {request.designer_notes && request.status !== 'pending' && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-1">Designer Notes:</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{request.designer_notes}</p>
        </div>
      )}
    </div>
  );
}
