# 🔐 Supabase Authentication & RLS Implementation Guide
## San Pedro Beach Resort Management System

**Date**: January 27, 2025  
**Status**: Implementation Guide  
**Priority**: 🔴 **CRITICAL**

---

## 📋 **Overview**

This guide provides step-by-step instructions for implementing Supabase authentication with Row Level Security (RLS) for the San Pedro Beach Resort management system. This will provide enterprise-grade security and user management.

---

## 🎯 **Implementation Goals**

1. **Enable Supabase Authentication** for all users
2. **Implement Row Level Security** on all tables
3. **Create role-based access control** (admin, manager, employee, guest)
4. **Migrate existing users** to Supabase Auth
5. **Update frontend** to use Supabase authentication
6. **Test and validate** all security measures

---

## 🚀 **Phase 1: Database Schema Preparation**

### **Step 1.1: Create Migration Scripts**

Create the following SQL files in the `docs/` folder:

#### **1.1.1: Enable Supabase Auth Integration**
```sql
-- docs/2025-01-27_enable_supabase_auth.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update user_profiles to integrate with auth.users
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_auth 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing columns for auth integration
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();
```

#### **1.1.2: Convert inventory_items to UUID**
```sql
-- docs/2025-01-27_convert_inventory_to_uuid.sql

-- Create temporary table with UUID structure
CREATE TABLE inventory_items_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  stock REAL DEFAULT 0,
  size TEXT,
  units TEXT,
  price REAL DEFAULT 0,
  min_level REAL DEFAULT 0,
  supplier TEXT,
  barcode TEXT,
  barcode_type TEXT,
  notes TEXT,
  tags TEXT,
  restock_price REAL,
  value REAL,
  photo1 TEXT,
  photo2 TEXT,
  photo3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy data from old table to new table
INSERT INTO inventory_items_new (
  category, product_name, stock, size, units, price, min_level,
  supplier, barcode, barcode_type, notes, tags, restock_price, value,
  photo1, photo2, photo3, created_at, updated_at
)
SELECT 
  category, product_name, stock, size, units, price, min_level,
  supplier, barcode, barcode_type, notes, tags, restock_price, value,
  photo1, photo2, photo3, created_at, updated_at
FROM inventory_items;

-- Drop old table and rename new table
DROP TABLE inventory_items;
ALTER TABLE inventory_items_new RENAME TO inventory_items;

-- Update any foreign key references to inventory_items
-- (This will be done in the next step)
```

#### **1.1.3: Add Missing Foreign Keys**
```sql
-- docs/2025-01-27_add_missing_foreign_keys.sql

-- Add employee to user_profile relationship
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id);

-- Add inventory relationships
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id),
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);

-- Update existing data to link categories and suppliers
UPDATE inventory_items 
SET category_id = (
  SELECT id FROM product_categories 
  WHERE name = inventory_items.category
)
WHERE category_id IS NULL;

-- Add foreign key for inventory_count_items
ALTER TABLE inventory_count_items 
ADD CONSTRAINT IF NOT EXISTS fk_count_items_inventory 
FOREIGN KEY (item_id) REFERENCES inventory_items(id);

-- Add foreign key for inventory_transactions
ALTER TABLE inventory_transactions 
ADD CONSTRAINT IF NOT EXISTS fk_transactions_inventory 
FOREIGN KEY (item_id) REFERENCES inventory_items(id);
```

### **Step 1.2: Convert Data Types**
```sql
-- docs/2025-01-27_convert_data_types.sql

-- Convert financial amounts from TEXT to NUMERIC
ALTER TABLE expenses_2025 
ALTER COLUMN amount TYPE NUMERIC(10,2) 
USING CASE 
  WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::NUMERIC(10,2)
  ELSE 0
END;

ALTER TABLE employee_salaries_2025 
ALTER COLUMN amount TYPE NUMERIC(10,2) 
USING CASE 
  WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::NUMERIC(10,2)
  ELSE 0
END;

ALTER TABLE stakeholder_withdrawals_2025 
ALTER COLUMN amount TYPE NUMERIC(10,2) 
USING CASE 
  WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::NUMERIC(10,2)
  ELSE 0
END;

-- Convert dates from TEXT to DATE
ALTER TABLE expenses_2025 
ALTER COLUMN date TYPE DATE 
USING CASE 
  WHEN date ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE
  ELSE NULL
END;

ALTER TABLE employee_salaries_2025 
ALTER COLUMN date TYPE DATE 
USING CASE 
  WHEN date ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE
  ELSE NULL
END;

ALTER TABLE stakeholder_withdrawals_2025 
ALTER COLUMN date TYPE DATE 
USING CASE 
  WHEN date ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE
  ELSE NULL
END;
```

---

## 🔐 **Phase 2: Row Level Security Implementation**

### **Step 2.1: Enable RLS on All Tables**
```sql
-- docs/2025-01-27_enable_rls.sql

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
```

### **Step 2.2: Create Role-Based Policies**
```sql
-- docs/2025-01-27_create_rls_policies.sql

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

CREATE POLICY "Managers can view financial data" ON employee_salaries_2025
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Managers can view financial data" ON stakeholder_withdrawals_2025
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

CREATE POLICY "Admins can manage financial data" ON employee_salaries_2025
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage financial data" ON stakeholder_withdrawals_2025
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
```

---

## 🎨 **Phase 3: Frontend Authentication Integration**

### **Step 3.1: Install Required Packages**
```bash
# Install Supabase packages
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr

# Install additional dependencies
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### **Step 3.2: Create Authentication Context**
```typescript
// src/lib/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: any | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    userProfile,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### **Step 3.3: Update Root Layout**
```typescript
// src/app/layout.tsx
import { AuthProvider } from '@/lib/auth-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### **Step 3.4: Create Protected Route Component**
```typescript
// src/components/ProtectedRoute.tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'employee' | 'guest'
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (requiredRole && userProfile?.role !== requiredRole) {
        // Check if user has sufficient permissions
        const roleHierarchy = {
          'guest': 0,
          'employee': 1,
          'manager': 2,
          'admin': 3
        }

        const userLevel = roleHierarchy[userProfile?.role as keyof typeof roleHierarchy] || 0
        const requiredLevel = roleHierarchy[requiredRole]

        if (userLevel < requiredLevel) {
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [user, userProfile, loading, requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

### **Step 3.5: Update Login Page**
```typescript
// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      router.push('/admin/dashboard')
    } catch (error: any) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSignIn}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
```

---

## 🧪 **Phase 4: Testing & Validation**

### **Step 4.1: Create Test Scripts**
```sql
-- docs/2025-01-27_test_rls_policies.sql

-- Test RLS policies
-- Run these queries as different users to verify access control

-- Test 1: Verify user can only see their own profile
-- (Run as regular user)
SELECT * FROM user_profiles WHERE id = auth.uid();

-- Test 2: Verify admin can see all profiles
-- (Run as admin)
SELECT * FROM user_profiles;

-- Test 3: Verify employee can only see their own data
-- (Run as employee)
SELECT * FROM employees WHERE user_profile_id = auth.uid();

-- Test 4: Verify manager can see all employees
-- (Run as manager)
SELECT * FROM employees;

-- Test 5: Verify financial data is restricted
-- (Run as employee - should fail)
SELECT * FROM expenses_2025;

-- Test 6: Verify manager can see financial data
-- (Run as manager - should succeed)
SELECT * FROM expenses_2025;
```

### **Step 4.2: Create User Migration Script**
```sql
-- docs/2025-01-27_migrate_existing_users.sql

-- This script migrates existing users to Supabase Auth
-- Run this after setting up Supabase Auth

-- Create admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@sanpedrobeachresort.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Create corresponding user profile
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@sanpedrobeachresort.com'),
  'admin@sanpedrobeachresort.com',
  'System Administrator',
  'admin',
  NOW(),
  NOW()
);

-- Create manager user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'manager@sanpedrobeachresort.com',
  crypt('manager123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Create corresponding user profile
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'manager@sanpedrobeachresort.com'),
  'manager@sanpedrobeachresort.com',
  'Resort Manager',
  'manager',
  NOW(),
  NOW()
);

-- Create employee user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'employee@sanpedrobeachresort.com',
  crypt('employee123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Create corresponding user profile
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'employee@sanpedrobeachresort.com'),
  'employee@sanpedrobeachresort.com',
  'Resort Employee',
  'employee',
  NOW(),
  NOW()
);
```

---

## 📋 **Execution Checklist**

### **Pre-Implementation**
- [ ] Backup current database
- [ ] Review all migration scripts
- [ ] Test scripts in development environment
- [ ] Prepare rollback plan

### **Database Changes**
- [ ] Run `2025-01-27_enable_supabase_auth.sql`
- [ ] Run `2025-01-27_convert_inventory_to_uuid.sql`
- [ ] Run `2025-01-27_add_missing_foreign_keys.sql`
- [ ] Run `2025-01-27_convert_data_types.sql`
- [ ] Run `2025-01-27_enable_rls.sql`
- [ ] Run `2025-01-27_create_rls_policies.sql`

### **Frontend Changes**
- [ ] Install Supabase packages
- [ ] Create auth context
- [ ] Update root layout
- [ ] Create protected route component
- [ ] Update login page
- [ ] Wrap admin pages with ProtectedRoute

### **Testing**
- [ ] Test user authentication
- [ ] Test role-based access
- [ ] Test RLS policies
- [ ] Test all admin functions
- [ ] Test error handling

### **Deployment**
- [ ] Deploy to staging environment
- [ ] Run full test suite
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Update documentation

---

## 🚨 **Important Notes**

1. **Backup First**: Always backup your database before running migrations
2. **Test Thoroughly**: Test all changes in development before production
3. **Monitor Performance**: RLS can impact query performance
4. **User Communication**: Inform users about new authentication system
5. **Password Reset**: Provide password reset functionality
6. **Session Management**: Handle session timeouts gracefully

---

## 🎯 **Expected Results**

After implementation, you will have:

✅ **Secure Authentication**: Supabase Auth with JWT tokens  
✅ **Role-Based Access**: Granular permissions per user role  
✅ **Data Protection**: RLS prevents unauthorized access  
✅ **Audit Trail**: Complete activity logging  
✅ **Scalable Architecture**: UUID-based primary keys  
✅ **Performance Optimized**: Proper indexes and data types  
✅ **Maintainable Code**: Clean separation of concerns  

**This implementation provides enterprise-grade security and user management for your resort system.** 🚀
