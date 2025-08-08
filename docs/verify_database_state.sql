-- =====================================================
-- Database State Verification Script
-- Date: 2025-01-27
-- Description: Verify the current state of the database after migrations
-- =====================================================

-- Check primary key types
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ UUID'
        WHEN data_type = 'integer' THEN '⚠️ INTEGER (needs UUID conversion)'
        ELSE '❓ ' || data_type
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'id'
AND table_name IN (
    'user_profiles', 'employees', 'inventory_items', 'bookings', 
    'guests', 'orders', 'payments', 'expenses_2025', 'employee_salaries_2025',
    'stakeholder_withdrawals_2025', 'employee_advances', 'money_denominations'
)
ORDER BY table_name;

-- Check data types for financial fields
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'numeric' THEN '✅ NUMERIC'
        WHEN data_type = 'text' THEN '⚠️ TEXT (needs conversion)'
        WHEN data_type = 'real' THEN '⚠️ REAL (needs conversion)'
        ELSE '❓ ' || data_type
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name IN ('amount', 'price', 'total_amount', 'total_value', 'totals')
ORDER BY table_name, column_name;

-- Check date fields
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'date' THEN '✅ DATE'
        WHEN data_type = 'text' THEN '⚠️ TEXT (needs conversion)'
        ELSE '❓ ' || data_type
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name IN ('date', 'check_in_date', 'check_out_date', 'created_at', 'updated_at')
ORDER BY table_name, column_name;

-- Check foreign key relationships
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✅ FK exists' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Check constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    '✅ Constraint exists' as status
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
AND tc.constraint_type IN ('CHECK', 'FOREIGN KEY', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_type;

-- Check indexes
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as index_scans,
    CASE 
        WHEN idx_scan > 0 THEN '✅ Used'
        ELSE '⚠️ Unused'
    END as usage_status
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC, relname, indexrelname;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Summary report
DO $$
DECLARE
    uuid_count INTEGER;
    numeric_count INTEGER;
    date_count INTEGER;
    fk_count INTEGER;
    constraint_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Count UUID primary keys
    SELECT COUNT(*) INTO uuid_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'id'
    AND data_type = 'uuid';
    
    -- Count numeric financial fields
    SELECT COUNT(*) INTO numeric_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name IN ('amount', 'price', 'total_amount', 'total_value', 'totals')
    AND data_type = 'numeric';
    
    -- Count date fields
    SELECT COUNT(*) INTO date_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name IN ('date', 'check_in_date', 'check_out_date')
    AND data_type = 'date';
    
    -- Count foreign keys
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND constraint_type = 'FOREIGN KEY';
    
    -- Count constraints
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND constraint_type = 'CHECK';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '=== DATABASE STATE SUMMARY ===';
    RAISE NOTICE 'UUID Primary Keys: %', uuid_count;
    RAISE NOTICE 'Numeric Financial Fields: %', numeric_count;
    RAISE NOTICE 'Date Fields: %', date_count;
    RAISE NOTICE 'Foreign Key Relationships: %', fk_count;
    RAISE NOTICE 'Data Validation Constraints: %', constraint_count;
    RAISE NOTICE 'Performance Indexes: %', index_count;
    RAISE NOTICE '================================';
END $$;
