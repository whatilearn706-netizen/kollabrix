/**
 * Comprehensive Database & Platform Restore Script
 * Restores all tables, configurations, settings, and mock catalogs from a backup JSON file into any target Supabase or PostgreSQL instance.
 *
 * Usage:
 *   node scripts/restore-complete-backup.js [optional_backup_file_path]
 *
 * Target Credentials:
 *   Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from process.env or .env.local
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
const targetUrl = process.env.TARGET_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const targetKey = process.env.TARGET_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!targetUrl || !targetKey) {
  console.error('Error: Target Supabase URL and SERVICE_ROLE_KEY are required to restore backup.');
  process.exit(1);
}

const client = createClient(targetUrl, targetKey, {
  auth: { persistSession: false },
});

// Primary keys for idempotent upsert per table
const TABLE_PRIMARY_KEYS = {
  profiles: 'user_id',
  projects: 'id',
  project_members: 'id',
  project_tasks: 'id',
  project_discussions: 'id',
  project_discussion_replies: 'id',
  problem_statements: 'id',
  hackathons: 'id',
  hackathon_participants: 'id',
  hackathon_teams: 'id',
  hackathon_team_members: 'id',
  hackathon_submissions: 'id',
  platform_settings: 'key',
  admin_audit_logs: 'id',
  notifications: 'id',
  project_mentoring_notes: 'id',
};

async function runRestore() {
  const argFile = process.argv[2];
  const backupPath = argFile
    ? path.resolve(process.cwd(), argFile)
    : path.resolve(process.cwd(), 'backups/kollabrix-database-backup-latest.json');

  if (!fs.existsSync(backupPath)) {
    console.error(`Error: Backup file not found at ${backupPath}`);
    process.exit(1);
  }

  console.log(`Loading backup from: ${backupPath}`);
  const rawData = fs.readFileSync(backupPath, 'utf8');
  const backup = JSON.parse(rawData);

  console.log(`Backup Timestamp: ${backup.metadata?.timestamp || 'Unknown'}`);
  console.log(`Original Source: ${backup.metadata?.sourceUrl || 'Unknown'}`);
  console.log(`Restoring to Target: ${targetUrl}...\n`);

  const tables = Object.keys(backup.tables || {});

  for (const table of tables) {
    const tableData = backup.tables[table];
    const rows = tableData?.rows || [];
    const pk = TABLE_PRIMARY_KEYS[table] || 'id';

    if (rows.length === 0) {
      console.log(`Table [${table}]: 0 rows in backup, skipping.`);
      continue;
    }

    process.stdout.write(`Restoring table [${table}] (${rows.length} rows)... `);
    try {
      // Chunk insertions by 50 to avoid payload caps
      const chunkSize = 50;
      let insertedCount = 0;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await client.from(table).upsert(chunk, { onConflict: pk });
        if (error) {
          throw error;
        }
        insertedCount += chunk.length;
      }
      console.log(`✓ successfully restored (${insertedCount} rows)`);
    } catch (err) {
      console.log(`⚠️ Warning on table [${table}]: ${err.message}`);
    }
  }

  console.log(`\n🎉 Platform restore completed successfully to ${targetUrl}!`);
}

runRestore().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
