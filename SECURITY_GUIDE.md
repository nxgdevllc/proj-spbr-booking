# 🔒 Supabase Security Guide for San Pedro Beach Resort

## 🚨 Critical Security Measures

### 1. **Environment Variables Security**

#### ✅ Current Setup Analysis
- Your Supabase URL and keys are properly stored in environment variables
- Keys are not hardcoded in the source code
- Using `NEXT_PUBLIC_` prefix correctly for client-side access

#### 🔧 Recommended Improvements

**Create a `.env.local` file (if not exists):**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Server-side only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 2. **Row Level Security (RLS) Policies**

#### 🛡️ Essential RLS Policies to Implement

**1. User Profiles Table:**
```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

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
```

**2. Bookings Table:**
```sql
-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

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
```

**3. Payments Table:**
```sql
-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

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
```

### 3. **API Security**

#### 🔐 Secure Client Configuration

**Update `src/lib/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Add security headers and configurations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'san-pedro-beach-resort'
    }
  }
})

// Server-side client (for admin operations)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

### 4. **Authentication Security**

#### 🔑 Implement Secure Authentication

**Create `src/lib/auth-server.ts`:**
```typescript
import { createServerClient } from './supabase'
import { cookies } from 'next/headers'

export async function getServerSession() {
  const cookieStore = await cookies()
  const supabase = createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
```

### 5. **Database Security**

#### 🗄️ Database Hardening

**1. Enable SSL:**
```sql
-- Ensure SSL is enabled (usually default)
SHOW ssl;
```

**2. Restrict Database Access:**
```sql
-- Create specific roles for different access levels
CREATE ROLE resort_employee;
CREATE ROLE resort_manager;
CREATE ROLE resort_admin;

-- Grant appropriate permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO resort_employee;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO resort_manager;
GRANT ALL ON ALL TABLES IN SCHEMA public TO resort_admin;
```

**3. Audit Logging:**
```sql
-- Enable audit logging
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Log all DDL operations
ALTER SYSTEM SET pgaudit.log = 'DDL';
ALTER SYSTEM SET pgaudit.log_relation = on;
```

### 6. **Network Security**

#### 🌐 Network Hardening

**1. IP Restrictions (if needed):**
```sql
-- Restrict access to specific IPs (optional)
-- This would be configured in Supabase dashboard
```

**2. CORS Configuration:**
```typescript
// In your Supabase project settings
// Add your domain to allowed origins
// https://your-domain.vercel.app
// http://localhost:3000 (for development)
```

### 7. **Monitoring and Logging**

#### 📊 Security Monitoring

**1. Enable Supabase Logs:**
- Go to Supabase Dashboard > Settings > Logs
- Enable all log types
- Set up alerts for suspicious activities

**2. Implement Application Logging:**
```typescript
// Add to your API routes
export async function logSecurityEvent(event: string, userId?: string) {
  console.log(`[SECURITY] ${new Date().toISOString()}: ${event}`, {
    userId,
    ip: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent')
  })
}
```

### 8. **Data Encryption**

#### 🔐 Encryption Best Practices

**1. Sensitive Data Encryption:**
```sql
-- Encrypt sensitive fields
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- For credit card numbers (if storing)
ALTER TABLE payments ADD COLUMN encrypted_card_number TEXT;
-- Use pgp_sym_encrypt() for encryption
```

**2. Password Hashing:**
```typescript
// Ensure passwords are properly hashed
import { hash, compare } from 'bcryptjs'

export async function hashPassword(password: string) {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword)
}
```

### 9. **Regular Security Audits**

#### 🔍 Security Checklist

**Monthly Tasks:**
- [ ] Review Supabase access logs
- [ ] Check for unused API keys
- [ ] Update dependencies
- [ ] Review RLS policies
- [ ] Test authentication flows

**Quarterly Tasks:**
- [ ] Security penetration testing
- [ ] Database backup verification
- [ ] Access control review
- [ ] Update security policies

### 10. **Emergency Response**

#### 🚨 Incident Response Plan

**1. Data Breach Response:**
```bash
# Immediate actions
1. Revoke compromised API keys
2. Reset user passwords
3. Enable additional logging
4. Contact Supabase support
5. Notify affected users
```

**2. Backup and Recovery:**
```sql
-- Regular backups (handled by Supabase)
-- Point-in-time recovery available
-- Test restore procedures monthly
```

## 🛡️ Implementation Priority

### High Priority (Implement Immediately):
1. ✅ Environment variables security
2. 🔧 Row Level Security policies
3. 🔧 Secure client configuration
4. 🔧 Authentication middleware

### Medium Priority (Implement Soon):
1. 📊 Security monitoring
2. 🔐 Data encryption
3. 🌐 Network restrictions

### Low Priority (Implement Later):
1. 🔍 Advanced audit logging
2. 🚨 Incident response automation
3. 📈 Security metrics dashboard

## 📞 Support Resources

- **Supabase Security Docs**: https://supabase.com/docs/guides/security
- **Supabase Support**: https://supabase.com/support
- **Security Best Practices**: https://owasp.org/www-project-top-ten/

---

**⚠️ Important**: This guide provides a foundation for securing your Supabase setup. Always follow the principle of least privilege and regularly review your security measures.
