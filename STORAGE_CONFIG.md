# Storage Configuration Guide

This document explains how to change the Backblaze B2 storage credentials for file uploads in the application.

## Current Storage Setup

The application uses Backblaze B2 for two types of file storage:

1. **Product Images** - Images for products in the catalog
2. **Order Attachments** - Files attached to customer orders

## How to Change Storage Credentials

If you need to change to a different Backblaze B2 account or update credentials, you need to update **3 locations**:

### 1. Environment Variables (.env file)

Update the `.env` file in the project root with your new credentials:

```env
# For Product Images
VITE_S3_PRODUCT_ENDPOINT=s3.us-east-005.backblazeb2.com
VITE_S3_PRODUCT_REGION=us-east-005
VITE_S3_PRODUCT_BUCKET=your-product-bucket-name
VITE_S3_PRODUCT_ACCESS_KEY_ID=your-key-id
VITE_S3_PRODUCT_SECRET_KEY=your-application-key

# For Order Attachments
VITE_S3_ORDER_ENDPOINT=s3.us-east-005.backblazeb2.com
VITE_S3_ORDER_REGION=us-east-005
VITE_S3_ORDER_BUCKET=your-order-bucket-name
VITE_S3_ORDER_ACCESS_KEY_ID=your-key-id
VITE_S3_ORDER_SECRET_KEY=your-application-key
```

**Note:** Replace `your-key-id` with the actual keyID (e.g., `00500472239d1730000000005`) and `your-application-key` with the application key (e.g., `K005sqPaIk3e391FOzOhKnixN1BEnoY`).

### 2. Order Attachments Edge Function

Update the file: `supabase/functions/manage-attachment/index.ts`

Find the `ORDER_ATTACHMENTS_CONFIG` object (around line 14) and update the fallback values:

```typescript
const ORDER_ATTACHMENTS_CONFIG: StorageConfig = {
  endpoint: Deno.env.get('S3_ORDER_ENDPOINT') || 's3.us-east-005.backblazeb2.com',
  region: Deno.env.get('S3_ORDER_REGION') || 'us-east-005',
  bucketName: Deno.env.get('S3_ORDER_BUCKET') || 'your-order-bucket-name',
  accessKeyId: Deno.env.get('S3_ORDER_ACCESS_KEY_ID') || 'your-key-id',
  secretAccessKey: Deno.env.get('S3_ORDER_SECRET_KEY') || 'your-application-key',
};
```

### 3. Product Images Edge Function

Update the file: `supabase/functions/manage-product-image/index.ts`

Find the `PRODUCT_IMAGES_CONFIG` object (around line 13) and update the fallback values:

```typescript
const PRODUCT_IMAGES_CONFIG: StorageConfig = {
  endpoint: Deno.env.get('S3_PRODUCT_ENDPOINT') || 's3.us-east-005.backblazeb2.com',
  region: Deno.env.get('S3_PRODUCT_REGION') || 'us-east-005',
  bucketName: Deno.env.get('S3_PRODUCT_BUCKET') || 'your-product-bucket-name',
  accessKeyId: Deno.env.get('S3_PRODUCT_ACCESS_KEY_ID') || 'your-key-id',
  secretAccessKey: Deno.env.get('S3_PRODUCT_SECRET_KEY') || 'your-application-key',
};
```

## Important Notes

1. **keyID vs applicationKey**: Don't confuse these two:
   - **keyID** (accessKeyId): A long numeric string like `00500472239d1730000000005`
   - **applicationKey** (secretAccessKey): Starts with `K005` like `K005sqPaIk3e391FOzOhKnixN1BEnoY`

2. **Bucket Permissions**: Make sure your Backblaze B2 buckets have the correct permissions:
   - Files should be publicly accessible for reading
   - The application key needs upload and delete permissions

3. **Endpoint**: The endpoint format is `s3.{region}.backblazeb2.com` where region is typically `us-east-005` or similar

4. **After Changes**: After updating all three locations:
   - Restart your development server
   - Run `npm run build` to verify everything works
   - The edge functions will automatically use the new credentials

## Testing

After making changes, test both:
1. Upload a product image in the Admin Dashboard
2. Attach a file to an order in the Orders section

Both should work without errors.
