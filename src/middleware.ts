import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || request.nextUrl.host || '').toLowerCase();
  const pathname = request.nextUrl.pathname;
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

  const PRIMARY_DOMAIN = 'linkora-link.online';
  const VALID_DOMAINS = ['linkora-link.online', 'linkora-edu.online', 'linkora.in', 'linkora-edu.in'];

  // 1. If request has an OAuth code and is not yet on /auth/callback, route it to /auth/callback on linkora-link.online
  if (request.nextUrl.searchParams.has('code') && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone();
    url.host = isLocal ? host : (VALID_DOMAINS.includes(host) ? host : PRIMARY_DOMAIN);
    url.protocol = isLocal ? url.protocol : 'https';
    url.port = isLocal ? url.port : '';
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url, { status: 307 });
  }

  // 2. Prevent search engines (Google, Bing) from ever indexing *.vercel.app or non-canonical hosts
  if (!isLocal && !VALID_DOMAINS.includes(host)) {
    if (pathname === '/robots.txt' && host.includes('vercel.app')) {
      return new NextResponse('User-agent: *\nDisallow: /\n', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      });
    }

    const url = request.nextUrl.clone();
    url.host = PRIMARY_DOMAIN;
    url.protocol = 'https';
    url.port = '';
    const redirectResponse = NextResponse.redirect(url, { status: 301 });
    if (host.includes('vercel.app')) {
      redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }
    return redirectResponse;
  }

  const configuredAdminPath = (process.env.NEXT_PUBLIC_ADMIN_ROUTE_PATH || '/control-center-7x9').trim();

  // 2. Direct /admin route redirect to /control-center-7x9
  if (pathname === '/admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/control-center-7x9';
    return NextResponse.redirect(url);
  }

  // 3. If a custom admin route path is configured and matches the request, rewrite to the internal /control-center-7x9 page
  if (configuredAdminPath !== '/control-center-7x9' && pathname === configuredAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/control-center-7x9';
    return NextResponse.rewrite(url);
  }

  const isAdminCookie = request.cookies.get('linkora_admin_session')?.value === 'true';

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    // Supabase is not yet configured, proceed normally without failing
    return response;
  }

  try {
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
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Refresh auth session safely
    await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  } catch (err) {
    // Fail safely without disrupting the page request
  }


  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images / svg / static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

