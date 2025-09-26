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
  company_name?: string;
  status: 'active' | 'disabled';
  assigned_sales_rep_id?: string;
  assigned_sales_rep_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: string;
  order_number?: string;
  order_type?: 'catalog' | 'custom';
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_company_name?: string;
  product_id?: string;
  product_title?: string;
  custom_description?: string;
  file_urls?: string[] | null;
  design_size?: string;
  apparel_type?: string;
  custom_width?: number;
  custom_height?: number;
  total_amount?: number;
  status: 'pending' | 'unassigned' | 'assigned_to_sales' | 'assigned_to_designer' | 'in_progress' | 'under_review' | 'completed' | 'archived';
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

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface AdminStats {
  totalOrdersThisMonth: number;
  newCustomersThisMonth: number;
  totalRevenueThisMonth: number;
  inProgressOrders: number;
  activeProducts: number;
}

export interface Invoice {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  invoice_title: string;
  month_year: string;
  payment_link?: string;
  order_ids: string[];
  total_amount: number;
  status: 'paid' | 'unpaid' | 'partially_paid' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_company_name?: string;
  customerId: string;
  order_type: 'catalog' | 'custom';
  status: 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'delivered' | 'cancelled';
  payment_status: 'paid' | 'unpaid' | 'partially_paid';
  total_amount: number;
  date: string;
  file_urls?: string[] | null;
  design_size?: string;
  apparel_type?: string;
  custom_width?: number;
  custom_height?: number;
  custom_description?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Order filters
  status?: string;
  customerSearch?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paymentStatus?: string;
  // User filters
  role?: string;
  salesRepId?: string;
  // Product filters
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  // Invoice filters
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