import { NextRequest, NextResponse } from 'next/server';
import { joinPlayerToRoom, getRoom } from '@/lib/arena/roomStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// POST: Join a battle room with code/link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, player } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Room code or link is required' }, { status: 400 });
    }

    // Extract code if user pasted a full URL (e.g. "https://kollabrix.in/arena?room=KBX-4634")
    let cleanCode = String(code).trim();
    if (cleanCode.includes('room=')) {
      const match = cleanCode.match(/room=([A-Za-z0-9-]+)/);
      if (match && match[1]) cleanCode = match[1];
    } else if (cleanCode.includes('#join-')) {
      cleanCode = cleanCode.split('#join-')[1];
    }

    cleanCode = cleanCode.toUpperCase();

    const playerName = player?.name?.trim() || 'RivalCoder';
    const avatarIdx = Number(player?.avatarIdx) || 1;
    const playerId = player?.id || `p-${Date.now()}`;

    const result = await joinPlayerToRoom(cleanCode, {
      id: playerId,
      name: playerName,
      avatarIdx,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, room: result.room },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
