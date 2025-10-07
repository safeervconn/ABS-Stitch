/**
 * Application Constants
 * 
 * Centralized constants for consistent values across the application
 * including API endpoints, configuration values, and UI constants.
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'ABS STITCH',
  tagline: 'Where We Stitch Perfection!',
  description: 'Professional custom embroidery and stitching services',
  version: '1.0.0',
  author: 'ABS STITCH Team',
} as const;

/**
 * Contact information
 */
export const CONTACT_INFO = {
  phone: '+1-123-456-7890',
  email: 'hello@absstitch.com',
  address: 'Remote & Worldwide',
  businessHours: 'Monday - Friday: 9AM - 6PM EST',
  website: 'https://abs-stitch.com',
} as const;

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/absstitch',
  instagram: 'https://instagram.com/absstitch',
  twitter: 'https://twitter.com/absstitch',
  linkedin: 'https://linkedin.com/company/absstitch',
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * UI constants
 */
export const UI_CONSTANTS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/*', '.pdf', '.doc', '.docx', '.zip'],
  itemsPerPage: 25,
  searchDebounceMs: 300,
  animationDuration: 300,
  toastDuration: 4000,
} as const;

/**
 * Order status configurations
 */
export const ORDER_STATUSES = {
  new: { label: 'New', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'purple' },
  under_review: { label: 'Under Review', color: 'orange' },
  completed: { label: 'Completed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
} as const;

/**
 * Payment status configurations
 */
export const PAYMENT_STATUSES = {
  paid: { label: 'Paid', color: 'green' },
  unpaid: { label: 'Unpaid', color: 'red' },
  partially_paid: { label: 'Partially Paid', color: 'yellow' },
} as const;

/**
 * User role configurations
 */
export const USER_ROLES = {
  admin: { label: 'Administrator', color: 'purple' },
  sales_rep: { label: 'Sales Representative', color: 'blue' },
  designer: { label: 'Designer', color: 'green' },
  customer: { label: 'Customer', color: 'gray' },
} as const;

/**
 * Navigation menu items
 */
export const NAVIGATION_ITEMS = [
  { href: '/', label: 'Home', id: 'home' },
  { href: '/catalog', label: 'Catalog', id: 'catalog' },
  { href: '/#services', label: 'Services', id: 'services' },
  { href: '/about', label: 'About', id: 'about' },
  { href: '/#contact', label: 'Contact', id: 'contact' },
] as const;

/**
 * Dashboard routes by role
 */
export const DASHBOARD_ROUTES = {
  admin: '/admin',
  sales_rep: '/sales/dashboard',
  designer: '/designer/dashboard',
  customer: '/customer/dashboard',
} as const;

/**
 * File upload configurations
 */
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    archives: ['application/zip', 'application/x-rar-compressed'],
  },
  buckets: {
    orderFiles: 'order-files',
    productImages: 'product-images',
    avatars: 'avatars',
  },
} as const;