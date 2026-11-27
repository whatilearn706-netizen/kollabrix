import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from './isConfigured';
import { isKollabrixProdDomain } from '@/lib/kaBrandDomains';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  let host = '';
  try {
    const hdrs = headers();
    host = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
  } catch {}
  const shareDomain = isKollabrixProdDomain(host);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(
              name,
              value,
              shareDomain
                ? {
                    ...options,
                    domain: '.kollabrix.in',
                    path: '/',
                    sameSite: 'lax',
                  }
                : options
            );
          });
        } catch {
          // Safe no-op when called from a pure Server Component
        }
      },
    },
  });
}
