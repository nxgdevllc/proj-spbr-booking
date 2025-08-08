#!/usr/bin/env node

/**
 * Verify Database Schema Update
 * Confirms that the inventory_items table has been updated correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  console.log('🔍 Verifying database schema update...\n');
  
  try {
    // Check if the table exists and get its structure
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'inventory_items')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (columnError) {
      throw new Error(`Failed to get table structure: ${columnError.message}`);
    }
    
    console.log('📋 Current inventory_items table structure:');
    console.log('='.repeat(60));
    
    const expectedColumns = [
      'id', 'category', 'product_name', 'stock', 'size', 'units', 
      'price', 'min_level', 'supplier', 'barcode', 'barcode_type', 
      'notes', 'tags', 'created_at', 'updated_at'
    ];
    
    let allColumnsPresent = true;
    const foundColumns = [];
    
    columns.forEach(col => {
      foundColumns.push(col.column_name);
      const isExpected = expectedColumns.includes(col.column_name);
      const status = isExpected ? '✅' : '❌';
      console.log(`${status} ${col.column_name} (${col.data_type})`);
    });
    
    // Check for missing expected columns
    const missingColumns = expectedColumns.filter(col => !foundColumns.includes(col));
    if (missingColumns.length > 0) {
      console.log('\n❌ Missing expected columns:');
      missingColumns.forEach(col => console.log(`  - ${col}`));
      allColumnsPresent = false;
    }
    
    // Check for old columns that should be removed
    const oldColumns = ['sid'];
    const oldColumnsFound = oldColumns.filter(col => foundColumns.includes(col));
    if (oldColumnsFound.length > 0) {
      console.log('\n❌ Old columns still present:');
      oldColumnsFound.forEach(col => console.log(`  - ${col}`));
      allColumnsPresent = false;
    }
    
    // Check if table is empty (should be after schema update)
    const { count, error: countError } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('\n⚠️  Could not check table count');
    } else {
      console.log(`\n📊 Current record count: ${count}`);
    }
    
    // Check if backup table exists
    const { data: backupExists, error: backupError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'inventory_items_backup')
      .eq('table_schema', 'public');
    
    if (!backupError && backupExists.length > 0) {
      console.log('✅ Backup table created successfully');
    } else {
      console.log('⚠️  Backup table not found');
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (allColumnsPresent) {
      console.log('🎉 Schema update verification: PASSED');
      console.log('✅ All expected columns present');
      console.log('✅ Old columns removed');
      console.log('✅ Ready for updated import');
      return true;
    } else {
      console.log('❌ Schema update verification: FAILED');
      console.log('⚠️  Please check the schema update');
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error verifying schema: ${error.message}`);
    return false;
  }
}

// Run the script if called directly
if (require.main === module) {
  verifySchema();
}

module.exports = { verifySchema };
