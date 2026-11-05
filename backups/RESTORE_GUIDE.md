# 📦 Kollabrix Universal Backup & Disaster Recovery Guide

This backup bundle contains the complete database schema, configurations, mock catalogs, and active data for **Kollabrix** (formerly TeamForge).

If you ever need to migrate to a new provider (such as AIC Cloud, Supabase, Neon, or self-hosted PostgreSQL) or restore after a system crash, this guide allows you to restore 100% of the platform without having to re-fix anything.

---

## 📁 Backup Bundle Contents

| File | Purpose |
| :--- | :--- |
| `backups/complete-database-schema.sql` | Complete SQL DDL (all 17 migrations combined): creates tables, relations, triggers, constraints, indexes, and Row-Level Security (RLS) policies. |
| `backups/kollabrix-database-backup-latest.json` | Complete data snapshot of all tables, master configurations, arena rooms, and platform settings. |
| `scripts/export-complete-backup.js` | One-click command to generate a fresh, timestamped database snapshot. |
| `scripts/restore-complete-backup.js` | Automated script to load and upsert all data from a backup JSON file into any target database. |

---

## 🚀 How to Restore to Any New Database (e.g. AIC Cloud or Supabase)

### Step 1: Create the Tables & Schema (SQL)
1. Open the SQL editor in your new database dashboard (e.g., Supabase SQL Editor or AIC Cloud Database Console).
2. Open and copy the entire contents of [`backups/complete-database-schema.sql`](./complete-database-schema.sql).
3. Paste and run the SQL query.
   * This creates all tables: `profiles`, `projects`, `hackathons`, `problem_statements`, `platform_settings`, `notifications`, etc.

---

### Step 2: Populate Data & Configurations (Automated)
Run the automated restore script pointing to your new database URL and service role key:

```bash
# Option A: If restoring to your current .env.local database:
node scripts/restore-complete-backup.js

# Option B: If restoring to a new database or provider (e.g. AIC Cloud / New Supabase):
TARGET_SUPABASE_URL="https://your-new-db-url.com" \
TARGET_SERVICE_ROLE_KEY="your-new-service-role-key" \
node scripts/restore-complete-backup.js backups/kollabrix-database-backup-latest.json
```

The script will automatically upsert all:
- Verified student & faculty profiles
- Hackathons, themes, and join codes
- Problem statements and team registries
- Platform master control configurations, custom themes, and AI battle questions

---

## 🔄 How to Create Fresh Backups Anytime

Whenever you make major changes or add new features, create a new backup with:

```bash
node scripts/export-complete-backup.js
```

This exports all live tables and saves a timestamped JSON file in `backups/kollabrix-database-backup-YYYY-MM-DD.json` and updates `kollabrix-database-backup-latest.json`.
