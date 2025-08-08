-- =====================================================
-- Phase 3: Comprehensive Indexes & Performance Optimization
-- San Pedro Beach Resort Management System
-- Date: January 27, 2025
-- =====================================================

-- =====================================================
-- 1. COMPREHENSIVE INDEXING STRATEGY
-- =====================================================

-- =====================================================
-- INVENTORY INDEXES
-- =====================================================

-- Performance indexes for inventory queries
CREATE INDEX IF NOT EXISTS idx_inventory_items_name_lower ON inventory_items(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_inventory_items_category_lower ON inventory_items(LOWER(category));
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_lower ON inventory_items(LOWER(supplier));
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock_low ON inventory_items(stock) WHERE stock < 10;
CREATE INDEX IF NOT EXISTS idx_inventory_items_price_range ON inventory_items(price) WHERE price > 0;
CREATE INDEX IF NOT EXISTS idx_inventory_items_created_at ON inventory_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_items_updated_at ON inventory_items(updated_at DESC);

-- =====================================================
-- BOOKING INDEXES
-- =====================================================

-- Date range and availability indexes
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status_dates ON bookings(status, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_unit_dates ON bookings(unit_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_dates ON bookings(guest_id, check_in_date DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmed ON bookings(status, check_in_date) WHERE status = 'confirmed';

-- =====================================================
-- PAYMENT INDEXES
-- =====================================================

-- Payment tracking indexes
CREATE INDEX IF NOT EXISTS idx_payments_status_date ON payments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_booking_status ON payments(booking_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_amount_range ON payments(amount) WHERE amount > 0;
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(status, created_at) WHERE status = 'pending';

-- =====================================================
-- ORDER INDEXES
-- =====================================================

-- Order management indexes
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(payment_status, pickup_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_pending_pickup ON orders(payment_status, pickup_status) WHERE payment_status = 'paid' AND pickup_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_orders_ready_pickup ON orders(pickup_status, created_at) WHERE pickup_status = 'ready';
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount) WHERE total_amount > 0;

-- =====================================================
-- USER & EMPLOYEE INDEXES
-- =====================================================

-- User management indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(role, created_at) WHERE role IN ('admin', 'manager', 'employee');

-- Employee indexes
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_user_profile ON employees(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(position, created_at) WHERE position IS NOT NULL;

-- =====================================================
-- GUEST INDEXES
-- =====================================================

-- Guest management indexes
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_guests_created_at ON guests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guests_active ON guests(created_at) WHERE created_at > NOW() - INTERVAL '1 year';

-- =====================================================
-- FINANCIAL INDEXES
-- =====================================================

-- Expense tracking indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date_amount ON expenses_2025(date, amount);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses_2025(category);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses_2025(date) WHERE date >= DATE_TRUNC('month', CURRENT_DATE);
CREATE INDEX IF NOT EXISTS idx_expenses_large ON expenses_2025(amount) WHERE amount > 1000;

-- Salary indexes
CREATE INDEX IF NOT EXISTS idx_salaries_date_amount ON employee_salaries_2025(date, amount);
CREATE INDEX IF NOT EXISTS idx_salaries_employee ON employee_salaries_2025(employee_name);
CREATE INDEX IF NOT EXISTS idx_salaries_month ON employee_salaries_2025(date) WHERE date >= DATE_TRUNC('month', CURRENT_DATE);

-- Withdrawal indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_date_amount ON stakeholder_withdrawals_2025(date, amount);
CREATE INDEX IF NOT EXISTS idx_withdrawals_month ON stakeholder_withdrawals_2025(date) WHERE date >= DATE_TRUNC('month', CURRENT_DATE);

-- =====================================================
-- AUDIT & TRACKING INDEXES
-- =====================================================

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action ON audit_logs(table_name, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_recent ON audit_logs(created_at DESC) WHERE created_at > NOW() - INTERVAL '30 days';
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);

-- Inventory transaction indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_recent ON inventory_transactions(created_at DESC) WHERE created_at > NOW() - INTERVAL '7 days';

-- Inventory count indexes
CREATE INDEX IF NOT EXISTS idx_inventory_counts_date ON inventory_counts(count_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_status ON inventory_counts(status);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_recent ON inventory_counts(count_date DESC) WHERE count_date > NOW() - INTERVAL '30 days';

-- =====================================================
-- 2. PARTIAL INDEXES FOR COMMON QUERIES
-- =====================================================

-- Active inventory items (in stock)
CREATE INDEX IF NOT EXISTS idx_inventory_active ON inventory_items(id, name, stock, price) WHERE stock > 0;

-- Pending bookings
CREATE INDEX IF NOT EXISTS idx_bookings_pending ON bookings(id, guest_id, unit_id, check_in_date) WHERE status = 'pending';

-- Pending payments
CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(id, booking_id, amount) WHERE status = 'pending';

-- Ready for pickup orders
CREATE INDEX IF NOT EXISTS idx_orders_ready ON orders(id, customer_email, total_amount) WHERE pickup_status = 'ready';

-- Low stock items
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory_items(id, name, stock) WHERE stock <= 5;

-- Recent audit events
CREATE INDEX IF NOT EXISTS idx_audit_recent ON audit_logs(id, user_id, table_name, action) WHERE created_at > NOW() - INTERVAL '7 days';

-- =====================================================
-- 3. FUNCTIONAL INDEXES
-- =====================================================

-- Case-insensitive search indexes
CREATE INDEX IF NOT EXISTS idx_inventory_name_ci ON inventory_items(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_guests_name_ci ON guests(LOWER(first_name), LOWER(last_name));
CREATE INDEX IF NOT EXISTS idx_employees_name_ci ON employees(LOWER(first_name), LOWER(last_name));

-- Date-based indexes
CREATE INDEX IF NOT EXISTS idx_bookings_checkin_month ON bookings(DATE_TRUNC('month', check_in_date));
CREATE INDEX IF NOT EXISTS idx_payments_created_month ON payments(DATE_TRUNC('month', created_at));
CREATE INDEX IF NOT EXISTS idx_orders_created_month ON orders(DATE_TRUNC('month', created_at));

-- =====================================================
-- 4. COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =====================================================

-- Multi-column indexes for complex filtering
CREATE INDEX IF NOT EXISTS idx_inventory_category_stock_price ON inventory_items(category, stock, price);
CREATE INDEX IF NOT EXISTS idx_bookings_unit_status_dates ON bookings(unit_id, status, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_orders_status_customer_date ON orders(payment_status, pickup_status, customer_email, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_booking_status_date ON payments(booking_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_table_date ON audit_logs(user_id, table_name, created_at DESC);

-- =====================================================
-- 5. STATISTICS AND ANALYTICS INDEXES
-- =====================================================

-- Revenue tracking indexes
CREATE INDEX IF NOT EXISTS idx_payments_daily_revenue ON payments(DATE(created_at), amount) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_orders_daily_sales ON orders(DATE(created_at), total_amount) WHERE payment_status = 'paid';

-- Inventory movement indexes
CREATE INDEX IF NOT EXISTS idx_transactions_daily ON inventory_transactions(DATE(created_at), transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_item_daily ON inventory_transactions(item_id, DATE(created_at));

-- Booking analytics indexes
CREATE INDEX IF NOT EXISTS idx_bookings_monthly ON bookings(DATE_TRUNC('month', check_in_date), status);
CREATE INDEX IF NOT EXISTS idx_bookings_unit_monthly ON bookings(unit_id, DATE_TRUNC('month', check_in_date));

-- =====================================================
-- 6. PERFORMANCE MONITORING VIEWS
-- =====================================================

-- View for inventory performance
CREATE OR REPLACE VIEW inventory_performance AS
SELECT 
    i.id,
    i.name,
    i.category,
    i.stock,
    i.price,
    i.cost,
    (i.price - i.cost) as profit_margin,
    CASE 
        WHEN i.stock = 0 THEN 'Out of Stock'
        WHEN i.stock <= 5 THEN 'Low Stock'
        WHEN i.stock <= 10 THEN 'Medium Stock'
        ELSE 'Well Stocked'
    END as stock_status,
    COUNT(it.id) as transaction_count,
    MAX(it.created_at) as last_transaction
FROM inventory_items i
LEFT JOIN inventory_transactions it ON i.id = it.item_id
GROUP BY i.id, i.name, i.category, i.stock, i.price, i.cost;

-- View for booking performance
CREATE OR REPLACE VIEW booking_performance AS
SELECT 
    u.id as unit_id,
    u.name as unit_name,
    u.type as unit_type,
    COUNT(b.id) as total_bookings,
    COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN b.status = 'checked_in' THEN 1 END) as active_bookings,
    AVG(EXTRACT(DAY FROM (b.check_out_date - b.check_in_date))) as avg_stay_days,
    SUM(p.amount) as total_revenue
FROM units u
LEFT JOIN bookings b ON u.id = b.unit_id
LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
GROUP BY u.id, u.name, u.type;

-- View for financial summary
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
    AVG(CASE WHEN status = 'completed' THEN amount END) as avg_payment_amount
FROM payments
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- =====================================================
-- 7. MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to analyze index usage
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
    index_name TEXT,
    table_name TEXT,
    index_size TEXT,
    index_scans BIGINT,
    index_tuples_read BIGINT,
    index_tuples_fetched BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.indexname::TEXT,
        i.tablename::TEXT,
        pg_size_pretty(pg_relation_size(i.indexname::regclass))::TEXT,
        s.idx_scan,
        s.idx_tup_read,
        s.idx_tup_fetch
    FROM pg_indexes i
    LEFT JOIN pg_stat_user_indexes s ON i.indexname = s.indexrelname
    WHERE i.schemaname = 'public'
    ORDER BY pg_relation_size(i.indexname::regclass) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get table sizes
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
    table_name TEXT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        pg_size_pretty(pg_total_relation_size(t.table_name::regclass))::TEXT,
        pg_size_pretty(pg_indexes_size(t.table_name::regclass))::TEXT,
        pg_size_pretty(pg_total_relation_size(t.table_name::regclass))::TEXT
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    ORDER BY pg_total_relation_size(t.table_name::regclass) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. AUTOMATIC MAINTENANCE TRIGGERS
-- =====================================================

-- Function to update statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS VOID AS $$
BEGIN
    -- Update statistics for all tables
    ANALYZE user_profiles;
    ANALYZE employees;
    ANALYZE guests;
    ANALYZE units;
    ANALYZE bookings;
    ANALYZE payments;
    ANALYZE inventory_items;
    ANALYZE orders;
    ANALYZE audit_logs;
    ANALYZE inventory_transactions;
    ANALYZE inventory_counts;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify indexes are created
SELECT 'Indexes Created' as check_name,
       COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- Verify partial indexes
SELECT 'Partial Indexes' as check_name,
       indexname,
       indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexdef LIKE '%WHERE%'
ORDER BY indexname;

-- Verify functional indexes
SELECT 'Functional Indexes' as check_name,
       indexname,
       indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexdef LIKE '%LOWER(%'
ORDER BY indexname;

-- Check index sizes
SELECT 'Index Sizes' as check_name,
       indexname,
       pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexname::regclass) DESC
LIMIT 10;

-- Verify views are created
SELECT 'Views Created' as check_name,
       viewname,
       definition
FROM pg_views
WHERE schemaname = 'public'
AND viewname LIKE '%_performance' OR viewname LIKE '%_summary'
ORDER BY viewname;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Insert migration record
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('Phase_3_Comprehensive_Indexes_2025-01-27', NOW())
ON CONFLICT (version) DO NOTHING;

-- Update statistics
SELECT update_table_statistics();

SELECT 'Phase 3 Comprehensive Indexes completed successfully!' as status;
