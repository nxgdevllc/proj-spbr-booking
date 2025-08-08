const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Hash password using SHA-256 (same as in auth.ts)
function hashPassword(password) {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function setInitialPasswords() {
  console.log('Setting initial passwords for all users...')
  
  const defaultPassword = 'password123' // Change this in production
  const hashedPassword = hashPassword(defaultPassword)

  try {
    // Update all users who don't have a password_hash set
    const { data, error } = await supabase
      .from('employees')
      .update({ password_hash: hashedPassword })
      .is('password_hash', null)
      .select('employee_name, username, email')

    if (error) {
      console.error('Error setting initial passwords:', error)
      return
    }

    console.log(`✅ Successfully set initial passwords for ${data.length} users:`)
    data.forEach(user => {
      console.log(`   - ${user.employee_name} (${user.username}) - ${user.email}`)
    })

    console.log('\n📋 Default login credentials:')
    console.log('   Username: username from the list above')
    console.log('   Password: password123')
    console.log('\n⚠️  IMPORTANT: Change these passwords after first login!')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
setInitialPasswords()
  .then(() => {
    console.log('\n✅ Password setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
