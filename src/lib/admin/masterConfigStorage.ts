import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

const MASTER_KEY = 'site_master_control_config';

// In-memory cache to prevent excessive Supabase Egress & Log Ingestion
let cachedMasterRecord: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 20_000; // 20 seconds TTL

export function invalidateMasterControlCache() {
  cachedMasterRecord = null;
  cacheTimestamp = 0;
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Authoritative Master Configuration Reader
 * Fetches the site_master_control_config row from platform_settings with 20s in-memory caching
 */
export async function getMasterControlRecord(): Promise<Record<string, any>> {
  // Check in-memory cache first to avoid repeated Supabase egress
  const now = Date.now();
  if (cachedMasterRecord && (now - cacheTimestamp < CACHE_TTL_MS)) {
    return cachedMasterRecord;
  }

  const client = getSupabaseClient();
  if (!client) return cachedMasterRecord || {};

  try {
    const { data, error } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', MASTER_KEY)
      .maybeSingle();

    if (error) {
      console.warn('Error reading site_master_control_config:', error.message);
      return cachedMasterRecord || {};
    }

    if (data?.value && typeof data.value === 'object') {
      cachedMasterRecord = data.value;
      cacheTimestamp = now;
      return data.value;
    }
  } catch (err: any) {
    console.warn('Exception reading site_master_control_config:', err.message);
  }

  return cachedMasterRecord || {};
}

/**
 * Fetch a specific subkey from site_master_control_config
 */
export async function getMasterControlSubkey<T>(subkey: string, fallback: T): Promise<T> {
  const master = await getMasterControlRecord();
  if (master && master[subkey] !== undefined && master[subkey] !== null) {
    return master[subkey] as T;
  }
  return fallback;
}

/**
 * Authoritative Master Configuration Updater
 * Updates a specific subkey inside site_master_control_config via a standard Postgres UPDATE (PATCH)
 * which bypasses insert RLS restrictions on platform_settings.
 */
export async function updateMasterControlSubkey(
  subkey: string,
  subvalue: any
): Promise<{ success: boolean; error?: string; updatedRecord?: Record<string, any> }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Database unavailable' };
  }

  try {
    // 1. Read current master value
    const currentMaster = await getMasterControlRecord();

    // 2. Merge subkey
    const newMaster = {
      ...currentMaster,
      [subkey]: subvalue,
    };

    // 3. Issue authoritative UPDATE query
    const { error } = await client
      .from('platform_settings')
      .update({
        value: newMaster,
        updated_at: new Date().toISOString(),
      })
      .eq('key', MASTER_KEY);

    if (error) {
      console.warn(`Could not update master control subkey "${subkey}":`, error.message);
      return { success: false, error: error.message };
    }

    // Refresh cache immediately
    cachedMasterRecord = newMaster;
    cacheTimestamp = Date.now();

    return { success: true, updatedRecord: newMaster };
  } catch (err: any) {
    console.warn(`Exception updating master control subkey "${subkey}":`, err.message);
    return { success: false, error: err.message || 'Database update failed' };
  }
}

/**
 * Authoritative Full Master Control Updater
 */
export async function updateFullMasterControl(
  fullConfig: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Database unavailable' };
  }

  try {
    const currentMaster = await getMasterControlRecord();
    const merged = {
      ...currentMaster,
      ...fullConfig,
    };

    const { error } = await client
      .from('platform_settings')
      .update({
        value: merged,
        updated_at: new Date().toISOString(),
      })
      .eq('key', MASTER_KEY);

    if (error) {
      console.warn('Could not update full master control:', error.message);
      return { success: false, error: error.message };
    }

    cachedMasterRecord = merged;
    cacheTimestamp = Date.now();

    return { success: true };
  } catch (err: any) {
    console.warn('Exception updating full master control:', err.message);
    return { success: false, error: err.message || 'Database update failed' };
  }
}
