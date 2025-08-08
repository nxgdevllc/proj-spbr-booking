-- Update Inventory Items Schema
-- This script updates the inventory_items table with improved structure

-- Step 1: Backup current data
CREATE TABLE inventory_items_backup AS SELECT * FROM inventory_items;

-- Step 2: Drop the current table
DROP TABLE inventory_items;

-- Step 3: Create new table with improved schema
CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  stock REAL DEFAULT 0,
  size TEXT,
  units TEXT,
  price REAL DEFAULT 0,
  min_level REAL DEFAULT 0,
  supplier TEXT,
  barcode TEXT,
  barcode_type TEXT,
  notes TEXT,
  tags TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_inventory_product_name ON inventory_items(product_name);
CREATE INDEX idx_inventory_barcode ON inventory_items(barcode);
CREATE INDEX idx_inventory_tags ON inventory_items(tags);

-- Step 5: Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
-- Admin can do everything
CREATE POLICY "Admins can manage all inventory" ON inventory_items
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Managers can read and update
CREATE POLICY "Managers can read and update inventory" ON inventory_items
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Managers can update inventory" ON inventory_items
  FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- Employees can read
CREATE POLICY "Employees can read inventory" ON inventory_items
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'manager', 'employee'));

-- Guests can read (for store display)
CREATE POLICY "Guests can read inventory" ON inventory_items
  FOR SELECT USING (true);

-- Step 7: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger for updated_at
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();

-- Step 9: Reset the sequence to start from 245
ALTER SEQUENCE inventory_items_id_seq RESTART WITH 245;
