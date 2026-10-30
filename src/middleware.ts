import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware that protects any route under /arena/*
 * from unauthenticated access. If the user does not have a
 * valid session cookie, they are redirected to the login page
 * with a `next` query param that points back to the original URL.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to arena routes (including the root /arena page)
  if (pathname.startsWith('/arena')) {
    // Assume the session token is stored in a cookie called `next-auth.session-token`
    const session = request.cookies.get('next-auth.session-token');
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  // Continue to the requested page when auth is present or path is not protected
  return NextResponse.next();
}

// Apply the middleware only to arena paths
export const config = {
  matcher: ['/arena/:path*'],
};
