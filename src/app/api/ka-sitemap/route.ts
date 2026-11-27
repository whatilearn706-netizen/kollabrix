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

  const now = new Date().toISOString();
  const origin = brand === 'folio' ? KA_FOLIO_ORIGIN : KA_AI_ORIGIN;
  const secondaryPath = brand === 'folio' ? '/resources' : '/spark';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}${secondaryPath}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
