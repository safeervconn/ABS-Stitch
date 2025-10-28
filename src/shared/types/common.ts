export type UserRole = 'customer' | 'designer' | 'sales_rep' | 'admin';

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export type InvoiceStatus = 'paid' | 'awaiting_payment' | 'partially_paid' | 'cancelled';

export type NotificationType = 'order_update' | 'payment_received' | 'edit_request' | 'system';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
}

export interface Order extends BaseEntity {
  customer_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  description?: string;
  design_file_url?: string;
  notes?: string;
}

export interface Invoice extends BaseEntity {
  order_id: string;
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  due_date?: string;
  paid_at?: string;
}

export interface Notification extends BaseEntity {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  order_id?: string;
}

export interface StockDesign extends BaseEntity {
  name: string;
  description: string;
  price: number;
  image_url: string;
  file_url?: string;
  category?: string;
}

export interface EditRequest extends BaseEntity {
  order_id: string;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  response?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
