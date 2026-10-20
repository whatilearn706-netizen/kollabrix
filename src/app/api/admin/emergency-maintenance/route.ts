import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

function retired() {
  return NextResponse.json(
    {
      error: 'This legacy emergency endpoint has been disabled.',
      message: 'Use the authenticated Admin Control Center instead.',
    },
    {
      status: 410,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

export async function GET() {
  return retired();
}

export async function POST() {
  return retired();
}
