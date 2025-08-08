-- Create Orders Table for GCash Payment System
-- This table stores customer orders and payment information

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL, -- Array of order items
  total_amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'gcash')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  pickup_status TEXT NOT NULL DEFAULT 'pending' CHECK (pickup_status IN ('pending', 'ready', 'completed')),
  pickup_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_status ON orders(pickup_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all authenticated users to read orders (for staff)
CREATE POLICY "Allow authenticated users to read orders" ON orders
  FOR SELECT USING (auth.role() IN ('authenticated', 'admin', 'manager', 'employee'));

-- Allow all users to insert orders (for customers)
CREATE POLICY "Allow all users to insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow staff to update orders
CREATE POLICY "Allow staff to update orders" ON orders
  FOR UPDATE USING (auth.role() IN ('admin', 'manager', 'employee'));

-- Add comments for documentation
COMMENT ON TABLE orders IS 'Customer orders for store purchases';
COMMENT ON COLUMN orders.order_number IS 'Unique order number for customer reference';
COMMENT ON COLUMN orders.items IS 'JSON array of order items with id, name, price, quantity';
COMMENT ON COLUMN orders.payment_method IS 'Payment method: cash or gcash';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, or failed';
COMMENT ON COLUMN orders.pickup_status IS 'Pickup status: pending, ready, or completed';
COMMENT ON COLUMN orders.pickup_time IS 'Scheduled pickup time for the order';
