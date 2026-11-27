import { NextRequest, NextResponse } from 'next/server';
import { KA_AI_ORIGIN, KA_FOLIO_ORIGIN, getKaSubdomainFromHost } from '@/lib/kaBrandDomains';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    '';
  const brandParam = request.nextUrl.searchParams.get('brand');
  const brand =
    brandParam === 'ai' || brandParam === 'folio'
      ? brandParam
      : getKaSubdomainFromHost(host) || 'ai';

  const origin = brand === 'folio' ? KA_FOLIO_ORIGIN : KA_AI_ORIGIN;
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /control-center
Disallow: /admin

Sitemap: ${origin}/sitemap.xml
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
