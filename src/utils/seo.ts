/**
 * SEO Utilities
 * 
 * Utilities for managing SEO metadata, structured data, and page optimization
 * to improve search engine visibility and social media sharing.
 */

interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Updates document head with SEO metadata
 * @param seoData - SEO configuration object
 */
export const updateSEOMetadata = (seoData: SEOData): void => {
  // Update title
  document.title = seoData.title;

  // Update or create meta tags
  updateMetaTag('description', seoData.description);
  
  if (seoData.keywords) {
    updateMetaTag('keywords', seoData.keywords.join(', '));
  }

  // Open Graph tags
  updateMetaTag('og:title', seoData.title, 'property');
  updateMetaTag('og:description', seoData.description, 'property');
  updateMetaTag('og:type', seoData.type || 'website', 'property');
  
  if (seoData.image) {
    updateMetaTag('og:image', seoData.image, 'property');
  }
  
  if (seoData.url) {
    updateMetaTag('og:url', seoData.url, 'property');
  }

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', seoData.title);
  updateMetaTag('twitter:description', seoData.description);
  
  if (seoData.image) {
    updateMetaTag('twitter:image', seoData.image);
  }

  // Article specific tags
  if (seoData.type === 'article') {
    if (seoData.author) {
      updateMetaTag('article:author', seoData.author, 'property');
    }
    if (seoData.publishedTime) {
      updateMetaTag('article:published_time', seoData.publishedTime, 'property');
    }
    if (seoData.modifiedTime) {
      updateMetaTag('article:modified_time', seoData.modifiedTime, 'property');
    }
  }
};

/**
 * Helper function to update or create meta tags
 * @param name - Meta tag name or property
 * @param content - Meta tag content
 * @param attribute - Attribute type ('name' or 'property')
 */
const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name'): void => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};

/**
 * Generate structured data for rich snippets
 * @param type - Schema.org type
 * @param data - Structured data object
 * @returns JSON-LD script element
 */
export const generateStructuredData = (type: string, data: Record<string, any>): void => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};

/**
 * SEO configurations for different pages
 */
export const seoConfigs = {
  home: {
    title: 'ABS STITCH - Professional Custom Embroidery Services | Where We Stitch Perfection',
    description: 'Professional custom embroidery and stitching services for apparel, promotional items, and personal projects. Quick turnaround, unlimited revisions, and premium quality.',
    keywords: ['custom embroidery', 'embroidery services', 'logo stitching', 'apparel customization', 'promotional items', 'custom patches'],
    type: 'website' as const,
  },
  catalog: {
    title: 'Embroidery Design Catalog | Ready-Made Professional Designs | ABS STITCH',
    description: 'Browse our collection of professionally designed embroidery patterns, ready for immediate stitching. High-quality designs for all apparel types.',
    keywords: ['embroidery designs', 'ready-made patterns', 'embroidery catalog', 'professional designs', 'apparel patterns'],
    type: 'website' as const,
  },
  about: {
    title: 'About ABS STITCH | Professional Embroidery Team | Our Story',
    description: 'Learn about ABS STITCH, our passionate team of embroidery professionals, and our mission to deliver exceptional custom stitching services.',
    keywords: ['about abs stitch', 'embroidery team', 'custom embroidery company', 'professional stitching'],
    type: 'website' as const,
  },
  login: {
    title: 'Sign In | ABS STITCH Customer Portal',
    description: 'Sign in to your ABS STITCH account to manage orders, track progress, and access your custom embroidery dashboard.',
    keywords: ['sign in', 'customer portal', 'embroidery account', 'order tracking'],
    type: 'website' as const,
  },
  signup: {
    title: 'Create Account | Join ABS STITCH | Professional Embroidery Services',
    description: 'Create your ABS STITCH account to place custom embroidery orders, track progress, and manage your projects with our professional team.',
    keywords: ['create account', 'embroidery signup', 'custom embroidery account', 'join abs stitch'],
    type: 'website' as const,
  },
} as const;

/**
 * Generate business structured data for local SEO
 */
export const generateBusinessStructuredData = (): void => {
  generateStructuredData('LocalBusiness', {
    name: 'ABS STITCH',
    description: 'Professional custom embroidery and stitching services',
    url: window.location.origin,
    telephone: '+1-123-456-7890',
    email: 'hello@absstitch.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Remote',
      addressCountry: 'US'
    },
    openingHours: 'Mo-Fr 09:00-18:00',
    priceRange: '$$',
    serviceArea: {
      '@type': 'Place',
      name: 'Worldwide'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Embroidery Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Custom Embroidery',
            description: 'Professional custom embroidery services'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Logo Stitching',
            description: 'Professional logo embroidery services'
          }
        }
      ]
    }
  });
};