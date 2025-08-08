-- =====================================================
-- Phase 2: Structure Improvements & Enhanced RLS
-- San Pedro Beach Resort Management System
-- Date: January 27, 2025
-- =====================================================

-- =====================================================
-- 1. COMPREHENSIVE RLS POLICIES
-- =====================================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Employees can view own data" ON employees;
DROP POLICY IF EXISTS "Managers can view all employees" ON employees;
DROP POLICY IF EXISTS "Public read access to inventory" ON inventory_items;
DROP POLICY IF EXISTS "Staff can manage inventory" ON inventory_items;
DROP POLICY IF EXISTS "Public read access to units" ON units;
DROP POLICY IF EXISTS "Staff can manage bookings" ON bookings;
DROP POLICY IF EXISTS "Admin/Manager financial access" ON expenses_2025;
DROP POLICY IF EXISTS "Admin/Manager salary access" ON employee_salaries_2025;

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =====================================================
-- EMPLOYEES POLICIES
-- =====================================================

-- Employees can view their own data
CREATE POLICY "Employees can view own data" ON employees
    FOR SELECT USING (auth.uid()::text = user_profile_id::text);

-- Managers and admins can view all employees
CREATE POLICY "Managers can view all employees" ON employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- Managers and admins can manage employees
CREATE POLICY "Managers can manage employees" ON employees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- =====================================================
-- INVENTORY POLICIES
-- =====================================================

-- Public read access to inventory items
CREATE POLICY "Public read access to inventory" ON inventory_items
    FOR SELECT USING (true);

-- Staff can manage inventory
CREATE POLICY "Staff can manage inventory" ON inventory_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- =====================================================
-- PRODUCT CATEGORIES POLICIES
-- =====================================================

-- Public read access to categories
CREATE POLICY "Public read access to categories" ON product_categories
    FOR SELECT USING (true);

-- Staff can manage categories
CREATE POLICY "Staff can manage categories" ON product_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- =====================================================
-- SUPPLIERS POLICIES
-- =====================================================

-- Staff can view suppliers
CREATE POLICY "Staff can view suppliers" ON suppliers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Managers and admins can manage suppliers
CREATE POLICY "Managers can manage suppliers" ON suppliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- =====================================================
-- UNITS POLICIES
-- =====================================================

-- Public read access to units
CREATE POLICY "Public read access to units" ON units
    FOR SELECT USING (true);

-- Staff can manage units
CREATE POLICY "Staff can manage units" ON units
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- =====================================================
-- BOOKINGS POLICIES
-- =====================================================

-- Staff can view all bookings
CREATE POLICY "Staff can view bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Staff can manage bookings
CREATE POLICY "Staff can manage bookings" ON bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Staff can view payments
CREATE POLICY "Staff can view payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Staff can manage payments
CREATE POLICY "Staff can manage payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Staff can view orders
CREATE POLICY "Staff can view orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Staff can manage orders
CREATE POLICY "Staff can manage orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- =====================================================
-- FINANCIAL POLICIES (ADMIN/MANAGER ONLY)
-- =====================================================

-- Expenses
CREATE POLICY "Admin/Manager financial access" ON expenses_2025
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- Salaries
CREATE POLICY "Admin/Manager salary access" ON employee_salaries_2025
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- Withdrawals
CREATE POLICY "Admin/Manager withdrawal access" ON stakeholder_withdrawals_2025
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- Employee advances
CREATE POLICY "Admin/Manager advance access" ON employee_advances
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- Money denominations
CREATE POLICY "Admin/Manager money access" ON money_denominations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager')
        )
    );

-- =====================================================
-- AUDIT & TRACKING POLICIES
-- =====================================================

-- Audit logs (admin only)
CREATE POLICY "Admin audit access" ON audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Inventory transactions
CREATE POLICY "Staff inventory transaction access" ON inventory_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Inventory counts
CREATE POLICY "Staff inventory count access" ON inventory_counts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Inventory count items
CREATE POLICY "Staff inventory count item access" ON inventory_count_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- =====================================================
-- GUESTS POLICIES
-- =====================================================

-- Staff can view guests
CREATE POLICY "Staff can view guests" ON guests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Staff can manage guests
CREATE POLICY "Staff can manage guests" ON guests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'employee')
        )
    );

-- =====================================================
-- 2. ADD MISSING CONSTRAINTS
-- =====================================================

-- Add NOT NULL constraints where appropriate
ALTER TABLE inventory_items 
ALTER COLUMN name SET NOT NULL;

ALTER TABLE user_profiles 
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN full_name SET NOT NULL,
ALTER COLUMN role SET NOT NULL;

ALTER TABLE employees 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Add unique constraints
ALTER TABLE user_profiles 
ADD CONSTRAINT unique_user_email UNIQUE (email);

ALTER TABLE inventory_items 
ADD CONSTRAINT unique_inventory_barcode UNIQUE (barcode);

-- Add check constraints for valid roles
ALTER TABLE user_profiles 
ADD CONSTRAINT valid_user_role CHECK (role IN ('admin', 'manager', 'employee', 'guest'));

-- Add check constraints for valid booking status
ALTER TABLE bookings 
ADD CONSTRAINT valid_booking_status CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'));

-- Add check constraints for valid payment status
ALTER TABLE payments 
ADD CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));

-- Add check constraints for valid order status
ALTER TABLE orders 
ADD CONSTRAINT valid_order_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed')),
ADD CONSTRAINT valid_order_pickup_status CHECK (pickup_status IN ('pending', 'ready', 'picked_up', 'cancelled'));

-- =====================================================
-- 3. ADD COMPOSITE INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_inventory_stock_price ON inventory_items(stock, price);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_dates ON bookings(guest_id, check_in_date);
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_email, payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_status ON payments(booking_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at);

-- =====================================================
-- 4. ADD TRIGGERS FOR AUDIT LOGGING
-- =====================================================

-- Create function for audit logging
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        table_name,
        action,
        record_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        auth.uid()::text,
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to important tables
DROP TRIGGER IF EXISTS audit_user_profiles ON user_profiles;
CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_employees ON employees;
CREATE TRIGGER audit_employees
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_inventory_items ON inventory_items;
CREATE TRIGGER audit_inventory_items
    AFTER INSERT OR UPDATE OR DELETE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_bookings ON bookings;
CREATE TRIGGER audit_bookings
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_orders ON orders;
CREATE TRIGGER audit_orders
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- =====================================================
-- 5. ADD HELPER FUNCTIONS
-- =====================================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_profiles 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_profiles 
        WHERE id = auth.uid()::text 
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has any of the required roles
CREATE OR REPLACE FUNCTION has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_profiles 
        WHERE id = auth.uid()::text 
        AND role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. ADD VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for inventory with category and supplier info
CREATE OR REPLACE VIEW inventory_with_details AS
SELECT 
    i.*,
    pc.name as category_name,
    s.name as supplier_name
FROM inventory_items i
LEFT JOIN product_categories pc ON i.category_id = pc.id
LEFT JOIN suppliers s ON i.supplier_id = s.id;

-- View for bookings with guest and unit info
CREATE OR REPLACE VIEW bookings_with_details AS
SELECT 
    b.*,
    g.first_name as guest_first_name,
    g.last_name as guest_last_name,
    g.email as guest_email,
    g.phone as guest_phone,
    u.name as unit_name,
    u.type as unit_type
FROM bookings b
LEFT JOIN guests g ON b.guest_id = g.id
LEFT JOIN units u ON b.unit_id = u.id;

-- View for orders with customer info
CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
    o.*,
    g.first_name as customer_first_name,
    g.last_name as customer_last_name,
    g.email as customer_email,
    g.phone as customer_phone
FROM orders o
LEFT JOIN guests g ON o.guest_id = g.id;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify RLS policies are created
SELECT 'RLS Policies' as check_name,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify constraints are added
SELECT 'Constraints' as check_name,
       conname,
       conrelid::regclass as table_name,
       contype,
       pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid::regnamespace::name = 'public'
ORDER BY conrelid::regclass, conname;

-- Verify indexes are created
SELECT 'Indexes' as check_name,
       schemaname,
       tablename,
       indexname,
       indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verify triggers are created
SELECT 'Triggers' as check_name,
       trigger_name,
       event_manipulation,
       event_object_table,
       action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Insert migration record
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('Phase_2_Structure_Improvements_2025-01-27', NOW())
ON CONFLICT (version) DO NOTHING;

SELECT 'Phase 2 Structure Improvements completed successfully!' as status;
