export const STORAGE_BUCKETS = {
  ORDER_ATTACHMENTS: 'order-attachments',
  STOCK_DESIGN_IMAGES: 'stock-design-images',
} as const;

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_STOCK_DESIGN_IMAGE_SIZE_MB = 10;
export const MAX_STOCK_DESIGN_IMAGE_SIZE_BYTES = MAX_STOCK_DESIGN_IMAGE_SIZE_MB * 1024 * 1024;

export function generateStoragePath(type: 'order' | 'stock_design', orderNumber: string | null, filename: string): string {
  if (type === 'order' && orderNumber) {
    return `orders/${orderNumber}/${filename}`;
  }
  return `stock-design-images/${filename}`;
}
