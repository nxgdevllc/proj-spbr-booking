#!/usr/bin/env node

/**
 * Update Database Schema Script
 * Runs the schema update SQL to modify inventory_items table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSchema() {
  console.log('🔧 Updating inventory_items table schema...\n');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'update-inventory-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 SQL Schema Update:');
    console.log('  - Backup current data');
    console.log('  - Drop current table');
    console.log('  - Create new table with improved schema');
    console.log('  - Add barcode_type, notes, tags columns');
    console.log('  - Set auto-increment to start from 245');
    console.log('  - Update RLS policies');
    console.log('');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      // If RPC doesn't work, we'll need to run this manually in Supabase
      console.log('⚠️  Note: This script needs to be run manually in Supabase SQL Editor');
      console.log('📁 SQL file location: scripts/update-inventory-schema.sql');
      console.log('');
      console.log('📋 Please run the following in Supabase SQL Editor:');
      console.log('='.repeat(60));
      console.log(sqlContent);
      console.log('='.repeat(60));
      return false;
    }
    
    console.log('✅ Schema updated successfully!');
    return true;
    
  } catch (error) {
    console.error(`❌ Error updating schema: ${error.message}`);
    return false;
  }
}

// Run the script if called directly
if (require.main === module) {
  updateSchema();
}

module.exports = { updateSchema };
