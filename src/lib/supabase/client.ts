import { createBrowserClient } from '@supabase/ssr';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from './isConfigured';
import { isKollabrixProdDomain } from '@/lib/kaBrandDomains';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export function createClient() {
  const shareDomain =
    typeof window !== 'undefined' && isKollabrixProdDomain(window.location.hostname);

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    ...(shareDomain
      ? {
          cookieOptions: {
            domain: '.kollabrix.in',
            path: '/',
            sameSite: 'lax',
            secure: window.location.protocol === 'https:',
          },
        }
      : {}),
  });
}

export const supabase = createClient();
