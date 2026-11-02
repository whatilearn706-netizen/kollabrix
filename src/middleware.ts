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

  // Protect nested arena sub-routes while allowing public entry
  if (pathname.startsWith('/arena/')) {
    const cookies = request.cookies.getAll();
    const hasSession = cookies.some(
      (c) =>
        c.name.includes('-auth-token') ||
        c.name.startsWith('sb-') ||
        c.name === 'next-auth.session-token'
    );

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Apply the middleware only to arena paths
export const config = {
  matcher: ['/arena/:path*'],
};
