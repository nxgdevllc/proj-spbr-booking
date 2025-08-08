-- Improved Supabase Schema with Proper ID Columns
-- This schema adds unique ID columns to all tables for better data management

-- DROP all tables first (in case of pre-existing)
DROP TABLE IF EXISTS "employees";
DROP TABLE IF EXISTS "expenses_2025";
DROP TABLE IF EXISTS "inventory_items";
DROP TABLE IF EXISTS "money_denominations";
DROP TABLE IF EXISTS "employee_salaries_2025";
DROP TABLE IF EXISTS "stakeholder_withdrawals_2025";
DROP TABLE IF EXISTS "employee_advances";
DROP TABLE IF EXISTS "rental_units_pricing";

-- Table: employees (now serves as users table)
CREATE TABLE "employees" (
  "id" SERIAL PRIMARY KEY,
  "employee_name" TEXT NOT NULL,
  "employee_role" TEXT NOT NULL,
  "employment_type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active',
  
  "monthly_pay" TEX
  T,
  "weekly_pay" TEXT,
  "daily_pay" TEXT,
  "notes" TEXT,
  -- Authentication fields
  "username" TEXT UNIQUE,
  "email" TEXT UNIQUE,
  "password_hash" TEXT,
  "user_role" TEXT NOT NULL DEFAULT 'employee' CHECK (user_role IN ('employee', 'manager', 'stakeholder', 'admin')),
  "last_login" TIMESTAMPTZ,
  "password_reset_token" TEXT,
  "password_reset_expires" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table: expenses_2025
CREATE TABLE "expenses_2025" (
  "id" SERIAL PRIMARY KEY,
  "receipt_number" REAL,
  "date" TEXT NOT NULL,
  "amount" TEXT NOT NULL,
  "payment_method" TEXT NOT NULL,
  "vendor" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "project" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Closed',
  "closed_by" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table: inventory_items
CREATE TABLE "inventory_items" (
  "id" SERIAL PRIMARY KEY,
  "sid" TEXT UNIQUE NOT NULL,
  "category" TEXT NOT NULL,
  "product_name" TEXT NOT NULL,
  "stock" REAL DEFAULT 0,
  "size" TEXT,
  "units" TEXT,
  "price" REAL DEFAULT 0,
  "min_level" REAL DEFAULT 0,
  "supplier" TEXT,
  "barcode" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table: money_denominations
CREATE TABLE "money_denominations" (
  "id" SERIAL PRIMARY KEY,
  "denomination" TEXT UNIQUE NOT NULL,
  "quantity" REAL DEFAULT 0,
  "total_value" REAL DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table: employee_salaries_2025
CREATE TABLE "employee_salaries_2025" (
  "id" SERIAL PRIMARY KEY,
  "date" TEXT NOT NULL,
  "amount" REAL NOT NULL,
  "name" TEXT NOT NULL,
  "notes" TEXT,
  "payment_type" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table: stakeholder_withdrawals_2025
CREATE TABLE "stakeholder_withdrawals_2025" (
  "id" SERIAL PRIMARY KEY,
  "date" TEXT NOT NULL,
  "amount" REAL NOT NULL,
  "stakeholder" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table: employee_advances
CREATE TABLE "employee_advances" (
  "id" SERIAL PRIMARY KEY,
  "employee" TEXT NOT NULL,
  "product_or_cash_advance" TEXT NOT NULL,
  "amount" REAL DEFAULT 0,
  "notes" TEXT,
  "totals" REAL DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table: rental_units_pricing
CREATE TABLE "rental_units_pricing" (
  "id" SERIAL PRIMARY KEY,
  "unit_id" TEXT UNIQUE NOT NULL,
  "rental_type" TEXT NOT NULL,
  "maximum_capacity" REAL,
  "day_rate" TEXT,
  "ci_day_time" TEXT,
  "co_day_time" TEXT,
  "night_rate" TEXT,
  "ci_night_time" TEXT,
  "co_night_time" TEXT,
  "24hr_rate" TEXT,
  "ci_24hr_time" TEXT,
  "co_24hr_time" TEXT,
  "early_ci_and_late_co_fee" TEXT,
  "early_ci_time_day_if_unit_not_used_prior_night" TEXT,
  "early_ci_time_night_if_unit_not_used_during_day" TEXT,
  "early_ci_time_24hr_if_unit_not_used_prior_booking" TEXT,
  "late_co_time_day_if_available" TEXT,
  "late_co_time_night_if_available" TEXT,
  "late_co_time_24hr_if_available" TEXT,
  "early_ci_and_late_co_fee_percentage" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample data for employees with authentication
INSERT INTO "employees" ("employee_name", "employee_role", "employment_type", "status", "monthly_pay", "weekly_pay", "daily_pay", "notes", "username", "email", "user_role") VALUES 
('Raymond', 'Manager', 'Full-Time', 'Active', '25000.00', '5833.33', '833.33', NULL, 'raymond', 'raymond@sanpedro.com', 'admin'),
('Jing Jing', 'Reception Cashier', 'Full-Time', 'Active', '8000.00', '1866.67', '266.67', NULL, 'jingjing', 'jingjing@sanpedro.com', 'manager'),
('Jerry', 'Security', 'Full-Time', 'Active', '16000.00', '3733.33', '533.33', NULL, 'jerry', 'jerry@sanpedro.com', 'manager'),
('Chinamae', 'Store', 'Full-Time', 'Active', '5500.00', '1283.33', '183.33', NULL, 'chinamae', 'chinamae@sanpedro.com', 'employee'),
('Romeo', 'Cleaner', 'Full-Time', 'Active', '8000.00', '1866.67', '266.67', NULL, 'romeo', 'romeo@sanpedro.com', 'employee'),
('JR', 'Life Guard / Cleaner', 'Full-Time', 'Active', '7000.00', '1633.33', '233.33', NULL, 'jr', 'jr@sanpedro.com', 'employee'),
('Narding', 'Construction', 'Full-Time', 'Active', '14400.00', '3600.00', '600.00', NULL, 'narding', 'narding@sanpedro.com', 'employee'),
('Bella', 'Cook / Cleaning', 'Full-Time', 'Active', '6000.00', '1400.00', '200.00', NULL, 'bella', 'bella@sanpedro.com', 'employee'),
('Dong Dong', 'Electrician', 'Project-Based', 'Active', NULL, NULL, NULL, NULL, 'dongdong', 'dongdong@sanpedro.com', 'employee'),
('Bobong', 'Cleaner', 'Full-Time', 'Inactive', '5500.00', '1283.33', '183.33', NULL, 'bobong', 'bobong@sanpedro.com', 'employee'),
('Ailleen', 'Laundry / Cleaning', 'Full-Time', 'Inactive', '6000.00', '1400.00', '200.00', NULL, 'ailleen', 'ailleen@sanpedro.com', 'employee'),
('Edward', 'Cleaner', 'Full-Time', 'Terminated', '5000.00', '1166.67', '166.67', NULL, 'edward', 'edward@sanpedro.com', 'employee');

-- Insert sample data for rental units
INSERT INTO "rental_units_pricing" ("unit_id", "rental_type", "maximum_capacity", "day_rate", "ci_day_time", "co_day_time", "night_rate", "ci_night_time", "co_night_time", "24hr_rate", "ci_24hr_time", "co_24hr_time", "early_ci_and_late_co_fee", "early_ci_and_late_co_fee_percentage", "notes") VALUES 
('RC1', 'Open Cottage', 10, '700', '7:00 AM', '5:00 PM', '1000', '6:00 PM', '6:00 AM', '1700', '7:00 AM', '6:00 AM', '350', '21%', ''),
('FR1', 'Room', 6, '', '', '', '', '', '', '4500', '2:00 PM', '12:00 PM', '1000', '22%', ''),
('RM1', 'Room', 2, '', '', '', '', '', '', '1300', '2:00 PM', '12:00 PM', '350', '27%', '');

-- Insert sample data for money denominations
INSERT INTO "money_denominations" ("denomination", "quantity", "total_value") VALUES 
('1000', 10, 10000.00),
('500', 20, 10000.00),
('100', 50, 5000.00),
('50', 100, 5000.00),
('20', 200, 4000.00),
('10', 500, 5000.00),
('5', 1000, 5000.00),
('1', 2000, 2000.00);

-- Create indexes for better performance
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_expenses_date ON expenses_2025(date);
CREATE INDEX idx_expenses_vendor ON expenses_2025(vendor);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_salaries_date ON employee_salaries_2025(date);
CREATE INDEX idx_withdrawals_date ON stakeholder_withdrawals_2025(date);
CREATE INDEX idx_advances_employee ON employee_advances(employee);
CREATE INDEX idx_rental_units_type ON rental_units_pricing(rental_type);

-- Add RLS (Row Level Security) policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_denominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_salaries_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_withdrawals_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_units_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies (you can customize these based on your needs)
CREATE POLICY "Enable read access for all users" ON employees FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON employees FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON employees FOR DELETE USING (true);

-- Repeat for other tables...
CREATE POLICY "Enable read access for all users" ON expenses_2025 FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON expenses_2025 FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON expenses_2025 FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON expenses_2025 FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON inventory_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON inventory_items FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON money_denominations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON money_denominations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON money_denominations FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON money_denominations FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON employee_salaries_2025 FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON employee_salaries_2025 FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON employee_salaries_2025 FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON employee_salaries_2025 FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON stakeholder_withdrawals_2025 FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON stakeholder_withdrawals_2025 FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON stakeholder_withdrawals_2025 FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON stakeholder_withdrawals_2025 FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON employee_advances FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON employee_advances FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON employee_advances FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON employee_advances FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON rental_units_pricing FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON rental_units_pricing FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON rental_units_pricing FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON rental_units_pricing FOR DELETE USING (true);
