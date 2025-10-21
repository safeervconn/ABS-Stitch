import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCorsPreFlight, errorResponse, jsonResponse } from '../_shared/corsHeaders.ts';
import { authenticateRequest, requireAdmin } from '../_shared/authHelpers.ts';
import {
  STORAGE_BUCKETS,
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  generateStoredFilename,
  generateStoragePath,
  getPublicUrl
} from '../_shared/storageHelpers.ts';

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
      const storagePath = generateStoragePath('stock_design', null, storedFilename);

      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      await uploadToSupabaseStorage(
        supabaseClient,
        STORAGE_BUCKETS.STOCK_DESIGN_IMAGES,
        storagePath,
        fileData,
        file.type
      );

      const publicUrl = getPublicUrl(STORAGE_BUCKETS.STOCK_DESIGN_IMAGES, storagePath);

      return jsonResponse({ success: true, publicUrl, storagePath });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const storagePath = url.searchParams.get('storagePath');

      if (!storagePath) {
        return errorResponse('Missing storagePath', 400);
      }

      await deleteFromSupabaseStorage(supabaseClient, STORAGE_BUCKETS.STOCK_DESIGN_IMAGES, storagePath);

      return jsonResponse({ success: true });
    }

    return errorResponse('Method not allowed', 405);

  } catch (error) {
    console.error('Error in manage-stock-design-image function:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
