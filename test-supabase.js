const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? '✅ Present' : '❌ Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n📡 Testing basic connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('user_profiles').select('count')
    if (error) {
      console.log('❌ Database connection failed:', error.message)
      return
    }
    console.log('✅ Database connection successful!')
    
    // Test auth
    console.log('\n🔐 Testing authentication...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.log('❌ Authentication test failed:', authError.message)
    } else {
      console.log('✅ Authentication working!')
    }
    
    // Test storage
    console.log('\n📦 Testing storage...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
      console.log('❌ Storage test failed:', bucketError.message)
    } else {
      console.log('✅ Storage working!')
      console.log('📁 Available buckets:', buckets.map(b => b.name))
    }
    
    console.log('\n🎉 All tests completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Get your Service Role Key from Supabase dashboard')
    console.log('2. Add it to .env.local')
    console.log('3. Run the database schema setup')
    console.log('4. Deploy to GitHub and Vercel')
    
  } catch (error) {
    console.log('❌ Test failed:', error.message)
  }
}

testConnection() 