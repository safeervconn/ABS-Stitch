export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: 'admin' | 'sales_rep' | 'designer';
          status: 'active' | 'disabled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          status: 'active' | 'disabled';
          assigned_sales_rep_id: string | null;
          company_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          stock_design_id: string | null;
          custom_description: string | null;
          status: 'new' | 'in_progress' | 'under_review' | 'completed' | 'cancelled';
          assigned_sales_rep_id: string | null;
          assigned_designer_id: string | null;
          invoice_url: string | null;
          created_at: string;
          updated_at: string;
          order_type: 'stock_design' | 'custom';
          order_number: string;
          order_name: string;
          total_amount: number;
          payment_status: 'paid' | 'unpaid' | 'cancelled';
          custom_width: number;
          custom_height: number;
          category_id: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at' | 'order_number'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      stock_designs: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category_id: string | null;
          image_url: string | null;
          price: number;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stock_designs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['stock_designs']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          category_name: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          customer_id: string;
          invoice_title: string;
          month_year: string;
          payment_link: string | null;
          order_ids: string[];
          total_amount: number;
          status: 'paid' | 'unpaid' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: 'order' | 'user' | 'stock_design' | 'system';
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      order_comments: {
        Row: {
          id: number;
          order_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_comments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_comments']['Insert']>;
      };
      order_attachments: {
        Row: {
          id: string;
          order_id: string;
          original_filename: string;
          stored_filename: string;
          file_size: number;
          mime_type: string;
          storage_path: string;
          uploaded_by: string;
          uploaded_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_attachments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_attachments']['Insert']>;
      };
    };
    Views: {
      orders_with_details: {
        Row: Database['public']['Tables']['orders']['Row'] & {
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          customer_company_name: string | null;
          stock_design_title: string | null;
          category_name: string | null;
          sales_rep_name: string | null;
          designer_name: string | null;
          first_attachment_id: string | null;
        };
      };
      customer_summary: {
        Row: Database['public']['Tables']['customers']['Row'] & {
          sales_rep_name: string | null;
          total_orders: number;
          total_spent: number;
          unpaid_orders_count: number;
        };
      };
    };
    Functions: {
      calculate_dashboard_stats: {
        Args: Record<string, never>;
        Returns: {
          totalOrdersThisMonth: number;
          newCustomersThisMonth: number;
          totalRevenueThisMonth: number;
          inProgressOrders: number;
          activeStockDesigns: number;
          newOrdersCount: number;
          underReviewOrdersCount: number;
        };
      };
      calculate_sales_rep_stats: {
        Args: { rep_id: string };
        Returns: {
          totalOrdersThisMonth: number;
          newOrdersCount: number;
          inProgressOrdersCount: number;
          underReviewOrdersCount: number;
        };
      };
      calculate_designer_stats: {
        Args: { designer_id: string };
        Returns: {
          totalOrdersThisMonth: number;
          inProgressOrdersCount: number;
        };
      };
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      create_notification_batch: {
        Args: {
          user_ids: string[];
          notification_type: string;
          notification_message: string;
        };
        Returns: void;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_sales_rep: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_designer: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_customer: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}
