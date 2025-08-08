-- Create Row Level Security Policies
-- This script creates comprehensive RLS policies for role-based access control

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles" ON user_profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- EMPLOYEES POLICIES
-- =====================================================

-- Employees can view their own data
CREATE POLICY "Employees can view own data" ON employees
FOR SELECT USING (user_profile_id = auth.uid());

-- Managers and admins can view all employees
CREATE POLICY "Managers can view all employees" ON employees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- Only admins can manage employees
CREATE POLICY "Admins can manage employees" ON employees
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- INVENTORY POLICIES
-- =====================================================

-- All authenticated users can view inventory
CREATE POLICY "Authenticated users can view inventory" ON inventory_items
FOR SELECT USING (auth.role() = 'authenticated');

-- Employees and above can update inventory
CREATE POLICY "Staff can update inventory" ON inventory_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
  )
);

-- Only managers and admins can insert/delete inventory
CREATE POLICY "Managers can manage inventory" ON inventory_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- =====================================================
-- BOOKINGS POLICIES
-- =====================================================

-- All authenticated users can view bookings
CREATE POLICY "Authenticated users can view bookings" ON bookings
FOR SELECT USING (auth.role() = 'authenticated');

-- Employees and above can update bookings
CREATE POLICY "Staff can update bookings" ON bookings
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
  )
);

-- Only managers and admins can create/delete bookings
CREATE POLICY "Managers can manage bookings" ON bookings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- =====================================================
-- FINANCIAL POLICIES (RESTRICTED)
-- =====================================================

-- Only managers and admins can view financial data
CREATE POLICY "Managers can view financial data" ON expenses_2025
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Managers can view salary data" ON employee_salaries_2025
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Managers can view withdrawal data" ON stakeholder_withdrawals_2025
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- Only admins can modify financial data
CREATE POLICY "Admins can manage financial data" ON expenses_2025
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage salary data" ON employee_salaries_2025
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage withdrawal data" ON stakeholder_withdrawals_2025
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- PUBLIC ACCESS POLICIES
-- =====================================================

-- Public read access for units (for booking display)
CREATE POLICY "Public can view units" ON units
FOR SELECT USING (true);

-- Public read access for product categories
CREATE POLICY "Public can view categories" ON product_categories
FOR SELECT USING (true);

-- Public read access for suppliers
CREATE POLICY "Public can view suppliers" ON suppliers
FOR SELECT USING (true);

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- All authenticated users can view orders
CREATE POLICY "Authenticated users can view orders" ON orders
FOR SELECT USING (auth.role() = 'authenticated');

-- Employees and above can update orders
CREATE POLICY "Staff can update orders" ON orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
  )
);

-- All users can create orders (for customers)
CREATE POLICY "Users can create orders" ON orders
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only managers and admins can delete orders
CREATE POLICY "Managers can delete orders" ON orders
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- System can insert audit logs (no user check)
CREATE POLICY "System can insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (true);

-- =====================================================
-- INVENTORY TRANSACTIONS POLICIES
-- =====================================================

-- Staff can view inventory transactions
CREATE POLICY "Staff can view inventory transactions" ON inventory_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
  )
);

-- Staff can create inventory transactions
CREATE POLICY "Staff can create inventory transactions" ON inventory_transactions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
  )
);

-- Only managers and admins can modify inventory transactions
CREATE POLICY "Managers can modify inventory transactions" ON inventory_transactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- =====================================================
-- INVENTORY COUNTS POLICIES
-- =====================================================

-- Staff can view inventory counts
CREATE POLICY "Staff can view inventory counts" ON inventory_counts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
  )
);

-- Managers and admins can manage inventory counts
CREATE POLICY "Managers can manage inventory counts" ON inventory_counts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- Staff can view inventory count items
CREATE POLICY "Staff can view inventory count items" ON inventory_count_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')
  )
);

-- Managers and admins can manage inventory count items
CREATE POLICY "Managers can manage inventory count items" ON inventory_count_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);
