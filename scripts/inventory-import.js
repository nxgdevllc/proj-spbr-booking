#!/usr/bin/env node

/**
 * Inventory Import Script for San Pedro Beach Resort
 * Processes INV1.csv and imports into Supabase inventory_items table
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Column mapping from CSV to database schema (matching actual DB schema)
const COLUMN_MAPPING = {
  'id': 'sid', // String ID from CSV
  'Product Name': 'product_name',
  'Price': 'price',
  'Size': 'size',
  'Units': 'units',
  'Category': 'category',
  'Min Level': 'min_level',
  'Stock': 'stock',
  'Supplier': 'supplier',
  'Barcode/QR2-Data': 'barcode'
  // Note: Other columns like restock_quantity, count, restock_price, notes, barcode_type, value, tags, photo_url are not in the DB schema
};

// Required columns for inventory items
const REQUIRED_COLUMNS = ['id', 'Product Name', 'Price', 'Category', 'Stock'];

// Data type validation rules (matching actual DB schema)
const VALIDATION_RULES = {
  'sid': { type: 'string', required: true },
  'product_name': { type: 'string', required: true },
  'price': { type: 'number', required: true, min: 0 },
  'size': { type: 'string', required: false },
  'units': { type: 'string', required: false },
  'category': { type: 'string', required: true },
  'min_level': { type: 'number', required: false, min: 0 },
  'stock': { type: 'number', required: true, min: 0 },
  'supplier': { type: 'string', required: false },
  'barcode': { type: 'string', required: false }
};

/**
 * Validate data type for a specific value
 */
function validateDataType(value, rule) {
  if (rule.required && (value === '' || value === null || value === undefined)) {
    return { isValid: false, error: 'Required field is empty' };
  }

  if (value === '' || value === null || value === undefined) {
    return { isValid: true }; // Optional field can be empty
  }

  switch (rule.type) {
    case 'string':
      return { isValid: typeof value === 'string' };
      
    case 'number':
      const num = parseFloat(value);
      if (isNaN(num) || !isFinite(num)) {
        return { isValid: false, error: 'Must be a valid number' };
      }
      if (rule.min !== undefined && num < rule.min) {
        return { isValid: false, error: `Must be at least ${rule.min}` };
      }
      return { isValid: true, value: num };
      
    default:
      return { isValid: true };
  }
}

/**
 * Clean and normalize category names
 */
function normalizeCategory(category) {
  if (!category || category.trim() === '') {
    return 'Uncategorized';
  }
  
  const normalized = category.trim();
  
  // Fix common category issues
  const categoryFixes = {
    'Cold Beverages': 'Cold Beverages', // Rice was incorrectly categorized
    'Food Packs': 'Food Packs',
    'Kitchen & Condiments': 'Kitchen & Condiments',
    'Supplies': 'Supplies',
    'Toiletries': 'Toiletries',
    'Hot Beverages': 'Hot Beverages',
    'Snacks': 'Snacks',
    'Alcoholic Beverages': 'Alcoholic Beverages',
    'Cigarettes': 'Cigarettes'
  };
  
  return categoryFixes[normalized] || normalized;
}

/**
 * Validate CSV file structure and data
 */
function validateCSV(filePath) {
  console.log(`🔍 Validating CSV file: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Validate headers
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    console.log(`✅ Headers validated: ${headers.length} columns found`);
    
    // Validate data rows
    const errors = [];
    const warnings = [];
    const validRows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
        continue;
      }
      
      // Create row object
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      // Validate each field
      const rowErrors = [];
      const rowWarnings = [];
      
      Object.keys(COLUMN_MAPPING).forEach(csvColumn => {
        const dbColumn = COLUMN_MAPPING[csvColumn];
        const value = row[csvColumn];
        const rule = VALIDATION_RULES[dbColumn];
        
        if (rule) {
          const validation = validateDataType(value, rule);
          if (!validation.isValid) {
            rowErrors.push(`${csvColumn}: ${validation.error}`);
          } else if (validation.value !== undefined) {
            row[dbColumn] = validation.value; // Convert to proper type
          }
        }
      });
      
      // Check for missing category
      if (!row['Category'] || row['Category'].trim() === '') {
        row['Category'] = 'Uncategorized';
        rowWarnings.push('Category was empty, set to "Uncategorized"');
      }
      
      if (rowErrors.length > 0) {
        errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
      } else {
        if (rowWarnings.length > 0) {
          warnings.push(`Row ${i + 1}: ${rowWarnings.join(', ')}`);
        }
        validRows.push(row);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validRows,
      totalRows: lines.length - 1,
      validRowCount: validRows.length
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message],
      warnings: [],
      validRows: [],
      totalRows: 0,
      validRowCount: 0
    };
  }
}

/**
 * Transform CSV data to database format
 */
function transformData(validRows) {
  console.log('🔄 Transforming data to database format...');
  
  return validRows.map(row => {
    const transformed = {
      sid: row['id'] || null,
      product_name: row['Product Name'] || '',
      price: parseFloat(row['Price']) || 0,
      size: row['Size'] || null,
      units: row['Units'] || null,
      category: normalizeCategory(row['Category']),
      min_level: row['Min Level'] ? parseFloat(row['Min Level']) : null,
      stock: parseInt(row['Stock']) || 0,
      supplier: row['Supplier'] || null,
      barcode: row['Barcode/QR2-Data'] || null
    };
    
    return transformed;
  });
}

/**
 * Clear existing inventory data
 */
async function clearInventory() {
  console.log('🗑️  Clearing existing inventory data...');
  
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (error) {
      throw new Error(`Failed to clear inventory: ${error.message}`);
    }
    
    console.log('✅ Existing inventory data cleared');
    return true;
  } catch (error) {
    console.error(`❌ Error clearing inventory: ${error.message}`);
    return false;
  }
}

/**
 * Import inventory data into Supabase
 */
async function importInventory(data) {
  console.log(`📥 Importing ${data.length} inventory items...`);
  
  try {
    // Insert data in batches
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('inventory_items')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
        errorCount += batch.length;
      } else {
        console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)`);
        successCount += batch.length;
      }
    }
    
    return { successCount, errorCount };
  } catch (error) {
    console.error(`❌ Import failed: ${error.message}`);
    return { successCount: 0, errorCount: data.length };
  }
}

/**
 * Generate import report
 */
function generateReport(validation, transformation, importResult) {
  console.log('\n📊 IMPORT REPORT');
  console.log('='.repeat(50));
  
  console.log(`📁 File: INV1_final.csv`);
  console.log(`📊 Total rows processed: ${validation.totalRows}`);
  console.log(`✅ Valid rows: ${validation.validRowCount}`);
  console.log(`❌ Invalid rows: ${validation.totalRows - validation.validRowCount}`);
  
  if (validation.errors.length > 0) {
    console.log(`\n❌ Validation Errors:`);
    validation.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log(`\n⚠️  Warnings:`);
    validation.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  console.log(`\n🔄 Data Transformation:`);
  console.log(`  - Transformed ${transformation.length} items`);
  
  // Category breakdown
  const categories = {};
  transformation.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1;
  });
  
  console.log(`\n📂 Categories:`);
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count} items`);
  });
  
  console.log(`\n📥 Import Results:`);
  console.log(`  - Successfully imported: ${importResult.successCount} items`);
  console.log(`  - Failed imports: ${importResult.errorCount} items`);
  
  // Price statistics
  const prices = transformation.map(item => item.price).filter(p => p > 0);
  if (prices.length > 0) {
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    console.log(`\n💰 Price Statistics:`);
    console.log(`  - Average price: ₱${avgPrice.toFixed(2)}`);
    console.log(`  - Price range: ₱${minPrice.toFixed(2)} - ₱${maxPrice.toFixed(2)}`);
  }
  
  // Stock statistics
  const stocks = transformation.map(item => item.stock);
  const totalStock = stocks.reduce((sum, s) => sum + s, 0);
  const avgStock = totalStock / stocks.length;
  
  console.log(`\n📦 Stock Statistics:`);
  console.log(`  - Total stock items: ${totalStock}`);
  console.log(`  - Average stock per item: ${avgStock.toFixed(1)}`);
  
  console.log('\n' + '='.repeat(50));
}

/**
 * Main import function
 */
async function importInventoryFile() {
  const csvPath = path.join(__dirname, '../public/csv-imports/INV1_final.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ INV1_final.csv file not found in public/csv-imports/');
    return;
  }
  
  console.log('🚀 Starting inventory import process...\n');
  
  // Step 1: Validate CSV
  const validation = validateCSV(csvPath);
  
  if (!validation.isValid) {
    console.error('❌ CSV validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    return;
  }
  
  console.log(`✅ CSV validation passed: ${validation.validRowCount}/${validation.totalRows} rows valid`);
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  // Step 2: Transform data
  const transformedData = transformData(validation.validRows);
  console.log(`✅ Data transformation completed: ${transformedData.length} items`);
  
  // Step 3: Clear existing inventory
  const cleared = await clearInventory();
  if (!cleared) {
    console.error('❌ Failed to clear existing inventory. Aborting import.');
    return;
  }
  
  // Step 4: Import new data
  const importResult = await importInventory(transformedData);
  
  // Step 5: Generate report
  generateReport(validation, transformedData, importResult);
  
  if (importResult.successCount > 0) {
    console.log('\n🎉 Inventory import completed successfully!');
  } else {
    console.log('\n❌ Inventory import failed!');
  }
}

// Run the script if called directly
if (require.main === module) {
  importInventoryFile().catch(console.error);
}

module.exports = {
  validateCSV,
  transformData,
  clearInventory,
  importInventory,
  generateReport
};
