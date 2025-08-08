-- 🧹 Database Cleanup Script for San Pedro Beach Resort
-- Run this script in Supabase SQL Editor to clean up and optimize the database

-- 1. Clean up unused indexes
-- Remove indexes that are no longer needed
-- (Add specific indexes to remove based on your schema)

-- 2. Analyze table statistics for better query planning
ANALYZE;

-- 3. Vacuum tables to reclaim storage and update statistics
VACUUM ANALYZE;

-- 4. Clean up audit logs older than 90 days (if audit_logs table exists)
-- DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- 5. Clean up expired sessions (if using custom session management)
-- DELETE FROM user_sessions WHERE expires_at < NOW();

-- 6. Update table statistics for better performance
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY tablename, attname;

-- 7. Check for unused tables (review before dropping)
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT IN (
    'user_profiles', 'bookings', 'guests', 'units', 'payments',
    'employees', 'rental_units_pricing', 'inventory_items',
    'expenses_2025', 'employee_salaries_2025', 'stakeholder_withdrawals_2025',
    'employee_advances', 'money_denominations', 'audit_logs'
  );

-- 8. Check for unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- 9. Check table sizes and bloat
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 10. Check for long-running queries (if any)
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
  AND state = 'active';

-- 11. Clean up temporary files and connections
-- This is handled automatically by Supabase

-- 12. Verify RLS policies are working correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 13. Check for any orphaned records
-- Example: Check for bookings without valid guests
-- SELECT b.id, b.guest_id FROM bookings b 
-- LEFT JOIN guests g ON b.guest_id = g.id 
-- WHERE g.id IS NULL;

-- 14. Verify foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';

-- 15. Performance optimization recommendations
-- Check for missing indexes on frequently queried columns
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
  AND n_distinct > 100  -- Columns with high cardinality
  AND correlation < 0.1  -- Low correlation (good for indexes)
ORDER BY n_distinct DESC;

-- 16. Clean up any test data (uncomment and modify as needed)
-- DELETE FROM test_table WHERE created_at < NOW() - INTERVAL '7 days';

-- 17. Verify data integrity
-- Check for duplicate records in critical tables
-- SELECT guest_id, COUNT(*) FROM bookings GROUP BY guest_id HAVING COUNT(*) > 1;

-- 18. Update sequence values if needed
-- SELECT setval('table_name_id_seq', (SELECT MAX(id) FROM table_name));

-- 19. Check for any locked tables or deadlocks
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity 
WHERE state = 'active' 
  AND pid <> pg_backend_pid();

-- 20. Final verification - check overall database health
SELECT 
    'Database cleanup completed successfully' as status,
    NOW() as cleanup_time,
    version() as postgres_version;
