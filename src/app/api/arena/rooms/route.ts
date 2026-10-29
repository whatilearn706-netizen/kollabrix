import { NextRequest, NextResponse } from 'next/server';
import { getRoom, saveRoom, ArenaRoom, ArenaPlayer } from '@/lib/arena/roomStorage';
import { DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET: Fetch room status by code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, error: 'Room code is required' }, { status: 400 });
    }

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ success: false, error: `Room ${code.toUpperCase()} not found` }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, room },
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

// POST: Host creates or updates a Battle Arena room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      hostName,
      format = '1v1',
      arena = 'web_dev',
      selectedTags = ['html', 'css'],
      difficulty = 'medium',
      timeLimit = 300,
      question,
      isBotEnabled = false,
      avatarIdx = 0,
      hostId = `host-${Date.now()}`,
    } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Room code is required' }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const now = new Date().toISOString();

    const hostPlayer: ArenaPlayer = {
      id: hostId,
      name: hostName || 'SquadLeader',
      avatarIdx: Number(avatarIdx) || 0,
      team: 'alpha',
      role: 'driver',
      isReady: true,
      isHost: true,
      testsPassed: 0,
      wpm: 0,
      lastActive: now,
    };

    const finalQuestion = question || DEFAULT_ARENA_QUESTIONS[0];

    // Build or update room
    const newRoom: ArenaRoom = {
      code: cleanCode,
      hostName: hostPlayer.name,
      format: format === '2v2' ? '2v2' : '1v1',
      arena,
      selectedTags,
      difficulty,
      timeLimit: Number(timeLimit) || 300,
      question: finalQuestion,
      status: 'lobby',
      alphaPlayers: [hostPlayer],
      omegaPlayers: isBotEnabled
        ? [
            {
              id: 'bot-rival',
              name: 'ByteRival Bot (Practice AI)',
              avatarIdx: 1,
              team: 'omega',
              role: 'driver',
              isReady: true,
              isHost: false,
              testsPassed: 0,
              wpm: 68,
              lastActive: now,
            },
          ]
        : [],
      isBotEnabled: Boolean(isBotEnabled),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await saveRoom(newRoom);

    return NextResponse.json(
      { success: true, room: saved },
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
