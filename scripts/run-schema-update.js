#!/usr/bin/env node

/**
 * Run Schema Update Script
 * Executes the add-restock-price-and-value.sql migration
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

async function runSchemaUpdate() {
  console.log('🔧 Running schema update to add restock_price and value columns...\n');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-restock-price-and-value.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 SQL Schema Update:');
    console.log('  - Add restock_price column');
    console.log('  - Add value column (computed: stock * price)');
    console.log('  - Create index on value column');
    console.log('  - Update existing records with calculated values');
    console.log('  - Create trigger for automatic value updates');
    console.log('');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      // If RPC doesn't work, we'll need to run this manually in Supabase
      console.log('⚠️  Note: This script needs to be run manually in Supabase SQL Editor');
      console.log('📁 SQL file location: scripts/add-restock-price-and-value.sql');
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
  runSchemaUpdate();
}

module.exports = { runSchemaUpdate };
