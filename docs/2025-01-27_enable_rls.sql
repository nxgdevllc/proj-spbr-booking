-- Enable Row Level Security on All Tables
-- This script enables RLS on all tables for security

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

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User profiles with RLS enabled for authentication';
COMMENT ON TABLE employees IS 'Employee data with RLS enabled for role-based access';
COMMENT ON TABLE inventory_items IS 'Inventory items with RLS enabled for staff access';
COMMENT ON TABLE bookings IS 'Booking data with RLS enabled for staff access';
COMMENT ON TABLE expenses_2025 IS 'Financial data with RLS enabled for restricted access';
