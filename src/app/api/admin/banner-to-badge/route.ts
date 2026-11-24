import { NextRequest, NextResponse } from 'next/server';
import { analyzeBannerForBadge } from '@/lib/bannerToBadgeAI';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bannerUrl, title, organizer, description, prizePool } = body || {};

    const analysis = analyzeBannerForBadge({
      bannerUrl,
      title,
      organizer,
      description,
      prizePool,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to analyze banner' },
      { status: 500 }
    );
  }
}
