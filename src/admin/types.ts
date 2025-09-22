export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'sales_rep' | 'designer' | 'customer';
  status: 'active' | 'disabled';
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  sales_rep_id?: string;
  sales_rep_name?: string;
  assigned_designer_id?: string;
  designer_name?: string;
  assigned_role?: 'sales_rep' | 'designer';
  order_type: 'catalog' | 'custom';
  status: 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'delivered' | 'cancelled';
  total_amount: number;
  items_summary: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProduct {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  price: number;
  stock: number;
  sku?: string;
  image_url?: string;
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminStats {
  totalOrdersThisMonth: number;
  newCustomersThisMonth: number;
  totalRevenueThisMonth: number;
  inProgressOrders: number;
  activeProducts: number;
}

export interface AdminMeta {
  last_seen_users: string;
  last_seen_orders: string;
  last_seen_products: string;
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
  // User filters
  role?: string;
  salesRepId?: string;
  // Product filters
  categoryId?: string;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}