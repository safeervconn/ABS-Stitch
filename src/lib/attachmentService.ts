import { supabase } from './supabase';
import { formatFileSize, validateFileSize } from '../shared/utils/fileUtils';

export interface OrderAttachment {
  id: string;
  order_id: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
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

const STORAGE_BUCKET = 'order-attachments';

function generateStoredFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
  return `${timestamp}-${randomStr}${ext}`;
}

function generateStoragePath(orderNumber: string, storedFilename: string): string {
  return `orders/${orderNumber}/${storedFilename}`;
}

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
  orderNumber: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<OrderAttachment> {
  const validation = validateFileSize(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const storedFilename = generateStoredFilename(file.name);
  const storagePath = generateStoragePath(orderNumber, storedFilename);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error('Failed to upload file');
  }

  const { data: attachment, error: dbError } = await supabase
    .from('order_attachments')
    .insert({
      order_id: orderId,
      original_filename: file.name,
      stored_filename: storedFilename,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    console.error('Database insert error:', dbError);
    throw new Error('Failed to save attachment record');
  }

  return attachment;
}

export async function getAttachmentDownloadUrl(attachmentId: string): Promise<string> {
  const { data: attachment, error: fetchError } = await supabase
    .from('order_attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .maybeSingle();

  if (fetchError || !attachment) {
    throw new Error('Attachment not found');
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(attachment.storage_path, 3600);

  if (error || !data) {
    console.error('Error creating signed URL:', error);
    throw new Error('Failed to get download URL');
  }

  return data.signedUrl;
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const { data: attachment, error: fetchError } = await supabase
    .from('order_attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .maybeSingle();

  if (fetchError || !attachment) {
    throw new Error('Attachment not found');
  }

  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([attachment.storage_path]);

  if (storageError) {
    console.error('Storage delete error:', storageError);
    throw new Error('Failed to delete file from storage');
  }

  const { error: dbError } = await supabase
    .from('order_attachments')
    .delete()
    .eq('id', attachmentId);

  if (dbError) {
    console.error('Database delete error:', dbError);
    throw new Error('Failed to delete attachment record');
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

export { formatFileSize, getFileIcon } from '../shared/utils/fileUtils';
