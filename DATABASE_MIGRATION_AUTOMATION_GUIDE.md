# 🗄️ Database Migration Automation Guide

## 🚀 **Automated Migration Tools Available**

You have **3 different ways** to run your SQL migration files automatically instead of manually copying and pasting into Supabase:

### **1. SQLTools Integration (Recommended)**

**Best for**: Full control with visual feedback

```bash
npm run migrate:sqltools
```

**How it works:**

- Opens each migration file directly in VS Code with SQLTools
- You can see the full SQL before executing
- Execute with `Cmd+Shift+E` after connecting to database
- Full error visibility and query history
- Can modify queries before execution if needed

### **2. Direct Supabase Execution**

**Best for**: Fully automated execution

```bash
npm run migrate:direct
```

**How it works:**

- Automatically connects to Supabase using your `.env.local` credentials
- Executes all migration files in the correct order
- Provides detailed progress and error reporting
- Continues on non-critical errors
- Full logging and summary report

### **3. Manual Guided Process**

**Best for**: Step-by-step verification

```bash
npm run migrate
```

**How it works:**

- Loads and validates each migration file
- Provides detailed progress reporting
- You confirm each step before proceeding
- Full error handling with recovery options

---

## 🛠️ **Your VS Code Database Setup**

### **SQLTools Extension**

✅ **Already Configured** with:

- Direct Supabase PostgreSQL connection
- Auto-completion for table names and columns
- Query history and result export
- Real-time error highlighting

### **Connection Details**

Your SQLTools is pre-configured with:

- **Connection Name**: "San Pedro Beach Resort - Production"
- **Server**: `db.supabase.co`
- **Database**: `postgres`
- **Credentials**: From your `.env.local` file

---

## 📋 **Step-by-Step Migration Process**

### **Option A: SQLTools Integration (Recommended)**

1. **Run the migration script**:

   ```bash
   npm run migrate:sqltools
   ```

2. **For each migration file**:

   - File opens automatically in VS Code
   - Press `Cmd+Shift+P` → "SQLTools: Connect to Database"
   - Select "San Pedro Beach Resort - Production"
   - Press `Cmd+Shift+E` to execute the entire file
   - Review results in the SQLTools output panel
   - Press Enter in terminal to continue to next migration

3. **Benefits**:
   - ✅ Full visibility of each SQL statement
   - ✅ Syntax highlighting and error detection
   - ✅ Query result preview
   - ✅ Ability to modify queries before execution
   - ✅ Complete query history

### **Option B: Fully Automated**

1. **Ensure your environment is set up**:

   ```bash
   # Check that these are set in .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Run automated migration**:

   ```bash
   npm run migrate:direct
   ```

3. **What happens**:
   - ✅ Automatic database connection verification
   - ✅ Sequential execution of all migration files
   - ✅ Detailed progress reporting with colors
   - ✅ Error handling with recovery options
   - ✅ Comprehensive completion summary

---

## 🎯 **Migration Files Ready to Execute**

### **Phase 1: Critical Fixes**

**File**: `docs/2025-01-27_phase1_critical_fixes.sql`
**Purpose**: UUID conversion, foreign keys, data types, RLS
**Expected Duration**: 2-3 minutes

### **Phase 2: Structure Improvements**

**File**: `docs/2025-01-27_phase2_structure_improvements.sql`
**Purpose**: Comprehensive RLS policies, constraints, audit triggers
**Expected Duration**: 3-5 minutes

### **Phase 3: Comprehensive Indexes**

**File**: `docs/2025-01-27_phase3_comprehensive_indexes.sql`
**Purpose**: Performance indexes, analytics views, maintenance functions
**Expected Duration**: 5-10 minutes

---

## ⚡ **Quick Start Commands**

```bash
# Option 1: SQLTools integration (recommended)
npm run migrate:sqltools

# Option 2: Fully automated
npm run migrate:direct

# Option 3: Manual guided process
npm run migrate

# Check if SQLTools is working
code --list-extensions | grep sqltools
```

---

## 🔧 **Troubleshooting**

### **SQLTools Connection Issues**

1. **Check VS Code Extensions**:

   ```bash
   code --list-extensions | grep -i sqltools
   ```

2. **Verify Environment Variables**:

   ```bash
   # Make sure these exist in .env.local
   cat .env.local | grep SUPABASE
   ```

3. **Test Direct Connection**:
   - Open VS Code Command Palette (`Cmd+Shift+P`)
   - Type "SQLTools: Add Connection"
   - Use your Supabase credentials manually

### **Migration Script Issues**

1. **Missing Dependencies**:

   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. **Permission Issues**:

   ```bash
   chmod +x scripts/run-migrations*.js
   ```

3. **Environment Variables**:
   ```bash
   # Copy template if .env.local doesn't exist
   cp .env.template .env.local
   # Edit with your actual Supabase credentials
   ```

---

## 🎉 **Benefits of Automated Migration**

### **vs Manual Copy/Paste to Supabase**

| Feature               | Manual    | SQLTools    | Automated    |
| --------------------- | --------- | ----------- | ------------ |
| **Speed**             | Slow ⏱️   | Fast ⚡     | Fastest 🚀   |
| **Error Handling**    | Manual 😓 | Visual ✅   | Automatic ✅ |
| **Progress Tracking** | None ❌   | Manual ✅   | Automatic ✅ |
| **Query History**     | None ❌   | Built-in ✅ | Logged ✅    |
| **Rollback**          | Manual ❌ | Manual ⚠️   | Scripted ✅  |
| **Validation**        | None ❌   | Syntax ✅   | Full ✅      |

### **Time Savings**

- **Manual Process**: ~30-45 minutes for all migrations
- **SQLTools Process**: ~10-15 minutes with full control
- **Automated Process**: ~5-10 minutes with monitoring

### **Error Reduction**

- **Manual**: High risk of copy/paste errors
- **SQLTools**: Medium risk, visual verification
- **Automated**: Low risk, comprehensive error handling

---

## 🚀 **Recommended Workflow**

### **For Development/Testing**

```bash
npm run migrate:sqltools
```

- Full visibility and control
- Can modify queries on the fly
- Perfect for debugging

### **For Production Deployment**

```bash
npm run migrate:direct
```

- Consistent execution
- Comprehensive logging
- Automated error handling

### **For Learning/Training**

```bash
npm run migrate
```

- Step-by-step process
- Educational value
- Maximum control

---

## 📊 **Next Steps After Migration**

### **Verification Commands**

```bash
# Test database connection
node scripts/test-database-connection.js

# Verify RLS policies
# (Run in SQLTools or Supabase)
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public';

# Check foreign key constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE contype = 'f';
```

### **Test Your Setup**

1. **Login System**: Try logging in with demo accounts
2. **RLS Policies**: Verify role-based access works
3. **Foreign Keys**: Test data integrity
4. **Performance**: Check query execution times

---

**🎯 You now have professional-grade database migration automation! No more manual copy/paste to Supabase. Use the tool that best fits your workflow and development style.**
