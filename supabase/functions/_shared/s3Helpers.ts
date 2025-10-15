import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from 'npm:@aws-sdk/client-s3@3';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3';

export interface StorageConfig {
  endpoint: string;
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

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

export function generateS3Key(orderNumber: string, filename: string): string {
  return `orders/${orderNumber}/${filename}`;
}

export async function uploadToS3(
  client: S3Client,
  config: StorageConfig,
  key: string,
  file: Uint8Array,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  });
  await client.send(command);
}

export async function getSignedDownloadUrl(
  client: S3Client,
  config: StorageConfig,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });
  return await getSignedUrl(client, command, { expiresIn });
}

export async function deleteFromS3(
  client: S3Client,
  config: StorageConfig,
  key: string
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });
  await client.send(command);
}

export function getStorageConfig(type: 'product' | 'order'): StorageConfig {
  if (type === 'product') {
    return {
      endpoint: Deno.env.get('S3_PRODUCT_ENDPOINT') || 's3.us-east-005.backblazeb2.com',
      region: Deno.env.get('S3_PRODUCT_REGION') || 'us-east-005',
      bucketName: Deno.env.get('S3_PRODUCT_BUCKET') || 'product-image-bucket',
      accessKeyId: Deno.env.get('S3_PRODUCT_ACCESS_KEY_ID') || '',
      secretAccessKey: Deno.env.get('S3_PRODUCT_SECRET_KEY') || '',
    };
  }

  return {
    endpoint: Deno.env.get('S3_ORDER_ENDPOINT') || 's3.us-east-005.backblazeb2.com',
    region: Deno.env.get('S3_ORDER_REGION') || 'us-east-005',
    bucketName: Deno.env.get('S3_ORDER_BUCKET') || 'order-attachment-bucket',
    accessKeyId: Deno.env.get('S3_ORDER_ACCESS_KEY_ID') || '',
    secretAccessKey: Deno.env.get('S3_ORDER_SECRET_KEY') || '',
  };
}
