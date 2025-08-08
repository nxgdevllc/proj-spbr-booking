#!/usr/bin/env node

/**
 * CSV Validation and Import Script for San Pedro Beach Resort
 * Validates CSV files before importing into Supabase database
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CSV file validation rules
const VALIDATION_RULES = {
  'employees.csv': {
    required_columns: ['id', 'first_name', 'last_name', 'email', 'role', 'hire_date'],
    data_types: {
      id: 'string',
      first_name: 'string',
      last_name: 'string',
      email: 'email',
      role: 'enum',
      hire_date: 'date'
    },
    enum_values: {
      role: ['admin', 'manager', 'employee']
    }
  },
  'inventory_items.csv': {
    required_columns: ['id', 'product_name', 'category', 'price', 'stock', 'supplier'],
    data_types: {
      id: 'string',
      product_name: 'string',
      category: 'string',
      price: 'number',
      stock: 'number',
      supplier: 'string'
    }
  },
  'rental_units_pricing.csv': {
    required_columns: ['id', 'unit_id', 'rental_type', 'day_rate', 'night_rate'],
    data_types: {
      id: 'string',
      unit_id: 'string',
      rental_type: 'string',
      day_rate: 'number',
      night_rate: 'number'
    }
  }
};

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
    const fileName = path.basename(filePath);
    const rules = VALIDATION_RULES[fileName];
    
    if (!rules) {
      console.warn(`⚠️  No validation rules found for ${fileName}`);
      return { isValid: true, warnings: [`No validation rules for ${fileName}`] };
    }
    
    // Validate headers
    const missingColumns = rules.required_columns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    // Validate data rows
    const errors = [];
    const warnings = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
        continue;
      }
      
      // Validate each column
      headers.forEach((header, index) => {
        const value = values[index];
        const dataType = rules.data_types[header];
        
        if (dataType) {
          const validationResult = validateDataType(value, dataType, rules.enum_values?.[header]);
          if (!validationResult.isValid) {
            errors.push(`Row ${i + 1}, Column "${header}": ${validationResult.error}`);
          }
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowCount: lines.length - 1
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message],
      warnings: []
    };
  }
}

/**
 * Validate data type for a specific value
 */
function validateDataType(value, dataType, enumValues = null) {
  if (value === '' || value === null || value === undefined) {
    return { isValid: true }; // Allow empty values
  }
  
  switch (dataType) {
    case 'string':
      return { isValid: typeof value === 'string' };
      
    case 'number':
      const num = parseFloat(value);
      return { 
        isValid: !isNaN(num) && isFinite(num),
        error: !isNaN(num) && isFinite(num) ? null : 'Must be a valid number'
      };
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(value),
        error: emailRegex.test(value) ? null : 'Must be a valid email address'
      };
      
    case 'date':
      const date = new Date(value);
      return {
        isValid: !isNaN(date.getTime()),
        error: !isNaN(date.getTime()) ? null : 'Must be a valid date'
      };
      
    case 'enum':
      if (enumValues) {
        return {
          isValid: enumValues.includes(value.toLowerCase()),
          error: enumValues.includes(value.toLowerCase()) ? null : `Must be one of: ${enumValues.join(', ')}`
        };
      }
      return { isValid: true };
      
    default:
      return { isValid: true };
  }
}

/**
 * Import validated CSV data into Supabase
 */
async function importCSV(filePath, tableName) {
  console.log(`📥 Importing data to table: ${tableName}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      const row = {};
      headers.forEach((header, index) => {
        let value = values[index];
        
        // Convert empty strings to null
        if (value === '') {
          value = null;
        }
        
        // Convert numeric values
        if (!isNaN(value) && value !== null) {
          value = parseFloat(value);
        }
        
        row[header] = value;
      });
      
      data.push(row);
    }
    
    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (error) {
        throw new Error(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      }
      
      console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1} (${batch.length} rows)`);
    }
    
    console.log(`🎉 Successfully imported ${data.length} rows to ${tableName}`);
    return { success: true, rowCount: data.length };
    
  } catch (error) {
    console.error(`❌ Import failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main function to process CSV files
 */
async function processCSVFiles() {
  const csvDir = path.join(__dirname, '../public/csv-imports');
  
  if (!fs.existsSync(csvDir)) {
    console.error('❌ CSV imports directory not found');
    return;
  }
  
  const files = fs.readdirSync(csvDir).filter(file => file.endsWith('.csv'));
  
  if (files.length === 0) {
    console.log('📭 No CSV files found in imports directory');
    return;
  }
  
  console.log(`📁 Found ${files.length} CSV file(s) to process`);
  
  for (const file of files) {
    const filePath = path.join(csvDir, file);
    console.log(`\n🔍 Processing: ${file}`);
    
    // Validate CSV
    const validation = validateCSV(filePath);
    
    if (!validation.isValid) {
      console.error(`❌ Validation failed for ${file}:`);
      validation.errors.forEach(error => console.error(`  - ${error}`));
      continue;
    }
    
    if (validation.warnings.length > 0) {
      console.warn(`⚠️  Warnings for ${file}:`);
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    console.log(`✅ Validation passed for ${file} (${validation.rowCount} rows)`);
    
    // Ask for confirmation before import
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question(`Do you want to import ${file}? (y/N): `, resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      // Determine table name from file name
      const tableName = file.replace('.csv', '').replace(/[^a-zA-Z0-9_]/g, '_');
      
      const importResult = await importCSV(filePath, tableName);
      
      if (importResult.success) {
        console.log(`🎉 Successfully imported ${importResult.rowCount} rows`);
      } else {
        console.error(`❌ Import failed: ${importResult.error}`);
      }
    } else {
      console.log(`⏭️  Skipped import for ${file}`);
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  processCSVFiles().catch(console.error);
}

module.exports = {
  validateCSV,
  importCSV,
  processCSVFiles
};
