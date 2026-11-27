import { NextRequest, NextResponse } from 'next/server';
import { KA_CODEX_BOOKS } from '@/data/kaCodexBooks';
import { buildMonographCoverSvg } from '@/lib/codex/monographArt';

export const runtime = 'nodejs';

/**
 * Generates and serves 100% original KΛ FOLIO dark monograph hardcover SVG covers
 * for every curated volume (eliminating external copyrighted publisher cover requests).
 */
export async function GET(request: NextRequest) {
  const isbn = (request.nextUrl.searchParams.get('isbn') || '').replace(/[^0-9X]/gi, '');
  const id = (request.nextUrl.searchParams.get('id') || '').trim();

  const book =
    KA_CODEX_BOOKS.find((b) => (isbn && b.isbn === isbn) || (id && b.id === id)) || null;

  if (!book) {
    return NextResponse.json({ error: 'Unknown volume' }, { status: 404 });
  }

  const svg = buildMonographCoverSvg(book);
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
