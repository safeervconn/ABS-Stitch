import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from 'npm:@aws-sdk/client-s3@3';

interface StorageConfig {
  endpoint: string;
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const PRODUCT_IMAGES_CONFIG: StorageConfig = {
  endpoint: Deno.env.get('S3_PRODUCT_ENDPOINT') || 's3.us-east-005.backblazeb2.com',
  region: Deno.env.get('S3_PRODUCT_REGION') || 'us-east-005',
  bucketName: Deno.env.get('S3_PRODUCT_BUCKET') || 'product-image-bucket',
  accessKeyId: Deno.env.get('S3_PRODUCT_ACCESS_KEY_ID') || '00500472239d1730000000005',
  secretAccessKey: Deno.env.get('S3_PRODUCT_SECRET_KEY') || 'K005sqPaIk3e391FOzOhKnixN1BEnoY',
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
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const employee = await supabaseClient
      .from('employees')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (!employee.data || employee.data.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'Missing file' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ error: 'File size exceeds 10MB limit' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const s3Client = createS3Client(PRODUCT_IMAGES_CONFIG);
      const storedFilename = generateStoredFilename(file.name);
      const s3Key = `product-images/${storedFilename}`;

      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      await uploadToS3(
        s3Client,
        PRODUCT_IMAGES_CONFIG,
        s3Key,
        fileData,
        file.type
      );

      const publicUrl = `https://${PRODUCT_IMAGES_CONFIG.bucketName}.${PRODUCT_IMAGES_CONFIG.endpoint}/${s3Key}`;

      return new Response(
        JSON.stringify({ success: true, publicUrl, s3Key }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const s3Key = url.searchParams.get('s3Key');

      if (!s3Key) {
        return new Response(
          JSON.stringify({ error: 'Missing s3Key' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const s3Client = createS3Client(PRODUCT_IMAGES_CONFIG);
      await deleteFromS3(s3Client, PRODUCT_IMAGES_CONFIG, s3Key);

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
    console.error('Error in manage-product-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});