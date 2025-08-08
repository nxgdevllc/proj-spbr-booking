-- =====================================================
-- Phase 1: Critical Database Fixes
-- San Pedro Beach Resort Management System
-- Date: January 27, 2025
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CONVERT INVENTORY_ITEMS TO UUID PRIMARY KEY
-- =====================================================

-- Create new table with UUID primary key
CREATE TABLE IF NOT EXISTS inventory_items_new (
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
DROP TABLE IF EXISTS inventory_items;
ALTER TABLE inventory_items_new RENAME TO inventory_items;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_name ON inventory_items(product_name);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(stock);
CREATE INDEX IF NOT EXISTS idx_inventory_items_price ON inventory_items(price);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier);

-- =====================================================
-- 2. ADD MISSING FOREIGN KEY RELATIONSHIPS
-- =====================================================

-- Add user_profile_id to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id);

-- Add category_id and supplier_id to inventory_items
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id),
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);

-- Update existing inventory items to link with categories
UPDATE inventory_items 
SET category_id = (
    SELECT id FROM product_categories 
    WHERE name = inventory_items.category 
    LIMIT 1
)
WHERE category_id IS NULL AND category IS NOT NULL;

-- Add foreign keys for inventory transactions
ALTER TABLE inventory_transactions 
ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES inventory_items(id);

-- Add foreign keys for inventory count items
ALTER TABLE inventory_count_items 
ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES inventory_items(id);

-- Add foreign keys for orders (if guest_id exists)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES guests(id);

-- Add foreign keys for bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES guests(id),
ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES units(id);

-- Add foreign keys for payments
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);

-- =====================================================
-- 3. CONVERT DATA TYPES (TEXT TO NUMERIC/DATE)
-- =====================================================

-- Convert financial amounts from TEXT to NUMERIC
ALTER TABLE expenses_2025 
ALTER COLUMN amount TYPE NUMERIC(10,2) 
USING CASE 
    WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::NUMERIC(10,2)
    ELSE 0.00
END;

ALTER TABLE employee_salaries_2025 
ALTER COLUMN amount TYPE NUMERIC(10,2) 
USING CASE 
    WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::NUMERIC(10,2)
    ELSE 0.00
END;

ALTER TABLE stakeholder_withdrawals_2025 
ALTER COLUMN amount TYPE NUMERIC(10,2) 
USING CASE 
    WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::NUMERIC(10,2)
    ELSE 0.00
END;

-- Convert dates from TEXT to DATE
ALTER TABLE expenses_2025 
ALTER COLUMN date TYPE DATE 
USING CASE 
    WHEN date ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE
    ELSE NULL
END;

ALTER TABLE employee_salaries_2025 
ALTER COLUMN date TYPE DATE 
USING CASE 
    WHEN date ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE
    ELSE NULL
END;

ALTER TABLE stakeholder_withdrawals_2025 
ALTER COLUMN date TYPE DATE 
USING CASE 
    WHEN date ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE
    ELSE NULL
END;

-- Add constraints to ensure positive amounts
ALTER TABLE expenses_2025 
ADD CONSTRAINT check_positive_amount CHECK (amount >= 0);

ALTER TABLE employee_salaries_2025 
ADD CONSTRAINT check_positive_salary CHECK (amount >= 0);

ALTER TABLE stakeholder_withdrawals_2025 
ADD CONSTRAINT check_positive_withdrawal CHECK (amount >= 0);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_units_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_salaries_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_withdrawals_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_denominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_count_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE BASIC RLS POLICIES
-- =====================================================

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Employees policies
CREATE POLICY "Employees can view own data" ON employees
    FOR SELECT USING (auth.uid()::text = user_profile_id::text);

CREATE POLICY "Managers can view all employees" ON employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- Inventory policies
CREATE POLICY "Public read access to inventory" ON inventory_items
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage inventory" ON inventory_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Booking policies
CREATE POLICY "Public read access to units" ON units
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage bookings" ON bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Financial policies (admin/manager only)
CREATE POLICY "Admin/Manager financial access" ON expenses_2025
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admin/Manager salary access" ON employee_salaries_2025
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- =====================================================
-- 6. ADD PERFORMANCE INDEXES
-- =====================================================

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status, pickup_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_email);

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses_2025(date);
CREATE INDEX IF NOT EXISTS idx_salaries_date ON employee_salaries_2025(date);
CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON stakeholder_withdrawals_2025(date);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);

-- =====================================================
-- 7. ADD UPDATED_AT TRIGGERS
-- =====================================================

-- Create function for updating timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables that need updated_at
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify inventory_items conversion
SELECT 'inventory_items UUID conversion' as check_name,
       COUNT(*) as total_items,
       COUNT(CASE WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuid_items
FROM inventory_items;

-- Verify foreign key relationships
SELECT 'Foreign key relationships' as check_name,
       COUNT(*) as total_employees_with_profiles
FROM employees e
JOIN user_profiles up ON e.user_profile_id = up.id;

-- Verify data type conversions
SELECT 'Data type conversions' as check_name,
       COUNT(*) as total_expenses,
       COUNT(CASE WHEN amount IS NOT NULL THEN 1 END) as numeric_amounts
FROM expenses_2025;

-- Verify RLS is enabled
SELECT 'RLS status' as check_name,
       schemaname,
       tablename,
       rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'employees', 'inventory_items', 'bookings')
ORDER BY tablename;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Insert migration record
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('Phase_1_Critical_Fixes_2025-01-27', NOW())
ON CONFLICT (version) DO NOTHING;

SELECT 'Phase 1 Critical Fixes completed successfully!' as status;
