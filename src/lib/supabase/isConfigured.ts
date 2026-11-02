export const DEFAULT_SUPABASE_URL = 'https://api.kollabrix.in';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.lfKjrWCz1QIVeItdz3Cs5UxitvcEenG8O9NPFVYlsjg';
export const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.oQZavejg-0CH8snB9ICC-ssTnBsuwmt1MjYfakEO0cI';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes('your-project-id') || anonKey.includes('your-supabase-anon-key')) return false;
  if (!url.startsWith('https://') && !url.startsWith('http://')) return false;

  return true;
}
