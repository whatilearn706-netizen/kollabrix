import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from './isConfigured';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
