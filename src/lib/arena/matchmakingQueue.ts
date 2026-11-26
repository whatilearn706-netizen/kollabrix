import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/isConfigured';
import { saveRoom, ArenaRoom } from './roomStorage';
import { DuelQuestion } from '@/types/arenaDuel';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface MatchmakingOpponent {
  id: string;
  name: string;
  college: string;
  avatarIdx: number;
  elo: number;
}

export interface MatchedRoomInfo {
  code: string;
  opponent: MatchmakingOpponent;
  isHost: boolean;
  question: DuelQuestion;
  timeLimit: number;
}

export interface QueueTicket {
  id: string; // "q_" + playerId
  playerId: string;
  playerName: string;
  college: string;
  avatarIdx: number;
  elo: number;
  combatMode: 'blitz' | 'bug_hunt' | 'web_clash';
  algoLanguage: string;
  webTags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  question: DuelQuestion;
  createdAt: number;
  matched: boolean;
  matchedRoom?: MatchedRoomInfo;
}

// In-memory cache for ultra-fast local lookups
const MEMORY_QUEUE = new Map<string, QueueTicket>();
const STALE_TICKET_TTL_MS = 25000; // 25s maximum queue residency

/**
 * Fetch authoritative queue state across PM2 cluster instances from Postgres
 */
async function getStoredQueue(): Promise<Record<string, QueueTicket>> {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      const fallback: Record<string, QueueTicket> = {};
      MEMORY_QUEUE.forEach((v, k) => { fallback[k] = v; });
      return fallback;
    }
    const { data } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', 'arena_matchmaking_queue')
      .limit(1);

    const raw = (data && data[0] && typeof data[0].value === 'object' && data[0].value !== null)
      ? data[0].value
      : {};

    const now = Date.now();
    const cleaned: Record<string, QueueTicket> = {};

    for (const [id, ticket] of Object.entries(raw as Record<string, QueueTicket>)) {
      if (ticket && now - ticket.createdAt < STALE_TICKET_TTL_MS) {
        cleaned[id] = ticket;
        MEMORY_QUEUE.set(id, ticket);
      }
    }
    return cleaned;
  } catch {
    const fallback: Record<string, QueueTicket> = {};
    MEMORY_QUEUE.forEach((v, k) => { fallback[k] = v; });
    return fallback;
  }
}

/**
 * Persist queue state to Postgres for cross-process synchronization
 */
async function persistQueue(queue: Record<string, QueueTicket>) {
  try {
    const client = getSupabaseAdmin();
    if (!client) return;
    await client.from('platform_settings').upsert(
      {
        key: 'arena_matchmaking_queue',
        value: queue,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch {}
}

/**
 * Enqueue a player and attempt to pair with another real human contender.
 */
export async function enqueuePlayer(ticket: QueueTicket): Promise<{
  matched: boolean;
  roomInfo?: MatchedRoomInfo;
  ticketId: string;
}> {
  const queue = await getStoredQueue();
  const now = Date.now();

  // 1. Scan for compatible real waiting player
  let matchedCandidateId: string | null = null;

  for (const [candId, cand] of Object.entries(queue)) {
    if (cand.playerId === ticket.playerId) continue;
    if (cand.matched) continue;
    if (now - cand.createdAt > STALE_TICKET_TTL_MS) continue;

    // Must share same combat mode (blitz, bug_hunt, or web_clash)
    if (cand.combatMode !== ticket.combatMode) continue;

    const waitDurationMs = now - cand.createdAt;

    if (ticket.combatMode === 'bug_hunt') {
      // Bug Hunt MUST keep Web strictly with Web, and each language strictly with its own starter bug!
      const candIsWeb = cand.algoLanguage === 'web';
      const ticketIsWeb = ticket.algoLanguage === 'web';
      if (candIsWeb !== ticketIsWeb) continue;

      if (ticketIsWeb) {
        matchedCandidateId = candId;
        break;
      }

      if (cand.algoLanguage !== ticket.algoLanguage) continue;
      if (cand.difficulty === ticket.difficulty || waitDurationMs > 2000) {
        matchedCandidateId = candId;
        break;
      }
    } else if (ticket.combatMode === 'blitz') {
      // Quick Blitz supports Python/C++/Java on the same I/O problem after 2s wait
      const sameLanguage = cand.algoLanguage === ticket.algoLanguage;
      const sameDiff = cand.difficulty === ticket.difficulty;
      if ((sameLanguage && sameDiff) || waitDurationMs > 2000) {
        matchedCandidateId = candId;
        break;
      }
    } else {
      // Web Clash: pair any waiting web contender
      matchedCandidateId = candId;
      break;
    }
  }

  // 2. If a real human candidate is found, pair them immediately!
  if (matchedCandidateId) {
    const candidate = queue[matchedCandidateId];
    const roomCode = `KBX-${Math.floor(1000 + Math.random() * 9000)}`;
    const chosenQuestion = candidate.question || ticket.question;
    const duration = candidate.timeLimit || ticket.timeLimit || 300;
    const isoNow = new Date().toISOString();

    // Create synchronized room
    const newRoom: ArenaRoom = {
      code: roomCode,
      hostName: candidate.playerName,
      hostId: candidate.playerId,
      format: '1v1',
      arena: ticket.combatMode === 'web_clash' ? 'web_dev' : ticket.combatMode === 'bug_hunt' ? 'bug_hunt' : 'algorithms',
      selectedTags: ticket.webTags || [],
      difficulty: ticket.difficulty,
      timeLimit: duration,
      question: chosenQuestion,
      status: 'starting',
      startedAt: new Date(now + 4200).toISOString(),
      alphaPlayers: [
        {
          id: candidate.playerId,
          name: candidate.playerName,
          avatarIdx: candidate.avatarIdx,
          team: 'alpha',
          role: 'driver',
          isReady: true,
          isHost: true,
          testsPassed: 0,
          wpm: 0,
          lastActive: isoNow,
        },
      ],
      omegaPlayers: [
        {
          id: ticket.playerId,
          name: ticket.playerName,
          avatarIdx: ticket.avatarIdx,
          team: 'omega',
          role: 'driver',
          isReady: true,
          isHost: false,
          testsPassed: 0,
          wpm: 0,
          lastActive: isoNow,
        },
      ],
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    await saveRoom(newRoom);

    // Update candidate's ticket so their next poll receives the match
    candidate.matched = true;
    candidate.matchedRoom = {
      code: roomCode,
      opponent: {
        id: ticket.playerId,
        name: ticket.playerName,
        college: ticket.college,
        avatarIdx: ticket.avatarIdx,
        elo: ticket.elo,
      },
      isHost: true,
      question: chosenQuestion,
      timeLimit: duration,
    };
    MEMORY_QUEUE.set(candidate.id, candidate);

    const roomForCaller: MatchedRoomInfo = {
      code: roomCode,
      opponent: {
        id: candidate.playerId,
        name: candidate.playerName,
        college: candidate.college,
        avatarIdx: candidate.avatarIdx,
        elo: candidate.elo,
      },
      isHost: false,
      question: chosenQuestion,
      timeLimit: duration,
    };

    // Clean up caller from queue and persist candidate's matched state
    delete queue[ticket.id];
    queue[candidate.id] = candidate;
    await persistQueue(queue);

    return {
      matched: true,
      roomInfo: roomForCaller,
      ticketId: ticket.id,
    };
  }

  // 3. No candidate waiting yet; record ticket in queue for other searchers
  ticket.matched = false;
  queue[ticket.id] = ticket;
  MEMORY_QUEUE.set(ticket.id, ticket);
  await persistQueue(queue);

  return {
    matched: false,
    ticketId: ticket.id,
  };
}

/**
 * Poll ticket to check if another human joined and matched.
 */
export async function pollTicket(ticketId: string): Promise<{
  matched: boolean;
  roomInfo?: MatchedRoomInfo;
}> {
  // Check local memory first for speed
  const local = MEMORY_QUEUE.get(ticketId);
  if (local?.matched && local.matchedRoom) {
    MEMORY_QUEUE.delete(ticketId);
    return { matched: true, roomInfo: local.matchedRoom };
  }

  const queue = await getStoredQueue();
  const ticket = queue[ticketId];
  if (ticket?.matched && ticket.matchedRoom) {
    const roomInfo = ticket.matchedRoom;
    delete queue[ticketId];
    MEMORY_QUEUE.delete(ticketId);
    await persistQueue(queue);
    return { matched: true, roomInfo };
  }

  return { matched: false };
}

/**
 * Remove ticket from queue when matchmaking times out or player cancels.
 */
export async function removeTicket(ticketId: string): Promise<void> {
  MEMORY_QUEUE.delete(ticketId);
  const queue = await getStoredQueue();
  if (queue[ticketId]) {
    delete queue[ticketId];
    await persistQueue(queue);
  }
}
