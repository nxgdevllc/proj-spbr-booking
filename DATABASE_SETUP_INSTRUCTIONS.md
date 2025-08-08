# 🗄️ Database Extensions Setup Instructions

## 🚀 Quick Setup

### 1. Environment Variables

Copy `.env.template` to `.env.local` and fill in your Supabase credentials. If the template is missing, create `.env.local` with the keys below:

```bash
cp .env.template .env.local
# Required
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Optional (used by SQLTools connection):
# SUPABASE_DB_HOST=your-project.supabase.co
# SUPABASE_DB_NAME=postgres
# SUPABASE_DB_USER=postgres
# SUPABASE_DB_PASSWORD=your_database_password
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
4. Use these settings or ensure the following env vars exist in `.env.local` (the project uses them automatically):
   - Name: "San Pedro Beach Resort - Production"
   - Server: `${env:SUPABASE_DB_HOST}`
   - Port: `5432`
   - Database: `${env:SUPABASE_DB_NAME}`
   - Username: `${env:SUPABASE_DB_USER}`
   - Password: `${env:SUPABASE_DB_PASSWORD}`
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

## ▶️ Running .sql files from terminal

1. Ensure you have psql installed (macOS):

```bash
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

2. Add these to `.env.local` (copy host from Supabase Dashboard → Project Settings → Database → Connection info):

```bash
SUPABASE_DB_HOST=db.<your-project-ref>.supabase.co
SUPABASE_DB_PASSWORD=<your_db_password>
```

3. Run any SQL file:

```bash
chmod +x scripts/run-sql.sh
scripts/run-sql.sh docs/2025-01-27_phase1_critical_fixes.sql
```

If you get DNS errors, verify `SUPABASE_DB_HOST` is correct (do NOT prepend `db.` if your host already includes it, copy exactly from Supabase).
