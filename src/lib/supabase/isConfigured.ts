export const DEFAULT_SUPABASE_URL = 'https://bmiwmlfraaridbekuily.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaXdtbGZyYWFyaWRiZWt1aWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjU4ODksImV4cCI6MjEwNzY0MTg4OX0.V6stfUC5ruqUZNHp0kOxeE0fBhBUmjka8GMWteESDGA';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes('your-project-id') || anonKey.includes('your-supabase-anon-key')) return false;
  if (!url.startsWith('https://') && !url.startsWith('http://')) return false;

  return true;
}
