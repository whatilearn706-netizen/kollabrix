import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/isConfigured';

/**
 * Global Next.js Middleware:
 * 1. Automatically refreshes expired Supabase session cookies via @supabase/ssr on every page visit.
 * 2. Protects authenticated routes (e.g., /arena/*).
 * 3. Keeps session cookies persistent for 30 days so users stay logged in across days.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            // Guarantee 30-day persistent cookie lifespan (2,592,000 seconds)
            maxAge: options?.maxAge ?? 2592000,
            sameSite: options?.sameSite ?? 'lax',
            path: options?.path ?? '/',
          });
        });
      },
    },
  });

  // Calling getUser() automatically evaluates the JWT and silently refreshes
  // the access token using the refresh token if expired.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Non-blocking fallback if auth service is temporarily unavailable
  }

  const { pathname } = request.nextUrl;

  // Protect nested arena sub-routes while allowing public entry
  if (pathname.startsWith('/arena/')) {
    const cookies = request.cookies.getAll();
    const hasSession =
      user !== null ||
      cookies.some(
        (c) =>
          c.name.includes('-auth-token') ||
          c.name.startsWith('sb-') ||
          c.name === 'next-auth.session-token' ||
          c.name === 'linkora_user_session'
      );

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Ensure persistent cookie tracking aligns with active authenticated user
  if (user && !request.cookies.get('linkora_user_session')) {
    response.cookies.set('linkora_user_session', 'true', {
      path: '/',
      maxAge: 2592000, // 30 days
      sameSite: 'lax',
    });
    response.cookies.set('linkora_user_id', user.id, {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static chunks)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - brand/ (brand assets)
     * - api/compiler/ (low-latency execution endpoint)
     * - static file extensions (svg, png, jpg, jpeg, gif, webp, ico, pdf, pptx, mp4)
     */
    '/((?!_next/static|_next/image|favicon.ico|brand/|api/compiler/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|pdf|pptx)$).*)',
  ],
};
