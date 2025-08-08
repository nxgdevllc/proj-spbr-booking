# Supabase Project Setup Guide

## 🚀 Initial Project Creation

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign Up"
3. **Choose Free Tier** (0$/month)
4. Create organization (if needed)
5. Click "New Project"

### Step 2: Project Configuration
- **Name**: `spbr-booking` or `san-pedro-beach-resort`
- **Database Password**: Create a strong password (save it!)
- **Region**: **Singapore (ap-southeast-1)** - Best for Philippines
- **Pricing Plan**: Free tier

## 🔧 Essential Configuration Settings

### 1. Database Schema Setup

#### Step 1: Access SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

#### Step 2: Run Database Schema
Copy and paste the entire content from `docs/DATABASE_SCHEMA.sql` and run it.

**Important**: This creates all tables, functions, triggers, and initial data.

### 2. Authentication Configuration

#### Step 1: Enable Email Auth
1. Go to **Authentication** → **Providers**
2. **Email**: Enable (should be enabled by default)
3. **Confirm email**: **Disable** (for easier testing)
4. **Secure email change**: **Enable**

#### Step 2: Configure Auth Settings
1. Go to **Authentication** → **Settings**
2. **Site URL**: `http://localhost:3000` (for development)
3. **Redirect URLs**: Add these URLs:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/dashboard
   https://your-vercel-domain.vercel.app/auth/callback
   https://your-vercel-domain.vercel.app/dashboard
   https://sanpedrobeachresort.com/auth/callback
   https://sanpedrobeachresort.com/dashboard
   ```

#### Step 3: Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**

### 3. Row Level Security (RLS) Configuration

#### Step 1: Enable RLS
1. Go to **Authentication** → **Policies**
2. Enable RLS on all tables (should be done by schema)

#### Step 2: Create Security Policies
Run these policies in SQL Editor:

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Allow employees to view all bookings
CREATE POLICY "Employees can view all bookings" ON public.bookings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to create bookings
CREATE POLICY "Employees can create bookings" ON public.bookings
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to update bookings
CREATE POLICY "Employees can update bookings" ON public.bookings
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to view all guests
CREATE POLICY "Employees can view all guests" ON public.guests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to create guests
CREATE POLICY "Employees can create guests" ON public.guests
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to update guests
CREATE POLICY "Employees can update guests" ON public.guests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to view all payments
CREATE POLICY "Employees can view all payments" ON public.payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to create payments
CREATE POLICY "Employees can create payments" ON public.payments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to view all units
CREATE POLICY "Employees can view all units" ON public.units
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to update units
CREATE POLICY "Employees can update units" ON public.units
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);
```

### 4. Storage Configuration

#### Step 1: Create Storage Buckets
1. Go to **Storage** → **Buckets**
2. Create these buckets:

**receipts** bucket:
- **Name**: `receipts`
- **Public**: **Yes** (for receipt access)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/*, application/pdf`

**avatars** bucket:
- **Name**: `avatars`
- **Public**: **Yes**
- **File size limit**: 2MB
- **Allowed MIME types**: `image/*`

**documents** bucket:
- **Name**: `documents`
- **Public**: **No** (private documents)
- **File size limit**: 10MB
- **Allowed MIME types**: `application/pdf, image/*`

#### Step 2: Storage Policies
Run these policies:

```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow employees to upload receipts
CREATE POLICY "Employees can upload receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipts' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow anyone to view receipts
CREATE POLICY "Anyone can view receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'receipts');

-- Allow employees to upload documents
CREATE POLICY "Employees can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);

-- Allow employees to view documents
CREATE POLICY "Employees can view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'employee', 'manager')
  )
);
```

### 5. Edge Functions Setup (Optional)

#### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

#### Step 2: Initialize Supabase
```bash
supabase init
```

#### Step 3: Create Edge Functions
```bash
# Create functions directory
mkdir supabase/functions

# Create payment processing function
supabase functions new process-payment

# Create receipt generation function
supabase functions new generate-receipt
```

### 6. Real-time Configuration

#### Step 1: Enable Real-time
1. Go to **Database** → **Replication**
2. Enable real-time for these tables:
   - `bookings`
   - `payments`
   - `guests`
   - `units`

#### Step 2: Configure Replication
```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE guests;
ALTER PUBLICATION supabase_realtime ADD TABLE units;
```

### 7. Database Performance Optimization

#### Step 1: Create Indexes
```sql
-- Performance indexes for common queries
CREATE INDEX CONCURRENTLY idx_bookings_dates_status ON bookings(check_in_date, check_out_date, status);
CREATE INDEX CONCURRENTLY idx_bookings_guest ON bookings(guest_id);
CREATE INDEX CONCURRENTLY idx_payments_booking ON payments(booking_id);
CREATE INDEX CONCURRENTLY idx_payments_date ON payments(created_at);
CREATE INDEX CONCURRENTLY idx_guests_phone ON guests(phone);
CREATE INDEX CONCURRENTLY idx_guests_email ON guests(email);
CREATE INDEX CONCURRENTLY idx_units_status ON units(status);
```

#### Step 2: Enable Query Performance Monitoring
1. Go to **Database** → **Logs**
2. Enable **Query Performance** monitoring

### 8. API Configuration

#### Step 1: API Settings
1. Go to **Settings** → **API**
2. **Project API keys**: Copy these for your `.env.local`
3. **Project URL**: Copy for your `.env.local`

#### Step 2: Rate Limiting
1. Go to **Settings** → **API**
2. **Rate limiting**: Set to 1000 requests per minute (free tier)

### 9. Create Initial Admin User

#### Step 1: Create Admin User
```sql
-- Insert initial admin user (replace with your details)
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  phone
) VALUES (
  'your-user-id-here', -- Get this from Supabase Auth after creating user
  'admin@sanpedrobeachresort.com',
  'System Administrator',
  'admin',
  '+63 XXX XXX XXXX'
);
```

#### Step 2: Create User in Auth
1. Go to **Authentication** → **Users**
2. Click "Add User"
3. Enter admin email and password
4. Copy the user ID and use it in the SQL above

### 10. Environment Variables Setup

#### Step 1: Get Your Credentials
1. Go to **Settings** → **API**
2. Copy these values:

```env
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Anon/Public Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service Role Key (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### Step 2: Add to Your .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🔍 Testing Your Setup

### Step 1: Test Database Connection
```bash
# Create test file
touch test-supabase.js
```

Add this content:
```javascript
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('user_profiles').select('count')
    console.log('✅ Database connection successful!')
    
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession()
    console.log('✅ Authentication working!')
    
    // Test storage
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    console.log('✅ Storage buckets:', buckets.map(b => b.name))
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

testConnection()
```

Run the test:
```bash
node test-supabase.js
```

## 🚨 Important Security Notes

1. **Service Role Key**: Never expose this in client-side code
2. **RLS Policies**: Always test your security policies
3. **Environment Variables**: Keep them secure and never commit to git
4. **Backup**: Enable automatic backups in Supabase dashboard

## 📊 Monitoring Setup

### Step 1: Enable Monitoring
1. Go to **Settings** → **Usage**
2. Monitor your usage against free tier limits:
   - Database: 500MB
   - Bandwidth: 1GB
   - Auth users: 50,000
   - Edge functions: 500K invocations

### Step 2: Set Up Alerts
1. Go to **Settings** → **Usage**
2. Set up email alerts for:
   - 80% database usage
   - 80% bandwidth usage
   - High error rates

## ✅ Final Checklist

- [ ] Project created with Singapore region
- [ ] Database schema applied
- [ ] Authentication configured
- [ ] RLS policies created
- [ ] Storage buckets set up
- [ ] Real-time enabled
- [ ] Indexes created
- [ ] Admin user created
- [ ] Environment variables configured
- [ ] Connection tested
- [ ] Monitoring enabled

Once you complete this setup, your Supabase project will be fully configured for the resort management system! 