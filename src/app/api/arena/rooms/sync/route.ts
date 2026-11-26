import { NextRequest, NextResponse } from 'next/server';
import { getRoom, saveRoom } from '@/lib/arena/roomStorage';
import { DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// POST: Realtime multiplayer room actions & state synchronization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, action, playerId, payload } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Room code required' }, { status: 400 });
    }

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    switch (action) {
      case 'start_match': {
        room.status = 'starting';
        room.startedAt = payload?.startedAt || new Date(Date.now() + 3800).toISOString();
        if (payload?.timeLimit) {
          room.timeLimit = Number(payload.timeLimit);
        }
        if (payload?.question) {
          room.question = {
            ...payload.question,
            timeLimitSeconds: room.timeLimit || Number(payload.question.timeLimitSeconds) || 300,
          };
        } else if (room.question && room.timeLimit) {
          room.question.timeLimitSeconds = room.timeLimit;
        }
        if (room.question) {
          const match = DEFAULT_ARENA_QUESTIONS.find(
            (d) => d.id === room.question.id || d.title.toLowerCase().trim() === room.question.title.toLowerCase().trim()
          );
          if (match?.targetComponentJs && (!room.question.targetComponentJs || room.question.targetComponentJs.trim().length < 20)) {
            room.question.targetComponentJs = match.targetComponentJs;
          }
        }
        break;
      }

      case 'close_room': {
        room.status = 'closed';
        break;
      }

      case 'leave_room': {
        const isActorAlpha =
          (room.hostId && room.hostId === playerId) ||
          room.alphaPlayers.some((p) => p.id === playerId);
        const isActorOmega = room.omegaPlayers.some((p) => p.id === playerId);

        if ((room.status === 'in_progress' || room.status === 'starting') && (isActorAlpha || isActorOmega)) {
          room.status = 'finished';
          room.winnerTeam = isActorAlpha ? 'Team Omega' : 'Team Alpha';
        } else if (isActorAlpha) {
          room.status = 'closed';
        } else {
          room.alphaPlayers = room.alphaPlayers.filter((p) => p.id !== playerId);
          room.omegaPlayers = room.omegaPlayers.filter((p) => p.id !== playerId);
        }
        break;
      }

      case 'in_progress': {
        room.status = 'in_progress';
        if (!room.startedAt) {
          room.startedAt = now;
        }
        break;
      }

      case 'toggle_bot': {
        const isBotEnabled = Boolean(payload?.isBotEnabled);
        room.isBotEnabled = isBotEnabled;
        if (isBotEnabled) {
          room.omegaPlayers = [
            {
              id: 'bot-rival',
              name: 'Rohan Sharma (DTU Delhi)',
              avatarIdx: 2,
              team: 'omega',
              role: 'driver',
              isReady: true,
              isHost: false,
              testsPassed: 0,
              wpm: 66,
              lastActive: now,
            },
          ];
        } else {
          // Only remove if it was the bot
          room.omegaPlayers = room.omegaPlayers.filter((p) => p.id !== 'bot-rival');
        }
        break;
      }

      case 'progress': {
        const testsPassed = Number(payload?.testsPassed) || 0;
        const wpm = Number(payload?.wpm) || 0;

        // Update player's telemetry
        const alphaPlayer = room.alphaPlayers.find((p) => p.id === playerId);
        if (alphaPlayer) {
          alphaPlayer.testsPassed = testsPassed;
          alphaPlayer.wpm = wpm;
          alphaPlayer.lastActive = now;
        }

        const omegaPlayer = room.omegaPlayers.find((p) => p.id === playerId);
        if (omegaPlayer) {
          omegaPlayer.testsPassed = testsPassed;
          omegaPlayer.wpm = wpm;
          omegaPlayer.lastActive = now;
        }
        break;
      }

      case 'cheat_flag': {
        const cheaterId = payload?.cheaterId || playerId;
        const cheaterName = payload?.cheaterName || 'Player';
        const strikeCount = Number(payload?.strikeCount) || 1;
        const reason = payload?.reason || 'Screen / tab switch detected';

        if (!room.cheatIncidents) {
          room.cheatIncidents = [];
        }

        room.cheatIncidents.push({
          cheaterId,
          cheaterName,
          strikeCount,
          reason,
          timestamp: now,
        });

        // Also record strikes directly on player roster entry
        const alphaP = room.alphaPlayers.find((p) => p.id === cheaterId);
        if (alphaP) alphaP.cheatStrikes = strikeCount;
        const omegaP = room.omegaPlayers.find((p) => p.id === cheaterId);
        if (omegaP) omegaP.cheatStrikes = strikeCount;
        break;
      }

      case 'match_won': {
        // First solver wins atomically: if already finished, return authoritative finished room so rival sees defeat
        if (room.status === 'finished' && room.winnerTeam) {
          return NextResponse.json(
            { success: true, alreadyFinished: true, room },
            {
              headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
              },
            }
          );
        }

        // 1. Match must currently be active or starting
        if (room.status !== 'in_progress' && room.status !== 'starting') {
          return NextResponse.json({ success: false, error: 'Match is not actively running' }, { status: 400 });
        }

        // 2. Actor must be a registered participant in this room
        const isAlpha = room.alphaPlayers.some((p) => p.id === playerId || p.name === payload?.playerName);
        const isOmega = room.omegaPlayers.some((p) => p.id === playerId || p.name === payload?.playerName);

        if (!isAlpha && !isOmega) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized: Actor is not a registered player in this match room.' },
            { status: 403 }
          );
        }

        // 3. Winner is locked strictly to the first verified participant's squad (or opposing squad on forfeit)
        const isForfeit = payload?.forfeit === true;
        const actorIsAlpha = room.alphaPlayers.some((p) => p.id === playerId);
        const actorTeam: 'Team Alpha' | 'Team Omega' = actorIsAlpha ? 'Team Alpha' : isOmega ? 'Team Omega' : 'Team Alpha';
        const winningTeam: 'Team Alpha' | 'Team Omega' = isForfeit
          ? (actorTeam === 'Team Alpha' ? 'Team Omega' : 'Team Alpha')
          : actorTeam;

        // 4. Update winner's verified test case score (when solved, not forfeited)
        if (!isForfeit) {
          const totalTests = room.question?.testCases?.length || 3;
          const reportedPassed = Math.max(Number(payload?.testsPassed) || totalTests, 1);

          if (winningTeam === 'Team Alpha') {
            const p = room.alphaPlayers.find((x) => x.id === playerId || x.name === payload?.playerName);
            if (p) p.testsPassed = reportedPassed;
          } else {
            const p = room.omegaPlayers.find((x) => x.id === playerId || x.name === payload?.playerName);
            if (p) p.testsPassed = reportedPassed;
          }
        }

        room.status = 'finished';
        room.winnerTeam = winningTeam;
        break;
      }

      case 'heartbeat':
      default: {
        // Refresh caller heartbeat & auto-award win if live PvP opponent disconnected > 18s
        const p1 = room.alphaPlayers.find((p) => p.id === playerId);
        if (p1) p1.lastActive = now;
        const p2 = room.omegaPlayers.find((p) => p.id === playerId);
        if (p2) p2.lastActive = now;

        if (room.status === 'in_progress' && !room.isBotEnabled && room.startedAt) {
          const startedMs = Date.parse(room.startedAt);
          const nowMs = Date.now();
          if (Number.isFinite(startedMs) && nowMs - startedMs >= 18000) {
            const actorIsAlpha = Boolean(p1);
            const oppList = actorIsAlpha ? room.omegaPlayers : room.alphaPlayers;
            const humanOpp = oppList.find((p) => p.id !== 'bot-rival');
            if (humanOpp?.lastActive) {
              const oppLastMs = Date.parse(humanOpp.lastActive);
              if (Number.isFinite(oppLastMs) && oppLastMs >= startedMs - 5000 && nowMs - oppLastMs >= 18000) {
                room.status = 'finished';
                room.winnerTeam = actorIsAlpha ? 'Team Alpha' : 'Team Omega';
              }
            }
          }
        }
        break;
      }
    }

    const updated = await saveRoom(room);

    return NextResponse.json(
      { success: true, room: updated },
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
