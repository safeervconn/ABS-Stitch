/**
 * SEO Head Component
 * 
 * Component for managing page-specific SEO metadata including
 * title, description, Open Graph tags, and structured data.
 */

import React, { useEffect } from 'react';
import { updateSEOMetadata, generateBusinessStructuredData, seoConfigs } from '../../utils/seo';

interface SEOHeadProps {
  page?: keyof typeof seoConfigs;
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  includeBusinessData?: boolean;
}

/**
 * SEO metadata management component
 * Automatically updates document head with proper SEO tags
 */
const SEOHead: React.FC<SEOHeadProps> = ({
  page,
  title,
  description,
  keywords,
  image,
  url,
  type,
  includeBusinessData = false,
}) => {
  useEffect(() => {
    // Use predefined config or custom values
    const seoData = page ? seoConfigs[page] : {
      title: title || 'ABS STITCH - Professional Custom Embroidery Services',
      description: description || 'Professional custom embroidery and stitching services.',
      keywords,
      type: type || 'website',
    };

    // Add current URL if not provided
    const finalSeoData = {
      ...seoData,
      url: url || window.location.href,
      image: image || `${window.location.origin}/og-image.jpg`,
    };

    updateSEOMetadata(finalSeoData);

    // Add business structured data if requested
    if (includeBusinessData) {
      generateBusinessStructuredData();
    }
  }, [page, title, description, keywords, image, url, type, includeBusinessData]);

  return null; // This component doesn't render anything
};

export default SEOHead;