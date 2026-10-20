import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || request.nextUrl.host || '').toLowerCase();
  const pathname = request.nextUrl.pathname;
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

  const PRIMARY_DOMAIN = 'linkora-link.online';

  // 1. Permanently 301 redirect all linkora-edu and vercel.app traffic to linkora-link.online
  // This removes linkora-edu from Google Search and forces all users and crawlers to linkora-link.online
  if (!isLocal && (host.includes('linkora-edu') || host.includes('vercel.app'))) {
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

  // 2. If request has an OAuth code and is not yet on /auth/callback, route it to /auth/callback on linkora-link.online
  if (request.nextUrl.searchParams.has('code') && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone();
    url.host = isLocal ? host : PRIMARY_DOMAIN;
    url.protocol = isLocal ? url.protocol : 'https';
    url.port = isLocal ? url.port : '';
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url, { status: 307 });
  }

  // 3. Ensure any other non-canonical host redirects to PRIMARY_DOMAIN
  if (!isLocal && host !== PRIMARY_DOMAIN && host !== `www.${PRIMARY_DOMAIN}` && host !== 'linkora.in' && host !== 'www.linkora.in') {
    const url = request.nextUrl.clone();
    url.host = PRIMARY_DOMAIN;
    url.protocol = 'https';
    url.port = '';
    return NextResponse.redirect(url, { status: 301 });
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


  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self'; object-src 'none'; base-uri 'self';"
  );

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

