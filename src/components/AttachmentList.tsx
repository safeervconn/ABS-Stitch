import { useState } from 'react';
import { Download, Trash2, Upload, X, FileIcon } from 'lucide-react';
import { OrderAttachment } from '../admin/types';
import {
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
  fetchOrderAttachments,
  getFileIcon,
  formatFileSize
} from '../lib/attachmentService';
import { toast } from '../utils/toast';

interface AttachmentListProps {
  orderId: string;
  orderNumber: string;
  attachments: OrderAttachment[];
  onAttachmentsChange: () => void;
  canUpload?: boolean;
  canDelete?: boolean;
  pendingDeletions?: string[];
  onPendingDeletionsChange?: (ids: string[]) => void;
  deferDeletion?: boolean;
  onConfirmDelete?: () => Promise<void>;
}

export function AttachmentList({
  orderId,
  orderNumber,
  attachments,
  onAttachmentsChange,
  canUpload = true,
  canDelete = false,
  pendingDeletions = [],
  onPendingDeletionsChange,
  deferDeletion = false,
  onConfirmDelete,
}: AttachmentListProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const validFiles = files.filter(file => {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 20MB limit`);
          return false;
        }
        return true;
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of selectedFiles) {
      try {
        await uploadAttachment(orderId, orderNumber, file);
        successCount++;
        setSelectedFiles(prev => prev.filter(f => f !== file));
      } catch (error) {
        console.error('Upload error:', error);
        errorCount++;
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      onAttachmentsChange();
    }
  };

  const handleDownload = async (attachment: OrderAttachment) => {
    try {
      await downloadAttachment(attachment.id, attachment.original_filename);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (attachmentId: string, filename: string) => {
    if (deferDeletion && onPendingDeletionsChange) {
      if (pendingDeletions.includes(attachmentId)) {
        onPendingDeletionsChange(pendingDeletions.filter(id => id !== attachmentId));
        toast.success('Removed from deletion queue');
      } else {
        onPendingDeletionsChange([...pendingDeletions, attachmentId]);
        toast.success('Marked for deletion');
      }
    } else {
      if (!confirm(`Are you sure you want to delete ${filename}?`)) {
        return;
      }

      try {
        await deleteAttachment(attachmentId);
        toast.success('Attachment deleted successfully');
        onAttachmentsChange();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete attachment');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!onConfirmDelete || pendingDeletions.length === 0) return;

    setDeleting(true);
    try {
      await onConfirmDelete();
    } catch (error) {
      console.error('Delete confirmation error:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
        <div className="flex items-center space-x-2">
          {canDelete && deferDeletion && pendingDeletions.length > 0 && onConfirmDelete && (
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Confirm Delete ({pendingDeletions.length})</span>
                </>
              )}
            </button>
          )}
          {canUpload && (
            <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Upload className="h-4 w-4 mr-2" />
              Add Files
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900">
              Selected Files ({selectedFiles.length})
            </h4>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-2 rounded border border-blue-200"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-900 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                {!uploading && (
                  <button
                    onClick={() => removeSelectedFile(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {attachments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
          <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No attachments yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const isPendingDeletion = pendingDeletions.includes(attachment.id);
            return (
            <div
              key={attachment.id}
              className={`flex items-center justify-between p-3 bg-white border rounded-md hover:bg-gray-50 transition-all ${
                isPendingDeletion ? 'border-red-300 bg-red-50 opacity-60' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className={`text-2xl flex-shrink-0 ${isPendingDeletion ? 'line-through' : ''}`}>
                  {getFileIcon(attachment.mime_type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isPendingDeletion ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {attachment.original_filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.file_size)} •
                    {new Date(attachment.uploaded_at).toLocaleDateString()}
                    {isPendingDeletion && <span className="text-red-600 ml-2 font-semibold">• Will be deleted</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(attachment)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  title="Download"
                  disabled={isPendingDeletion}
                >
                  <Download className="h-4 w-4" />
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(attachment.id, attachment.original_filename)}
                    className={`p-2 hover:bg-red-50 rounded ${
                      isPendingDeletion ? 'text-orange-600 hover:text-orange-800' : 'text-red-600 hover:text-red-800'
                    }`}
                    title={isPendingDeletion ? 'Undo deletion' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
