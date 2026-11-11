import { NextRequest, NextResponse } from 'next/server';
import { getRoom, saveRoom, getAllActiveRooms, deleteRoom, ArenaRoom, ArenaPlayer } from '@/lib/arena/roomStorage';
import { DEFAULT_ARENA_QUESTIONS, DuelQuestion } from '@/types/arenaDuel';
import { getMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { selectBestQuestion } from '@/lib/arena/questionSelector';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET: Fetch room status by code, or list all active rooms for Admin Desk
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || searchParams.get('room') || searchParams.get('roomCode');
    const isList = searchParams.get('list') === 'true' || searchParams.get('all') === 'true';

    if (isList) {
      const allRoomsMap = await getAllActiveRooms();
      const rooms: ArenaRoom[] = Object.values(allRoomsMap).sort(
        (a: ArenaRoom, b: ArenaRoom) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      return NextResponse.json(
        { success: true, rooms },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        }
      );
    }

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
      bugDomain,
      selectedTags = ['html', 'css'],
      difficulty = 'medium',
      timeLimit = 300,
      question,
      isBotEnabled = false,
      avatarIdx = 0,
      hostId = `host-${Date.now()}`,
      isTournamentRoom = false,
      matchTitle,
      seenQuestionIds = [],
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

    const matchDuration = Number(timeLimit) || 300;
    let finalQuestion = question;
    try {
      const storedQuestions = await getMasterControlSubkey<DuelQuestion[]>(
        'arena_duel_questions',
        DEFAULT_ARENA_QUESTIONS
      );
      const rawDeleted = await getMasterControlSubkey<string[]>('deleted_arena_question_ids', []);
      const deletedSet = new Set<string>(
        Array.isArray(rawDeleted) ? rawDeleted.map((id) => String(id).trim().toLowerCase()) : []
      );

      const adminList = Array.isArray(storedQuestions) ? storedQuestions : [];
      const combined: DuelQuestion[] = [];
      for (const q of adminList) {
        if (q && q.id && !deletedSet.has(q.id.toLowerCase())) {
          combined.push(q);
        }
      }
      for (const defQ of DEFAULT_ARENA_QUESTIONS) {
        if (!deletedSet.has(defQ.id.toLowerCase()) && !combined.some((q) => q.id === defQ.id)) {
          combined.push(defQ);
        }
      }

      // If the client provided a specific non-default admin question (e.g. Admin "Play" test), preserve it.
      // Otherwise, authoritatively select the best question from the combined database pool (which prioritizes admin questions).
      const isClientQuestionAdmin = question && !DEFAULT_ARENA_QUESTIONS.some((d) => d.id === question.id);
      if (isClientQuestionAdmin) {
        finalQuestion = {
          ...question,
          timeLimitSeconds: matchDuration,
        };
      } else {
        finalQuestion = selectBestQuestion(combined, {
          arena,
          bugDomain,
          selectedTags,
          difficulty,
          timeLimit: matchDuration,
          seenQuestionIds: Array.isArray(seenQuestionIds) ? seenQuestionIds : [],
        });
      }
    } catch {
      finalQuestion = finalQuestion
        ? { ...finalQuestion, timeLimitSeconds: matchDuration }
        : {
            ...DEFAULT_ARENA_QUESTIONS[0],
            timeLimitSeconds: matchDuration,
          };
    }

    if (finalQuestion) {
      const match = DEFAULT_ARENA_QUESTIONS.find(
        (d) => d.id === finalQuestion.id || d.title.toLowerCase().trim() === finalQuestion.title.toLowerCase().trim()
      );
      if (match?.targetComponentJs && (!finalQuestion.targetComponentJs || finalQuestion.targetComponentJs.trim().length < 20)) {
        finalQuestion.targetComponentJs = match.targetComponentJs;
      }
    }

    // Build or update room
    const isTourney = Boolean(isTournamentRoom);
    const newRoom: ArenaRoom = {
      code: cleanCode,
      hostName: isTourney ? (matchTitle || 'Tournament Host') : hostPlayer.name,
      format: format === '2v2' ? '2v2' : '1v1',
      arena,
      selectedTags,
      difficulty,
      timeLimit: matchDuration,
      question: finalQuestion,
      status: 'lobby',
      alphaPlayers: isTourney ? [] : [hostPlayer],
      omegaPlayers: isTourney
        ? []
        : isBotEnabled
        ? [
            {
              id: 'bot-rival',
              name: 'Aditya Verma (IIT Delhi)',
              avatarIdx: 1,
              team: 'omega',
              role: 'driver',
              isReady: true,
              isHost: false,
              testsPassed: 0,
              wpm: 64,
              lastActive: now,
            },
          ]
        : [],
      isBotEnabled: isTourney ? false : Boolean(isBotEnabled),
      isTournamentRoom: isTourney,
      matchTitle: matchTitle || (isTourney ? `Tournament Duel ${cleanCode}` : undefined),
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

// DELETE: Admin or host permanently deletes a Battle Arena room
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || searchParams.get('room') || searchParams.get('roomCode');

    if (!code) {
      return NextResponse.json({ success: false, error: 'Room code is required' }, { status: 400 });
    }

    const deleted = await deleteRoom(code);
    return NextResponse.json(
      { success: deleted, message: `Room ${code.toUpperCase()} deleted` },
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

