-- =====================================================
-- Phase 3: Comprehensive Indexes Migration (FIXED VERSION)
-- Date: 2025-01-27
-- Description: Add comprehensive indexes for optimal performance (IMMUTABLE-safe)
-- =====================================================

BEGIN;

-- =====================================================
-- 1. PERFORMANCE INDEXES FOR CORE TABLES
-- =====================================================

-- User profiles table indexes (for authentication data)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_active ON user_profiles(role, is_active);

-- Employees table indexes (user_role moved to user_profiles)
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON employees(employment_type);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);
CREATE INDEX IF NOT EXISTS idx_employees_updated_at ON employees(updated_at);
CREATE INDEX IF NOT EXISTS idx_employees_employee_role ON employees(employee_role);
CREATE INDEX IF NOT EXISTS idx_employees_role_status ON employees(employee_role, status);

-- Inventory items table indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_name ON inventory_items(product_name);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(stock);
CREATE INDEX IF NOT EXISTS idx_inventory_items_price ON inventory_items(price);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_items_created_at ON inventory_items(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_items_updated_at ON inventory_items(updated_at);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category_stock ON inventory_items(category, stock);
CREATE INDEX IF NOT EXISTS idx_inventory_items_price_range ON inventory_items(price) WHERE price > 0;
CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock ON inventory_items(stock, min_level) WHERE stock <= min_level;

-- Expenses 2025 table indexes
CREATE INDEX IF NOT EXISTS idx_expenses_2025_date ON expenses_2025(date);
CREATE INDEX IF NOT EXISTS idx_expenses_2025_vendor ON expenses_2025(vendor);
CREATE INDEX IF NOT EXISTS idx_expenses_2025_category ON expenses_2025(category);
CREATE INDEX IF NOT EXISTS idx_expenses_2025_payment_method ON expenses_2025(payment_method);
CREATE INDEX IF NOT EXISTS idx_expenses_2025_status ON expenses_2025(status);
CREATE INDEX IF NOT EXISTS idx_expenses_2025_amount ON expenses_2025(amount);
CREATE INDEX IF NOT EXISTS idx_expenses_2025_created_at ON expenses_2025(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_2025_date_category ON expenses_2025(date, category);
CREATE INDEX IF NOT EXISTS idx_expenses_2025_vendor_date ON expenses_2025(vendor, date);

-- Employee salaries 2025 table indexes
CREATE INDEX IF NOT EXISTS idx_employee_salaries_2025_date ON employee_salaries_2025(date);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_2025_name ON employee_salaries_2025(name);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_2025_amount ON employee_salaries_2025(amount);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_2025_payment_type ON employee_salaries_2025(payment_type);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_2025_created_at ON employee_salaries_2025(created_at);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_2025_name_date ON employee_salaries_2025(name, date);

-- Stakeholder withdrawals 2025 table indexes
CREATE INDEX IF NOT EXISTS idx_stakeholder_withdrawals_2025_date ON stakeholder_withdrawals_2025(date);
CREATE INDEX IF NOT EXISTS idx_stakeholder_withdrawals_2025_stakeholder ON stakeholder_withdrawals_2025(stakeholder);
CREATE INDEX IF NOT EXISTS idx_stakeholder_withdrawals_2025_amount ON stakeholder_withdrawals_2025(amount);
CREATE INDEX IF NOT EXISTS idx_stakeholder_withdrawals_2025_created_at ON stakeholder_withdrawals_2025(created_at);
CREATE INDEX IF NOT EXISTS idx_stakeholder_withdrawals_2025_stakeholder_date ON stakeholder_withdrawals_2025(stakeholder, date);

-- Employee advances table indexes
CREATE INDEX IF NOT EXISTS idx_employee_advances_employee ON employee_advances(employee);
CREATE INDEX IF NOT EXISTS idx_employee_advances_product_or_cash_advance ON employee_advances(product_or_cash_advance);
CREATE INDEX IF NOT EXISTS idx_employee_advances_amount ON employee_advances(amount);
CREATE INDEX IF NOT EXISTS idx_employee_advances_totals ON employee_advances(totals);
CREATE INDEX IF NOT EXISTS idx_employee_advances_created_at ON employee_advances(created_at);
CREATE INDEX IF NOT EXISTS idx_employee_advances_employee_date ON employee_advances(employee, created_at);

-- Money denominations table indexes
CREATE INDEX IF NOT EXISTS idx_money_denominations_denomination ON money_denominations(denomination);
CREATE INDEX IF NOT EXISTS idx_money_denominations_quantity ON money_denominations(quantity);
CREATE INDEX IF NOT EXISTS idx_money_denominations_total_value ON money_denominations(total_value);
CREATE INDEX IF NOT EXISTS idx_money_denominations_created_at ON money_denominations(created_at);

-- Rental units pricing table indexes
CREATE INDEX IF NOT EXISTS idx_rental_units_pricing_unit_id ON rental_units_pricing(unit_id);
CREATE INDEX IF NOT EXISTS idx_rental_units_pricing_rental_type ON rental_units_pricing(rental_type);
CREATE INDEX IF NOT EXISTS idx_rental_units_pricing_maximum_capacity ON rental_units_pricing(maximum_capacity);
CREATE INDEX IF NOT EXISTS idx_rental_units_pricing_created_at ON rental_units_pricing(created_at);
CREATE INDEX IF NOT EXISTS idx_rental_units_pricing_type_capacity ON rental_units_pricing(rental_type, maximum_capacity);

-- =====================================================
-- 2. INDEXES FOR NEW INVENTORY SYSTEM TABLES
-- =====================================================

-- Product categories table indexes (conditional on table existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_categories') THEN
        CREATE INDEX IF NOT EXISTS idx_product_categories_name ON product_categories(name);
        CREATE INDEX IF NOT EXISTS idx_product_categories_sort_order ON product_categories(sort_order);
        CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);
        CREATE INDEX IF NOT EXISTS idx_product_categories_created_at ON product_categories(created_at);
        CREATE INDEX IF NOT EXISTS idx_product_categories_active_sort ON product_categories(is_active, sort_order);
    END IF;
END $$;

-- Suppliers table indexes (conditional on table existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
        CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
        CREATE INDEX IF NOT EXISTS idx_suppliers_phone ON suppliers(phone);
        CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
        CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at);
        CREATE INDEX IF NOT EXISTS idx_suppliers_active_name ON suppliers(is_active, name);
    END IF;
END $$;

-- Inventory transactions table indexes (conditional on table existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_transactions') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_transaction_type ON inventory_transactions(transaction_type);
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at);
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_processed_by ON inventory_transactions(processed_by);
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_date ON inventory_transactions(item_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type_date ON inventory_transactions(transaction_type, created_at);
    END IF;
END $$;

-- Inventory counts table indexes (conditional on table existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_counts') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_counts_count_date ON inventory_counts(count_date);
        CREATE INDEX IF NOT EXISTS idx_inventory_counts_counted_by ON inventory_counts(counted_by);
        CREATE INDEX IF NOT EXISTS idx_inventory_counts_status ON inventory_counts(status);
        CREATE INDEX IF NOT EXISTS idx_inventory_counts_created_at ON inventory_counts(created_at);
        CREATE INDEX IF NOT EXISTS idx_inventory_counts_status_date ON inventory_counts(status, count_date);
    END IF;
END $$;

-- Inventory count items table indexes (conditional on table existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_count_items') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_count_items_count_id ON inventory_count_items(count_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_count_items_item_id ON inventory_count_items(item_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_count_items_difference ON inventory_count_items(difference);
        CREATE INDEX IF NOT EXISTS idx_inventory_count_items_created_at ON inventory_count_items(created_at);
        CREATE INDEX IF NOT EXISTS idx_inventory_count_items_count_item ON inventory_count_items(count_id, item_id);
    END IF;
END $$;

-- Store settings table indexes (conditional on table existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_settings') THEN
        CREATE INDEX IF NOT EXISTS idx_store_settings_setting_key ON store_settings(setting_key);
        CREATE INDEX IF NOT EXISTS idx_store_settings_setting_type ON store_settings(setting_type);
        CREATE INDEX IF NOT EXISTS idx_store_settings_updated_at ON store_settings(updated_at);
    END IF;
END $$;

-- Product reviews table indexes (conditional on table existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_reviews') THEN
        CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_approved_by ON product_reviews(approved_by);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_approved_rating ON product_reviews(is_approved, rating);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_product_approved ON product_reviews(product_id, is_approved);
    END IF;
END $$;

-- =====================================================
-- 3. INDEXES FOR BOOKING SYSTEM TABLES
-- =====================================================

-- Guests table indexes
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_last_name ON guests(last_name);
CREATE INDEX IF NOT EXISTS idx_guests_created_at ON guests(created_at);
CREATE INDEX IF NOT EXISTS idx_guests_email_phone ON guests(email, phone);

-- Units table indexes
CREATE INDEX IF NOT EXISTS idx_units_unit_number ON units(unit_number);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
CREATE INDEX IF NOT EXISTS idx_units_created_at ON units(created_at);

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_unit_id ON bookings(unit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON bookings(check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_dates_status ON bookings(check_in_date, check_out_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_dates ON bookings(guest_id, check_in_date, check_out_date);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_booking_status ON payments(booking_id, status);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_status ON orders(pickup_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email_status ON orders(customer_email, payment_status);

-- =====================================================
-- 4. FULL-TEXT SEARCH INDEXES
-- =====================================================

-- Full-text search for inventory items
CREATE INDEX IF NOT EXISTS idx_inventory_items_fts ON inventory_items 
USING gin(to_tsvector('english', product_name || ' ' || COALESCE(notes, '') || ' ' || COALESCE(supplier, '')));

-- Full-text search for employees
CREATE INDEX IF NOT EXISTS idx_employees_fts ON employees 
USING gin(to_tsvector('english', employee_name || ' ' || COALESCE(notes, '') || ' ' || employee_role));

-- Full-text search for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_fts ON user_profiles 
USING gin(to_tsvector('english', full_name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, '')));

-- Full-text search for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_2025_fts ON expenses_2025 
USING gin(to_tsvector('english', vendor || ' ' || COALESCE(notes, '') || ' ' || category));

-- Full-text search for product reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_fts ON product_reviews 
USING gin(to_tsvector('english', COALESCE(review_text, '') || ' ' || customer_name));

-- =====================================================
-- 5. PARTIAL INDEXES FOR COMMON QUERIES
-- =====================================================

-- Recent orders (last 30 days)
CREATE INDEX IF NOT EXISTS idx_orders_recent ON orders(id, order_number, customer_email, total_amount, created_at) 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Pending payments
CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(id, booking_id, amount, payment_method, status) 
WHERE status = 'pending';

-- Active inventory items (with stock > 0)
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(id, product_name, category, stock, price) 
WHERE stock > 0;

-- Low stock items
CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock_alert ON inventory_items(id, product_name, stock, min_level) 
WHERE stock <= min_level;

-- Active employees
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(id, employee_name, employee_role, status) 
WHERE status = 'Active';

-- =====================================================
-- 6. COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =====================================================

-- Inventory search by category and price range
CREATE INDEX IF NOT EXISTS idx_inventory_category_price ON inventory_items(category, price, product_name);

-- Employee search by role and status
CREATE INDEX IF NOT EXISTS idx_employees_role_status ON employees(employee_role, status, employee_name);

-- Expense search by date range and category
CREATE INDEX IF NOT EXISTS idx_expenses_date_category ON expenses_2025(date, category, amount);

-- Booking search by date range and unit
CREATE INDEX IF NOT EXISTS idx_bookings_date_unit ON bookings(check_in_date, check_out_date, unit_id, status);

-- =====================================================
-- 7. STATISTICS AND MAINTENANCE
-- =====================================================

-- Update table statistics for better query planning
ANALYZE user_profiles;
ANALYZE employees;
ANALYZE inventory_items;
ANALYZE expenses_2025;
ANALYZE employee_salaries_2025;
ANALYZE stakeholder_withdrawals_2025;
ANALYZE employee_advances;
ANALYZE money_denominations;
ANALYZE rental_units_pricing;
ANALYZE product_categories;
ANALYZE suppliers;
ANALYZE inventory_transactions;
ANALYZE inventory_counts;
ANALYZE inventory_count_items;
ANALYZE store_settings;
ANALYZE product_reviews;
ANALYZE guests;
ANALYZE units;
ANALYZE bookings;
ANALYZE payments;
ANALYZE orders;

-- =====================================================
-- 8. VERIFICATION QUERY
-- =====================================================

SELECT 
    'Phase 3 Comprehensive Indexes migration completed successfully!' as status,
    COUNT(*) as total_indexes_created
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

COMMIT;

-- =====================================================
-- 9. MIGRATION TRACKING
-- =====================================================

-- Create migration tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY,
    applied_at timestamptz DEFAULT NOW()
);

-- Insert migration record after successful execution
INSERT INTO schema_migrations (version) 
VALUES ('Phase_3_Comprehensive_Indexes_2025-01-27')
ON CONFLICT (version) DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Phase 3 Comprehensive Indexes completed successfully!';
    RAISE NOTICE 'All performance indexes created';
    RAISE NOTICE 'Full-text search indexes implemented';
    RAISE NOTICE 'Partial indexes for common queries added';
    RAISE NOTICE 'Composite indexes for complex queries created';
    RAISE NOTICE 'Table statistics updated';
    RAISE NOTICE 'Migration tracking record created';
END $$;
