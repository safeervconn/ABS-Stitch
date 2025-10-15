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

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_PRODUCT_IMAGE_SIZE_MB = 10;
export const MAX_PRODUCT_IMAGE_SIZE_BYTES = MAX_PRODUCT_IMAGE_SIZE_MB * 1024 * 1024;
