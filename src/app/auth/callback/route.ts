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
  const isLocalEnv = process.env.NODE_ENV === 'development' || origin.includes('localhost') || origin.includes('127.0.0.1');
  const redirectBase = isLocalEnv ? origin : 'https://linkora-edu.online';

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

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError && data?.session && data?.user) {
        const user = data.user;
        const session = data.session;

        let profile = null;
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          if (prof) profile = prof;
        } catch (e) {}

        const isOwner =
          user.email?.toLowerCase() === 'goyalmayank142@gmail.com' ||
          user.id === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ||
          profile?.role === 'admin';

        // Check if user is suspended
        if (profile && (profile.is_suspended || profile.status === 'suspended') && !isOwner) {
          await supabase.auth.signOut().catch(() => {});
          response.cookies.set('linkora_user_session', '', { path: '/', maxAge: 0 });
          response.cookies.set('linkora_user_id', '', { path: '/', maxAge: 0 });
          response.cookies.set('linkora_user_email', '', { path: '/', maxAge: 0 });
          response.cookies.set('linkora_admin_session', '', { path: '/', maxAge: 0 });
          const reason = profile.suspension_reason || 'This account has been suspended by administration. Access denied.';
          return NextResponse.redirect(`${redirectBase}/explore?error=${encodeURIComponent(reason)}`);
        }

        // 1-Year persistent session cookies
        response.cookies.set('linkora_user_session', 'true', {
          path: '/',
          maxAge: 31536000,
          sameSite: 'lax',
        });
        response.cookies.set('linkora_user_id', user.id, {
          path: '/',
          maxAge: 31536000,
          sameSite: 'lax',
        });
        response.cookies.set('linkora_user_email', encodeURIComponent(user.email || ''), {
          path: '/',
          maxAge: 31536000,
          sameSite: 'lax',
        });
        if (isOwner) {
          response.cookies.set('linkora_admin_session', 'true', {
            path: '/',
            maxAge: 31536000,
            sameSite: 'lax',
          });
        }

        const targetUrl = `${redirectBase}${next}`;

        // Return instant HTML hydration script to guarantee localStorage is synchronously populated
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authenticating Linkora...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { background: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .loader { text-align: center; }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(99, 102, 241, 0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <div style="font-weight: 700; font-size: 16px;">Authenticating Linkora Account...</div>
    <div style="font-size: 13px; opacity: 0.6; margin-top: 6px;">Syncing session across all tabs...</div>
  </div>
  <script>
    try {
      localStorage.removeItem('linkora_explicit_signout');
      sessionStorage.removeItem('linkora_explicit_signout');
      sessionStorage.removeItem('linkora_signing_out');
      localStorage.setItem('linkora_auth_user', ${JSON.stringify(JSON.stringify(user))});
      localStorage.setItem('linkora_auth_session', ${JSON.stringify(JSON.stringify(session))});
      localStorage.setItem('linkora_auth_user_id', ${JSON.stringify(user.id)});
      localStorage.setItem('linkora_auth_user_email', ${JSON.stringify(user.email || '')});
      ${profile ? `localStorage.setItem('linkora_auth_profile', ${JSON.stringify(JSON.stringify(profile))});` : ''}
      ${isOwner ? `
      localStorage.setItem('linkora_admin_session', 'true');
      document.cookie = 'linkora_admin_session=true; path=/; max-age=31536000; SameSite=Lax';
      ` : ''}
      document.cookie = 'linkora_user_session=true; path=/; max-age=31536000; SameSite=Lax';
      document.cookie = 'linkora_user_id=' + ${JSON.stringify(user.id)} + '; path=/; max-age=31536000; SameSite=Lax';
      document.cookie = 'linkora_user_email=' + encodeURIComponent(${JSON.stringify(user.email || '')}) + '; path=/; max-age=31536000; SameSite=Lax';
    } catch (e) {}
    window.location.replace(${JSON.stringify(targetUrl)});
  </script>
</body>
</html>`;

        const htmlResponse = new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });

        response.cookies.getAll().forEach((c) => {
          htmlResponse.cookies.set(c.name, c.value, c);
        });

        return htmlResponse;
      }

      if (exchangeError) {
        console.error('Auth code exchange error:', exchangeError.message);
        return NextResponse.redirect(
          `${redirectBase}/explore?error=${encodeURIComponent(exchangeError.message)}`
        );
      }
    } catch (err: unknown) {
      console.error('Unexpected error in auth callback:', err);
      const msg = err instanceof Error ? err.message : 'Authentication code exchange failed.';
      return NextResponse.redirect(`${redirectBase}/explore?error=${encodeURIComponent(msg)}`);
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${redirectBase}/explore`);
}

