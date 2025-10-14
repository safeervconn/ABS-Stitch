import { S3Client } from '@aws-sdk/client-s3';

export interface StorageConfig {
  endpoint: string;
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const PRODUCT_IMAGES_CONFIG: StorageConfig = {
  endpoint: import.meta.env.VITE_S3_PRODUCT_ENDPOINT || 's3.us-east-005.backblazeb2.com',
  region: import.meta.env.VITE_S3_PRODUCT_REGION || 'us-east-005',
  bucketName: import.meta.env.VITE_S3_PRODUCT_BUCKET || 'product-image-bucket',
  accessKeyId: import.meta.env.VITE_S3_PRODUCT_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.VITE_S3_PRODUCT_SECRET_KEY || '',
};

export const ORDER_ATTACHMENTS_CONFIG: StorageConfig = {
  endpoint: import.meta.env.VITE_S3_ORDER_ENDPOINT || 's3.us-east-005.backblazeb2.com',
  region: import.meta.env.VITE_S3_ORDER_REGION || 'us-east-005',
  bucketName: import.meta.env.VITE_S3_ORDER_BUCKET || 'order-attachment-bucket',
  accessKeyId: import.meta.env.VITE_S3_ORDER_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.VITE_S3_ORDER_SECRET_KEY || '',
};

export function createS3Client(config: StorageConfig): S3Client {
  return new S3Client({
    endpoint: `https://${config.endpoint}`,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export function generateS3Key(orderNumber: string, filename: string): string {
  return `orders/${orderNumber}/${filename}`;
}

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

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateFileSize(file: File, maxSizeMB: number = MAX_FILE_SIZE_MB): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }
  return { valid: true };
}
