/*
  # Add payment status to orders and create invoices table

  1. New Columns
    - Add `payment_status` to orders table with default 'unpaid'
  
  2. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to customers)
      - `invoice_title` (text)
      - `month_year` (text, e.g., "September 2025")
      - `payment_link` (text)
      - `order_ids` (uuid array, references orders.id)
      - `total_amount` (numeric)
      - `status` (text, default 'unpaid')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  3. Security
    - Enable RLS on invoices table
    - Add policies for admin management and customer read access
*/

-- Add payment_status to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid' NOT NULL;

-- Add constraint for payment_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_payment_status_check' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
    CHECK (payment_status IN ('paid', 'unpaid'));
  END IF;
END $$;

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  invoice_title text NOT NULL,
  month_year text NOT NULL,
  payment_link text,
  order_ids uuid[] NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'unpaid' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Add constraint for invoice status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invoices_status_check' 
    AND table_name = 'invoices'
  ) THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('paid', 'unpaid');
  END IF;
END $$;

-- Create policies for invoices
CREATE POLICY "Admins can manage invoices" ON invoices
FOR ALL USING (EXISTS (
  SELECT 1 FROM employees e 
  WHERE e.id = auth.uid() AND e.role = 'admin'
));

CREATE POLICY "Customers can read their own invoices" ON invoices
FOR SELECT USING (customer_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_invoices_updated_at 
BEFORE UPDATE ON invoices 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_month_year ON invoices(month_year);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);