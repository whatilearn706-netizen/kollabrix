import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/explore';

  const reqHeaders = new Headers(request.headers);
  const forwardedHost = reqHeaders.get('x-forwarded-host');
  const forwardedProto = reqHeaders.get('x-forwarded-proto') || 'https';
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const redirectBase = isLocalEnv
    ? origin
    : forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : origin;

  // 1. Check for incoming OAuth or Provider errors from Supabase/Google
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error || errorDescription) {
    const message = errorDescription || error || 'OAuth authentication failed.';
    console.error('OAuth Callback Error:', { error, errorDescription });
    return NextResponse.redirect(`${redirectBase}/explore?error=${encodeURIComponent(message)}`);
  }

  // 2. Exchange authorization code for authenticated session
  if (code && isSupabaseConfigured()) {
    try {
      const cookieStore = cookies();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const response = NextResponse.redirect(`${redirectBase}${next}`);

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch (e) {}
              try {
                response.cookies.set(name, value, options);
              } catch (e) {}
            });
          },
        },
      });

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (!exchangeError) {
        response.cookies.set('linkora_user_session', 'true', {
          path: '/',
          maxAge: 31536000,
          sameSite: 'lax',
        });
        return response;
      }
      console.error('Auth code exchange error:', exchangeError.message);
      return NextResponse.redirect(
        `${redirectBase}/explore?error=${encodeURIComponent(exchangeError.message)}`
      );
    } catch (err: unknown) {
      console.error('Unexpected error in auth callback:', err);
      const msg = err instanceof Error ? err.message : 'Authentication code exchange failed.';
      return NextResponse.redirect(`${redirectBase}/explore?error=${encodeURIComponent(msg)}`);
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${redirectBase}/explore`);
}

