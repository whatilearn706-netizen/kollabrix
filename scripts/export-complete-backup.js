/**
 * Comprehensive Database & Platform Backup Script
 * Exports all tables, configurations, settings, and mock catalogs into a single JSON file.
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse environment
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach((line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['\"]|['\"]$/g, '');
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.kollabrix.in';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required to create a full database backup.');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const TABLES = [
  'profiles',
  'projects',
  'project_members',
  'project_tasks',
  'project_discussions',
  'project_discussion_replies',
  'problem_statements',
  'hackathons',
  'hackathon_participants',
  'hackathon_teams',
  'hackathon_team_members',
  'hackathon_submissions',
  'platform_settings',
  'admin_audit_logs',
  'notifications',
  'project_mentoring_notes',
];

async function runBackup() {
  console.log(`Starting Kollabrix Platform Backup from ${supabaseUrl}...`);
  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      sourceUrl: supabaseUrl,
      version: '1.0.0',
    },
    tables: {},
  };

  for (const table of TABLES) {
    process.stdout.write(`Exporting table [${table}]... `);
    try {
      const { data, error } = await client.from(table).select('*');
      if (error) {
        console.log(`⚠️ Skipped (${error.message})`);
        backupData.tables[table] = { status: 'error', error: error.message, rows: [] };
      } else {
        console.log(`✓ (${data?.length || 0} rows)`);
        backupData.tables[table] = { status: 'ok', count: data?.length || 0, rows: data || [] };
      }
    } catch (e) {
      console.log(`❌ Exception: ${e.message}`);
      backupData.tables[table] = { status: 'exception', error: e.message, rows: [] };
    }
  }

  const backupDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `kollabrix-database-backup-${timestamp}.json`;
  const latestFileName = 'kollabrix-database-backup-latest.json';
  const outPath = path.join(backupDir, backupFileName);
  const latestPath = path.join(backupDir, latestFileName);

  const jsonString = JSON.stringify(backupData, null, 2);
  fs.writeFileSync(outPath, jsonString, 'utf8');
  fs.writeFileSync(latestPath, jsonString, 'utf8');

  console.log(`\n🎉 Backup saved successfully!`);
  console.log(`File: ${outPath} (${(Buffer.byteLength(jsonString) / 1024).toFixed(1)} KB)`);
  console.log(`Symlinked/Latest: ${latestPath}`);
}

runBackup().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
