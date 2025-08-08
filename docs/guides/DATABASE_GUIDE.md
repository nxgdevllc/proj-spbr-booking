# 🗄️ Database Guide - San Pedro Beach Resort

## 📋 Overview

This project uses **PostgreSQL** via **Supabase** as the database backend. The database is designed with security, scalability, and maintainability in mind.

## 🏗️ Database Architecture

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `user_profiles` | User authentication & roles | RLS enabled, role-based access |
| `employees` | Staff management | Employee data, roles, salaries |
| `guests` | Customer information | Guest profiles, contact details |
| `units` | Accommodation units | Room types, availability status |
| `rental_units_pricing` | Pricing configuration | Day/night rates, capacity |
| `bookings` | Reservation system | Check-in/out, payments, status |
| `payments` | Financial transactions | Payment methods, receipts |
| `inventory_items` | Store management | Products, stock levels, pricing |
| `expenses_2025` | Financial tracking | Expense categories, amounts |
| `employee_salaries_2025` | Payroll management | Salary records, deductions |
| `stakeholder_withdrawals_2025` | Business finances | Withdrawal tracking |
| `employee_advances` | Staff advances | Advance payments, repayment |
| `money_denominations` | Cash management | Currency denominations |
| `audit_logs` | Security logging | User actions, system events |

## 🔐 Security Implementation

### Row Level Security (RLS)

All tables have RLS enabled with role-based policies:

```sql
-- Example RLS Policy
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);
```

### User Roles

- **admin**: Full system access
- **manager**: Management functions, reporting
- **employee**: Basic operations, limited data access
- **guest**: Public access (read-only for certain data)

### Authentication Flow

1. User logs in via Supabase Auth
2. User profile fetched with role information
3. RLS policies enforce access based on role
4. Server-side operations use service role key

## 📊 Data Import & Management

### CSV Import Process

1. **Validate CSV files** using the validation script:
   ```bash
   npm run validate-csv
   ```

2. **Check file structure** in `public/csv-imports/`:
   - `employees.csv` - Staff data
   - `inventory_items.csv` - Store inventory
   - `rental_units_pricing.csv` - Room pricing
   - `expenses_2025.csv` - Financial data

3. **Import data** through the admin interface or scripts

### CSV Validation Rules

- **Required headers** for each file type
- **Data type validation** (strings, numbers, dates, emails)
- **Enum value checking** for role fields
- **Duplicate detection** and handling
- **Error reporting** with detailed messages

## 🧹 Database Maintenance

### Regular Cleanup Tasks

Run the cleanup script in Supabase SQL Editor:

```sql
-- Located in scripts/database-cleanup.sql
-- Includes:
-- - Table statistics updates
-- - Index optimization
-- - Audit log cleanup
-- - Performance monitoring
```

### Performance Optimization

1. **Index Management**:
   - Primary keys automatically indexed
   - Foreign key columns indexed
   - Frequently queried columns indexed
   - Composite indexes for complex queries

2. **Query Optimization**:
   - Use appropriate WHERE clauses
   - Limit result sets with LIMIT
   - Use proper JOIN types
   - Avoid SELECT * in production

3. **Connection Management**:
   - Use connection pooling
   - Implement proper error handling
   - Monitor connection usage

## 🔧 Development Setup

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### Database Connection

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

## 📈 Monitoring & Analytics

### Database Metrics

Monitor these key metrics:

- **Query Performance**: Slow query identification
- **Connection Usage**: Active connections and limits
- **Storage Usage**: Table sizes and growth
- **Index Usage**: Index efficiency and recommendations
- **Error Rates**: Failed queries and connection issues

### Audit Logging

All sensitive operations are logged:

```sql
-- Audit log entry example
INSERT INTO audit_logs (
  user_id, 
  action, 
  table_name, 
  record_id, 
  details
) VALUES (
  auth.uid(),
  'UPDATE',
  'bookings',
  'booking_id',
  '{"status": "confirmed"}'
);
```

## 🚨 Troubleshooting

### Common Issues

1. **RLS Policy Errors**:
   - Check user authentication status
   - Verify role permissions
   - Review policy conditions

2. **Connection Timeouts**:
   - Check network connectivity
   - Verify environment variables
   - Monitor connection limits

3. **Data Import Errors**:
   - Validate CSV format
   - Check required fields
   - Verify data types

4. **Performance Issues**:
   - Review query execution plans
   - Check index usage
   - Monitor table statistics

### Debug Commands

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Monitor active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

## 📚 Best Practices

### Database Design

1. **Normalization**: Follow 3NF principles
2. **Constraints**: Use foreign keys and check constraints
3. **Indexing**: Index frequently queried columns
4. **Naming**: Use consistent snake_case naming
5. **Documentation**: Document all tables and relationships

### Security

1. **RLS**: Enable on all tables
2. **Authentication**: Always verify user identity
3. **Authorization**: Check role permissions
4. **Input Validation**: Sanitize all inputs
5. **Audit Logging**: Log sensitive operations

### Performance

1. **Query Optimization**: Use efficient queries
2. **Indexing Strategy**: Create appropriate indexes
3. **Connection Pooling**: Manage connections efficiently
4. **Monitoring**: Track performance metrics
5. **Regular Maintenance**: Run cleanup scripts

## 🔄 Migration Strategy

### Schema Changes

1. **Create migration files** in `docs/` folder
2. **Test migrations** in development environment
3. **Backup data** before production deployment
4. **Deploy during low-traffic periods**
5. **Monitor for issues** after deployment

### Data Migration

1. **Export existing data** before changes
2. **Validate data integrity** after migration
3. **Update application code** to match schema
4. **Test thoroughly** in staging environment
5. **Deploy with rollback plan**

## 📞 Support

For database-related issues:

1. **Check this guide** for common solutions
2. **Review Supabase documentation** for platform-specific issues
3. **Check audit logs** for error details
4. **Monitor performance metrics** for bottlenecks
5. **Contact development team** for complex issues

---

**Last Updated**: August 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
