import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ALLOWED_ISBNS = new Set([
  '9781449373320',
  '9780132350884',
  '9780135957059',
  '9780262046305',
  '9781617292231',
  '9780134757599',
  '9780134685991',
  '9780201633610',
  '9780134494166',
  '9780984782857',
  '9780735619678',
  '9780262510875',
]);

/**
 * Same-origin cached proxy for curated KΛ CODEX book covers so WebGL Three.js
 * textures load cleanly without browser CORS canvas tainting.
 */
export async function GET(request: NextRequest) {
  const isbn = (request.nextUrl.searchParams.get('isbn') || '').replace(/[^0-9X]/gi, '');
  if (!ALLOWED_ISBNS.has(isbn)) {
    return NextResponse.json({ error: 'Invalid ISBN' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`, {
      next: { revalidate: 86400 },
    });
    if (!upstream.ok) {
      return new NextResponse(null, { status: 404 });
    }
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buf = await upstream.arrayBuffer();
    if (buf.byteLength < 800) {
      return new NextResponse(null, { status: 404 });
    }
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
