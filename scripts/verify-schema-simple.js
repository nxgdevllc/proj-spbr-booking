#!/usr/bin/env node

/**
 * Simple Schema Verification
 * Checks if the inventory_items table has the expected structure
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

async function verifySchemaSimple() {
  console.log('🔍 Verifying database schema update...\n');
  
  try {
    // Try to select from the table to see if it exists and what columns it has
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing inventory_items table:');
      console.log(`   ${error.message}`);
      return false;
    }
    
    console.log('✅ inventory_items table exists and is accessible');
    
    // Check if backup table exists
    const { data: backupData, error: backupError } = await supabase
      .from('inventory_items_backup')
      .select('*')
      .limit(1);
    
    if (backupError) {
      console.log('⚠️  Backup table not found or not accessible');
    } else {
      console.log('✅ Backup table created successfully');
    }
    
    // Try to insert a test record to check the new schema
    const testRecord = {
      id: 999, // Test ID
      category: 'Test Category',
      product_name: 'Test Product',
      stock: 10,
      price: 100,
      barcode_type: 'EAN-13',
      notes: 'Test note',
      tags: 'test'
    };
    
    const { error: insertError } = await supabase
      .from('inventory_items')
      .insert(testRecord);
    
    if (insertError) {
      console.log('❌ Error inserting test record:');
      console.log(`   ${insertError.message}`);
      return false;
    }
    
    console.log('✅ New schema supports all required columns');
    
    // Clean up test record
    const { error: deleteError } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', 999);
    
    if (deleteError) {
      console.log('⚠️  Could not clean up test record');
    }
    
    console.log('\n🎉 Schema update verification: PASSED');
    console.log('✅ Table structure updated correctly');
    console.log('✅ All new columns available');
    console.log('✅ Ready for updated import');
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error verifying schema: ${error.message}`);
    return false;
  }
}

// Run the script if called directly
if (require.main === module) {
  verifySchemaSimple();
}

module.exports = { verifySchemaSimple };
