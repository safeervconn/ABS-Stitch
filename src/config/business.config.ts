export interface BusinessConfig {
  businessName: string;
  tagline: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  features: {
    stockDesigns: boolean;
    customOrders: boolean;
    quoteRequests: boolean;
    multiplePaymentGateways: boolean;
  };
  pricing: {
    currency: string;
    taxRate: number;
  };
  orderWorkflow: {
    defaultStatus: string;
    allowedStatuses: string[];
  };
}

export const businessConfig: BusinessConfig = {
  businessName: import.meta.env.VITE_BUSINESS_NAME || 'AB STITCH',
  tagline: import.meta.env.VITE_BUSINESS_TAGLINE || 'Professional Embroidery Services',
  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL || 'contact@absstitch.com',
    phone: import.meta.env.VITE_CONTACT_PHONE || '+1 (555) 123-4567',
    address: import.meta.env.VITE_CONTACT_ADDRESS || '123 Business St, City, State 12345',
  },
  branding: {
    logoUrl: import.meta.env.VITE_LOGO_URL || '/logo.svg',
    faviconUrl: import.meta.env.VITE_FAVICON_URL || '/favicon.ico',
  },
  social: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK,
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM,
    twitter: import.meta.env.VITE_SOCIAL_TWITTER,
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN,
  },
  features: {
    stockDesigns: import.meta.env.VITE_FEATURE_STOCK_DESIGNS !== 'false',
    customOrders: import.meta.env.VITE_FEATURE_CUSTOM_ORDERS !== 'false',
    quoteRequests: import.meta.env.VITE_FEATURE_QUOTE_REQUESTS !== 'false',
    multiplePaymentGateways: import.meta.env.VITE_FEATURE_MULTIPLE_PAYMENT_GATEWAYS === 'true',
  },
  pricing: {
    currency: import.meta.env.VITE_CURRENCY || 'USD',
    taxRate: parseFloat(import.meta.env.VITE_TAX_RATE || '0'),
  },
  orderWorkflow: {
    defaultStatus: import.meta.env.VITE_DEFAULT_ORDER_STATUS || 'pending',
    allowedStatuses: [
      'pending',
      'in_progress',
      'completed',
      'cancelled',
      'on_hold',
    ],
  },
};

export const getBusinessName = () => businessConfig.businessName;
export const getContactEmail = () => businessConfig.contact.email;
export const getContactPhone = () => businessConfig.contact.phone;
export const getContactAddress = () => businessConfig.contact.address;
export const isFeatureEnabled = (feature: keyof BusinessConfig['features']) =>
  businessConfig.features[feature];
