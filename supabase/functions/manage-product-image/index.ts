import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCorsPreFlight, errorResponse, jsonResponse } from '../_shared/corsHeaders.ts';
import { authenticateRequest, requireAdmin } from '../_shared/authHelpers.ts';
import {
  getStorageConfig,
  createS3Client,
  uploadToS3,
  deleteFromS3,
  generateStoredFilename
} from '../_shared/s3Helpers.ts';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return handleCorsPreFlight();
  }

  try {
    const { supabaseClient, user, error: authError } = await authenticateRequest(req);

    if (authError) {
      return errorResponse(authError, 401);
    }

    const adminError = await requireAdmin(supabaseClient, user.id);
    if (adminError) {
      return errorResponse(adminError, 403);
    }

    const storageConfig = getStorageConfig('products');
    const s3Client = createS3Client(storageConfig);

    if (req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return errorResponse('Missing file', 400);
      }

      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse('File size exceeds 10MB limit', 400);
      }

      const storedFilename = generateStoredFilename(file.name);
      const s3Key = `product-images/${storedFilename}`;

      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      await uploadToS3(
        s3Client,
        storageConfig,
        s3Key,
        fileData,
        file.type
      );

      const publicUrl = `https://${storageConfig.bucketName}.${storageConfig.endpoint}/${s3Key}`;

      return jsonResponse({ success: true, publicUrl, s3Key });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const s3Key = url.searchParams.get('s3Key');

      if (!s3Key) {
        return errorResponse('Missing s3Key', 400);
      }

      await deleteFromS3(s3Client, storageConfig, s3Key);

      return jsonResponse({ success: true });
    }

    return errorResponse('Method not allowed', 405);

  } catch (error) {
    console.error('Error in manage-product-image function:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
