// Base types for admin interface
export interface AdminStats {
  totalOrdersThisMonth: number;
  newCustomersThisMonth: number;
  totalRevenueThisMonth: number;
  inProgressOrders: number;
  activeProducts: number;
  newOrdersCount: number;
  underReviewOrdersCount: number;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'sales_rep' | 'designer';
  status: 'active' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface AdminCustomer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  status: 'active' | 'disabled';
  assigned_sales_rep_id?: string;
  assigned_sales_rep_name?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderAttachment {
  id: string;
  order_id: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string;
  s3_key: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  order_name: string;
  order_type?: 'custom' | 'catalog';
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company_name: string;
  product_id?: string;
  product_title?: string;
  custom_description?: string;
  attachments?: OrderAttachment[];
  first_attachment_url?: string;
  first_attachment_id?: string;
  apparel_type_id?: string;
  apparel_type_name?: string;
  custom_width?: number;
  custom_height?: number;
  total_amount: number;
  payment_status: 'paid' | 'unpaid';
  status: 'new' | 'in_progress' | 'under_review' | 'completed' | 'cancelled';
  assigned_sales_rep_id?: string;
  assigned_sales_rep_name?: string;
  assigned_designer_id?: string;
  assigned_designer_name?: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProduct {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  image_url?: string;
  price: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ApparelType {
  id: string;
  type_name: string;
  description?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_company_name?: string;
  apparel_type_id?: string;
  apparel_type_name?: string;
  month_year: string;
  payment_link?: string;
  order_ids: string[];
  total_amount: number;
  status: 'paid' | 'unpaid' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface OrderComment {
  id: number;
  order_id: string;
  author_id: string;
  author_name?: string;
  content: string;
  created_at: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Filter-specific params
  role?: string;
  status?: string | string[];
  apparelTypeId?: string;
  salesRepId?: string;
  assignedDesignerId?: string;
  customerSearch?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  amountMin?: number;
  amountMax?: number;
  
  // Invoice-specific params
  invoiceStatus?: string;
  invoiceCustomerId?: string;
  invoiceMonthYear?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Customer order type for customer dashboard
export interface CustomerOrder {
  id: string;
  order_number: string;
  order_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company_name: string;
  customerId: string;
  order_type: 'custom' | 'catalog';
  attachments?: OrderAttachment[];
  first_attachment_url?: string;
  status: 'in_progress' | 'under_review' | 'completed' | 'cancelled';
  payment_status: 'paid' | 'unpaid';
  total_amount: number;
  created_at: string;
  updated_at: string;
  custom_description?: string;
  apparel_type_id?: string;
  apparel_type_name?: string;
  custom_width?: number;
  custom_height?: number;
  assigned_sales_rep_name?: string;
  assigned_designer_name?: string;
  assigned_sales_rep_id?: string;
  assigned_designer_id?: string;
}

// Order type for order context
export interface Order extends CustomerOrder {}