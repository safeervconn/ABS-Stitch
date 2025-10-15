import React, { useState, useEffect } from 'react';
import { getSignedImageUrl } from '../lib/imageUrlService';
import { getPlaceholderImage } from '../lib/placeholderImages';

interface OrderImagePreviewProps {
  attachmentId?: string;
  alt?: string;
  className?: string;
}

export const OrderImagePreview: React.FC<OrderImagePreviewProps> = ({
  attachmentId,
  alt = 'Order attachment',
  className = 'w-12 h-12'
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!attachmentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        const url = await getSignedImageUrl(attachmentId);

        if (isMounted) {
          if (url) {
            setImageUrl(url);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [attachmentId]);

  const placeholderUrl = getPlaceholderImage('thumbnail');

  return (
    <div className={`${className} rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center`}>
      {loading ? (
        <div className="animate-pulse bg-gray-200 w-full h-full"></div>
      ) : (
        <img
          src={error || !imageUrl ? placeholderUrl : imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderUrl;
          }}
        />
      )}
    </div>
  );
};
