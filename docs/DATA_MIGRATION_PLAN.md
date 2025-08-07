# Data Migration Plan: Google Sheets → Supabase

## Migration Overview

This document outlines the complete strategy for migrating San Pedro Beach Resort's existing Google Sheets data to the new Supabase database system.

## Current Data Assessment

### Typical Google Sheets Structure (Assumptions)
Based on common resort operations, the current sheets likely contain:

1. **Guest Information Sheet**
   - Guest names, contact details, ID numbers
   - Booking history and preferences
   - Emergency contacts

2. **Booking Records Sheet**
   - Reservation dates, unit assignments
   - Payment status and amounts
   - Check-in/check-out records

3. **Unit Management Sheet**
   - Unit types, pricing, availability
   - Maintenance schedules and status
   - Unit amenities and descriptions

4. **Financial Records Sheet**
   - Daily income and expenses
   - Payment methods and references
   - Vendor payments and receipts

5. **Inventory Sheet**
   - Product lists with current stock
   - Purchase records and suppliers
   - Sales transactions

6. **Employee Records Sheet**
   - Staff information and schedules
   - Payroll data and time tracking
   - Task assignments

## Migration Strategy

### Phase 1: Data Discovery & Cleaning (Week 1)

#### Step 1: Data Export and Analysis
```bash
# Export all sheets to CSV format
# Recommended naming convention:
guests_export.csv
bookings_export.csv
units_export.csv
financial_export.csv
inventory_export.csv
employees_export.csv
```

#### Step 2: Data Quality Assessment
```python
# Python script for data analysis
import pandas as pd
import numpy as np

def analyze_data_quality(csv_file):
    df = pd.read_csv(csv_file)
    
    analysis = {
        'total_rows': len(df),
        'columns': list(df.columns),
        'missing_values': df.isnull().sum().to_dict(),
        'duplicate_rows': df.duplicated().sum(),
        'data_types': df.dtypes.to_dict()
    }
    
    return analysis

# Run analysis on each exported file
files = ['guests_export.csv', 'bookings_export.csv', ...]
for file in files:
    analysis = analyze_data_quality(file)
    print(f"Analysis for {file}:", analysis)
```

#### Step 3: Data Cleaning Rules
```python
# Common data cleaning operations
def clean_phone_numbers(phone):
    # Standardize Philippine phone numbers
    # Remove spaces, dashes, parentheses
    # Add country code if missing
    import re
    phone = re.sub(r'[^\d+]', '', str(phone))
    if phone.startswith('09'):
        phone = '+63' + phone[1:]
    return phone

def clean_currency_values(amount):
    # Remove currency symbols, commas
    # Convert to decimal format
    import re
    amount = re.sub(r'[₱,\s]', '', str(amount))
    return float(amount) if amount else 0.0

def standardize_dates(date_str):
    # Convert various date formats to ISO format
    from dateutil import parser
    try:
        return parser.parse(date_str).date()
    except:
        return None
```

### Phase 2: Database Setup & Testing (Week 1)

#### Step 1: Supabase Project Setup
```sql
-- Create Supabase project
-- Apply database schema from DATABASE_SCHEMA.sql
-- Set up authentication and RLS policies
-- Create initial admin user
```

#### Step 2: Migration Tool Development
```typescript
// Next.js migration interface
interface MigrationTool {
  uploadCSV: (file: File) => Promise<void>;
  previewData: (data: any[]) => void;
  validateData: (data: any[]) => ValidationResult[];
  mapColumns: (csvColumns: string[], dbColumns: string[]) => ColumnMapping;
  executeMigration: (mappedData: any[]) => Promise<MigrationResult>;
}

// Column mapping interface
interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
  transform?: (value: any) => any;
  required: boolean;
}
```

### Phase 3: Data Transformation & Mapping (Week 2)

#### Guest Data Mapping
```typescript
const guestMapping: ColumnMapping[] = [
  { csvColumn: 'Full Name', dbColumn: 'first_name', transform: extractFirstName },
  { csvColumn: 'Full Name', dbColumn: 'last_name', transform: extractLastName },
  { csvColumn: 'Phone', dbColumn: 'phone', transform: cleanPhoneNumbers },
  { csvColumn: 'Email', dbColumn: 'email', transform: validateEmail },
  { csvColumn: 'ID Number', dbColumn: 'id_number', required: false },
  { csvColumn: 'Address', dbColumn: 'address', required: false }
];

function transformGuestData(csvRow: any): Guest {
  return {
    id: generateUUID(),
    first_name: extractFirstName(csvRow['Full Name']),
    last_name: extractLastName(csvRow['Full Name']),
    phone: cleanPhoneNumbers(csvRow['Phone']),
    email: validateEmail(csvRow['Email']),
    id_number: csvRow['ID Number'] || null,
    address: csvRow['Address'] || null,
    created_at: new Date(),
    updated_at: new Date()
  };
}
```

#### Booking Data Mapping
```typescript
const bookingMapping: ColumnMapping[] = [
  { csvColumn: 'Check-in Date', dbColumn: 'check_in_date', transform: standardizeDates },
  { csvColumn: 'Check-out Date', dbColumn: 'check_out_date', transform: standardizeDates },
  { csvColumn: 'Unit', dbColumn: 'unit_id', transform: lookupUnitId },
  { csvColumn: 'Guest Name', dbColumn: 'guest_id', transform: lookupGuestId },
  { csvColumn: 'Total Amount', dbColumn: 'total_amount', transform: cleanCurrencyValues },
  { csvColumn: 'Status', dbColumn: 'status', transform: standardizeStatus }
];

function transformBookingData(csvRow: any): Booking {
  return {
    id: generateUUID(),
    booking_number: generateBookingNumber(),
    guest_id: lookupGuestId(csvRow['Guest Name']),
    unit_id: lookupUnitId(csvRow['Unit']),
    check_in_date: standardizeDates(csvRow['Check-in Date']),
    check_out_date: standardizeDates(csvRow['Check-out Date']),
    total_amount: cleanCurrencyValues(csvRow['Total Amount']),
    status: standardizeStatus(csvRow['Status']),
    created_at: new Date(),
    updated_at: new Date()
  };
}
```

#### Financial Data Mapping
```typescript
const transactionMapping: ColumnMapping[] = [
  { csvColumn: 'Date', dbColumn: 'transaction_date', transform: standardizeDates },
  { csvColumn: 'Description', dbColumn: 'description', required: true },
  { csvColumn: 'Amount', dbColumn: 'amount', transform: cleanCurrencyValues },
  { csvColumn: 'Type', dbColumn: 'type', transform: categorizeTransaction },
  { csvColumn: 'Payment Method', dbColumn: 'payment_method', transform: standardizePaymentMethod }
];
```

### Phase 4: Migration Execution (Week 2)

#### Step 1: Validation and Testing
```typescript
async function validateMigrationData(data: any[], tableName: string) {
  const errors: ValidationError[] = [];
  
  for (const row of data) {
    // Check required fields
    // Validate data types
    // Check foreign key constraints
    // Validate business rules
    
    if (tableName === 'bookings') {
      if (new Date(row.check_in_date) >= new Date(row.check_out_date)) {
        errors.push({
          row: row,
          field: 'check_out_date',
          message: 'Check-out date must be after check-in date'
        });
      }
    }
    
    if (tableName === 'guests') {
      if (!isValidPhoneNumber(row.phone)) {
        errors.push({
          row: row,
          field: 'phone',
          message: 'Invalid phone number format'
        });
      }
    }
  }
  
  return errors;
}
```

#### Step 2: Batch Migration Process
```typescript
async function executeBatchMigration(data: any[], tableName: string, batchSize: number = 100) {
  const batches = chunkArray(data, batchSize);
  const results = [];
  
  for (const batch of batches) {
    try {
      const { data: insertedData, error } = await supabase
        .from(tableName)
        .insert(batch);
        
      if (error) throw error;
      
      results.push({
        batch: batches.indexOf(batch) + 1,
        success: true,
        recordsInserted: batch.length
      });
      
    } catch (error) {
      results.push({
        batch: batches.indexOf(batch) + 1,
        success: false,
        error: error.message,
        failedRecords: batch
      });
    }
  }
  
  return results;
}
```

#### Step 3: Migration Order (Important!)
```typescript
// Migration must follow dependency order
const migrationOrder = [
  'unit_types',      // No dependencies
  'units',           // Depends on unit_types
  'guests',          // No dependencies
  'employees',       // Depends on user_profiles
  'suppliers',       // No dependencies
  'product_categories', // No dependencies
  'products',        // Depends on categories, suppliers
  'bookings',        // Depends on guests, units
  'payments',        // Depends on bookings
  'transactions',    // Can reference bookings
  'inventory_movements', // Depends on products
  'sales',           // No dependencies
  'sale_items'       // Depends on sales, products
];
```

### Phase 5: Data Verification (Week 3)

#### Verification Checklist
```sql
-- Record count verification
SELECT 'guests' as table_name, COUNT(*) as record_count FROM guests
UNION ALL
SELECT 'bookings' as table_name, COUNT(*) as record_count FROM bookings
UNION ALL
SELECT 'payments' as table_name, COUNT(*) as record_count FROM payments
-- ... continue for all tables

-- Data integrity checks
-- Check for orphaned records
SELECT b.* FROM bookings b 
LEFT JOIN guests g ON b.guest_id = g.id 
WHERE g.id IS NULL;

-- Financial reconciliation
SELECT 
  SUM(amount) as total_payments,
  COUNT(*) as payment_count
FROM payments 
WHERE status = 'completed';

-- Inventory verification
SELECT 
  p.name,
  p.current_stock,
  COALESCE(SUM(CASE WHEN im.movement_type = 'stock_in' THEN im.quantity ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN im.movement_type = 'stock_out' THEN im.quantity ELSE 0 END), 0) as calculated_stock
FROM products p
LEFT JOIN inventory_movements im ON p.id = im.product_id
GROUP BY p.id, p.name, p.current_stock;
```

### Phase 6: Parallel Operation (Week 3-4)

#### Dual System Operation
```typescript
// Sync service to keep both systems updated
class DataSyncService {
  async syncNewBooking(booking: Booking) {
    // Insert into new system
    await supabase.from('bookings').insert(booking);
    
    // Update Google Sheets (temporary)
    await this.updateGoogleSheets('bookings', booking);
  }
  
  async syncPayment(payment: Payment) {
    // Insert into new system
    await supabase.from('payments').insert(payment);
    
    // Update financial sheet
    await this.updateGoogleSheets('payments', payment);
  }
}
```

#### Staff Training Period
- **Week 3**: Staff training on new system
- **Week 4**: Supervised parallel operation
- **Week 5**: Independent operation with support
- **Week 6**: Full transition, sheets archived

### Migration Tools & Interface

#### Web-based Migration Dashboard
```typescript
// Migration dashboard components
const MigrationDashboard = () => {
  return (
    <div className="migration-dashboard">
      <FileUpload onUpload={handleFileUpload} />
      <DataPreview data={previewData} />
      <ColumnMapper mapping={columnMapping} />
      <ValidationResults errors={validationErrors} />
      <MigrationProgress status={migrationStatus} />
      <ResultsSummary results={migrationResults} />
    </div>
  );
};
```

#### Command Line Tools
```bash
# Migration CLI tools
npm run migrate:validate -- --file=guests.csv --table=guests
npm run migrate:execute -- --file=guests.csv --table=guests --batch-size=50
npm run migrate:verify -- --table=guests
npm run migrate:rollback -- --migration-id=migration_001
```

### Rollback Strategy

#### Backup Before Migration
```sql
-- Create backup tables
CREATE TABLE guests_backup AS SELECT * FROM guests;
CREATE TABLE bookings_backup AS SELECT * FROM bookings;
-- ... for all tables
```

#### Rollback Procedures
```typescript
async function rollbackMigration(migrationId: string) {
  // Get migration details
  const migration = await getMigrationDetails(migrationId);
  
  // Delete migrated records
  for (const table of migration.tables) {
    await supabase
      .from(table)
      .delete()
      .in('id', migration.insertedIds[table]);
  }
  
  // Restore from backup if needed
  await restoreFromBackup(migration.backupId);
}
```

### Success Metrics

#### Migration Success Criteria
- **Data Completeness**: 100% of critical data migrated
- **Data Accuracy**: <0.1% error rate in financial data
- **Performance**: System response time <2 seconds
- **User Adoption**: Staff comfortable with new system within 2 weeks
- **Business Continuity**: Zero downtime during transition

#### Post-Migration Monitoring
```typescript
// Monitor data consistency
const monitoringChecks = [
  'daily_booking_count_match',
  'financial_totals_reconciliation',
  'inventory_levels_accuracy',
  'guest_data_completeness'
];

// Run daily for first month
setInterval(runConsistencyChecks, 24 * 60 * 60 * 1000);
```

### Risk Mitigation

#### Common Migration Risks
1. **Data Loss**: Multiple backups, staged migration
2. **Downtime**: Parallel operation period
3. **Data Corruption**: Validation at every step
4. **Staff Resistance**: Comprehensive training program
5. **Performance Issues**: Load testing before go-live

#### Contingency Plans
- **Immediate Rollback**: Available within 1 hour
- **Data Recovery**: Point-in-time restore capability
- **Alternative Access**: Mobile hotspot for internet issues
- **Manual Procedures**: Paper backup forms for critical operations

This comprehensive migration plan ensures a smooth, safe transition from Google Sheets to the new Supabase-powered system while maintaining business operations and data integrity throughout the process.