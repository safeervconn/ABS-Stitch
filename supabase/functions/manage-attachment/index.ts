import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCorsPreFlight, errorResponse, jsonResponse } from '../_shared/corsHeaders.ts';
import { authenticateRequest } from '../_shared/authHelpers.ts';
import {
  getStorageConfig,
  createS3Client,
  uploadToS3,
  getSignedDownloadUrl,
  deleteFromS3,
  generateStoredFilename,
  generateS3Key
} from '../_shared/s3Helpers.ts';

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
    return handleCorsPreFlight();
  }

  try {
    const { supabaseClient, user, error: authError } = await authenticateRequest(req);

    if (authError) {
      return errorResponse(authError, 401);
    }

    const url = new URL(req.url);
    const storageConfig = getStorageConfig('orders');
    const s3Client = createS3Client(storageConfig);

    if (req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const orderId = formData.get('orderId') as string;
      const orderNumber = formData.get('orderNumber') as string;

      if (!file || !orderId || !orderNumber) {
        return errorResponse('Missing file, orderId, or orderNumber', 400);
      }

      const MAX_FILE_SIZE = 20 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse('File size exceeds 20MB limit', 400);
      }

      const permissions = await validateAttachmentAccess(supabaseClient, user.id, orderId);

      if (!permissions.canUpload) {
        return errorResponse('Permission denied', 403);
      }

      const storedFilename = generateStoredFilename(file.name);
      const s3Key = generateS3Key('orders', orderNumber, storedFilename);

      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      await uploadToS3(
        s3Client,
        storageConfig,
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
        await deleteFromS3(s3Client, storageConfig, s3Key);
        throw dbError;
      }

      return jsonResponse({ success: true, attachment });
    }

    if (req.method === 'GET') {
      const attachmentId = url.searchParams.get('attachmentId');

      if (!attachmentId) {
        return errorResponse('Missing attachmentId', 400);
      }

      const { data: attachment, error: fetchError } = await supabaseClient
        .from('order_attachments')
        .select('*')
        .eq('id', attachmentId)
        .maybeSingle();

      if (fetchError || !attachment) {
        return errorResponse('Attachment not found', 404);
      }

      const permissions = await validateAttachmentAccess(
        supabaseClient,
        user.id,
        attachment.order_id
      );

      if (!permissions.canView) {
        return errorResponse('Permission denied', 403);
      }

      const downloadUrl = await getSignedDownloadUrl(
        s3Client,
        storageConfig,
        attachment.s3_key,
        3600
      );

      return jsonResponse({ downloadUrl, attachment });
    }

    if (req.method === 'DELETE') {
      const attachmentId = url.searchParams.get('attachmentId');

      if (!attachmentId) {
        return errorResponse('Missing attachmentId', 400);
      }

      const { data: attachment, error: fetchError } = await supabaseClient
        .from('order_attachments')
        .select('*')
        .eq('id', attachmentId)
        .maybeSingle();

      if (fetchError || !attachment) {
        return errorResponse('Attachment not found', 404);
      }

      const permissions = await validateAttachmentAccess(
        supabaseClient,
        user.id,
        attachment.order_id
      );

      if (!permissions.canDelete) {
        return errorResponse('Only admins can delete attachments', 403);
      }

      await deleteFromS3(s3Client, storageConfig, attachment.s3_key);

      const { error: deleteError } = await supabaseClient
        .from('order_attachments')
        .delete()
        .eq('id', attachmentId);

      if (deleteError) {
        throw deleteError;
      }

      return jsonResponse({ success: true });
    }

    return errorResponse('Method not allowed', 405);

  } catch (error) {
    console.error('Error in manage-attachment function:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
