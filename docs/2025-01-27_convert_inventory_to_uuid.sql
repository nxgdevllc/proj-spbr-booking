-- Convert inventory_items to UUID Primary Key
-- This script converts the inventory_items table from SERIAL to UUID

-- Create temporary table with UUID structure
CREATE TABLE inventory_items_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  restock_price REAL,
  value REAL,
  photo1 TEXT,
  photo2 TEXT,
  photo3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy data from old table to new table
INSERT INTO inventory_items_new (
  category, product_name, stock, size, units, price, min_level,
  supplier, barcode, barcode_type, notes, tags, restock_price, value,
  photo1, photo2, photo3, created_at, updated_at
)
SELECT 
  category, product_name, stock, size, units, price, min_level,
  supplier, barcode, barcode_type, notes, tags, restock_price, value,
  photo1, photo2, photo3, created_at, updated_at
FROM inventory_items;

-- Drop old table and rename new table
DROP TABLE inventory_items;
ALTER TABLE inventory_items_new RENAME TO inventory_items;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(stock);
CREATE INDEX IF NOT EXISTS idx_inventory_items_price ON inventory_items(price);

-- Add comments for documentation
COMMENT ON TABLE inventory_items IS 'Product inventory with UUID primary keys';
COMMENT ON COLUMN inventory_items.id IS 'Unique UUID identifier for each product';
