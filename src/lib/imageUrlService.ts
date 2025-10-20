import { supabase } from './supabase';

interface SignedUrlCache {
  url: string;
  expiresAt: number;
}

const urlCache = new Map<string, SignedUrlCache>();
const CACHE_BUFFER_MS = 5 * 60 * 1000;
const STORAGE_BUCKET = 'order-attachments';

export async function getSignedImageUrl(attachmentId: string): Promise<string | null> {
  const cached = urlCache.get(attachmentId);
  if (cached && cached.expiresAt > Date.now() + CACHE_BUFFER_MS) {
    return cached.url;
  }

  try {
    const { data: attachment, error: fetchError } = await supabase
      .from('order_attachments')
      .select('storage_path')
      .eq('id', attachmentId)
      .maybeSingle();

    if (fetchError || !attachment) {
      console.error('Failed to fetch attachment:', fetchError);
      return null;
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(attachment.storage_path, 3600);

    if (error || !data) {
      console.error('Failed to create signed URL:', error);
      return null;
    }

    const signedUrl = data.signedUrl;

    if (signedUrl) {
      urlCache.set(attachmentId, {
        url: signedUrl,
        expiresAt: Date.now() + 55 * 60 * 1000,
      });
      return signedUrl;
    }

    return null;
  } catch (error) {
    console.error('Error fetching signed image URL:', error);
    return null;
  }
}

export async function getBulkSignedImageUrls(attachmentIds: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const uncachedIds: string[] = [];

  for (const id of attachmentIds) {
    const cached = urlCache.get(id);
    if (cached && cached.expiresAt > Date.now() + CACHE_BUFFER_MS) {
      results[id] = cached.url;
    } else {
      uncachedIds.push(id);
    }
  }

  if (uncachedIds.length === 0) {
    return results;
  }

  try {
    const { data: attachments, error: fetchError } = await supabase
      .from('order_attachments')
      .select('id, storage_path')
      .in('id', uncachedIds);

    if (fetchError || !attachments) {
      console.error('Failed to fetch attachments:', fetchError);
      return results;
    }

    const urlPromises = attachments.map(async (attachment) => {
      try {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(attachment.storage_path, 3600);

        if (error || !data) {
          return { id: attachment.id, url: null };
        }

        const signedUrl = data.signedUrl;

        if (signedUrl) {
          urlCache.set(attachment.id, {
            url: signedUrl,
            expiresAt: Date.now() + 55 * 60 * 1000,
          });
          return { id: attachment.id, url: signedUrl };
        }

        return { id: attachment.id, url: null };
      } catch (error) {
        console.error(`Error creating signed URL for attachment ${attachment.id}:`, error);
        return { id: attachment.id, url: null };
      }
    });

    const urlResults = await Promise.all(urlPromises);

    for (const { id, url } of urlResults) {
      if (url) {
        results[id] = url;
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching bulk signed image URLs:', error);
    return results;
  }
}

export function clearUrlCache(): void {
  urlCache.clear();
}

export function getOrderImagePreviewUrl(order: { first_attachment_url?: string; first_attachment_id?: string }): string | null {
  if (!order.first_attachment_url && !order.first_attachment_id) {
    return null;
  }

  if (order.first_attachment_url?.startsWith('http')) {
    return order.first_attachment_url;
  }

  return null;
}
