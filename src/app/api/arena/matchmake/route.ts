import { NextRequest, NextResponse } from 'next/server';
import {
  enqueuePlayer,
  pollTicket,
  removeTicket,
  QueueTicket,
} from '@/lib/arena/matchmakingQueue';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// POST: Join queue, poll, or cancel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'join';

    if (action === 'join') {
      const {
        playerId,
        playerName,
        college,
        avatarIdx,
        elo,
        combatMode,
        algoLanguage,
        webTags,
        difficulty,
        timeLimit,
        question,
      } = body;

      if (!playerId || !playerName || !combatMode) {
        return NextResponse.json(
          { success: false, error: 'Missing required matchmaking parameters' },
          { status: 400 }
        );
      }

      const ticket: QueueTicket = {
        id: `q_${playerId}`,
        playerId,
        playerName,
        college: college || 'Campus Contender',
        avatarIdx: Number(avatarIdx) || 1,
        elo: Number(elo) || 1200,
        combatMode,
        algoLanguage: algoLanguage || 'python',
        webTags: Array.isArray(webTags) ? webTags : [],
        difficulty: difficulty || 'easy',
        timeLimit: Number(timeLimit) || 300,
        question,
        createdAt: Date.now(),
        matched: false,
      };

      const result = await enqueuePlayer(ticket);
      return NextResponse.json({
        success: true,
        matched: result.matched,
        roomInfo: result.roomInfo,
        ticketId: result.ticketId,
      });
    }

    if (action === 'poll') {
      const ticketId = body.ticketId;
      if (!ticketId) {
        return NextResponse.json({ success: false, error: 'ticketId required' }, { status: 400 });
      }
      const result = await pollTicket(ticketId);
      return NextResponse.json({
        success: true,
        matched: result.matched,
        roomInfo: result.roomInfo,
      });
    }

    if (action === 'cancel') {
      const ticketId = body.ticketId;
      if (ticketId) await removeTicket(ticketId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Matchmaking error' },
      { status: 500 }
    );
  }
}

// GET: Fast polling endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');
    if (!ticketId) {
      return NextResponse.json({ success: false, error: 'ticketId required' }, { status: 400 });
    }
    const result = await pollTicket(ticketId);
    return NextResponse.json(
      {
        success: true,
        matched: result.matched,
        roomInfo: result.roomInfo,
      },
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

// DELETE: Cancel ticket
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');
    if (ticketId) await removeTicket(ticketId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
