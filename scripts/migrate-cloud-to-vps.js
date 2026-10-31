const fs = require('fs');

const url = 'https://bmiwmlfraaridbekuily.supabase.co/rest/v1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaXdtbGZyYWFyaWRiZWt1aWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjU4ODksImV4cCI6MjEwNzY0MTg4OX0.V6stfUC5ruqUZNHp0kOxeE0fBhBUmjka8GMWteESDGA';

const tables = [
  'platform_settings',
  'profiles',
  'projects',
  'hackathons',
  'hackathon_participants',
  'hackathon_challenges',
  'hackathon_announcements'
];

function pgType(val, colName) {
  if (colName === 'id' || colName.endsWith('_id')) return 'TEXT';
  if (typeof val === 'boolean') return 'BOOLEAN';
  if (typeof val === 'number') return Number.isInteger(val) ? 'BIGINT' : 'NUMERIC';
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === 'string') return 'TEXT[]';
    return 'JSONB';
  }
  if (val && typeof val === 'object') return 'JSONB';
  return 'TEXT';
}

function pgVal(val, colType) {
  if (val === null || val === undefined) return 'NULL';
  if (colType === 'JSONB') {
    return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
  }
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return val.toString();
  if (Array.isArray(val)) {
    if (colType === 'TEXT[]') {
      const arr = val.map(s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"').join(',');
      return "'{" + arr.replace(/'/g, "''") + "}'::text[]";
    }
    return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
  }
  if (typeof val === 'object') {
    return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
  }
  return "'" + String(val).replace(/'/g, "''") + "'";
}

async function main() {
  let sql = 'DROP SCHEMA IF EXISTS public CASCADE;\nCREATE SCHEMA public;\n\n';

  for (const t of tables) {
    const res = await fetch(`${url}/${t}?select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!res.ok) {
      console.log(`Failed to fetch ${t}: ${res.status}`);
      continue;
    }
    const rows = await res.json();
    console.log(`Processing ${t}: ${rows.length} rows`);
    if (rows.length === 0) continue;

    // Detect column types across all rows
    const cols = new Set();
    const colTypes = {};
    for (const r of rows) {
      for (const k of Object.keys(r)) {
        cols.add(k);
        if (r[k] !== null && r[k] !== undefined && !colTypes[k]) {
          colTypes[k] = pgType(r[k], k);
        }
      }
    }

    const colDefs = Array.from(cols).map(c => `  "${c}" ${colTypes[c] || 'TEXT'}`).join(',\n');
    sql += `CREATE TABLE public."${t}" (\n${colDefs}\n);\n\n`;

    for (const r of rows) {
      const keys = Object.keys(r);
      const colNames = keys.map(k => `"${k}"`).join(', ');
      const values = keys.map(k => pgVal(r[k], colTypes[k])).join(', ');
      sql += `INSERT INTO public."${t}" (${colNames}) VALUES (${values});\n`;
    }
    sql += '\n';
  }

  // Create empty tables
  sql += `
CREATE TABLE IF NOT EXISTS public.project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  user_id TEXT,
  role TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT,
  description TEXT,
  target_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Upcoming',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  milestone_id TEXT,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'To Do',
  priority TEXT DEFAULT 'Medium',
  assignee_id TEXT,
  creator_id TEXT,
  due_date TIMESTAMPTZ,
  evidence_url TEXT,
  evidence_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_applications (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  applicant_id TEXT,
  application_message TEXT,
  proposed_role TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

CREATE TABLE IF NOT EXISTS public.project_discussions (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  author_id TEXT,
  content TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_discussion_replies (
  id TEXT PRIMARY KEY,
  discussion_id TEXT,
  project_id TEXT,
  author_id TEXT,
  content TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_mentoring_notes (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  mentor_id TEXT,
  content TEXT,
  feedback_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.problem_statements (
  id TEXT PRIMARY KEY,
  author_id TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  required_skills TEXT[],
  difficulty TEXT,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'Draft',
  min_team_size INT,
  max_team_size INT,
  team_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hackathon_teams (
  id TEXT PRIMARY KEY,
  hackathon_id TEXT,
  name TEXT,
  team_name TEXT,
  leader_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hackathon_team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT,
  user_id TEXT,
  role TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hackathon_submissions (
  id TEXT PRIMARY KEY,
  hackathon_id TEXT,
  team_id TEXT,
  title TEXT,
  description TEXT,
  repo_url TEXT,
  demo_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  recipient_id TEXT,
  sender_id TEXT,
  type TEXT,
  title TEXT,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT,
  performed_by TEXT,
  target_user_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
`;

  fs.writeFileSync('/tmp/dump.sql', sql);
  console.log('SUCCESS: Written to /tmp/dump.sql (' + sql.length + ' bytes)');
}

main().catch(console.error);
