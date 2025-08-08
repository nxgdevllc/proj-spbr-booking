#!/usr/bin/env node

/**
 * SQLTools Migration Runner for San Pedro Beach Resort
 * Uses SQLTools extension to run migrations directly from VS Code
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Migration files in order
const migrations = [
  {
    name: 'Phase 1: Critical Fixes',
    file: 'docs/2025-01-27_phase1_critical_fixes.sql',
    description: 'UUID conversion, foreign keys, data types, RLS',
  },
  {
    name: 'Phase 2: Structure Improvements',
    file: 'docs/2025-01-27_phase2_structure_improvements.sql',
    description: 'Comprehensive RLS policies, constraints, audit triggers',
  },
  {
    name: 'Phase 3: Comprehensive Indexes',
    file: 'docs/2025-01-27_phase3_comprehensive_indexes.sql',
    description: 'Performance indexes, analytics views, maintenance functions',
  },
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
  cyan: '\x1b[36m',
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function checkSQLToolsConnection() {
  logStep('Checking SQLTools connection...');

  try {
    // Check if SQLTools is available
    const { stdout } = await execAsync(
      'code --list-extensions | grep -i sqltools'
    );

    if (stdout.includes('sqltools')) {
      logSuccess('SQLTools extension is installed');
      return true;
    } else {
      logWarning('SQLTools extension not found');
      return false;
    }
  } catch (error) {
    logWarning('Could not verify SQLTools extension');
    return false;
  }
}

async function openMigrationInSQLTools(migration) {
  const fullPath = path.resolve(migration.file);

  logStep(`Opening ${migration.name} in SQLTools...`);
  log(`File: ${fullPath}`, 'blue');

  try {
    // Prefer Cursor CLI if available; fallback to VS Code CLI
    const editorCli = process.env.CURSOR_CLI || 'code';
    await execAsync(`${editorCli} "${fullPath}"`);
    logSuccess(`Opened ${migration.file} in VS Code`);

    logInfo('\n📋 Manual Steps to Execute:');
    log('1. The SQL file should now be open in VS Code');
    log('2. Press Cmd+Shift+P to open Command Palette');
    log('3. Type "SQLTools: Connect to Database"');
    log('4. Select "San Pedro Beach Resort - Production"');
    log('5. Once connected, press Cmd+Shift+E to execute the query');
    log('6. Review the results and any error messages');
    log('7. Close the file when done');

    return true;
  } catch (error) {
    logError(`Failed to open ${migration.file}: ${error.message}`);
    return false;
  }
}

async function runMigrationsWithSQLTools() {
  logHeader('🚀 San Pedro Beach Resort - SQLTools Migration Runner');

  log(
    'This script will open each migration file in SQLTools for manual execution.'
  );
  log('This approach gives you full control and visibility over each step.');

  // Check SQLTools
  const sqltoolsAvailable = await checkSQLToolsConnection();
  if (!sqltoolsAvailable) {
    logWarning('SQLTools not detected. You may need to install it manually.');
  }

  logInfo('\n📋 Migration Process:');
  log('1. Each migration file will be opened in VS Code');
  log('2. You will execute them manually using SQLTools');
  log('3. This gives you full control and error visibility');
  log('4. You can review and modify queries before execution');

  let currentMigration = 0;

  for (const migration of migrations) {
    currentMigration++;

    logHeader(
      `Migration ${currentMigration}/${migrations.length}: ${migration.name}`
    );
    log(`Description: ${migration.description}`, 'blue');

    // Check if file exists
    const fullPath = path.resolve(migration.file);
    if (!fs.existsSync(fullPath)) {
      logError(`Migration file not found: ${migration.file}`);
      continue;
    }

    // Open in SQLTools
    const opened = await openMigrationInSQLTools(migration);
    if (!opened) {
      continue;
    }

    // Wait for user confirmation
    logInfo('\n⏳ Waiting for you to execute this migration...');
    log(
      'Press Enter when you have completed this migration, or type "skip" to skip it.'
    );

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question('', resolve);
    });

    rl.close();

    if (answer.toLowerCase() === 'skip') {
      logWarning(`Skipped ${migration.name}`);
      continue;
    }

    logSuccess(`Completed ${migration.name}`);
  }

  // Summary
  logHeader('📊 Migration Summary');
  log('All migration files have been opened for manual execution.');
  log('\nNext steps:');
  log('1. Execute each migration file using SQLTools');
  log('2. Test the login system with demo accounts');
  log('3. Verify RLS policies are working correctly');
  log('4. Check that all foreign key relationships are intact');

  logInfo('\n🎯 Benefits of Manual Execution:');
  log('• Full visibility of each SQL statement');
  log('• Ability to modify queries if needed');
  log('• Immediate error feedback');
  log('• Control over execution order');
  log('• No risk of automated script errors');
}

// Alternative: Direct Supabase execution
async function runMigrationsDirect() {
  logHeader('🚀 San Pedro Beach Resort - Direct Migration Runner');

  log('This will execute migrations directly using Supabase client.');
  log('Make sure you have backed up your database before proceeding.');

  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config({ path: '.env.local' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logError('Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  for (const migration of migrations) {
    logStep(`Executing: ${migration.name}`);

    try {
      const sql = fs.readFileSync(migration.file, 'utf8');
      const statements = sql
        .split(';')
        .filter((stmt) => stmt.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim() && !statement.trim().startsWith('--')) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            logWarning(`Statement failed: ${error.message}`);
          }
        }
      }

      logSuccess(`Completed ${migration.name}`);
    } catch (error) {
      logError(`Failed ${migration.name}: ${error.message}`);
    }
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--direct')) {
    runMigrationsDirect().catch((error) => {
      logError(`Fatal error: ${error.message}`);
      process.exit(1);
    });
  } else {
    runMigrationsWithSQLTools().catch((error) => {
      logError(`Fatal error: ${error.message}`);
      process.exit(1);
    });
  }
}

module.exports = { runMigrationsWithSQLTools, runMigrationsDirect };
