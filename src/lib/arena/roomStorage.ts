import { DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/isConfigured';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

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
  hostId?: string;
  format: '1v1' | '2v2';
  arena: 'web_dev' | 'algorithms' | 'bug_hunt';
  selectedTags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  question: DuelQuestion;
  status: 'lobby' | 'starting' | 'in_progress' | 'finished' | 'closed';
  startedAt?: string;
  winnerTeam?: 'Team Alpha' | 'Team Omega' | 'Draw';
  alphaPlayers: ArenaPlayer[];
  omegaPlayers: ArenaPlayer[];
  isBotEnabled?: boolean;
  isTournamentRoom?: boolean;
  matchTitle?: string;
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
 * Fetch all active rooms from dedicated platform_settings row
 */
export async function getAllActiveRooms(): Promise<Record<string, ArenaRoom>> {
  try {
    const client = getSupabaseAdmin();
    if (!client) {
      const fallback: Record<string, ArenaRoom> = {};
      MEMORY_ROOMS.forEach((val, key) => { fallback[key] = val; });
      return fallback;
    }
    const { data, error } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', 'arena_active_rooms')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('DB error fetching arena_active_rooms:', error.message);
    }

    const rooms = (data && data[0] && typeof data[0].value === 'object' && data[0].value !== null)
      ? data[0].value
      : {};

    // Hydrate memory cache
    for (const [code, r] of Object.entries(rooms)) {
      MEMORY_ROOMS.set(code.toUpperCase(), r as ArenaRoom);
    }
    return rooms as Record<string, ArenaRoom>;
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

  // Always query database first to get authoritative shared state across all serverless containers
  const allRooms = await getAllActiveRooms();
  if (allRooms[cleanCode]) {
    return allRooms[cleanCode];
  }

  // Fallback to memory cache
  if (MEMORY_ROOMS.has(cleanCode)) {
    return MEMORY_ROOMS.get(cleanCode)!;
  }

  return null;
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

  // Persist to Postgres dedicated row
  try {
    const allRooms = await getAllActiveRooms();
    allRooms[cleanCode] = updatedRoom;
    const cleaned = cleanupStaleRooms(allRooms);
    const client = getSupabaseAdmin();
    if (client) {
      const { data: existingRows } = await client
        .from('platform_settings')
        .select('key')
        .eq('key', 'arena_active_rooms')
        .limit(1);

      await client
        .from('platform_settings')
        .upsert(
          {
            key: 'arena_active_rooms',
            value: cleaned,
            updated_at: now,
          },
          { onConflict: 'key' }
        );
    }
  } catch (err) {
    console.warn('Failed writing room to DB:', err);
  }

  return updatedRoom;
}

/**
 * Delete a room permanently from memory and database
 */
export async function deleteRoom(code: string): Promise<boolean> {
  if (!code) return false;
  const cleanCode = code.trim().toUpperCase();

  // 1. Remove from in-memory cache
  MEMORY_ROOMS.delete(cleanCode);

  // 2. Remove from Supabase platform_settings
  try {
    const allRooms = await getAllActiveRooms();
    delete allRooms[cleanCode];
    const cleaned = cleanupStaleRooms(allRooms);
    const client = getSupabaseAdmin();
    if (client) {
      await client
        .from('platform_settings')
        .upsert(
          {
            key: 'arena_active_rooms',
            value: cleaned,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
    }
    return true;
  } catch (err) {
    console.warn('Failed deleting room from DB:', err);
    return false;
  }
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

  // Deduplication check: Is this specific player already in alpha or omega?
  // NOTE: Strict check by player.id ONLY. Never match by player.name to avoid collisions when two users share names or during multi-account testing.
  const existingInAlpha = room.alphaPlayers.find((p) => p.id === player.id);
  if (existingInAlpha) {
    existingInAlpha.lastActive = now;
    existingInAlpha.avatarIdx = player.avatarIdx ?? existingInAlpha.avatarIdx;
    if (player.name) existingInAlpha.name = player.name;
    const saved = await saveRoom(room);
    return { success: true, room: saved };
  }

  const existingInOmega = room.omegaPlayers.find((p) => p.id === player.id);
  if (existingInOmega) {
    existingInOmega.lastActive = now;
    existingInOmega.avatarIdx = player.avatarIdx ?? existingInOmega.avatarIdx;
    if (player.name) existingInOmega.name = player.name;
    const saved = await saveRoom(room);
    return { success: true, room: saved };
  }

  // If this is an Admin-Hosted Tournament Room, fill Player 1 (Alpha) and Player 2 (Omega)
  if (room.isTournamentRoom) {
    if (room.format === '1v1') {
      if (!room.alphaPlayers || room.alphaPlayers.length === 0) {
        const contenderAlpha: ArenaPlayer = {
          id: player.id || `p-${Date.now()}`,
          name: player.name || 'Contender Alpha',
          avatarIdx: player.avatarIdx ?? 0,
          team: 'alpha',
          role: 'driver',
          isReady: true,
          isHost: true,
          testsPassed: 0,
          wpm: 0,
          lastActive: now,
        };
        room.alphaPlayers = [contenderAlpha];
        room.hostName = contenderAlpha.name;
        const saved = await saveRoom(room);
        return { success: true, room: saved };
      } else if (!room.omegaPlayers || room.omegaPlayers.length === 0) {
        const contenderOmega: ArenaPlayer = {
          id: player.id || `p-${Date.now()}`,
          name: player.name || 'Contender Omega',
          avatarIdx: player.avatarIdx ?? 1,
          team: 'omega',
          role: 'driver',
          isReady: true,
          isHost: false,
          testsPassed: 0,
          wpm: 0,
          lastActive: now,
        };
        room.omegaPlayers = [contenderOmega];
        room.isBotEnabled = false;
        const saved = await saveRoom(room);
        return { success: true, room: saved };
      } else {
        return { success: false, error: 'Tournament 1v1 Room is already full (both contenders have joined).' };
      }
    } else if (room.format === '2v2') {
      if (!room.alphaPlayers) room.alphaPlayers = [];
      if (!room.omegaPlayers) room.omegaPlayers = [];
      if (room.alphaPlayers.length < 2) {
        const p: ArenaPlayer = {
          id: player.id || `p-${Date.now()}`,
          name: player.name || `Alpha Player ${room.alphaPlayers.length + 1}`,
          avatarIdx: player.avatarIdx ?? room.alphaPlayers.length,
          team: 'alpha',
          role: room.alphaPlayers.length === 0 ? 'driver' : 'navigator',
          isReady: true,
          isHost: room.alphaPlayers.length === 0,
          testsPassed: 0,
          wpm: 0,
          lastActive: now,
        };
        room.alphaPlayers.push(p);
        if (room.alphaPlayers.length === 1) room.hostName = p.name;
        const saved = await saveRoom(room);
        return { success: true, room: saved };
      } else if (room.omegaPlayers.length < 2) {
        const p: ArenaPlayer = {
          id: player.id || `p-${Date.now()}`,
          name: player.name || `Omega Player ${room.omegaPlayers.length + 1}`,
          avatarIdx: player.avatarIdx ?? (2 + room.omegaPlayers.length),
          team: 'omega',
          role: room.omegaPlayers.length === 0 ? 'driver' : 'navigator',
          isReady: true,
          isHost: false,
          testsPassed: 0,
          wpm: 0,
          lastActive: now,
        };
        room.omegaPlayers.push(p);
        room.isBotEnabled = false;
        const saved = await saveRoom(room);
        return { success: true, room: saved };
      } else {
        return { success: false, error: 'Tournament 2v2 Room is already full (all 4 players have joined).' };
      }
    }
  }

  // In 1v1: the joining player is ALWAYS assigned to Team Omega (Opponent Slot)
  if (room.format === '1v1') {
    const rawName = player.name?.trim() || 'Challenger';
    const hostPlayerName = room.alphaPlayers[0]?.name?.trim() || room.hostName?.trim() || '';
    const isSameNameAsHost = Boolean(hostPlayerName && hostPlayerName.toLowerCase() === rawName.toLowerCase());
    const assignedName = isSameNameAsHost ? `${rawName} (Challenger)` : rawName;

    const newOpponent: ArenaPlayer = {
      id: player.id || `p-${Date.now()}`,
      name: assignedName,
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
    room.isBotEnabled = false; // Real student joined, turn off bot!
    const saved = await saveRoom(room);
    return { success: true, room: saved };
  } else {
    // In 2v2:
    // 1st joiner (player #2 in match) goes to Host squad (Team Alpha Navigator)
    if (room.alphaPlayers.length < 2) {
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
    } else {
      // 2nd and 3rd joiners (players #3 and #4 in match) go to Team Omega
      // Filter out practice bots if real students are joining
      room.omegaPlayers = room.omegaPlayers.filter((p) => p.id !== 'bot-rival');
      if (room.omegaPlayers.length < 2) {
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
  }

  const saved = await saveRoom(room);
  return { success: true, room: saved };
}

// Remove a player cleanly when leaving the room
export async function leaveRoomPlayer(
  roomCode: string,
  playerId: string,
  playerName?: string
): Promise<{ success: boolean; room?: ArenaRoom; error?: string }> {
  const room = await getRoom(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  // If host leaves, close room
  if (room.hostId === playerId || room.alphaPlayers[0]?.id === playerId) {
    room.status = 'closed';
  } else {
    room.alphaPlayers = room.alphaPlayers.filter((p) => p.id !== playerId);
    room.omegaPlayers = room.omegaPlayers.filter((p) => p.id !== playerId);
  }

  const saved = await saveRoom(room);
  return { success: true, room: saved };
}
