import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile/setup';

  if (code && isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error('Auth code exchange error:', error.message);
    } catch (err) {
      console.error('Unexpected error in auth callback:', err);
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/explore`);
}
