-- 🔒 Security Policies for San Pedro Beach Resort
-- Run this script in your Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_units_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_salaries_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_withdrawals_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_denominations ENABLE ROW LEVEL SECURITY;

-- 2. User Profiles Policies
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Only admins can insert/delete profiles
CREATE POLICY "Only admins can manage profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Bookings Policies
-- Staff can view all bookings
CREATE POLICY "Staff can view bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
    )
  );

-- Only staff can create/update bookings
CREATE POLICY "Staff can manage bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
    )
  );

-- 4. Payments Policies
-- Only authorized staff can view payments
CREATE POLICY "Authorized staff can view payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Only managers and admins can create payments
CREATE POLICY "Managers can create payments" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 5. Guests Policies
-- Staff can view all guest information
CREATE POLICY "Staff can view guests" ON guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
    )
  );

-- Only staff can manage guest data
CREATE POLICY "Staff can manage guests" ON guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
    )
  );

-- 6. Units Policies
-- Staff can view all units
CREATE POLICY "Staff can view units" ON units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
    )
  );

-- Only managers and admins can update units
CREATE POLICY "Managers can update units" ON units
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 7. Financial Data Policies (High Security)
-- Only admins and managers can view financial data
CREATE POLICY "Financial data access" ON expenses_2025
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Salary data access" ON employee_salaries_2025
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Withdrawal data access" ON stakeholder_withdrawals_2025
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 8. Inventory Policies
-- Staff can view inventory
CREATE POLICY "Staff can view inventory" ON inventory_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
    )
  );

-- Only managers and admins can update inventory
CREATE POLICY "Managers can update inventory" ON inventory_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 9. Pricing Policies
-- Public read access for pricing (needed for booking)
CREATE POLICY "Public can view pricing" ON rental_units_pricing
  FOR SELECT USING (true);

-- Only admins can update pricing
CREATE POLICY "Only admins can update pricing" ON rental_units_pricing
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 10. Employee Data Policies
-- Only admins can view employee data
CREATE POLICY "Only admins can view employees" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can manage employee data
CREATE POLICY "Only admins can manage employees" ON employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 11. Money Denominations (Cash Management)
-- Only managers and admins can access cash management
CREATE POLICY "Cash management access" ON money_denominations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 12. Employee Advances
-- Only managers and admins can view advances
CREATE POLICY "Advance management access" ON employee_advances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 13. Audit Logging (Optional - for advanced security)
-- Create an audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_audit_event(UUID) TO authenticated;

-- 14. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- 15. Enable SSL (usually enabled by default in Supabase)
-- Check SSL status
SELECT name, setting FROM pg_settings WHERE name = 'ssl';

-- 16. Set up connection limits (optional)
-- This would be configured in Supabase dashboard
-- ALTER SYSTEM SET max_connections = 100;

-- 17. Enable query logging for security monitoring
-- This would be configured in Supabase dashboard
-- ALTER SYSTEM SET log_statement = 'all';

-- 18. Create a function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  required_role TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_user_permission(TEXT) TO authenticated;

-- 19. Create a function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated;

-- 20. Final security check
-- Verify all tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'user_profiles', 'bookings', 'guests', 'units', 
    'payments', 'employees', 'rental_units_pricing', 
    'inventory_items', 'expenses_2025', 'employee_salaries_2025',
    'stakeholder_withdrawals_2025', 'employee_advances', 
    'money_denominations', 'audit_logs'
  );

-- Show all policies
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
