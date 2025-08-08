# 🗄️ Database Workflow Guide - San Pedro Beach Resort

## 🚀 Daily Database Operations

### 📊 Morning Routine (5 minutes)

#### 1. Connect to Database

```bash
# Open VS Code Command Palette (Cmd+Shift+P)
# Type: "SQLTools: Connect to Database"
# Select: "San Pedro Beach Resort - Production"
```

#### 2. Run Health Check Queries

```sql
-- Quick validation (use snippet: spbr-validate)
SELECT 'bookings without guests' AS issue, COUNT(*) AS count
FROM bookings b
LEFT JOIN guests g ON b.guest_id = g.id
WHERE g.id IS NULL
UNION ALL
SELECT 'low stock items' AS issue, COUNT(*) AS count
FROM inventory_items ii
WHERE ii.current_stock <= ii.restock_level;
```

#### 3. Check Today's Bookings

```sql
-- Today's check-ins (use snippet: spbr-bookings)
SELECT
  b.id,
  b.check_in_date,
  g.first_name || ' ' || g.last_name AS guest_name,
  g.phone,
  u.unit_number,
  u.unit_type
FROM bookings b
JOIN guests g ON b.guest_id = g.id
JOIN units u ON b.unit_id = u.id
WHERE DATE(b.check_in_date) = CURRENT_DATE
  AND b.status = 'confirmed'
ORDER BY b.check_in_date;
```

### 🔧 Development Workflow

#### Database Schema Changes

1. **Create Migration File**

   ```sql
   -- docs/YYYY-MM-DD_description.sql
   -- Example: docs/2025-01-27_add_booking_notes.sql
   ```

2. **Test in SQLTools**

   - Open migration file
   - Execute query
   - Verify results

3. **Apply to Production**
   - Copy query to Supabase SQL Editor
   - Execute and verify

#### Data Import/Export

1. **CSV Import Validation**

   ```bash
   # Open CSV file in VS Code
   # Rainbow CSV will highlight syntax
   # Check for validation errors
   ```

2. **Export Data**
   ```sql
   -- Export inventory for Excel
   SELECT
     ii.name,
     ii.description,
     ii.current_stock,
     ii.unit_price,
     pc.name AS category
   FROM inventory_items ii
   LEFT JOIN product_categories pc ON ii.category_id = pc.id
   ORDER BY pc.name, ii.name;
   ```

### 📈 Weekly Reports

#### Monday: Financial Summary

```sql
-- Last week's revenue (use snippet: spbr-finance)
SELECT
  DATE_TRUNC('week', b.check_in_date) AS week,
  COUNT(*) AS total_bookings,
  SUM(b.total_amount) AS total_revenue,
  AVG(b.total_amount) AS avg_booking_value
FROM bookings b
WHERE b.status = 'confirmed'
  AND b.check_in_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE_TRUNC('week', b.check_in_date);
```

#### Wednesday: Inventory Review

```sql
-- Low stock report (use snippet: spbr-inventory)
SELECT
  ii.name,
  ii.current_stock,
  ii.restock_level,
  ii.unit_price,
  pc.name AS category,
  s.name AS supplier
FROM inventory_items ii
LEFT JOIN product_categories pc ON ii.category_id = pc.id
LEFT JOIN suppliers s ON ii.supplier_id = s.id
WHERE ii.current_stock <= ii.restock_level
ORDER BY ii.current_stock ASC;
```

#### Friday: Guest Analytics

```sql
-- Guest statistics
SELECT
  COUNT(DISTINCT g.id) AS total_guests,
  COUNT(b.id) AS total_bookings,
  AVG(b.total_amount) AS avg_booking_value,
  MAX(b.check_in_date) AS last_booking_date
FROM guests g
LEFT JOIN bookings b ON g.id = b.guest_id
WHERE b.status = 'confirmed';
```

### 🧪 API Testing with Thunder Client

#### Authentication Testing

1. **Login Test**

   - Open Thunder Client
   - Select "Authentication > Login"
   - Update environment variables
   - Send request

2. **Token Management**
   - Copy access token from response
   - Update environment variable
   - Use for subsequent requests

#### Booking API Testing

1. **Get All Bookings**

   - Select "Bookings > Get All Bookings"
   - Verify response format
   - Check for authentication errors

2. **Create New Booking**
   - Select "Bookings > Create Booking"
   - Update request body with test data
   - Verify booking creation

#### Inventory API Testing

1. **Get Inventory Items**

   - Select "Inventory > Get Inventory Items"
   - Verify item list
   - Check stock levels

2. **Update Stock**
   - Select "Inventory > Update Stock"
   - Update item ID and new stock level
   - Verify stock update

### 🔍 Data Validation Workflow

#### Daily Validation

```sql
-- Run validation queries (use snippet: spbr-validate)
-- Check for:
-- 1. Orphaned records
-- 2. Data type issues
-- 3. Missing required fields
-- 4. Invalid relationships
```

#### Monthly Deep Validation

```sql
-- Comprehensive data audit
-- 1. Financial data consistency
-- 2. Booking date logic
-- 3. Inventory stock accuracy
-- 4. User permission integrity
```

### 📊 Performance Monitoring

#### Query Performance

```sql
-- Check slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

#### Table Statistics

```sql
-- Table sizes and row counts
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;
```

### 🔐 Security Monitoring

#### Audit Log Review

```sql
-- Recent security events (use snippet: spbr-audit)
SELECT
  al.timestamp,
  al.table_name,
  al.action,
  al.user_id,
  al.old_values,
  al.new_values
FROM audit_logs al
WHERE al.timestamp >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY al.timestamp DESC;
```

#### User Access Review

```sql
-- User login activity
SELECT
  up.email,
  up.role,
  up.last_login,
  COUNT(b.id) AS total_bookings_created
FROM user_profiles up
LEFT JOIN bookings b ON up.id = b.created_by
WHERE up.last_login >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY up.id, up.email, up.role, up.last_login
ORDER BY up.last_login DESC;
```

### 🚨 Emergency Procedures

#### Database Connection Issues

1. **Check Environment Variables**

   ```bash
   # Verify .env.local has correct credentials
   cat .env.local | grep SUPABASE
   ```

2. **Test Connection**

   ```bash
   # Run connection test
   node scripts/test-database-connection.js
   ```

3. **Check Supabase Status**
   - Visit Supabase dashboard
   - Check service status
   - Verify project settings

#### Data Recovery

1. **Backup Verification**

   ```sql
   -- Check recent backups
   SELECT
     backup_name,
     backup_time,
     backup_size
   FROM pg_stat_database;
   ```

2. **Point-in-Time Recovery**
   - Use Supabase dashboard
   - Select recovery point
   - Restore specific tables if needed

### 📋 Productivity Tips

#### SQL Snippets Usage

- Type `spbr` + Tab for basic template
- Type `spbr-users` + Tab for user queries
- Type `spbr-bookings` + Tab for booking queries
- Type `spbr-inventory` + Tab for inventory queries

#### Keyboard Shortcuts

- `Cmd+Shift+P`: Command Palette
- `Cmd+Shift+E`: Execute SQL query
- `Cmd+Shift+F`: Format SQL
- `Cmd+P`: Quick file open

#### VS Code Features

- **SQLTools Panel**: Browse database schema
- **Rainbow CSV**: Validate CSV files
- **Thunder Client**: Test APIs
- **GitLens**: Track database changes

### 🎯 Key Performance Indicators

#### Daily Metrics

- Total active bookings
- Low stock items count
- New guest registrations
- Revenue generated

#### Weekly Metrics

- Booking conversion rate
- Average booking value
- Inventory turnover
- Guest satisfaction scores

#### Monthly Metrics

- Revenue growth
- Customer retention
- Inventory efficiency
- System performance

---

## 📚 Quick Reference

### Essential Queries

| Purpose         | Snippet          | Description                  |
| --------------- | ---------------- | ---------------------------- |
| User Management | `spbr-users`     | User profiles and employees  |
| Booking System  | `spbr-bookings`  | Active bookings and revenue  |
| Inventory       | `spbr-inventory` | Stock levels and categories  |
| Financial       | `spbr-finance`   | Expenses and revenue reports |
| Audit           | `spbr-audit`     | Security and access logs     |
| Validation      | `spbr-validate`  | Data integrity checks        |

### Environment Variables

```bash
SUPABASE_DB_PASSWORD=your_password
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Connection Settings

- **Server**: `db.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **SSL**: Enabled

---

**🎉 This workflow guide ensures efficient and secure database operations for the San Pedro Beach Resort project!**
