import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile/setup';

  // 1. Check for incoming OAuth or Provider errors from Supabase/Google
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error || errorDescription) {
    const message = errorDescription || error || 'OAuth authentication failed.';
    console.error('OAuth Callback Error:', { error, errorDescription });
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  // 2. Exchange authorization code for authenticated session
  if (code && isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabaseClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (!exchangeError) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error('Auth code exchange error:', exchangeError.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    } catch (err: unknown) {
      console.error('Unexpected error in auth callback:', err);
      const msg = err instanceof Error ? err.message : 'Authentication code exchange failed.';
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`);
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/explore`);
}
