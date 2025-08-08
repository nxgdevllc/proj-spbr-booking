-- Add Restock Price and Value Columns to Inventory Items
-- This script adds restock_price and value columns to the inventory_items table

-- Step 1: Add restock_price column
ALTER TABLE inventory_items 
ADD COLUMN restock_price REAL DEFAULT 0;

-- Step 2: Add value column (computed: stock * price)
ALTER TABLE inventory_items 
ADD COLUMN value REAL DEFAULT 0;

-- Step 3: Create index on value for better performance
CREATE INDEX idx_inventory_value ON inventory_items(value);

-- Step 4: Update existing records to calculate value
UPDATE inventory_items 
SET value = stock * price 
WHERE value = 0 OR value IS NULL;

-- Step 5: Create function to automatically update value when stock or price changes
CREATE OR REPLACE FUNCTION update_inventory_value()
RETURNS TRIGGER AS $$
BEGIN
  NEW.value = NEW.stock * NEW.price;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to automatically update value
CREATE TRIGGER update_inventory_value_trigger
  BEFORE INSERT OR UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_value();

-- Step 7: Update RLS policies to include new columns
-- (Policies already allow all columns, so no changes needed)

-- Step 8: Add comments for documentation
COMMENT ON COLUMN inventory_items.restock_price IS 'Price to restock this item (may differ from selling price)';
COMMENT ON COLUMN inventory_items.value IS 'Computed value of current stock (stock * price)';
