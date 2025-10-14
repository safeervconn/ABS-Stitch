import { supabase } from './supabase';
import { formatFileSize, validateFileSize } from './storageConfig';

export interface OrderAttachment {
  id: string;
  order_id: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string;
  s3_key: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-attachment`;

export async function fetchOrderAttachments(orderId: string): Promise<OrderAttachment[]> {
  const { data, error } = await supabase
    .from('order_attachments')
    .select('*')
    .eq('order_id', orderId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching attachments:', error);
    throw new Error('Failed to fetch attachments');
  }

  return data || [];
}

export async function uploadAttachment(
  orderId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<OrderAttachment> {
  const validation = validateFileSize(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('orderId', orderId);

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  const result = await response.json();
  return result.attachment;
}

export async function getAttachmentDownloadUrl(attachmentId: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}?attachmentId=${attachmentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get download URL');
  }

  const result = await response.json();
  return result.downloadUrl;
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}?attachmentId=${attachmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete attachment');
  }
}

export async function downloadAttachment(attachmentId: string, filename: string): Promise<void> {
  const downloadUrl = await getAttachmentDownloadUrl(attachmentId);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
  return '📎';
}

export { formatFileSize };
