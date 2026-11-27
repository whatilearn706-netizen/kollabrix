import { ArenaCategory, DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';

export type ArenaStage = 'lobby' | 'room' | 'faceoff' | 'battle' | 'results';
export type CombatModeId = 'blitz' | 'bug_hunt' | 'web_clash' | 'custom';
export type MatchFormat = 'single';
export type EditorTab = 'html' | 'css' | 'js' | 'python' | 'java' | 'cpp';
export type AlgoLanguage = 'python' | 'cpp' | 'java';
export type StackLanguage = AlgoLanguage | 'web';

export interface BotProfile {
  name: string;
  college: string;
  branch: string;
  tag: string;
  avatarIdx: number;
  avatarEmoji: string;
  baseWpm: number;
  elo: number;
}

export const COLLEGIATE_BOT_PROFILES: BotProfile[] = [
  { name: 'Rohan_Sharma', college: 'IIT Delhi', branch: 'CSE', tag: 'IIT DELHI', avatarIdx: 2, avatarEmoji: '⚡', baseWpm: 66, elo: 1448 },
  { name: 'Aditya_Verma', college: 'DTU Delhi', branch: 'Software Eng', tag: 'DTU DELHI', avatarIdx: 1, avatarEmoji: '⚔️', baseWpm: 62, elo: 1390 },
  { name: 'Tanvi_Pillai', college: 'BITS Pilani', branch: 'Computer Science', tag: 'BITS PILANI', avatarIdx: 3, avatarEmoji: '🚀', baseWpm: 70, elo: 1510 },
  { name: 'Kabir_Mehta', college: 'IIIT Hyderabad', branch: 'CS & AI', tag: 'IIIT HYD', avatarIdx: 4, avatarEmoji: '💻', baseWpm: 72, elo: 1540 },
  { name: 'Meera_Nair', college: 'NIT Trichy', branch: 'Computer Science', tag: 'NIT TRICHY', avatarIdx: 0, avatarEmoji: '🔥', baseWpm: 68, elo: 1475 },
  { name: 'Aryan_Gupta', college: 'IIT Bombay', branch: 'Electrical & CS', tag: 'IIT BOMBAY', avatarIdx: 1, avatarEmoji: '🎯', baseWpm: 64, elo: 1430 },
  { name: 'Sneha_Kulkarni', college: 'COEP Pune', branch: 'Information Tech', tag: 'COEP PUNE', avatarIdx: 2, avatarEmoji: '⚡', baseWpm: 58, elo: 1320 },
  { name: 'Ananya_Deshmukh', college: 'VJTI Mumbai', branch: 'Information Tech', tag: 'VJTI MUMBAI', avatarIdx: 3, avatarEmoji: '✨', baseWpm: 60, elo: 1355 },
];

export const PROVING_GROUNDS_AVATARS = [
  { id: 'walker', name: 'Cyber Architect', image: '/images/arena-cyber-architect.jpg' },
  { id: 'ronin', name: 'Compiler Knight', image: '/images/arena-cyber-entity.jpg' },
  { id: 'sentinel', name: 'Kernel Phantom', image: '/images/arena-retro-sentinel-hd.jpg' },
  { id: 'coder', name: 'Syntax Prodigy', image: '/images/arena-coder-burst.jpg' },
  { id: 'glitch', name: 'Glitch Viper', image: '/images/arena-portal-walker-v1.webp' },
] as const;

export const RANDOM_CALLSIGNS = [
  'CYBER_RONIN_99',
  'NEO_DRIFTER_X',
  'BYTE_SLAYER',
  'QUANTUM_VIPER',
  'TITAN_LOGIC',
  'SYNTAX_REAPER',
  'KRYPTIC_PULSE',
  'VOID_RUNNER',
  'BINARY_FALCON',
];

export interface ArenaStatsSummary {
  elo: number;
  wins: number;
  losses: number;
  winStreak: number;
  tier: string;
}

export interface TestCaseVerdict {
  status: 'Accepted' | 'Wrong Answer' | 'Error';
  stdout: string;
  stderr?: string;
  executionTimeMs?: number;
}

export interface OpponentSolutionBuffer {
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  pythonCode?: string;
  javaCode?: string;
  cppCode?: string;
}

export interface CheatAlertInfo {
  cheaterName: string;
  strikes: number;
  reason: string;
  timestamp: number;
}

/**
 * Generates an ephemeral alphanumeric callsign (mixed letters + digits) for unauthenticated guest previews.
 */
export function generateGuestCallsign(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const chars: string[] = [];
  for (let i = 0; i < 4; i++) {
    chars.push(letters[Math.floor(Math.random() * letters.length)]);
  }
  for (let i = 0; i < 4; i++) {
    chars.push(digits[Math.floor(Math.random() * digits.length)]);
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return `G-${chars.join('')}`;
}

/**
 * Sanitizes any display name or email local-part into a valid Arena callsign
 * matching ^[a-zA-Z0-9_.-]+$ with spaces replaced by underscores.
 */
export function sanitizeCallsign(raw?: string | null): string {
  const cleaned = String(raw || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '')
    .replace(/^[_.-]+|[_.-]+$/g, '')
    .slice(0, 25);
  if (cleaned.length >= 3) return cleaned;
  return `${cleaned || 'Builder'}_KBX`.slice(0, 25);
}

/**
 * Returns a rank tier label for display in Fighter Dossier cards.
 */
export function getTierFromElo(elo: number): string {
  if (elo >= 2000) return 'APEX';
  if (elo >= 1800) return 'OBSIDIAN';
  if (elo >= 1500) return 'DIAMOND';
  if (elo >= 1300) return 'GOLD II';
  if (elo >= 1050) return 'SILVER I';
  return 'BRONZE';
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function computeExpectedQuestionTests(q: DuelQuestion): number {
  const ruleCount = Array.isArray(q.validationCriteria)
    ? q.validationCriteria.filter((c) => c.startsWith('rule::') || c.startsWith('ruleJson::')).length
    : 0;
  if (ruleCount > 0) return ruleCount;
  if (Array.isArray(q.testCases) && q.testCases.length > 0) {
    return q.testCases.length;
  }
  const tags = (q.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const isWebQ =
    q.arena === 'web_dev' ||
    (q.arena === 'bug_hunt' && (q.bugDomain === 'web' || Boolean(q.targetComponentHtml)));
  if (isWebQ) {
    let count = 0;
    if (tags.includes('html')) count++;
    if (tags.includes('css')) count++;
    if (tags.includes('javascript') || tags.includes('js')) count++;
    if (count > 0) return count;
    return q.targetComponentJs && q.targetComponentJs.length > 25 ? 3 : 2;
  }
  return 3;
}

export function enrichQuestion(q: DuelQuestion | null | undefined): DuelQuestion {
  if (!q) return DEFAULT_ARENA_QUESTIONS[0];
  const match = DEFAULT_ARENA_QUESTIONS.find(
    (d) => d.id === q.id || d.title.toLowerCase().trim() === q.title.toLowerCase().trim()
  );
  return {
    ...q,
    targetComponentHtml: q.targetComponentHtml || match?.targetComponentHtml || '',
    targetComponentCss: q.targetComponentCss || match?.targetComponentCss || '',
    targetComponentJs:
      q.targetComponentJs && q.targetComponentJs.trim().length > 20
        ? q.targetComponentJs
        : match?.targetComponentJs || '',
  };
}

/**
 * Returns ONLY the web editor tabs allowed for this specific challenge.
 * e.g. HTML-only -> ['html'], HTML+CSS -> ['html','css'], HTML+JS -> ['html','js'], HTML+CSS+JS -> ['html','css','js'].
 */
export function getVisibleWebTabs(q: DuelQuestion): Array<'html' | 'css' | 'js'> {
  const rawTags = (q.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const hasExplicitWebTags = rawTags.some((t) => ['html', 'css', 'js', 'javascript'].includes(t));

  if (hasExplicitWebTags) {
    const tabs: Array<'html' | 'css' | 'js'> = ['html'];
    if (rawTags.includes('css')) tabs.push('css');
    if (rawTags.includes('javascript') || rawTags.includes('js')) tabs.push('js');
    return tabs;
  }

  const tabs: Array<'html' | 'css' | 'js'> = ['html'];
  if ((q.targetComponentCss || q.starterCss || '').trim().length > 0) tabs.push('css');
  if ((q.targetComponentJs || q.starterJs || '').trim().length > 0) tabs.push('js');
  return tabs;
}

/**
 * Returns true if the question runs in Web UI mode (HTML/CSS/JS tabs + Blueprint & Live Preview).
 */
export function isWebArenaQuestion(q: DuelQuestion, mode?: CombatModeId): boolean {
  if (mode === 'web_clash') return true;
  if (q.arena === 'web_dev') return true;
  if (q.arena === 'bug_hunt') {
    return q.bugDomain === 'web' || Boolean(q.targetComponentHtml) || Boolean(q.starterHtml);
  }
  return false;
}

export function mapModeToConfig(mode: CombatModeId, stack: StackLanguage, webTags: string[]) {
  if (mode === 'web_clash' || (mode === 'custom' && stack === 'web')) {
    const tags = webTags.includes('html') ? webTags : ['html', ...webTags];
    return { arena: 'web_dev' as ArenaCategory, bugDomain: undefined, tags };
  }
  if (mode === 'bug_hunt') {
    if (stack === 'web') {
      return { arena: 'bug_hunt' as ArenaCategory, bugDomain: 'web' as const, tags: ['web'] };
    }
    return { arena: 'bug_hunt' as ArenaCategory, bugDomain: 'logic' as const, tags: [stack] };
  }
  return { arena: 'algorithms' as ArenaCategory, bugDomain: undefined, tags: [stack === 'web' ? 'python' : stack] };
}

/**
 * Computes smart default duel duration in seconds (60s for Bug Hunt, 3m/5m/10m otherwise).
 */
export function getSmartDurationSeconds(
  mode: CombatModeId,
  diff: 'easy' | 'medium' | 'hard',
  stack: StackLanguage = 'python'
): number {
  if (mode === 'bug_hunt') return 60;
  if (mode === 'web_clash' || (mode === 'custom' && stack === 'web')) return diff === 'easy' ? 300 : 600;
  if (diff === 'easy') return 180;
  if (diff === 'hard') return 600;
  return 300;
}
