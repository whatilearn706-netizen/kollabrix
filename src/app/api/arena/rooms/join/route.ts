import { NextRequest, NextResponse } from 'next/server';
import { joinPlayerToRoom, getRoom, normalizeRoomCode } from '@/lib/arena/roomStorage';

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

    const cleanCode = normalizeRoomCode(String(code));
    if (!cleanCode) {
      return NextResponse.json({ success: false, error: 'Please enter a valid room code or link' }, { status: 400 });
    }

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
