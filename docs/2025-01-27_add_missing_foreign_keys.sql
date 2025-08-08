-- Add Missing Foreign Key Relationships
-- This script adds missing foreign key constraints for data integrity

-- Add employee to user_profile relationship
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id);

-- Add inventory relationships
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id),
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);

-- Update existing data to link categories and suppliers
UPDATE inventory_items 
SET category_id = (
  SELECT id FROM product_categories 
  WHERE name = inventory_items.category
)
WHERE category_id IS NULL;

-- Add foreign key for inventory_count_items
ALTER TABLE inventory_count_items 
ADD CONSTRAINT IF NOT EXISTS fk_count_items_inventory 
FOREIGN KEY (item_id) REFERENCES inventory_items(id);

-- Add foreign key for inventory_transactions
ALTER TABLE inventory_transactions 
ADD CONSTRAINT IF NOT EXISTS fk_transactions_inventory 
FOREIGN KEY (item_id) REFERENCES inventory_items(id);

-- Add foreign key for orders (if guests table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guests') THEN
    ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES guests(id);
  END IF;
END $$;

-- Add foreign key for bookings (if not already exists)
ALTER TABLE bookings 
ADD CONSTRAINT IF NOT EXISTS fk_bookings_guest 
FOREIGN KEY (guest_id) REFERENCES guests(id);

ALTER TABLE bookings 
ADD CONSTRAINT IF NOT EXISTS fk_bookings_unit 
FOREIGN KEY (unit_id) REFERENCES units(id);

-- Add foreign key for payments
ALTER TABLE payments 
ADD CONSTRAINT IF NOT EXISTS fk_payments_booking 
FOREIGN KEY (booking_id) REFERENCES bookings(id);

-- Add comments for documentation
COMMENT ON COLUMN employees.user_profile_id IS 'Reference to user_profiles for authentication';
COMMENT ON COLUMN inventory_items.category_id IS 'Reference to product_categories';
COMMENT ON COLUMN inventory_items.supplier_id IS 'Reference to suppliers';
COMMENT ON COLUMN orders.customer_id IS 'Reference to guests table';
