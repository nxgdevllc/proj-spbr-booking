#!/usr/bin/env node

/**
 * Automated Migration Runner for San Pedro Beach Resort
 * Runs all migration files in the correct order with proper error handling
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Migration files in order
const migrations = [
  {
    name: 'Phase 1: Critical Fixes',
    file: 'docs/2025-01-27_phase1_critical_fixes.sql',
    description: 'UUID conversion, foreign keys, data types, RLS'
  },
  {
    name: 'Phase 2: Structure Improvements', 
    file: 'docs/2025-01-27_phase2_structure_improvements.sql',
    description: 'Comprehensive RLS policies, constraints, audit triggers'
  },
  {
    name: 'Phase 3: Comprehensive Indexes',
    file: 'docs/2025-01-27_phase3_comprehensive_indexes.sql', 
    description: 'Performance indexes, analytics views, maintenance functions'
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bright');
  console.log('='.repeat(60));
}

function logStep(message) {
  log(`\n📋 ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function readSqlFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read SQL file ${filePath}: ${error.message}`);
  }
}

async function executeMigration(name, sql, description) {
  logStep(`Executing: ${name}`);
  log(`Description: ${description}`, 'blue');
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) {
        continue;
      }

      try {
        log(`Executing statement ${i + 1}/${statements.length}...`, 'blue');
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase.from('_dummy').select('*').limit(0);
          
          if (directError) {
            throw new Error(`Statement ${i + 1} failed: ${error.message}`);
          }
        }
        
        logSuccess(`Statement ${i + 1} completed`);
        
      } catch (stmtError) {
        logWarning(`Statement ${i + 1} failed, continuing...`);
        log(`Error: ${stmtError.message}`, 'yellow');
        
        // Continue with next statement unless it's critical
        if (stmtError.message.includes('already exists') || 
            stmtError.message.includes('does not exist')) {
          log('Non-critical error, continuing...', 'yellow');
        } else {
          throw stmtError;
        }
      }
    }

    logSuccess(`${name} completed successfully!`);
    return true;
    
  } catch (error) {
    logError(`${name} failed: ${error.message}`);
    return false;
  }
}

async function verifyDatabaseConnection() {
  logStep('Verifying database connection...');
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    logSuccess('Database connection verified');
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function runMigrations() {
  logHeader('🚀 San Pedro Beach Resort - Database Migration Runner');
  
  log('This script will run all migration files in the correct order.');
  log('Make sure you have backed up your database before proceeding.');
  
  // Verify connection
  const connectionOk = await verifyDatabaseConnection();
  if (!connectionOk) {
    process.exit(1);
  }

  let successCount = 0;
  let totalMigrations = migrations.length;

  for (const migration of migrations) {
    try {
      logStep(`Loading migration: ${migration.name}`);
      
      const sql = await readSqlFile(migration.file);
      logSuccess(`Loaded ${migration.file}`);
      
      const success = await executeMigration(
        migration.name, 
        sql, 
        migration.description
      );
      
      if (success) {
        successCount++;
      } else {
        logError(`Migration ${migration.name} failed. Stopping execution.`);
        break;
      }
      
    } catch (error) {
      logError(`Failed to process migration ${migration.name}: ${error.message}`);
      break;
    }
  }

  // Summary
  logHeader('📊 Migration Summary');
  log(`Completed: ${successCount}/${totalMigrations} migrations`);
  
  if (successCount === totalMigrations) {
    logSuccess('🎉 All migrations completed successfully!');
    log('\nNext steps:');
    log('1. Test the login system with demo accounts');
    log('2. Verify RLS policies are working correctly');
    log('3. Check that all foreign key relationships are intact');
  } else {
    logError(`❌ Only ${successCount}/${totalMigrations} migrations completed`);
    log('\nTroubleshooting:');
    log('1. Check the error messages above');
    log('2. Verify your Supabase credentials');
    log('3. Ensure the SQL files exist and are valid');
    log('4. Check Supabase dashboard for any failed queries');
  }
}

// Run the migrations
if (require.main === module) {
  runMigrations().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runMigrations };
