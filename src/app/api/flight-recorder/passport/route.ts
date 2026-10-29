import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { DeveloperPassport, SAMPLE_MAYANK_PASSPORT } from '@/types/flightRecorder';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');

    const storedPassports = await getMasterControlSubkey<DeveloperPassport[]>(
      'minted_developer_passports',
      [SAMPLE_MAYANK_PASSPORT]
    );

    let match: DeveloperPassport | undefined;
    if (id) {
      match = storedPassports.find((p) => p.id === id);
    } else if (username) {
      match = storedPassports.find((p) => p.username.toLowerCase() === username.toLowerCase());
    }

    if (!match) {
      // Default to sample Mayank passport for rich presentation
      match = SAMPLE_MAYANK_PASSPORT;
    }

    return NextResponse.json(
      {
        success: true,
        passport: match,
        allCount: storedPassports.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, passport: SAMPLE_MAYANK_PASSPORT },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const storedPassports = await getMasterControlSubkey<DeveloperPassport[]>(
      'minted_developer_passports',
      [SAMPLE_MAYANK_PASSPORT]
    );

    const newPassport: DeveloperPassport = {
      id: body.id || `pass-${Date.now()}`,
      userId: body.userId || 'anon-user',
      username: body.username || 'developer',
      displayName: body.displayName || 'Campus Developer',
      avatarUrl: body.avatarUrl || '/brand/kollabrix-k.png',
      college: body.college || 'Collegiate Institute',
      course: body.course || 'B.Tech Computer Science',
      roleTitle: body.roleTitle || 'Full-Stack Developer',
      hackathonName: body.hackathonName || 'Collegiate Sprint',
      seasonYear: '2026',
      tierBadge: body.tierBadge || 'VERIFIED SPRINT CARRY',
      clutchFactor: Number(body.clutchFactor ?? 95),
      codeCraft: Number(body.codeCraft ?? 92),
      peerReliability: Number(body.peerReliability ?? 100),
      icpcAccuracy: Number(body.icpcAccuracy ?? 98.5),
      telemetry: body.telemetry || {
        backendPercent: 70,
        realtimeOrTelemetryPercent: 15,
        frontendPercent: 15,
        totalCommits: 40,
        lateNightCommits: 28,
        linesOfCodeEstimated: 3200,
        mergeConflictsCount: 0,
      },
      attestations: body.attestations || [],
      verificationHash: `hash-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      verificationUrl: `https://kollabrix.in/p/${body.username || 'developer'}`,
      mintedAt: new Date().toISOString(),
      status: 'minted',
    };

    // Replace if exists or append
    const updated = storedPassports.filter((p) => p.id !== newPassport.id);
    updated.unshift(newPassport);

    await updateMasterControlSubkey('minted_developer_passports', updated);

    return NextResponse.json({
      success: true,
      message: 'Passport minted successfully',
      passport: newPassport,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
