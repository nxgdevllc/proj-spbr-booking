const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Prefer .env.local, fallback to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envDefaultPath = path.resolve(process.cwd(), '.env');
const envToLoad = fs.existsSync(envLocalPath) ? envLocalPath : envDefaultPath;
dotenv.config({ path: envToLoad });

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...');
  console.log(
    `🧩 Loaded env file: ${fs.existsSync(envToLoad) ? envToLoad : 'none'}`
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const useServiceRole =
    (process.env.SUPABASE_USE_SERVICE_ROLE || '').toLowerCase() === 'true';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseKey = useServiceRole && serviceKey ? serviceKey : anonKey;
  const keyType = useServiceRole && serviceKey ? 'service_role' : 'anon';

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log(
      'Please set NEXT_PUBLIC_SUPABASE_URL and keys in your .env.local file'
    );
    return;
  }

  console.log(`🔑 Using key type: ${keyType}`);
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    // Test basic connection by hitting a lightweight table first
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      if (error.message && error.message.toLowerCase().includes('policy')) {
        console.log('\nℹ️ Tip: RLS policies might block anon key.');
        console.log(
          '   - Re-run with SUPABASE_USE_SERVICE_ROLE=true to bypass RLS in this local test'
        );
        console.log(
          '   - Or adjust SELECT policies on the queried table (e.g., user_profiles)'
        );
      }
      return;
    }

    console.log('✅ Database connection successful!');
    console.log('📊 Connection details:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key type: ${keyType}`);
    console.log(`   Key prefix: ${supabaseKey.substring(0, 12)}...`);

    // Test table access
    const tables = [
      'user_profiles',
      'employees',
      'guests',
      'units',
      'bookings',
      'inventory_items',
      'product_categories',
    ];

    console.log('\n📋 Testing table access:');
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        if (tableError) {
          console.log(`   ❌ ${table}: ${tableError.message}`);
        } else {
          console.log(`   ✅ ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testDatabaseConnection();
