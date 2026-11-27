import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/isConfigured';
import { getKaSubdomainFromHost, isKollabrixProdDomain } from '@/lib/kaBrandDomains';

/**
 * Global Next.js Middleware:
 * 1. Serves standalone KΛ subdomains (ai.kollabrix.in -> /ka-ai, folio.kollabrix.in -> /ka-codex) + dedicated SEO routes.
 * 2. Automatically refreshes Supabase session cookies via @supabase/ssr with shared `.kollabrix.in` cookie scope.
 * 3. Protects authenticated routes (e.g., /arena/*) and maintains 30-day persistent sessions.
 */
export async function middleware(request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    '';
  const brand = getKaSubdomainFromHost(host);
  const shareDomain = isKollabrixProdDomain(host);
  const { pathname } = request.nextUrl;

  if (brand && pathname === '/sitemap.xml') {
    const url = request.nextUrl.clone();
    url.pathname = '/api/ka-sitemap';
    url.searchParams.set('brand', brand);
    return NextResponse.rewrite(url);
  }

  if (brand && pathname === '/robots.txt') {
    const url = request.nextUrl.clone();
    url.pathname = '/api/ka-robots';
    url.searchParams.set('brand', brand);
    return NextResponse.rewrite(url);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const cookieExtra = shareDomain ? { domain: '.kollabrix.in' } : {};

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
            ...cookieExtra,
            maxAge: options?.maxAge ?? 2592000,
            sameSite: options?.sameSite ?? 'lax',
            path: options?.path ?? '/',
          });
        });
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Non-blocking fallback if auth service is temporarily unavailable
  }

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

  if (user && !request.cookies.get('linkora_user_session')) {
    response.cookies.set('linkora_user_session', 'true', {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
      ...cookieExtra,
    });
    response.cookies.set('linkora_user_id', user.id, {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
      ...cookieExtra,
    });
  }

  // Rewrite standalone KΛ subdomains cleanly while preserving refreshed session cookies
  if (brand && pathname === '/') {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = brand === 'ai' ? '/ka-ai' : '/ka-codex';
    const rewriteRes = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: request.headers,
      },
    });
    response.cookies.getAll().forEach((c) => {
      rewriteRes.cookies.set(c);
    });
    return rewriteRes;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|brand/|api/compiler/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|pdf|pptx)$).*)',
    '/sitemap.xml',
    '/robots.txt',
  ],
};
