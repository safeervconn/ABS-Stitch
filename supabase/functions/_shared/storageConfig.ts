import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from 'npm:@aws-sdk/client-s3@3';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3';

export interface StorageConfig {
  endpoint: string;
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const ORDER_ATTACHMENTS_CONFIG: StorageConfig = {
  endpoint: Deno.env.get('S3_ORDER_ENDPOINT') || 's3.us-east-005.backblazeb2.com',
  region: Deno.env.get('S3_ORDER_REGION') || 'us-east-005',
  bucketName: Deno.env.get('S3_ORDER_BUCKET') || 'order-attachment-bucket',
  accessKeyId: Deno.env.get('S3_ORDER_ACCESS_KEY_ID') || '005t/0wUxrIcHAwZHXktyMJuKQhOI8',
  secretAccessKey: Deno.env.get('S3_ORDER_SECRET_KEY') || 'K005t/0wUxrIcHAwZHXktyMJuKQhOI8',
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

export function generateS3Key(orderId: string, filename: string): string {
  return `orders/${orderId}/${filename}`;
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
