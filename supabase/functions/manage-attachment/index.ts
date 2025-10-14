import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from 'npm:@aws-sdk/client-s3@3';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3';

interface StorageConfig {
  endpoint: string;
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const ORDER_ATTACHMENTS_CONFIG: StorageConfig = {
  endpoint: Deno.env.get('S3_ORDER_ENDPOINT') || 's3.us-east-005.backblazeb2.com',
  region: Deno.env.get('S3_ORDER_REGION') || 'us-east-005',
  bucketName: Deno.env.get('S3_ORDER_BUCKET') || 'order-attachment-bucket',
  accessKeyId: Deno.env.get('S3_ORDER_ACCESS_KEY_ID') || '00500472239d1730000000004',
  secretAccessKey: Deno.env.get('S3_ORDER_SECRET_KEY') || 'K005t/0wUxrIcHAwZHXktyMJuKQhOI8',
};

function createS3Client(config: StorageConfig): S3Client {
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

function generateS3Key(orderId: string, filename: string): string {
  return `orders/${orderId}/${filename}`;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot) : '';
}

function generateStoredFilename(originalFilename: string): string {
  const uuid = crypto.randomUUID();
  const extension = getFileExtension(originalFilename);
  const sanitized = sanitizeFilename(originalFilename.replace(extension, ''));
  return `${uuid}-${sanitized}${extension}`;
}

async function uploadToS3(
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

async function getSignedDownloadUrl(
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

async function deleteFromS3(
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AttachmentPermissions {
  canView: boolean;
  canUpload: boolean;
  canDelete: boolean;
  userId: string;
  userRole: string;
}

async function validateAttachmentAccess(
  supabaseClient: any,
  userId: string,
  orderId: string
): Promise<AttachmentPermissions> {
  const employee = await supabaseClient
    .from('employees')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle();

  if (employee.data) {
    const role = employee.data.role;

    if (role === 'admin') {
      return {
        canView: true,
        canUpload: true,
        canDelete: true,
        userId,
        userRole: 'admin',
      };
    }

    const order = await supabaseClient
      .from('orders')
      .select('id, customer_id, assigned_sales_rep_id, assigned_designer_id')
      .eq('id', orderId)
      .maybeSingle();

    if (!order.data) {
      return {
        canView: false,
        canUpload: false,
        canDelete: false,
        userId,
        userRole: role,
      };
    }

    if (role === 'sales_rep') {
      const customer = await supabaseClient
        .from('customers')
        .select('assigned_sales_rep_id')
        .eq('id', order.data.customer_id)
        .maybeSingle();

      if (customer.data?.assigned_sales_rep_id === userId) {
        return {
          canView: true,
          canUpload: true,
          canDelete: false,
          userId,
          userRole: 'sales_rep',
        };
      }
    }

    if (role === 'designer' && order.data.assigned_designer_id === userId) {
      return {
        canView: true,
        canUpload: true,
        canDelete: false,
        userId,
        userRole: 'designer',
      };
    }

    return {
      canView: false,
      canUpload: false,
      canDelete: false,
      userId,
      userRole: role,
    };
  }

  const customer = await supabaseClient
    .from('customers')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (customer.data) {
    const order = await supabaseClient
      .from('orders')
      .select('customer_id')
      .eq('id', orderId)
      .eq('customer_id', userId)
      .maybeSingle();

    if (order.data) {
      return {
        canView: true,
        canUpload: true,
        canDelete: false,
        userId,
        userRole: 'customer',
      };
    }
  }

  return {
    canView: false,
    canUpload: false,
    canDelete: false,
    userId,
    userRole: 'unknown',
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const orderId = formData.get('orderId') as string;

      if (!file || !orderId) {
        return new Response(
          JSON.stringify({ error: 'Missing file or orderId' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const MAX_FILE_SIZE = 20 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ error: 'File size exceeds 20MB limit' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const permissions = await validateAttachmentAccess(supabaseClient, user.id, orderId);

      if (!permissions.canUpload) {
        return new Response(
          JSON.stringify({ error: 'Permission denied' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const s3Client = createS3Client(ORDER_ATTACHMENTS_CONFIG);
      const storedFilename = generateStoredFilename(file.name);
      const s3Key = generateS3Key(orderId, storedFilename);

      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      await uploadToS3(
        s3Client,
        ORDER_ATTACHMENTS_CONFIG,
        s3Key,
        fileData,
        file.type
      );

      const { data: attachment, error: dbError } = await supabaseClient
        .from('order_attachments')
        .insert({
          order_id: orderId,
          original_filename: file.name,
          stored_filename: storedFilename,
          file_size: file.size,
          mime_type: file.type,
          s3_key: s3Key,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (dbError) {
        await deleteFromS3(s3Client, ORDER_ATTACHMENTS_CONFIG, s3Key);
        throw dbError;
      }

      return new Response(
        JSON.stringify({ success: true, attachment }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'GET') {
      const attachmentId = url.searchParams.get('attachmentId');

      if (!attachmentId) {
        return new Response(
          JSON.stringify({ error: 'Missing attachmentId' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: attachment, error: fetchError } = await supabaseClient
        .from('order_attachments')
        .select('*')
        .eq('id', attachmentId)
        .maybeSingle();

      if (fetchError || !attachment) {
        return new Response(
          JSON.stringify({ error: 'Attachment not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const permissions = await validateAttachmentAccess(
        supabaseClient,
        user.id,
        attachment.order_id
      );

      if (!permissions.canView) {
        return new Response(
          JSON.stringify({ error: 'Permission denied' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const s3Client = createS3Client(ORDER_ATTACHMENTS_CONFIG);
      const downloadUrl = await getSignedDownloadUrl(
        s3Client,
        ORDER_ATTACHMENTS_CONFIG,
        attachment.s3_key,
        3600
      );

      return new Response(
        JSON.stringify({ downloadUrl, attachment }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'DELETE') {
      const attachmentId = url.searchParams.get('attachmentId');

      if (!attachmentId) {
        return new Response(
          JSON.stringify({ error: 'Missing attachmentId' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: attachment, error: fetchError } = await supabaseClient
        .from('order_attachments')
        .select('*')
        .eq('id', attachmentId)
        .maybeSingle();

      if (fetchError || !attachment) {
        return new Response(
          JSON.stringify({ error: 'Attachment not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const permissions = await validateAttachmentAccess(
        supabaseClient,
        user.id,
        attachment.order_id
      );

      if (!permissions.canDelete) {
        return new Response(
          JSON.stringify({ error: 'Only admins can delete attachments' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const s3Client = createS3Client(ORDER_ATTACHMENTS_CONFIG);
      await deleteFromS3(s3Client, ORDER_ATTACHMENTS_CONFIG, attachment.s3_key);

      const { error: deleteError } = await supabaseClient
        .from('order_attachments')
        .delete()
        .eq('id', attachmentId);

      if (deleteError) {
        throw deleteError;
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in manage-attachment function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});