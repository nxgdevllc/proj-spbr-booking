const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please check your .env.local file has:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Hash password using SHA-256 (same as in auth.ts)
function hashPassword(password) {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function setupDemoPasswords() {
  console.log('🔐 Setting up demo passwords...')
  
  const defaultPassword = 'password123'
  const hashedPassword = hashPassword(defaultPassword)

  try {
    // Update specific demo users
    const demoUsers = [
      { username: 'raymond', user_role: 'admin' },
      { username: 'jingjing', user_role: 'manager' },
      { username: 'jerry', user_role: 'manager' },
      { username: 'chinamae', user_role: 'employee' },
      { username: 'romeo', user_role: 'employee' },
      { username: 'jr', user_role: 'employee' }
    ]

    for (const user of demoUsers) {
      const { data, error } = await supabase
        .from('employees')
        .update({ 
          password_hash: hashedPassword,
          user_role: user.user_role
        })
        .eq('username', user.username)
        .select('employee_name, username, email')

      if (error) {
        console.error(`❌ Error updating ${user.username}:`, error.message)
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${user.username} (${data[0].employee_name}) - ${user.user_role}`)
      } else {
        console.log(`⚠️  User ${user.username} not found in database`)
      }
    }

    console.log('\n📋 Demo login credentials:')
    console.log('   Username: raymond, jingjing, jerry, chinamae, romeo, jr')
    console.log('   Password: password123')
    console.log('\n🔗 Login URL: http://localhost:3000/login')
    console.log('\n⚠️  IMPORTANT: Change these passwords after first login!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
setupDemoPasswords()
  .then(() => {
    console.log('\n✅ Demo password setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
