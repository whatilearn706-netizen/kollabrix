import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';

export interface ArenaPlayer {
  id: string;
  name: string;
  avatarIdx: number;
  team: 'alpha' | 'omega';
  role: 'driver' | 'navigator';
  isReady: boolean;
  isHost: boolean;
  testsPassed: number;
  wpm: number;
  lastActive: string;
}

export interface ArenaRoom {
  code: string; // e.g. "KBX-4634"
  hostName: string;
  format: '1v1' | '2v2';
  arena: 'web_dev' | 'algorithms' | 'bug_hunt';
  selectedTags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  question: DuelQuestion;
  status: 'lobby' | 'starting' | 'in_progress' | 'finished';
  winnerTeam?: 'Team Alpha' | 'Team Omega' | 'Draw';
  alphaPlayers: ArenaPlayer[];
  omegaPlayers: ArenaPlayer[];
  isBotEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Global in-memory cache for ultra-low latency sub-millisecond sync across serverless invocations
const MEMORY_ROOMS = new Map<string, ArenaRoom>();

// Clean up rooms older than 3 hours
function cleanupStaleRooms(rooms: Record<string, ArenaRoom>): Record<string, ArenaRoom> {
  const cutoff = Date.now() - 3 * 60 * 60 * 1000;
  const cleaned: Record<string, ArenaRoom> = {};
  for (const [code, r] of Object.entries(rooms)) {
    const updated = new Date(r.updatedAt || r.createdAt).getTime();
    if (updated > cutoff) {
      cleaned[code] = r;
    }
  }
  return cleaned;
}

/**
 * Fetch all active rooms from Postgres platform_settings
 */
export async function getAllActiveRooms(): Promise<Record<string, ArenaRoom>> {
  try {
    const raw = await getMasterControlSubkey<Record<string, ArenaRoom>>('arena_active_rooms', {});
    const rooms = typeof raw === 'object' && raw !== null ? raw : {};
    // Hydrate memory cache
    for (const [code, r] of Object.entries(rooms)) {
      MEMORY_ROOMS.set(code.toUpperCase(), r);
    }
    return rooms;
  } catch (err) {
    console.warn('Failed reading active rooms from DB:', err);
    const fallback: Record<string, ArenaRoom> = {};
    MEMORY_ROOMS.forEach((val, key) => {
      fallback[key] = val;
    });
    return fallback;
  }
}

/**
 * Get a specific room by code (e.g. KBX-4634)
 */
export async function getRoom(code: string): Promise<ArenaRoom | null> {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();

  // Check memory cache first
  if (MEMORY_ROOMS.has(cleanCode)) {
    return MEMORY_ROOMS.get(cleanCode)!;
  }

  // Fallback to database
  const allRooms = await getAllActiveRooms();
  return allRooms[cleanCode] || null;
}

/**
 * Save or update a room in both memory and database
 */
export async function saveRoom(room: ArenaRoom): Promise<ArenaRoom> {
  const cleanCode = room.code.trim().toUpperCase();
  const now = new Date().toISOString();
  const updatedRoom: ArenaRoom = {
    ...room,
    code: cleanCode,
    updatedAt: now,
  };

  // Update memory
  MEMORY_ROOMS.set(cleanCode, updatedRoom);

  // Persist to Postgres
  try {
    const allRooms = await getAllActiveRooms();
    allRooms[cleanCode] = updatedRoom;
    const cleaned = cleanupStaleRooms(allRooms);
    await updateMasterControlSubkey('arena_active_rooms', cleaned);
  } catch (err) {
    console.warn('Failed writing room to DB:', err);
  }

  return updatedRoom;
}

/**
 * Join an existing room
 */
export async function joinPlayerToRoom(
  roomCode: string,
  player: {
    id: string;
    name: string;
    avatarIdx: number;
  }
): Promise<{ success: boolean; room?: ArenaRoom; error?: string }> {
  const room = await getRoom(roomCode);
  if (!room) {
    return { success: false, error: `Room ${roomCode.toUpperCase()} not found. Please verify the code or link.` };
  }

  const cleanCode = roomCode.trim().toUpperCase();
  const now = new Date().toISOString();

  // Check if player is already in room
  const existingAlpha = room.alphaPlayers.find((p) => p.id === player.id || p.name === player.name);
  const existingOmega = room.omegaPlayers.find((p) => p.id === player.id || p.name === player.name);

  if (existingAlpha || existingOmega) {
    // Player re-joining, refresh activity
    if (existingAlpha) {
      existingAlpha.lastActive = now;
      existingAlpha.avatarIdx = player.avatarIdx;
    }
    if (existingOmega) {
      existingOmega.lastActive = now;
      existingOmega.avatarIdx = player.avatarIdx;
    }
    await saveRoom(room);
    return { success: true, room };
  }

  // New Player Joining Slot Assignment:
  if (room.format === '1v1') {
    // In 1v1, slot 1 is Host (Team Alpha). The joiner is Team Omega (Opponent).
    const newOpponent: ArenaPlayer = {
      id: player.id || `p-${Date.now()}`,
      name: player.name || 'RivalCoder',
      avatarIdx: player.avatarIdx ?? 1,
      team: 'omega',
      role: 'driver',
      isReady: true,
      isHost: false,
      testsPassed: 0,
      wpm: 0,
      lastActive: now,
    };
    room.omegaPlayers = [newOpponent];
    room.isBotEnabled = false; // Disable bot since real student joined!
  } else {
    // In 2v2:
    if (room.alphaPlayers.length < 2) {
      // Fill Team Alpha Navigator
      room.alphaPlayers.push({
        id: player.id || `p-${Date.now()}`,
        name: player.name || 'Teammate',
        avatarIdx: player.avatarIdx ?? 2,
        team: 'alpha',
        role: 'navigator',
        isReady: true,
        isHost: false,
        testsPassed: 0,
        wpm: 0,
        lastActive: now,
      });
    } else if (room.omegaPlayers.length < 2) {
      // Fill Team Omega Driver or Navigator
      const isDriver = room.omegaPlayers.length === 0;
      room.omegaPlayers.push({
        id: player.id || `p-${Date.now()}`,
        name: player.name || 'Challenger',
        avatarIdx: player.avatarIdx ?? 3,
        team: 'omega',
        role: isDriver ? 'driver' : 'navigator',
        isReady: true,
        isHost: false,
        testsPassed: 0,
        wpm: 0,
        lastActive: now,
      });
      room.isBotEnabled = false;
    } else {
      return { success: false, error: 'This battle room is already full (max 4 players for 2v2).' };
    }
  }

  const updated = await saveRoom(room);
  return { success: true, room: updated };
}
