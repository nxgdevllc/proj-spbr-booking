# 🚀 VS Code Quick Reference - San Pedro Beach Resort

## 🎯 Essential Extensions Quick Guide

### 📊 Database (Critical for your project)

| Extension           | Purpose             | Key Features                                  |
| ------------------- | ------------------- | --------------------------------------------- |
| **SQLTools**        | Database connection | Connect to Supabase, run queries, view schema |
| **Database Client** | Universal DB client | Browse tables, execute queries, export data   |
| **Rainbow CSV**     | CSV management      | Syntax highlighting, validation, table view   |

### ⚛️ TypeScript & React

| Extension                 | Purpose               | Key Features                        |
| ------------------------- | --------------------- | ----------------------------------- |
| **Auto Import**           | Auto-import modules   | Automatic TypeScript imports        |
| **Tailwind IntelliSense** | Tailwind autocomplete | Full Tailwind class suggestions     |
| **React Snippets**        | Quick React code      | Type `rfc` for functional component |

### 🔧 Code Quality

| Extension      | Purpose         | Key Features               |
| -------------- | --------------- | -------------------------- |
| **Prettier**   | Code formatting | Auto-format on save        |
| **ESLint**     | Code linting    | Error detection and fixing |
| **Error Lens** | Error display   | Inline error messages      |

### 🧪 API Testing

| Extension          | Purpose      | Key Features           |
| ------------------ | ------------ | ---------------------- |
| **Thunder Client** | API testing  | Test your booking APIs |
| **REST Client**    | REST testing | Test with .http files  |

## ⚡ Quick Commands

### Database Operations

```bash
# Connect to Supabase
Cmd+Shift+P → "SQLTools: Add Connection" → PostgreSQL
Server: db.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: [your-supabase-password]
```

### Code Snippets

```typescript
// React Functional Component
rfc + Tab → Creates functional component

// Next.js Page
npage + Tab → Creates Next.js page

// Tailwind Classes
// Just start typing: bg- → bg-blue-500, bg-green-600, etc.
```

### File Operations

```bash
# Format Document
Shift+Alt+F → Format current file

# Quick File Search
Cmd+P → Quick file open

# Command Palette
Cmd+Shift+P → All commands
```

## 🎨 Theme Setup

### Recommended Theme

1. `Cmd+Shift+P` → "Preferences: Color Theme"
2. Select "Material Theme" or "Dracula"

### Icons

1. `Cmd+Shift+P` → "Preferences: File Icon Theme"
2. Select "Material Icon Theme"

## 📊 Database Workflow

### Connect to Supabase

1. Open Command Palette (`Cmd+Shift+P`)
2. Type "SQLTools: Add Connection"
3. Select PostgreSQL
4. Enter Supabase credentials

### Run Queries

1. Open any `.sql` file
2. Write your query
3. `Cmd+Shift+E` to execute
4. View results in SQLTools panel

### View Schema

1. Open SQLTools panel
2. Expand your connection
3. Browse tables and relationships

## 📈 CSV Management

### View CSV Files

- Open any `.csv` file
- Rainbow CSV will highlight syntax
- Use table view for editing

### Validate CSV

- Rainbow CSV shows validation errors
- Check for proper formatting
- Verify data types

## 🧪 API Testing

### Thunder Client

1. Open Thunder Client panel
2. Create new request
3. Test your booking system APIs
4. Save collections for reuse

### REST Client

1. Create `.http` file
2. Write API requests
3. Click "Send Request" to test

## 🔧 Troubleshooting

### Extensions Not Working

```bash
# Restart VS Code
Cmd+Q → Quit VS Code → Reopen

# Check Extensions
Cmd+Shift+X → View Extensions
```

### Database Connection Issues

```bash
# Check Connection
SQLTools panel → Right-click connection → Test Connection

# Verify Credentials
Check Supabase dashboard for correct credentials
```

### Formatting Issues

```bash
# Set Prettier as Default
Right-click in file → "Format Document With..." → Prettier

# Check Settings
Cmd+, → Search "format on save" → Enable
```

## 📋 Daily Workflow

### Morning Setup

1. Open project in VS Code
2. Check SQLTools connection
3. Open Thunder Client for API testing
4. Verify Tailwind autocomplete

### Development

1. Use React snippets for components
2. Auto-import TypeScript modules
3. Format code on save
4. Test APIs with Thunder Client

### Database Work

1. Use SQLTools for queries
2. Format SQL with built-in formatter
3. Export data with Database Client
4. Validate CSV imports with Rainbow CSV

### End of Day

1. Commit changes with GitLens
2. Check TODO Tree for pending items
3. Save Thunder Client collections
4. Close VS Code

---

**🎯 This setup gives you maximum automation for database operations, TypeScript development, and API testing!**
