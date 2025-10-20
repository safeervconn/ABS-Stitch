export const STORAGE_BUCKETS = {
  ORDER_ATTACHMENTS: 'order-attachments',
  PRODUCT_IMAGES: 'product-images',
} as const;

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_PRODUCT_IMAGE_SIZE_MB = 10;
export const MAX_PRODUCT_IMAGE_SIZE_BYTES = MAX_PRODUCT_IMAGE_SIZE_MB * 1024 * 1024;

export function generateStoragePath(type: 'order' | 'product', orderNumber: string | null, filename: string): string {
  if (type === 'order' && orderNumber) {
    return `orders/${orderNumber}/${filename}`;
  }
  return `product-images/${filename}`;
}
