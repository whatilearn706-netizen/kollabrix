import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const configuredAdminPath = (process.env.NEXT_PUBLIC_ADMIN_ROUTE_PATH || '/control-center-7x9').trim();

  // 1. Direct /admin route redirect to /control-center-7x9
  if (pathname === '/admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/control-center-7x9';
    return NextResponse.redirect(url);
  }

  // 2. If a custom admin route path is configured and matches the request, rewrite to the internal /control-center-7x9 page
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
          // NEVER wipe valid cookies on GET requests due to unverified background calls
          cookiesToSet.forEach(({ name, value }) => {
            if (value) request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            if (value) response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Refresh auth session safely - never let errors crash middleware or wipe valid sessions
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

