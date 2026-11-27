import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import type { UserArenaStats } from '@/app/api/arena/rating/route';

export interface BuilderMemoryProfile {
  preferredStack: string[];
  weakTopics: string[];
  targetGoal: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  notes: string;
  updatedAt: string;
}

const MEMORY_KEY = 'ka_builder_memory_v1';
const memMemory = new Map<string, BuilderMemoryProfile>();

const DEFAULT_MEMORY: BuilderMemoryProfile = {
  preferredStack: [],
  weakTopics: [],
  targetGoal: '',
  experienceLevel: 'intermediate',
  notes: '',
  updatedAt: '',
};

/**
 * Loads a student's Personal Builder Memory + live Battle Arena performance telemetry
 * so KΛ ΛI automatically adapts explanations, code languages, and drills without re-prompting.
 */
export async function getBuilderMemoryWithArena(userId: string | null): Promise<{
  memory: BuilderMemoryProfile;
  arenaStats: UserArenaStats | null;
}> {
  if (!userId) {
    return { memory: DEFAULT_MEMORY, arenaStats: null };
  }

  try {
    const [allMem, allRatings] = await Promise.all([
      getMasterControlSubkey<Record<string, BuilderMemoryProfile>>(MEMORY_KEY, {}, true),
      getMasterControlSubkey<Record<string, UserArenaStats>>('arena_user_ratings', {}, true),
    ]);

    const memory = allMem[userId] || memMemory.get(userId) || DEFAULT_MEMORY;
    const arenaStats = allRatings[userId] || null;
    return { memory, arenaStats };
  } catch {
    return { memory: memMemory.get(userId) || DEFAULT_MEMORY, arenaStats: null };
  }
}

export async function saveBuilderMemory(
  userId: string,
  patch: Partial<BuilderMemoryProfile>
): Promise<BuilderMemoryProfile> {
  const { memory: current } = await getBuilderMemoryWithArena(userId);
  const next: BuilderMemoryProfile = {
    preferredStack: Array.isArray(patch.preferredStack)
      ? patch.preferredStack.map((s) => s.trim()).filter(Boolean).slice(0, 10)
      : current.preferredStack,
    weakTopics: Array.isArray(patch.weakTopics)
      ? patch.weakTopics.map((s) => s.trim()).filter(Boolean).slice(0, 10)
      : current.weakTopics,
    targetGoal: typeof patch.targetGoal === 'string' ? patch.targetGoal.trim().slice(0, 120) : current.targetGoal,
    experienceLevel:
      patch.experienceLevel === 'beginner' ||
      patch.experienceLevel === 'intermediate' ||
      patch.experienceLevel === 'advanced'
        ? patch.experienceLevel
        : current.experienceLevel,
    notes: typeof patch.notes === 'string' ? patch.notes.trim().slice(0, 300) : current.notes,
    updatedAt: new Date().toISOString(),
  };

  memMemory.set(userId, next);
  try {
    const allMem = await getMasterControlSubkey<Record<string, BuilderMemoryProfile>>(MEMORY_KEY, {}, true);
    allMem[userId] = next;
    await updateMasterControlSubkey(MEMORY_KEY, allMem);
  } catch {}
  return next;
}

export function formatBuilderMemoryPrompt(
  memory: BuilderMemoryProfile,
  arenaStats: UserArenaStats | null
): string {
  const lines: string[] = [];
  if (memory.preferredStack.length > 0) {
    lines.push(`- Preferred Tech Stack: ${memory.preferredStack.join(', ')}`);
  }
  if (memory.weakTopics.length > 0) {
    lines.push(`- Weak Topics / Needs Extra Intuition: ${memory.weakTopics.join(', ')}`);
  }
  if (memory.targetGoal) {
    lines.push(`- Target Goal: ${memory.targetGoal}`);
  }
  if (memory.experienceLevel) {
    lines.push(`- Experience Level: ${memory.experienceLevel}`);
  }
  if (memory.notes) {
    lines.push(`- Personal Notes: ${memory.notes}`);
  }
  if (arenaStats) {
    lines.push(
      `- Live 1v1 Battle Arena Telemetry: ${arenaStats.elo} ELO (${arenaStats.tier}) · ${arenaStats.wins}W / ${arenaStats.losses}L · Streak: ${arenaStats.winStreak}${
        arenaStats.lastOpponent ? ` · Last Rival: ${arenaStats.lastOpponent}` : ''
      }`
    );
  }
  if (lines.length === 0) return '';
  return `PERSONAL BUILDER MEMORY (Adapt code stack, depth & coaching automatically to this student):\n${lines.join('\n')}`;
}
