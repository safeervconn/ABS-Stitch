import { supabase } from './supabase';

interface SignedUrlCache {
  url: string;
  expiresAt: number;
}

const urlCache = new Map<string, SignedUrlCache>();
const CACHE_BUFFER_MS = 5 * 60 * 1000;

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-attachment`;

export async function getSignedImageUrl(attachmentId: string): Promise<string | null> {
  const cached = urlCache.get(attachmentId);
  if (cached && cached.expiresAt > Date.now() + CACHE_BUFFER_MS) {
    return cached.url;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('No active session for image URL generation');
      return null;
    }

    const response = await fetch(`${EDGE_FUNCTION_URL}?attachmentId=${attachmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to get signed URL:', response.status);
      return null;
    }

    const result = await response.json();
    const signedUrl = result.downloadUrl;

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('No active session for bulk image URL generation');
      return results;
    }

    const urlPromises = uncachedIds.map(async (id) => {
      try {
        const response = await fetch(`${EDGE_FUNCTION_URL}?attachmentId=${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          return { id, url: null };
        }

        const result = await response.json();
        const signedUrl = result.downloadUrl;

        if (signedUrl) {
          urlCache.set(id, {
            url: signedUrl,
            expiresAt: Date.now() + 55 * 60 * 1000,
          });
          return { id, url: signedUrl };
        }

        return { id, url: null };
      } catch (error) {
        console.error(`Error fetching signed URL for attachment ${id}:`, error);
        return { id, url: null };
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
