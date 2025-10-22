import { createClient } from 'jsr:@supabase/supabase-js@2';

export const STORAGE_BUCKETS = {
  ORDER_ATTACHMENTS: 'order-attachments',
  STOCK_DESIGN_IMAGES: 'stock-design-images',
} as const;

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot) : '';
}

export function generateStoredFilename(originalFilename: string): string {
  const uuid = crypto.randomUUID();
  const extension = getFileExtension(originalFilename);
  const sanitized = sanitizeFilename(originalFilename.replace(extension, ''));
  return `${uuid}-${sanitized}${extension}`;
}

export function generateStoragePath(type: 'order' | 'stock_design', orderNumber: string | null, filename: string): string {
  if (type === 'order' && orderNumber) {
    return `orders/${orderNumber}/${filename}`;
  }
  return filename;
}

export async function uploadToSupabaseStorage(
  supabaseClient: any,
  bucket: string,
  path: string,
  file: Uint8Array,
  contentType: string
): Promise<void> {
  const { error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
}

export async function getSignedDownloadUrl(
  supabaseClient: any,
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

export async function deleteFromSupabaseStorage(
  supabaseClient: any,
  bucket: string,
  path: string
): Promise<void> {
  const { error } = await supabaseClient.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Storage deletion failed: ${error.message}`);
  }
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}