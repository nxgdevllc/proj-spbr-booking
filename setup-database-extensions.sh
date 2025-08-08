#!/bin/bash

# Database Extensions Setup Script for San Pedro Beach Resort
# This script configures all database-related extensions and tools

echo "🗄️ Setting up Database Extensions for San Pedro Beach Resort..."
echo "=============================================================="

# Create necessary directories
echo "📁 Creating configuration directories..."
mkdir -p .vscode
mkdir -p .thunder-client
mkdir -p docs/database-queries

# Copy SQL snippets to VS Code snippets directory
echo "📝 Setting up SQL snippets..."
if [ -d "$HOME/Library/Application Support/Code/User/snippets" ]; then
    cp .vscode/sql-snippets.json "$HOME/Library/Application Support/Code/User/snippets/sql.json"
    echo "✅ SQL snippets copied to VS Code"
else
    echo "⚠️ VS Code snippets directory not found, please copy manually"
fi

# Create environment variables file template
echo "🔐 Creating environment variables template..."
cat > .env.template << 'EOF'
# Supabase Database Configuration
SUPABASE_DB_PASSWORD=your_supabase_database_password_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Local Database Configuration (Optional)
LOCAL_DB_PASSWORD=your_local_database_password_here

# API Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

echo "✅ Environment template created"

# Create Thunder Client collections for API testing
echo "⚡ Setting up Thunder Client collections..."
cat > .thunder-client/collections/spbr-api-collection.json << 'EOF'
{
  "client": "Thunder Client",
  "collectionName": "San Pedro Beach Resort API",
  "dateExported": "2025-01-27T00:00:00.000Z",
  "version": "1.1",
  "folders": [
    {
      "name": "Authentication",
      "items": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/v1/token?grant_type=password",
            "headers": [
              {
                "name": "Content-Type",
                "value": "application/json"
              },
              {
                "name": "apikey",
                "value": "{{supabaseAnonKey}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"{{email}}\",\n  \"password\": \"{{password}}\"\n}"
            }
          }
        },
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/v1/signup",
            "headers": [
              {
                "name": "Content-Type",
                "value": "application/json"
              },
              {
                "name": "apikey",
                "value": "{{supabaseAnonKey}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"{{email}}\",\n  \"password\": \"{{password}}\",\n  \"data\": {\n    \"first_name\": \"{{firstName}}\",\n    \"last_name\": \"{{lastName}}\",\n    \"role\": \"{{role}}\"\n  }\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Bookings",
      "items": [
        {
          "name": "Get All Bookings",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/rest/v1/bookings?select=*",
            "headers": [
              {
                "name": "apikey",
                "value": "{{supabaseAnonKey}}"
              },
              {
                "name": "Authorization",
                "value": "Bearer {{accessToken}}"
              }
            ]
          }
        },
        {
          "name": "Create Booking",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/rest/v1/bookings",
            "headers": [
              {
                "name": "Content-Type",
                "value": "application/json"
              },
              {
                "name": "apikey",
                "value": "{{supabaseAnonKey}}"
              },
              {
                "name": "Authorization",
                "value": "Bearer {{accessToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"guest_id\": \"{{guestId}}\",\n  \"unit_id\": \"{{unitId}}\",\n  \"check_in_date\": \"{{checkInDate}}\",\n  \"check_out_date\": \"{{checkOutDate}}\",\n  \"total_amount\": {{totalAmount}},\n  \"status\": \"confirmed\"\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Inventory",
      "items": [
        {
          "name": "Get Inventory Items",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/rest/v1/inventory_items?select=*",
            "headers": [
              {
                "name": "apikey",
                "value": "{{supabaseAnonKey}}"
              },
              {
                "name": "Authorization",
                "value": "Bearer {{accessToken}}"
              }
            ]
          }
        },
        {
          "name": "Update Stock",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/rest/v1/inventory_items?id=eq.{{itemId}}",
            "headers": [
              {
                "name": "Content-Type",
                "value": "application/json"
              },
              {
                "name": "apikey",
                "value": "{{supabaseAnonKey}}"
              },
              {
                "name": "Authorization",
                "value": "Bearer {{accessToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"current_stock\": {{newStock}}\n}"
            }
          }
        }
      ]
    }
  ],
  "environments": [
    {
      "name": "Development",
      "data": [
        {
          "name": "baseUrl",
          "value": "https://your-project.supabase.co"
        },
        {
          "name": "supabaseAnonKey",
          "value": "your_supabase_anon_key_here"
        },
        {
          "name": "accessToken",
          "value": "your_access_token_here"
        },
        {
          "name": "email",
          "value": "admin@sanpedrobeachresort.com"
        },
        {
          "name": "password",
          "value": "your_password_here"
        }
      ]
    }
  ]
}
EOF

echo "✅ Thunder Client collections created"

# Create database query templates
echo "📊 Creating database query templates..."
cat > docs/database-queries/01-user-management.sql << 'EOF'
-- User Management Queries
-- San Pedro Beach Resort Database

-- Get all user profiles with roles
SELECT 
  up.id,
  up.first_name,
  up.last_name,
  up.email,
  up.role,
  up.created_at
FROM user_profiles up
ORDER BY up.created_at DESC;

-- Get employees with user profiles
SELECT 
  e.id,
  e.first_name,
  e.last_name,
  e.position,
  e.hire_date,
  up.email,
  up.role
FROM employees e
LEFT JOIN user_profiles up ON e.user_profile_id = up.id
ORDER BY e.hire_date DESC;
EOF

cat > docs/database-queries/02-booking-system.sql << 'EOF'
-- Booking System Queries
-- San Pedro Beach Resort Database

-- Get all active bookings
SELECT 
  b.id,
  b.check_in_date,
  b.check_out_date,
  b.total_amount,
  b.status,
  g.first_name || ' ' || g.last_name AS guest_name,
  g.phone,
  u.unit_number,
  u.unit_type
FROM bookings b
JOIN guests g ON b.guest_id = g.id
JOIN units u ON b.unit_id = u.id
WHERE b.status = 'confirmed'
ORDER BY b.check_in_date;

-- Get booking revenue by month
SELECT 
  DATE_TRUNC('month', b.check_in_date) AS month,
  COUNT(*) AS total_bookings,
  SUM(b.total_amount) AS total_revenue
FROM bookings b
WHERE b.status = 'confirmed'
GROUP BY DATE_TRUNC('month', b.check_in_date)
ORDER BY month DESC;
EOF

cat > docs/database-queries/03-inventory-management.sql << 'EOF'
-- Inventory Management Queries
-- San Pedro Beach Resort Database

-- Get inventory items with categories
SELECT 
  ii.id,
  ii.name,
  ii.description,
  ii.current_stock,
  ii.restock_level,
  ii.unit_price,
  pc.name AS category_name,
  s.name AS supplier_name
FROM inventory_items ii
LEFT JOIN product_categories pc ON ii.category_id = pc.id
LEFT JOIN suppliers s ON ii.supplier_id = s.id
ORDER BY ii.current_stock ASC;

-- Get low stock items
SELECT 
  ii.name,
  ii.current_stock,
  ii.restock_level,
  ii.unit_price,
  pc.name AS category
FROM inventory_items ii
LEFT JOIN product_categories pc ON ii.category_id = pc.id
WHERE ii.current_stock <= ii.restock_level
ORDER BY ii.current_stock ASC;
EOF

cat > docs/database-queries/04-financial-reports.sql << 'EOF'
-- Financial Reports Queries
-- San Pedro Beach Resort Database

-- Get total expenses by month
SELECT 
  DATE_TRUNC('month', TO_DATE(e.date, 'YYYY-MM-DD')) AS month,
  SUM(CAST(e.amount AS NUMERIC(10,2))) AS total_expenses
FROM expenses_2025 e
GROUP BY DATE_TRUNC('month', TO_DATE(e.date, 'YYYY-MM-DD'))
ORDER BY month DESC;

-- Get employee salary total
SELECT 
  DATE_TRUNC('month', TO_DATE(es.date, 'YYYY-MM-DD')) AS month,
  SUM(CAST(es.amount AS NUMERIC(10,2))) AS total_salaries
FROM employee_salaries_2025 es
GROUP BY DATE_TRUNC('month', TO_DATE(es.date, 'YYYY-MM-DD'))
ORDER BY month DESC;
EOF

echo "✅ Database query templates created"

# Create database connection test script
echo "🔧 Creating database connection test script..."
cat > scripts/test-database-connection.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('📊 Connection details:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
    
    // Test table access
    const tables = [
      'user_profiles',
      'employees', 
      'guests',
      'units',
      'bookings',
      'inventory_items',
      'product_categories'
    ];
    
    console.log('\n📋 Testing table access:');
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testDatabaseConnection();
EOF

echo "✅ Database connection test script created"

# Create database setup instructions
echo "📚 Creating setup instructions..."
cat > DATABASE_SETUP_INSTRUCTIONS.md << 'EOF'
# 🗄️ Database Extensions Setup Instructions

## 🚀 Quick Setup

### 1. Environment Variables
Copy `.env.template` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.template .env.local
# Edit .env.local with your actual Supabase credentials
```

### 2. Test Database Connection
```bash
node scripts/test-database-connection.js
```

### 3. VS Code Database Connection
1. Open VS Code Command Palette (`Cmd+Shift+P`)
2. Type "SQLTools: Add Connection"
3. Select "PostgreSQL"
4. Use these settings:
   - Name: "San Pedro Beach Resort - Production"
   - Server: `db.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: Your Supabase database password
   - SSL: Enabled

## 📊 Available Database Tools

### SQLTools
- Connect directly to Supabase
- Run queries and view results
- Browse database schema
- Export data

### Database Client
- Universal database client
- Browse tables and relationships
- Execute queries
- Export data in various formats

### Rainbow CSV
- CSV syntax highlighting
- Data validation
- Table view editing
- Import/export functionality

### Thunder Client
- API testing for your booking system
- Pre-configured collections
- Environment variables support
- Request/response history

## 🔧 SQL Snippets

Use these snippets in SQL files:
- `spbr` - Basic SPBR query template
- `spbr-users` - User management queries
- `spbr-bookings` - Booking system queries
- `spbr-inventory` - Inventory management queries
- `spbr-finance` - Financial reports
- `spbr-audit` - Audit and security queries
- `spbr-validate` - Data validation queries
- `spbr-performance` - Performance optimization

## 📋 Daily Database Workflow

### Morning
1. Open SQLTools panel
2. Connect to Supabase
3. Run validation queries (`spbr-validate`)
4. Check for low stock items (`spbr-inventory`)

### Development
1. Use SQL snippets for common queries
2. Test APIs with Thunder Client
3. Validate CSV imports with Rainbow CSV
4. Export data as needed

### End of Day
1. Run financial reports (`spbr-finance`)
2. Check audit logs (`spbr-audit`)
3. Save Thunder Client collections
4. Commit any schema changes

## 🎯 Key Benefits

- **Direct Database Access**: Connect to Supabase directly from VS Code
- **Query Templates**: Pre-built queries for common operations
- **API Testing**: Test your booking system APIs
- **Data Validation**: Validate CSV imports and exports
- **Performance Monitoring**: Track database performance
- **Audit Trail**: Monitor database changes and access

## 🔧 Troubleshooting

### Connection Issues
1. Verify Supabase credentials in `.env.local`
2. Check network connectivity
3. Ensure SSL is enabled for Supabase
4. Test with the connection test script

### Extension Issues
1. Restart VS Code
2. Check if extensions are enabled
3. Update extensions if needed
4. Clear VS Code cache if necessary

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [SQLTools Documentation](https://vscode-sqltools.mteixeira.dev/)
- [Thunder Client Documentation](https://www.thunderclient.com/)
- [Rainbow CSV Documentation](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv)

---

**🎉 Your database extensions are now fully configured for maximum productivity!**
EOF

echo "✅ Setup instructions created"

echo ""
echo "🎉 Database Extensions Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy .env.template to .env.local and add your Supabase credentials"
echo "2. Test database connection: node scripts/test-database-connection.js"
echo "3. Open VS Code and configure SQLTools connection"
echo "4. Test Thunder Client collections"
echo "5. Review DATABASE_SETUP_INSTRUCTIONS.md for detailed guidance"
echo ""
echo "🚀 Your database workflow is now optimized for the San Pedro Beach Resort project!"
