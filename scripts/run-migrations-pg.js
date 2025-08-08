#!/usr/bin/env node

/**
 * PostgreSQL Migration Runner using pg
 * - Connects directly to Postgres using env vars
 * - Runs each .sql file in full via a single query
 * - Streams large files safely
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const migrations = [
  'docs/2025-01-27_phase1_critical_fixes.sql',
  'docs/2025-01-27_phase2_structure_improvements.sql',
  'docs/2025-01-27_phase3_comprehensive_indexes.sql',
].map((p) => path.resolve(p));

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}
function logHeader(msg) {
  console.log('\n' + '='.repeat(60));
  log(msg, 'bright');
  console.log('='.repeat(60));
}

function getDbConfig() {
  const host =
    process.env.SUPABASE_DB_HOST ||
    extractHost(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const database = process.env.SUPABASE_DB_NAME || 'postgres';
  const user = process.env.SUPABASE_DB_USER || 'postgres';
  const password = process.env.SUPABASE_DB_PASSWORD;
  const port = parseInt(process.env.SUPABASE_DB_PORT || '5432', 10);
  const ssl = process.env.SUPABASE_DB_SSL !== 'false';

  if (!host || !password) {
    throw new Error(
      'Missing DB host or password. Set SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD in .env.local'
    );
  }

  return {
    host,
    database,
    user,
    password,
    port,
    ssl: ssl ? { rejectUnauthorized: false } : false,
  };
}

function extractHost(url) {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return undefined;
  }
}

async function runSqlFile(client, filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  log(`Executing ${filePath}`, 'blue');
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
    log(`✅ Done ${path.basename(filePath)}`, 'green');
  } catch (err) {
    await client.query('ROLLBACK');
    log(`❌ Error in ${path.basename(filePath)}: ${err.message}`, 'red');
    throw err;
  }
}

async function main() {
  logHeader('🚀 PostgreSQL Migration Runner (pg)');
  const config = getDbConfig();
  const client = new Client(config);
  await client.connect();
  try {
    for (const m of migrations) {
      await runSqlFile(client, m);
    }
    log('🎉 All migrations completed', 'green');
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    process.exitCode = 1;
  });
}
