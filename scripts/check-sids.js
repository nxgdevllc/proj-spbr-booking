#!/usr/bin/env node

/**
 * Check SID values in inventory_items table
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

async function checkSIDs() {
  console.log('🔍 Checking SID values in inventory_items table...\n');
  
  try {
    // Get all inventory items with their SIDs
    const { data, error } = await supabase
      .from('inventory_items')
      .select('sid, product_name, category')
      .order('sid');
    
    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
    
    console.log(`📊 Total items in database: ${data.length}`);
    console.log('\n📋 First 10 SID values:');
    data.slice(0, 10).forEach(item => {
      console.log(`  SID: ${item.sid} | ${item.product_name} (${item.category})`);
    });
    
    console.log('\n📋 Last 10 SID values:');
    data.slice(-10).forEach(item => {
      console.log(`  SID: ${item.sid} | ${item.product_name} (${item.category})`);
    });
    
    // Check if SIDs are numeric and in range
    const sids = data.map(item => parseInt(item.sid)).filter(id => !isNaN(id));
    const minSid = Math.min(...sids);
    const maxSid = Math.max(...sids);
    
    console.log(`\n📈 SID Range: ${minSid} to ${maxSid}`);
    console.log(`📊 Unique SIDs: ${new Set(sids).size}`);
    
    // Check for any missing SIDs in the range
    const expectedSids = [];
    for (let i = minSid; i <= maxSid; i++) {
      if (sids.includes(i)) {
        expectedSids.push(i);
      }
    }
    
    console.log(`\n✅ SID validation: ${expectedSids.length === sids.length ? 'PASSED' : 'FAILED'}`);
    
    if (expectedSids.length !== sids.length) {
      console.log('❌ Missing SIDs detected');
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

checkSIDs();
