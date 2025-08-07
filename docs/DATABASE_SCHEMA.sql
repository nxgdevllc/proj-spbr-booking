-- San Pedro Beach Resort - Database Schema
-- Supabase PostgreSQL Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- AUTHENTICATION & USER MANAGEMENT
-- =============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'manager', 'guest')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee specific information
CREATE TABLE public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    position TEXT NOT NULL,
    hire_date DATE NOT NULL,
    base_salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    emergency_contact TEXT,
    emergency_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROPERTY MANAGEMENT
-- =============================================

-- Unit types (cottages, rooms, etc.)
CREATE TABLE public.unit_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    max_capacity INTEGER NOT NULL,
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual units
CREATE TABLE public.units (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    unit_type_id UUID REFERENCES public.unit_types(id),
    unit_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning', 'out_of_order')),
    last_maintenance DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GUEST & BOOKING MANAGEMENT
-- =============================================

-- Guest information
CREATE TABLE public.guests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    id_number TEXT, -- Government ID
    id_type TEXT, -- Type of ID (passport, driver's license, etc.)
    address TEXT,
    nationality TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_number TEXT UNIQUE NOT NULL,
    guest_id UUID REFERENCES public.guests(id),
    unit_id UUID REFERENCES public.units(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    actual_check_in TIMESTAMPTZ,
    actual_check_out TIMESTAMPTZ,
    number_of_guests INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
    special_requests TEXT,
    created_by UUID REFERENCES public.user_profiles(id),
    checked_in_by UUID REFERENCES public.user_profiles(id),
    checked_out_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENT & FINANCIAL MANAGEMENT
-- =============================================

-- Payment methods and transactions
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'gcash', 'bank_transfer', 'credit_card', 'debit_card')),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'full_payment', 'partial_payment', 'refund')),
    reference_number TEXT, -- GCash reference, bank transfer ref, etc.
    receipt_number TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    processed_by UUID REFERENCES public.user_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- General financial transactions (expenses, income, etc.)
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    category TEXT NOT NULL,
    subcategory TEXT,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    reference_id UUID, -- Can reference bookings, purchases, etc.
    reference_type TEXT, -- 'booking', 'purchase', 'payroll', etc.
    payment_method TEXT,
    receipt_url TEXT,
    processed_by UUID REFERENCES public.user_profiles(id),
    approved_by UUID REFERENCES public.user_profiles(id),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense categories
CREATE TABLE public.expense_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVENTORY MANAGEMENT
-- =============================================

-- Product suppliers
CREATE TABLE public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    payment_terms TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product categories
CREATE TABLE public.product_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products/inventory items
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.product_categories(id),
    supplier_id UUID REFERENCES public.suppliers(id),
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    current_stock INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    unit_of_measure TEXT DEFAULT 'piece',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory movements (stock in/out)
CREATE TABLE public.inventory_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('stock_in', 'stock_out', 'adjustment', 'transfer')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reference_number TEXT,
    reason TEXT,
    processed_by UUID REFERENCES public.user_profiles(id),
    movement_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales transactions
CREATE TABLE public.sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_reference TEXT,
    sold_by UUID REFERENCES public.user_profiles(id),
    receipt_printed BOOLEAN DEFAULT FALSE,
    sale_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale items (line items for each sale)
CREATE TABLE public.sale_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EMPLOYEE MANAGEMENT & TASKS
-- =============================================

-- Employee schedules
CREATE TABLE public.employee_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id),
    shift_date DATE NOT NULL,
    shift_type TEXT NOT NULL CHECK (shift_type IN ('day', 'night', 'full')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_scheduled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks and assignments
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.employees(id),
    assigned_by UUID REFERENCES public.user_profiles(id),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    estimated_hours DECIMAL(4,2),
    actual_hours DECIMAL(4,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time off requests
CREATE TABLE public.time_off_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('vacation', 'sick_leave', 'personal', 'emergency')),
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    approved_by UUID REFERENCES public.user_profiles(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYROLL MANAGEMENT
-- =============================================

-- Payroll periods
CREATE TABLE public.payroll_periods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    period_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'processing', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll records
CREATE TABLE public.payroll (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id),
    payroll_period_id UUID REFERENCES public.payroll_periods(id),
    base_salary DECIMAL(10,2) NOT NULL,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    overtime_rate DECIMAL(10,2) DEFAULT 0,
    overtime_pay DECIMAL(10,2) DEFAULT 0,
    bonuses DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    gross_pay DECIMAL(10,2) NOT NULL,
    tax_deduction DECIMAL(10,2) DEFAULT 0,
    sss_deduction DECIMAL(10,2) DEFAULT 0,
    philhealth_deduction DECIMAL(10,2) DEFAULT 0,
    pagibig_deduction DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    net_pay DECIMAL(10,2) NOT NULL,
    pay_date DATE,
    processed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SYSTEM SETTINGS & CONFIGURATION
-- =============================================

-- System settings
CREATE TABLE public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipt templates
CREATE TABLE public.receipt_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('booking', 'payment', 'sale', 'refund')),
    template_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Booking related indexes
CREATE INDEX idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_guest ON public.bookings(guest_id);
CREATE INDEX idx_bookings_unit ON public.bookings(unit_id);

-- Payment indexes
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_payments_date ON public.payments(created_at);
CREATE INDEX idx_payments_method ON public.payments(payment_method);

-- Transaction indexes
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_category ON public.transactions(category);

-- Inventory indexes
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_inventory_movements_product ON public.inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_date ON public.inventory_movements(movement_date);

-- Sales indexes
CREATE INDEX idx_sales_date ON public.sales(sale_date);
CREATE INDEX idx_sales_sold_by ON public.sales(sold_by);

-- Employee indexes
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be expanded based on specific requirements)
-- Admin users can see everything
CREATE POLICY "Admin full access" ON public.user_profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Employees can see their own data
CREATE POLICY "Employees can see own data" ON public.employees FOR SELECT USING (
    user_id = auth.uid()
);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.unit_types FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate booking numbers
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    SELECT TO_CHAR(CURRENT_DATE, 'YYYYMMDD') INTO new_number;
    
    -- Get count of bookings today
    SELECT COUNT(*) + 1 INTO counter
    FROM public.bookings
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Format: YYYYMMDD-001
    new_number := new_number || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate receipt numbers
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    SELECT TO_CHAR(CURRENT_DATE, 'YYYYMMDD') INTO new_number;
    
    -- Get count of payments today
    SELECT COUNT(*) + 1 INTO counter
    FROM public.payments
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Format: REC-YYYYMMDD-001
    new_number := 'REC-' || new_number || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking numbers
CREATE OR REPLACE FUNCTION public.set_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
        NEW.booking_number := public.generate_booking_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_number BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_booking_number();

-- Trigger to auto-generate receipt numbers
CREATE OR REPLACE FUNCTION public.set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL OR NEW.receipt_number = '' THEN
        NEW.receipt_number := public.generate_receipt_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_receipt_number BEFORE INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_receipt_number();

-- Function to update product stock levels
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'stock_in' THEN
        UPDATE public.products 
        SET current_stock = current_stock + NEW.quantity
        WHERE id = NEW.product_id;
    ELSIF NEW.movement_type = 'stock_out' THEN
        UPDATE public.products 
        SET current_stock = current_stock - NEW.quantity
        WHERE id = NEW.product_id;
    ELSIF NEW.movement_type = 'adjustment' THEN
        UPDATE public.products 
        SET current_stock = NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_stock AFTER INSERT ON public.inventory_movements FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description) VALUES
('Utilities', 'Electricity, water, internet, phone'),
('Maintenance', 'Property maintenance and repairs'),
('Supplies', 'Cleaning supplies, toiletries, linens'),
('Food & Beverage', 'Guest refreshments and staff meals'),
('Marketing', 'Advertising and promotional expenses'),
('Insurance', 'Property and liability insurance'),
('Licenses', 'Business permits and licenses'),
('Professional Services', 'Legal, accounting, consulting'),
('Equipment', 'Furniture, appliances, technology'),
('Transportation', 'Vehicle maintenance and fuel');

-- Insert default product categories
INSERT INTO public.product_categories (name, description) VALUES
('Beverages', 'Soft drinks, water, juices'),
('Snacks', 'Chips, crackers, candy'),
('Toiletries', 'Shampoo, soap, toothpaste'),
('Beach Items', 'Sunscreen, towels, beach toys'),
('Souvenirs', 'T-shirts, keychains, postcards'),
('Supplies', 'Cleaning supplies, paper products');

-- Insert default system settings
INSERT INTO public.settings (key, value, description) VALUES
('resort_name', '"San Pedro Beach Resort"', 'Resort name for receipts and documents'),
('resort_address', '"Opal, Philippines, Cal de Oro"', 'Resort address'),
('resort_phone', '""', 'Resort contact phone number'),
('resort_email', '""', 'Resort contact email'),
('tax_rate', '0.12', 'VAT/Tax rate (12% for Philippines)'),
('currency', '"PHP"', 'Currency code'),
('timezone', '"Asia/Manila"', 'Resort timezone'),
('receipt_footer', '"Thank you for staying with us!"', 'Footer text for receipts'),
('gcash_merchant_id', '""', 'GCash merchant ID for payments'),
('backup_schedule', '"daily"', 'Database backup frequency');

-- Insert default receipt template
INSERT INTO public.receipt_templates (name, template_type, template_content) VALUES
('Default Booking Receipt', 'booking', 
'================================
{{resort_name}}
{{resort_address}}
Tel: {{resort_phone}}
================================

BOOKING RECEIPT
Receipt #: {{receipt_number}}
Date: {{date}}
Time: {{time}}

--------------------------------
Guest: {{guest_name}}
Phone: {{guest_phone}}
Unit: {{unit_number}} ({{unit_type}})

Check-in: {{check_in_date}}
Check-out: {{check_out_date}}
Nights: {{nights}}

--------------------------------
Room Rate: ₱{{room_rate}}
Total Amount: ₱{{total_amount}}
Deposit Paid: ₱{{deposit_amount}}
Balance Due: ₱{{balance_due}}

Payment Method: {{payment_method}}
{{#if reference_number}}
Reference: {{reference_number}}
{{/if}}

--------------------------------
{{receipt_footer}}

Processed by: {{employee_name}}
================================');