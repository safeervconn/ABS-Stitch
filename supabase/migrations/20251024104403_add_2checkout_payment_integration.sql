/*
  # 2Checkout Payment Integration

  ## Overview
  This migration adds comprehensive support for 2Checkout payment processing for both stock designs and custom orders.

  ## Changes

  ### 1. Orders Table Updates
  - Add `invoice_id` column as nullable foreign key to invoices table
  - Update `payment_status` enum to include `pending_payment` state
  - Add index on `invoice_id` for query performance
  - Add index on `payment_status` for filtering performance

  ### 2. Invoices Table Updates
  - Add `tco_reference_number` to store 2Checkout REFNO
  - Add `tco_order_id` to store 2Checkout ORDERNO
  - Add `tco_payment_method` to track payment method used
  - Add index on `tco_reference_number` for webhook lookups

  ### 3. Stock Designs Table Updates
  - Add `attachment_url` for ZIP file storage path
  - Add `attachment_filename` for original filename
  - Add `attachment_size` for file size in bytes

  ## Security
  - All new columns use proper constraints
  - Foreign key relationships maintain referential integrity
  - RLS policies remain unchanged (already configured)

  ## Notes
  - `invoice_id` is nullable to support orders without invoices
  - `pending_payment` status indicates invoice created, awaiting payment
  - Stock design attachments stored in private bucket accessible only after payment
*/

-- Step 1: Add invoice_id column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'invoice_id'
  ) THEN
    ALTER TABLE orders 
    ADD COLUMN invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_orders_invoice_id ON orders(invoice_id);
  END IF;
END $$;

-- Step 2: Update payment_status enum to include pending_payment
DO $$
BEGIN
  -- Drop the existing constraint
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
  
  -- Add new constraint with pending_payment
  ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('paid', 'unpaid', 'cancelled', 'pending_payment'));
END $$;

-- Step 3: Add index on payment_status for performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Step 4: Add 2Checkout transaction fields to invoices table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'tco_reference_number'
  ) THEN
    ALTER TABLE invoices 
    ADD COLUMN tco_reference_number text UNIQUE,
    ADD COLUMN tco_order_id text,
    ADD COLUMN tco_payment_method text;
    
    CREATE INDEX IF NOT EXISTS idx_invoices_tco_reference ON invoices(tco_reference_number);
  END IF;
END $$;

-- Step 5: Add attachment fields to stock_designs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_designs' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE stock_designs 
    ADD COLUMN attachment_url text,
    ADD COLUMN attachment_filename text,
    ADD COLUMN attachment_size bigint;
  END IF;
END $$;

-- Step 6: Create function to sync order payment status with invoice status
CREATE OR REPLACE FUNCTION sync_order_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When invoice status changes to paid, update all linked orders
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE orders
    SET payment_status = 'paid'
    WHERE invoice_id = NEW.id;
  END IF;
  
  -- When invoice is cancelled, reset orders to unpaid and clear invoice_id
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE orders
    SET payment_status = 'unpaid', invoice_id = NULL
    WHERE invoice_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger for invoice status changes
DROP TRIGGER IF EXISTS trigger_sync_order_payment_status ON invoices;
CREATE TRIGGER trigger_sync_order_payment_status
  AFTER UPDATE OF status ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION sync_order_payment_status();

-- Step 8: Create function to update order payment status when invoice is linked
CREATE OR REPLACE FUNCTION update_order_invoice_link()
RETURNS TRIGGER AS $$
BEGIN
  -- When order is linked to an invoice, update payment status based on invoice status
  IF NEW.invoice_id IS NOT NULL AND (OLD.invoice_id IS NULL OR OLD.invoice_id != NEW.invoice_id) THEN
    UPDATE orders o
    SET payment_status = CASE 
      WHEN i.status = 'paid' THEN 'paid'
      ELSE 'pending_payment'
    END
    FROM invoices i
    WHERE o.id = NEW.id AND i.id = NEW.invoice_id;
  END IF;
  
  -- When order is unlinked from invoice, reset to unpaid
  IF NEW.invoice_id IS NULL AND OLD.invoice_id IS NOT NULL THEN
    UPDATE orders
    SET payment_status = 'unpaid'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger for order invoice linking
DROP TRIGGER IF EXISTS trigger_update_order_invoice_link ON orders;
CREATE TRIGGER trigger_update_order_invoice_link
  AFTER UPDATE OF invoice_id ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_invoice_link();