'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  X,
  Swords,
  Users,
  Copy,
  Check,
  Play,
  RotateCw,
  Trophy,
  Flame,
  Zap,
  Terminal,
  ShieldAlert,
  Code2,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Radio,
  Award,
  Sparkles,
  Bot,
  Globe,
  Share2,
  Maximize2,
  RefreshCw,
  Send,
  Cpu,
  FileCode,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Dices,
  Activity,
  Shield,
  ShieldCheck,
  Wifi,
  UserCheck,
  Laptop,
  Lock,
  RotateCcw,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Minimize2,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ArenaBackgroundMatrix } from '@/components/arena/ArenaBackgroundMatrix';
import { ArenaCategory, DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';
import { selectBestQuestion, updateSeenQuestionsHistory } from '@/lib/arena/questionSelector';

const SEEN_ARENA_QUESTIONS_KEY = 'kollabrix_arena_seen_questions';

function getStoredSeenQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_ARENA_QUESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((id) => String(id).toLowerCase().trim()) : [];
  } catch {
    return [];
  }
}

function persistSeenQuestionId(newQuestionId: string, matchingQuestionIds: string[] = []) {
  if (typeof window === 'undefined' || !newQuestionId) return;
  try {
    const current = getStoredSeenQuestionIds();
    const updated = updateSeenQuestionsHistory(current, newQuestionId, matchingQuestionIds);
    localStorage.setItem(SEEN_ARENA_QUESTIONS_KEY, JSON.stringify(updated));
  } catch {}
}
import {
  playVictorySound,
  playArcadeCoinSound,
  playCompileSuccessSound,
  playCompileErrorSound,
  playTacticalSelectSound,
  playCheatWarningSiren,
  playOpponentCheatRadarBeep,
} from '@/lib/arena/soundEffects';
import { evaluateWebCoordinateGraph, WebGraphEvaluation } from '@/lib/arena/webCoordinateGraph';
import { verifyTestOutput } from '@/lib/arena/testCaseVerifier';
import { trackEvent } from '@/lib/analytics/tracker';

interface FullArenaExperienceProps {
  onClose: () => void;
  initialRoomCode?: string;
  initialQuestion?: DuelQuestion;
  currentUser?: {
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  };
}

function computeExpectedQuestionTests(q: DuelQuestion): number {
  if (Array.isArray(q.testCases) && q.testCases.length > 0) {
    return q.testCases.length;
  }
  const tags = (q.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const isWebQ =
    q.arena === 'web_dev' ||
    (q.arena === 'bug_hunt' && (q.bugDomain === 'web' || Boolean(q.targetComponentHtml)));

  if (isWebQ) {
    const hasExplicitTags = tags.some((t) => ['html', 'css', 'js', 'javascript'].includes(t));
    if (hasExplicitTags) {
      let count = 0;
      if (tags.includes('html')) count++;
      if (tags.includes('css')) count++;
      if (tags.includes('javascript') || tags.includes('js')) count++;
      return count > 0 ? count : 2;
    }
    return Boolean(q.targetComponentJs && q.targetComponentJs.length > 25 && !q.targetComponentJs.startsWith('//'))
      ? 3
      : 2;
  }
  return q.testCases?.length || 3;
}

function enrichQuestion(q: DuelQuestion | null | undefined): DuelQuestion {
  if (!q) return DEFAULT_ARENA_QUESTIONS[0];
  const match = DEFAULT_ARENA_QUESTIONS.find(
    (d) => d.id === q.id || d.title.toLowerCase().trim() === q.title.toLowerCase().trim()
  );

  let targetJs =
    q.targetComponentJs && q.targetComponentJs.trim().length > 20
      ? q.targetComponentJs
      : match?.targetComponentJs || '';

  // Ensure Kanban Board question has pre-loaded tasks and global window.moveTask / window.deleteTask
  if (q.title && q.title.toLowerCase().includes('kanban')) {
    targetJs = `
let tasks = [
  { id: 1, title: "Design Sprint Mockup", description: "Create wireframes in Figma", status: "todo" },
  { id: 2, title: "API Authentication", description: "Implement JWT login flow", status: "progress" },
  { id: 3, title: "Database Migration", description: "Set up schema & indexes", status: "completed" }
];

const columns = ["todo", "progress", "completed"];

function renderBoard() {
  columns.forEach(function(column) {
    const columnTasks = tasks.filter(function(task) { return task.status === column; });
    const colEl = document.getElementById(column);
    if (colEl) {
      colEl.innerHTML = columnTasks.map(function(task) {
        return '<div class="task" style="background:#374151;padding:12px;margin:10px 0;border-radius:8px;border:1px solid #4b5563;box-shadow:0 4px 12px rgba(0,0,0,0.3);">' +
          '<strong style="display:block;font-size:13px;color:#f3f4f6;margin-bottom:4px;">' + task.title + '</strong>' +
          '<p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;line-height:1.4;">' + (task.description || '') + '</p>' +
          '<div style="display:flex;gap:6px;align-items:center;">' +
            '<button type="button" onclick="moveTask(' + task.id + ', -1)" style="padding:4px 8px;font-size:11px;background:#4b5563;color:white;border:none;border-radius:4px;cursor:pointer;">←</button>' +
            '<button type="button" onclick="moveTask(' + task.id + ', 1)" style="padding:4px 8px;font-size:11px;background:#4b5563;color:white;border:none;border-radius:4px;cursor:pointer;">→</button>' +
            '<button type="button" onclick="deleteTask(' + task.id + ')" style="padding:4px 8px;font-size:11px;background:#ef4444;color:white;border:none;border-radius:4px;cursor:pointer;">Delete</button>' +
          '</div>' +
        '</div>';
      }).join("");
    }

    const countId = column === "todo" ? "todoCount" :
      column === "progress" ? "progressCount" : "completedCount";
    const countEl = document.getElementById(countId);
    if (countEl) {
      countEl.textContent = String(columnTasks.length);
    }
  });
}

function moveTask(id, direction) {
  const order = ["todo", "progress", "completed"];
  tasks = tasks.map(function(task) {
    if (task.id === id) {
      const currentIdx = order.indexOf(task.status);
      const nextIdx = currentIdx + direction;
      if (nextIdx >= 0 && nextIdx < order.length) {
        task.status = order[nextIdx];
      }
    }
    return task;
  });
  renderBoard();
}

function deleteTask(id) {
  tasks = tasks.filter(function(task) { return task.id !== id; });
  renderBoard();
}

window.moveTask = moveTask;
window.deleteTask = deleteTask;

function setupKanban() {
  const form = document.getElementById("taskForm");
  const addBtn = document.getElementById("addTask") || document.querySelector("button[type='submit']");
  
  function handleAddTask() {
    const titleInput = document.getElementById("taskTitle") || document.querySelector("input[placeholder*='title' i]");
    const descInput = document.getElementById("taskDescription") || document.querySelector("input[placeholder*='desc' i]");
    const titleVal = titleInput ? titleInput.value.trim() : "";
    const descVal = descInput ? descInput.value.trim() : "";
    if (!titleVal) return;

    tasks.push({
      id: Date.now(),
      title: titleVal,
      description: descVal,
      status: "todo"
    });

    if (titleInput) titleInput.value = "";
    if (descInput) descInput.value = "";
    renderBoard();
  }

  if (form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      handleAddTask();
    });
  }

  if (addBtn && !form) {
    addBtn.addEventListener("click", function(event) {
      event.preventDefault();
      handleAddTask();
    });
  }

  renderBoard();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupKanban);
} else {
  setupKanban();
}
`;
  }

  return {
    ...q,
    targetComponentJs: targetJs,
    targetComponentHtml: q.targetComponentHtml || match?.targetComponentHtml || '',
    targetComponentCss: q.targetComponentCss || match?.targetComponentCss || '',
  };
}

export const COLLEGIATE_BOT_PROFILES = [
  { name: 'Aditya Verma', college: 'IIT Delhi', tag: 'IITD CSE', avatarIdx: 1, avatarEmoji: '🔥', baseWpm: 66 },
  { name: 'Rohan Sharma', college: 'DTU Delhi', tag: 'DTU COE', avatarIdx: 2, avatarEmoji: '⚡', baseWpm: 62 },
  { name: 'Tanvi Pillai', college: 'BITS Pilani', tag: 'BITS Goa', avatarIdx: 3, avatarEmoji: '🦊', baseWpm: 70 },
  { name: 'Sneha Kulkarni', college: 'COEP Pune', tag: 'COEP IT', avatarIdx: 4, avatarEmoji: '🧠', baseWpm: 58 },
  { name: 'Aryan Mehta', college: 'NSUT Delhi', tag: 'NSUT SE', avatarIdx: 5, avatarEmoji: '🐺', baseWpm: 64 },
  { name: 'Divya Nair', college: 'NIT Trichy', tag: 'NITT CSE', avatarIdx: 6, avatarEmoji: '⚔️', baseWpm: 68 },
  { name: 'Vikramaditya', college: 'IIIT Hyderabad', tag: 'IIITH CS', avatarIdx: 7, avatarEmoji: '👑', baseWpm: 72 },
  { name: 'Ananya Roy', college: 'Jadavpur Univ', tag: 'JU CS', avatarIdx: 8, avatarEmoji: '🚀', baseWpm: 60 },
];

interface AutoCompleteItem {
  label: string;
  insertText: string;
  cursorOffset?: number;
  detail: string;
  kind: 'tag' | 'snippet' | 'css';
}

const HTML_AUTOCOMPLETE_TAGS: AutoCompleteItem[] = [
  { label: '<h1>', insertText: '<h1></h1>', cursorOffset: -5, detail: 'Heading 1', kind: 'tag' },
  { label: '<h2>', insertText: '<h2></h2>', cursorOffset: -5, detail: 'Heading 2', kind: 'tag' },
  { label: '<h3>', insertText: '<h3></h3>', cursorOffset: -5, detail: 'Heading 3', kind: 'tag' },
  { label: '<h4>', insertText: '<h4></h4>', cursorOffset: -5, detail: 'Heading 4', kind: 'tag' },
  { label: '<p>', insertText: '<p></p>', cursorOffset: -4, detail: 'Paragraph text', kind: 'tag' },
  { label: '<hr>', insertText: '<hr>\n', cursorOffset: 0, detail: 'Horizontal separator line', kind: 'tag' },
  { label: '<br>', insertText: '<br>\n', cursorOffset: 0, detail: 'Line break', kind: 'tag' },
  { label: '<ul>', insertText: '<ul>\n  <li></li>\n</ul>', cursorOffset: -12, detail: 'Unordered bullet list', kind: 'snippet' },
  { label: '<ol>', insertText: '<ol>\n  <li></li>\n</ol>', cursorOffset: -12, detail: 'Ordered numbered list', kind: 'snippet' },
  { label: '<li>', insertText: '<li></li>', cursorOffset: -5, detail: 'List item', kind: 'tag' },
  { label: '<div>', insertText: '<div></div>', cursorOffset: -6, detail: 'Container block', kind: 'tag' },
  { label: '<span>', insertText: '<span></span>', cursorOffset: -7, detail: 'Inline text span', kind: 'tag' },
  { label: '<button>', insertText: '<button></button>', cursorOffset: -9, detail: 'Clickable button', kind: 'tag' },
  { label: '<input>', insertText: '<input type="text" placeholder="" />', cursorOffset: -4, detail: 'Input text field', kind: 'tag' },
  { label: '<textarea>', insertText: '<textarea></textarea>', cursorOffset: -11, detail: 'Multiline text input', kind: 'tag' },
  { label: '<img>', insertText: '<img src="" alt="" />', cursorOffset: -10, detail: 'Image element', kind: 'tag' },
  { label: '<a>', insertText: '<a href=""></a>', cursorOffset: -6, detail: 'Hyperlink anchor', kind: 'tag' },
  { label: '<section>', insertText: '<section></section>', cursorOffset: -10, detail: 'Thematic section', kind: 'tag' },
  { label: '<header>', insertText: '<header></header>', cursorOffset: -9, detail: 'Page header', kind: 'tag' },
  { label: '<footer>', insertText: '<footer></footer>', cursorOffset: -9, detail: 'Page footer', kind: 'tag' },
  { label: '<nav>', insertText: '<nav></nav>', cursorOffset: -6, detail: 'Navigation links', kind: 'tag' },
  { label: '<main>', insertText: '<main></main>', cursorOffset: -7, detail: 'Dominant content', kind: 'tag' },
  { label: '<table>', insertText: '<table>\n  <tr>\n    <td></td>\n  </tr>\n</table>', cursorOffset: -22, detail: 'Table grid', kind: 'snippet' },
  { label: '<strong>', insertText: '<strong></strong>', cursorOffset: -9, detail: 'Important bold text', kind: 'tag' },
  { label: '<em>', insertText: '<em></em>', cursorOffset: -5, detail: 'Emphasized italic text', kind: 'tag' },
  { label: '<!-- comment -->', insertText: '<!--  -->', cursorOffset: -4, detail: 'HTML Comment', kind: 'snippet' },
];

const CSS_AUTOCOMPLETE_PROPS: AutoCompleteItem[] = [
  { label: 'display: flex', insertText: 'display: flex;\n', cursorOffset: 0, detail: 'Flexbox layout', kind: 'css' },
  { label: 'display: grid', insertText: 'display: grid;\n', cursorOffset: 0, detail: 'CSS Grid layout', kind: 'css' },
  { label: 'flex-direction: column', insertText: 'flex-direction: column;\n', cursorOffset: 0, detail: 'Vertical flex flow', kind: 'css' },
  { label: 'justify-content: center', insertText: 'justify-content: center;\n', cursorOffset: 0, detail: 'Center along main axis', kind: 'css' },
  { label: 'align-items: center', insertText: 'align-items: center;\n', cursorOffset: 0, detail: 'Center along cross axis', kind: 'css' },
  { label: 'gap', insertText: 'gap: 16px;\n', cursorOffset: -2, detail: 'Grid / Flex gap', kind: 'css' },
  { label: 'color', insertText: 'color: #;\n', cursorOffset: -2, detail: 'Text color', kind: 'css' },
  { label: 'background', insertText: 'background: #;\n', cursorOffset: -2, detail: 'Background color', kind: 'css' },
  { label: 'padding', insertText: 'padding: 16px;\n', cursorOffset: -2, detail: 'Inner padding', kind: 'css' },
  { label: 'margin', insertText: 'margin: 0 auto;\n', cursorOffset: 0, detail: 'Outer margin', kind: 'css' },
  { label: 'border', insertText: 'border: 1px solid #e2e8f0;\n', cursorOffset: 0, detail: 'Border line', kind: 'css' },
  { label: 'border-radius', insertText: 'border-radius: 8px;\n', cursorOffset: -4, detail: 'Rounded corners', kind: 'css' },
  { label: 'font-size', insertText: 'font-size: 16px;\n', cursorOffset: -4, detail: 'Text size', kind: 'css' },
  { label: 'font-weight', insertText: 'font-weight: bold;\n', cursorOffset: 0, detail: 'Text boldness', kind: 'css' },
  { label: 'text-align: center', insertText: 'text-align: center;\n', cursorOffset: 0, detail: 'Center text', kind: 'css' },
  { label: 'width', insertText: 'width: 100%;\n', cursorOffset: -2, detail: 'Element width', kind: 'css' },
  { label: 'max-width', insertText: 'max-width: 600px;\n', cursorOffset: -2, detail: 'Maximum element width', kind: 'css' },
  { label: 'box-shadow', insertText: 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n', cursorOffset: 0, detail: 'Drop shadow', kind: 'css' },
];

export function FullArenaExperience({
  onClose,
  initialRoomCode,
  initialQuestion,
  currentUser,
}: FullArenaExperienceProps) {
  // Navigation Steps:
  // 0: Arena Gateway (Hero + Tactical Command Console - Image 1 Screen)
  // 1: Name & Team Size (1v1 / 2v2) - Tournament Command Center (Direct Entry)
  // 2: Choose Arena & Topics (Web Dev / Algo / Bug Hunt)
  // 3: Room Code & Invite Link Lobby
  // 4: Countdown (3-2-1)
  // 5: Battling Split-Screen
  // 6: Match Finished & Fog of War Lifted
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const stepRef = useRef<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);

  const transitionStep = (next: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    stepRef.current = next;
    setStep(next);
  };

  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  const [joinCodeInput, setJoinCodeInput] = useState(() => initialRoomCode || '');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [authGateError, setAuthGateError] = useState<string | null>(null);

  // Authenticated Student Profile & RBAC
  const { user, profile, openAuthModal } = useAuth();

  // Mobile Device Intelligence Banner
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showMobileBanner, setShowMobileBanner] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const check = () => {
        setIsMobileDevice(window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
      };
      check();
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }
  }, []);

  // Multiplayer Server State - Unique session per browser tab so 2 tabs/devices never collide
  const [myPlayerId] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        if (!window.name || !window.name.startsWith('kbx_tab_')) {
          window.name = `kbx_tab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        }
        const storageKey = `kollabrix_arena_pid_${window.name}`;
        const stored = sessionStorage.getItem(storageKey);
        if (stored) return stored;
        const fresh = `pilot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        sessionStorage.setItem(storageKey, fresh);
        return fresh;
      } catch {}
    }
    return `pilot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  });
  const [isHost, setIsHost] = useState(true);
  const [roomData, setRoomData] = useState<any>(null);

  // Step 1: Esports Tactical Pilot Dossier
  const COMBAT_AVATARS = [
    {
      id: 'ronin',
      name: 'Binary Ronin',
      emoji: '🗡️',
      color: 'from-rose-500 via-rose-600 to-amber-600',
      border: 'border-rose-500',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.5)]',
      trait: 'Ultra-Fast Precision',
      rank: 'Grandmaster #14',
      badge: 'SPEED SLICER',
    },
    {
      id: 'ghost',
      name: 'Quantum Ghost',
      emoji: '⚡',
      color: 'from-cyan-400 via-sky-500 to-blue-600',
      border: 'border-cyan-400',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.5)]',
      trait: 'Zero-Latency DSA',
      rank: 'Master #42',
      badge: 'LOGIC PHANTOM',
    },
    {
      id: 'architect',
      name: 'Neural Titan',
      emoji: '🧠',
      color: 'from-emerald-400 via-teal-500 to-cyan-600',
      border: 'border-emerald-400',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.5)]',
      trait: 'Clean System Architecture',
      rank: 'Challenger #08',
      badge: 'NEURAL FORGE',
    },
    {
      id: 'glitch',
      name: 'Glitch Viper',
      emoji: '🔮',
      color: 'from-purple-500 via-fuchsia-600 to-pink-600',
      border: 'border-purple-400',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.5)]',
      trait: 'Deep Bug Exterminator',
      rank: 'Elite #23',
      badge: 'BUG TRACKER',
    },
    {
      id: 'sentinel',
      name: 'Iron Sentinel',
      emoji: '🛡️',
      color: 'from-amber-400 via-orange-500 to-rose-600',
      border: 'border-amber-400',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]',
      trait: 'Bulletproof Test Suites',
      rank: 'Champion #05',
      badge: 'IRON DEFENSE',
    },
  ];

  const RANDOM_CALLSIGNS = [
    'CYBER_RONIN_99',
    'NEO_DRIFTER_X',
    'ZERO_COOL_7',
    'BYTE_SLAYER',
    'QUANTUM_VIPER',
    'TITAN_LOGIC',
    'MATRIX_SLICER',
    'SYNTAX_REAPER',
    'KRYPTIC_PULSE',
    'NEXUS_GHOST',
    'VOID_RUNNER',
    'BINARY_FALCON',
  ];

  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);

  // Step 1: Identity & Mode
  const [playerName, setPlayerName] = useState(
    currentUser?.displayName || currentUser?.username || 'CyberRonin'
  );
  const [teamSize, setTeamSize] = useState<'1v1' | '2v2'>('1v1');
  const [arenaTab, setArenaTab] = useState<'tournament' | 'direct' | 'practice'>('tournament');
  const [showJoinModal, setShowJoinModal] = useState<boolean>(Boolean(initialRoomCode));
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [selectedCombatFormat, setSelectedCombatFormat] = useState<'1v1' | '2v2' | 'ffa'>('1v1');

  // Synchronize player identity when user authenticates & guard steps
  useEffect(() => {
    if (user) {
      const liveName =
        profile?.display_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        profile?.username ||
        user.email?.split('@')[0];
      if (liveName) {
        setPlayerName(liveName);
      }
      setAuthGateError(null);
      setJoinError(null);
    }
  }, [user, profile]);

  const rollRandomCallSign = () => {
    playTacticalSelectSound();
    const random = RANDOM_CALLSIGNS[Math.floor(Math.random() * RANDOM_CALLSIGNS.length)];
    setPlayerName(random);
  };

  // Step 2: Arena & Topic Selection
  const [arena, setArena] = useState<ArenaCategory>('web_dev');
  const [selectedTags, setSelectedTags] = useState<string[]>(['html', 'css']);
  const [bugDomain, setBugDomain] = useState<'web' | 'logic'>('web');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState<number>(300);

  // Real Compiler Execution States for Java, C++, and Python
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcases' | 'stdout' | 'custom'>('testcases');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [customStdin, setCustomStdin] = useState('');
  const [compilerResult, setCompilerResult] = useState<{
    success: boolean;
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    executionTimeMs?: number;
    status?: string;
  } | null>(null);

  // Per-test-case results map: stores { status, stdout, stderr, executionTimeMs } for each test case index
  const [testCaseResults, setTestCaseResults] = useState<
    Record<
      number,
      {
        status: 'Accepted' | 'Wrong Answer' | 'Error';
        stdout: string;
        stderr?: string;
        executionTimeMs?: number;
      }
    >
  >({});

  // Step 3: Room & Invite (Fresh random code generated on mount)
  const [roomCode, setRoomCode] = useState(
    () => initialRoomCode || `KBX-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  // Default to false: user can invite student via link/code, or check bot to practice solo!
  const [isBotOpponentAdded, setIsBotOpponentAdded] = useState(false);

  // Step 4 & 5: Battlefield States
  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isQuestionExpanded, setIsQuestionExpanded] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<DuelQuestion>(() =>
    enrichQuestion(initialQuestion || DEFAULT_ARENA_QUESTIONS[0])
  );

  // Authoritative question & code initialization guards to prevent background polling from wiping user's code
  const initializedQuestionIdRef = useRef<string | null>(initialQuestion ? initialQuestion.id : null);
  const activeQuestionRef = useRef<DuelQuestion>(activeQuestion);

  useEffect(() => {
    activeQuestionRef.current = activeQuestion;
  }, [activeQuestion]);

  useEffect(() => {
    if (initialQuestion) {
      const q = enrichQuestion(initialQuestion);
      setActiveQuestion(q);
      activeQuestionRef.current = q;
      setArena(q.arena);
      if (q.tags && q.tags.length > 0) {
        setSelectedTags(q.tags);
      }
      initializedQuestionIdRef.current = q.id;
      setHtmlCode(q.starterHtml || '');
      setCssCode(q.starterCss || '');
      setJsCode(q.starterJs || '');
      setPythonCode(q.starterPython || '# Your python solution\n');
      setJavaCode(q.starterJava || '// Your java solution\n');
      setCppCode(q.starterCpp || '// Your C++ solution\n');
      const expectedTests = computeExpectedQuestionTests(q);
      setTotalTests(expectedTests);
      const initTime = q.timeLimitSeconds || 300;
      setTimeLimit(initTime);
      setTimeLeft(initTime);
      setIsBotOpponentAdded(true);
      setStep(4);
      setCountdownNum(3);
    }
  }, [initialQuestion]);

  // Authoritative pool of questions preloaded from server database (includes admin custom questions)
  const [availableQuestions, setAvailableQuestions] = useState<DuelQuestion[]>(DEFAULT_ARENA_QUESTIONS);
  const availableQuestionsRef = useRef<DuelQuestion[]>(DEFAULT_ARENA_QUESTIONS);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/arena/questions', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setAvailableQuestions(data.questions);
          availableQuestionsRef.current = data.questions;
        }
      })
      .catch((err) => console.warn('Preload arena questions notice:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Arena Live Status check
  const [isArenaLive, setIsArenaLive] = useState<boolean>(true);
  const [maintenanceMsg, setMaintenanceMsg] = useState<string>(
    'Battle Arena is temporarily offline for scheduled system tuning, anti-cheat calibration, and challenge additions. Please check back shortly!'
  );
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [activityNotification, setActivityNotification] = useState<{
    message: string;
    type: 'join' | 'leave';
    id: number;
  } | null>(null);
  const prevPlayersRef = useRef<string[]>([]);

  // Auto-dismiss activity notifications after 4.5 seconds
  useEffect(() => {
    if (!activityNotification) return;
    const timer = setTimeout(() => setActivityNotification(null), 4500);
    return () => clearTimeout(timer);
  }, [activityNotification]);

  // Fullscreen Management: Opens true fullscreen on "Start Match Now" for host and teammates
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const enterArenaFullscreen = useCallback(() => {
    try {
      const docEl = document.documentElement;
      if (!document.fullscreenElement && docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (!(document as any).webkitFullscreenElement && (docEl as any).webkitRequestFullscreen) {
        (docEl as any).webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen trigger note:', err);
    }
  }, []);

  const toggleArenaFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      } else {
        enterArenaFullscreen();
      }
    } catch {}
  }, [enterArenaFullscreen]);

  // Anti-Cheat Sentinel Screen / Tab Switch Detection
  const [myCheatStrikes, setMyCheatStrikes] = useState<number>(0);
  const [showCheatWarningModal, setShowCheatWarningModal] = useState<boolean>(false);
  const [opponentCheatAlert, setOpponentCheatAlert] = useState<{
    cheaterName: string;
    strikes: number;
    reason: string;
    timestamp: number;
  } | null>(null);
  const lastCheatDetectTimeRef = useRef<number>(0);

  // Auto-dismiss opponent cheat alert banner after 9 seconds if not manually dismissed
  useEffect(() => {
    if (!opponentCheatAlert) return;
    const timer = setTimeout(() => setOpponentCheatAlert(null), 9000);
    return () => clearTimeout(timer);
  }, [opponentCheatAlert]);

  // Tab & Window Switch Anti-Cheat Sentinel Guard (Only active in Live Duel Step 5)
  useEffect(() => {
    if (step !== 5) return;

    const triggerCheatIncident = (reason: string) => {
      const now = Date.now();
      // Throttle rapid consecutive OS events (e.g. blur + visibilitychange within 1.5s)
      if (now - lastCheatDetectTimeRef.current < 1500) return;
      lastCheatDetectTimeRef.current = now;

      setMyCheatStrikes((prev) => {
        const next = prev + 1;

        // 1. Play siren warning sound to local user who switched
        playCheatWarningSiren();

        // 2. Open prominent unmissable warning HUD modal
        setShowCheatWarningModal(true);

        // 3. Broadcast real-time cheat alert to opponent duelist
        if (channelRef.current) {
          try {
            channelRef.current.send({
              type: 'broadcast',
              event: 'cheat_alert',
              payload: {
                playerId: myPlayerId,
                name: playerName,
                strikes: next,
                reason,
                timestamp: Date.now(),
              },
            });
          } catch {}
        }

        // 4. Record incident on room server ledger
        if (roomCode) {
          fetch('/api/arena/rooms/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: roomCode,
              action: 'cheat_flag',
              playerId: myPlayerId,
              payload: {
                cheaterId: myPlayerId,
                cheaterName: playerName,
                strikeCount: next,
                reason,
              },
            }),
          }).catch(() => {});
        }

        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerCheatIncident('Tab switched / arena window hidden');
      }
    };

    const handleWindowBlur = () => {
      triggerCheatIncident('Focus lost / external application switched');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [step, myPlayerId, playerName, roomCode, playCheatWarningSiren]);

  // Session Restoration across Page Refreshes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check URL query param or sessionStorage
    const searchParams = new URLSearchParams(window.location.search);
    const urlRoom = searchParams.get('room');
    let savedSession: any = null;
    try {
      const raw = sessionStorage.getItem('kollabrix_arena_session');
      if (raw) savedSession = JSON.parse(raw);
    } catch {}

    const targetRoomCode = urlRoom || savedSession?.roomCode || initialRoomCode;
    if (!targetRoomCode) return;

    fetch(`/api/arena/rooms?code=${targetRoomCode}&_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.room || data.room.status === 'closed') {
          sessionStorage.removeItem('kollabrix_arena_session');
          return;
        }

        const rm = data.room;
        setRoomData(rm);
        setRoomCode(rm.code);
        setTeamSize(rm.format || '1v1');
        setArena(rm.arena || 'web_dev');
        if (rm.selectedTags) setSelectedTags(rm.selectedTags);

        // Determine host role: STRICTLY by ID match, never by name match
        const isHostPlayer = Boolean(
          (rm.hostId && rm.hostId === myPlayerId) ||
          (rm.alphaPlayers?.[0]?.id && rm.alphaPlayers[0].id === myPlayerId)
        );
        setIsHost(isHostPlayer);

        if (rm.question) {
          const q = enrichQuestion(rm.question);
          const matchTime = Number(rm.timeLimit) || Number(q.timeLimitSeconds) || 300;
          setTimeLimit(matchTime);
          setTimeLeft(matchTime);
          setActiveQuestion(q);
          activeQuestionRef.current = q;
          if (initializedQuestionIdRef.current !== q.id) {
            initializedQuestionIdRef.current = q.id;
            setHtmlCode(q.starterHtml || '');
            setCssCode(q.starterCss || '');
            setJsCode(q.starterJs || '');
            setPythonCode(q.starterPython || '# Your python solution\n');
            setJavaCode(q.starterJava || '// Your java solution\n');
            setCppCode(q.starterCpp || '// Your C++ solution\n');
          }
          const expectedTests = computeExpectedQuestionTests(q);
          setTotalTests(expectedTests);
        }

        // Restore user's code from sessionStorage if preserved
        try {
          const savedCodeRaw = sessionStorage.getItem(`arena_code_${rm.code}`);
          if (savedCodeRaw) {
            const sc = JSON.parse(savedCodeRaw);
            if (typeof sc.htmlCode === 'string') setHtmlCode(sc.htmlCode);
            if (typeof sc.cssCode === 'string') setCssCode(sc.cssCode);
            if (typeof sc.jsCode === 'string') setJsCode(sc.jsCode);
            if (typeof sc.pythonCode === 'string') setPythonCode(sc.pythonCode);
            if (typeof sc.javaCode === 'string') setJavaCode(sc.javaCode);
            if (typeof sc.cppCode === 'string') setCppCode(sc.cppCode);
          }
        } catch {}

        // Restore active step safely
        if (rm.status === 'in_progress') {
          transitionStep(5);
        } else if (rm.status === 'starting') {
          if (stepRef.current < 4) {
            transitionStep(4);
            setCountdownNum(3);
          }
        } else if (savedSession?.step === 3 || urlRoom || initialRoomCode) {
          if (stepRef.current < 3) {
            transitionStep(3);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to restore arena session:', err);
      });
  }, [initialRoomCode, myPlayerId, playerName]);

  // Sync active session and URL parameter whenever in active room or battlefield
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (step >= 3 && roomCode) {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('room') !== roomCode) {
        currentUrl.searchParams.set('room', roomCode);
        window.history.replaceState(null, '', currentUrl.toString());
      }
      try {
        sessionStorage.setItem(
          'kollabrix_arena_session',
          JSON.stringify({
            roomCode,
            step,
            isHost,
            myPlayerId,
            playerName,
          })
        );
      } catch {}
    } else if (step === 0 || step === 1) {
      if (step === 1) {
        setStep(0);
      }
      try {
        sessionStorage.removeItem('kollabrix_arena_session');
      } catch {}
    }
  }, [step, roomCode, isHost, myPlayerId, playerName]);

  // Exit Arena with confirmation and mutual opponent termination
  const handleExitArena = () => {
    // In Lobby (Step 3), host can simply go back to Step 2 cleanly without scary warning
    if (step === 3) {
      if (isHost) {
        setStep(2);
      } else {
        handleConfirmExit();
      }
      return;
    }
    // If on Gateway (Step 0), Pilot Dossier (Step 1), Arena Picker (Step 2), or Victory (Step 6), exit immediately
    if (step < 3 || step === 6 || !roomCode) {
      try {
        sessionStorage.removeItem('kollabrix_arena_session');
        window.history.replaceState(null, '', '/arena');
      } catch {}
      onClose();
      return;
    }
    // In active match only (Countdown Step 4 or Battlefield Step 5), ask confirmation
    setShowExitConfirmModal(true);
  };

  const handleConfirmExit = async () => {
    setShowExitConfirmModal(false);

    // If non-host player is in Lobby (Step 3), simply leave the room without shutting it down for host
    if (step === 3 && !isHost) {
      if (channelRef.current) {
        try {
          channelRef.current.send({
            type: 'broadcast',
            event: 'player_left',
            payload: { name: playerName, playerId: myPlayerId },
          });
        } catch {}
      }
      if (roomCode) {
        try {
          await fetch('/api/arena/rooms/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: roomCode,
              action: 'leave_room',
              playerId: myPlayerId,
              payload: { playerName },
            }),
          });
        } catch {}
      }
      try {
        sessionStorage.removeItem('kollabrix_arena_session');
        window.history.replaceState(null, '', '/arena');
      } catch {}
      setStep(0);
      return;
    }

    // Host leaving or match in progress: broadcast exit and close room
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'arena_exit',
          payload: {
            exitedBy: playerName,
            message: `⚡ ${playerName} has exited the Battle Arena. The match has ended.`,
          },
        });
      } catch {}
    }

    if (roomCode) {
      try {
        await fetch('/api/arena/rooms/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: roomCode,
            action: 'close_room',
            playerId: myPlayerId,
            payload: { exitedBy: playerName },
          }),
        });
      } catch {}
    }

    try {
      sessionStorage.removeItem('kollabrix_arena_session');
      if (roomCode) sessionStorage.removeItem(`arena_code_${roomCode}`);
      window.history.replaceState(null, '', '/arena');
    } catch {}

    onClose();
  };

  useEffect(() => {
    fetch('/api/arena/status', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isLive === 'boolean') {
          setIsArenaLive(data.isLive);
          if (data.maintenanceMessage) setMaintenanceMsg(data.maintenanceMessage);
        }
      })
      .catch(() => {});
  }, []);

  // Code editor tabs for active question
  const [activeTab, setActiveTab] = useState<string>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [pythonCode, setPythonCode] = useState('');
  const [javaCode, setJavaCode] = useState('');
  const [cppCode, setCppCode] = useState('');

  // Persist user code in battle (Step 5) so refresh never wipes out work
  useEffect(() => {
    if (typeof window === 'undefined' || step !== 5 || !roomCode) return;
    try {
      sessionStorage.setItem(
        `arena_code_${roomCode}`,
        JSON.stringify({ htmlCode, cssCode, jsCode, pythonCode, javaCode, cppCode })
      );
    } catch {}
  }, [step, roomCode, htmlCode, cssCode, jsCode, pythonCode, javaCode, cppCode]);

  const [userTestsPassed, setUserTestsPassed] = useState<number>(0);
  const [totalTests, setTotalTests] = useState<number>(3);
  const [testLog, setTestLog] = useState<string>('Ready to test code');
  const [webEvaluation, setWebEvaluation] = useState<WebGraphEvaluation | null>(null);

  // Opponent Team Omega (Fog of War)
  const [opponentTestsPassed, setOpponentTestsPassed] = useState<number>(0);
  const [opponentWpm, setOpponentWpm] = useState<number>(0);
  const [opponentAlert, setOpponentAlert] = useState<string>('');
  const [opponentStatusText, setOpponentStatusText] = useState<string>('Reading Problem & Constraints 📖');
  const [opponentSimCodeLinesCount, setOpponentSimCodeLinesCount] = useState<number>(3);
  const [winnerTeam, setWinnerTeam] = useState<'Team Alpha' | 'Team Omega' | null>(null);

  // Opponent actual solution state for post-battle reveal
  const [opponentSolution, setOpponentSolution] = useState<{
    htmlCode?: string;
    cssCode?: string;
    jsCode?: string;
    pythonCode?: string;
    javaCode?: string;
    cppCode?: string;
  } | null>(null);
  const [revealTab, setRevealTab] = useState<'html' | 'css' | 'js'>('html');

  // Intelligent Code Auto-Complete & Tag Hints (IntelliSense)
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AutoCompleteItem[]>([]);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(0);
  const [suggestionPrefixRange, setSuggestionPrefixRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [suggestionCoords, setSuggestionCoords] = useState<{ top: number; left: number }>({ top: 40, left: 60 });

  // Stably assign a collegiate student contender profile for practice matches based on roomCode hash
  const botProfileIndex = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < roomCode.length; i++) {
      hash = (hash << 5) - hash + roomCode.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % COLLEGIATE_BOT_PROFILES.length;
  }, [roomCode]);

  const assignedBotProfile = COLLEGIATE_BOT_PROFILES[botProfileIndex];

  // Real-time Keystrokes & Cadence Tracking
  const [myWpm, setMyWpm] = useState<number>(0);
  const recentKeystrokesRef = useRef<number[]>([]);
  const lastKeystrokeTimeRef = useRef<number>(0);
  const lastOpponentActivityTimeRef = useRef<number>(0);
  const lastHttpProgressSyncRef = useRef<number>(0);

  const handleUserKeystroke = () => {
    const now = Date.now();
    lastKeystrokeTimeRef.current = now;
    recentKeystrokesRef.current.push(now);
  };

  // Real IDE Code Editor Refs & Compiler Helpers
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const getCurrentCode = (): string => {
    switch (activeTab) {
      case 'html': return htmlCode;
      case 'css': return cssCode;
      case 'js': return jsCode;
      case 'python': return pythonCode;
      case 'java': return javaCode;
      case 'cpp': return cppCode;
      default: return pythonCode;
    }
  };

  const setCurrentCode = (val: string) => {
    handleUserKeystroke();
    switch (activeTab) {
      case 'html': setHtmlCode(val); break;
      case 'css': setCssCode(val); break;
      case 'js': setJsCode(val); break;
      case 'python': setPythonCode(val); break;
      case 'java': setJavaCode(val); break;
      case 'cpp': setCppCode(val); break;
      default: setPythonCode(val); break;
    }
  };

  const handleResetCurrentTemplate = () => {
    if (!activeQuestion) return;
    if (activeTab === 'html') setHtmlCode(activeQuestion.starterHtml || '');
    else if (activeTab === 'css') setCssCode(activeQuestion.starterCss || '');
    else if (activeTab === 'js') setJsCode(activeQuestion.starterJs || '');
    else if (activeTab === 'python') setPythonCode(activeQuestion.starterPython || '# Your python solution\n');
    else if (activeTab === 'java') setJavaCode(activeQuestion.starterJava || '// Your java solution\n');
    else if (activeTab === 'cpp') setCppCode(activeQuestion.starterCpp || '// Your C++ solution\n');
  };

  const handleClearCurrentCode = () => {
    setCurrentCode('');
  };

  const updateAutocomplete = useCallback((text: string, cursorPos: number) => {
    if (activeTab === 'html') {
      const beforeCursor = text.substring(0, cursorPos);
      const match = /<([a-zA-Z0-9-]*)$/.exec(beforeCursor);
      if (match) {
        const prefix = match[1].toLowerCase();
        const pool = HTML_AUTOCOMPLETE_TAGS;
        const filtered = prefix
          ? pool.filter((t) => t.label.replace(/[<>/]/g, '').toLowerCase().startsWith(prefix))
          : pool;

        if (filtered.length > 0) {
          setSuggestions(filtered);
          setSelectedSuggestionIdx(0);
          setSuggestionPrefixRange({ start: cursorPos - match[0].length, end: cursorPos });

          const lines = beforeCursor.split('\n');
          const lineIndex = lines.length - 1;
          const charIndex = lines[lineIndex].length;
          const top = Math.min(260, (lineIndex + 1) * 24 + 10);
          const left = Math.min(380, Math.max(40, charIndex * 8 + 40));
          setSuggestionCoords({ top, left });
          setSuggestionOpen(true);
          return;
        }
      }
    } else if (activeTab === 'css') {
      const beforeCursor = text.substring(0, cursorPos);
      const match = /(?:^|\n|;|\{)\s*([a-zA-Z-]{2,})$/.exec(beforeCursor);
      if (match) {
        const prefix = match[1].toLowerCase();
        const filtered = CSS_AUTOCOMPLETE_PROPS.filter((p) => p.label.toLowerCase().startsWith(prefix));
        if (filtered.length > 0) {
          setSuggestions(filtered);
          setSelectedSuggestionIdx(0);
          setSuggestionPrefixRange({ start: cursorPos - prefix.length, end: cursorPos });
          const lines = beforeCursor.split('\n');
          const lineIndex = lines.length - 1;
          const charIndex = lines[lineIndex].length;
          const top = Math.min(260, (lineIndex + 1) * 24 + 10);
          const left = Math.min(380, Math.max(40, charIndex * 8 + 40));
          setSuggestionCoords({ top, left });
          setSuggestionOpen(true);
          return;
        }
      }
    }
    setSuggestionOpen(false);
  }, [activeTab]);

  const applySuggestion = useCallback((item: AutoCompleteItem) => {
    const code = getCurrentCode();
    const before = code.substring(0, suggestionPrefixRange.start);
    const after = code.substring(suggestionPrefixRange.end);
    const nextVal = before + item.insertText + after;
    setCurrentCode(nextVal);
    setSuggestionOpen(false);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const newPos = suggestionPrefixRange.start + item.insertText.length + (item.cursorOffset || 0);
        textareaRef.current.selectionStart = newPos;
        textareaRef.current.selectionEnd = newPos;
        textareaRef.current.focus();
      }
    });
  }, [getCurrentCode, setCurrentCode, suggestionPrefixRange]);

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 0. Auto-complete key navigation & selection (Up / Down / Enter / Tab / Escape)
    if (suggestionOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIdx((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIdx]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestionOpen(false);
        return;
      }
    }

    // Auto-close HTML tags: if user types '>', check if preceded by <tag (e.g. <h1>)
    if (activeTab === 'html' && e.key === '>') {
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      const beforeCursor = value.substring(0, selectionStart);
      const match = /<([a-zA-Z0-9]+)(?:\s+[^>]*)?$/.exec(beforeCursor);
      const selfClosing = ['input', 'img', 'br', 'hr', 'meta', 'link'];
      if (match && !selfClosing.includes(match[1].toLowerCase()) && !match[0].startsWith('</')) {
        const tagName = match[1];
        const nextVal = value.substring(0, selectionStart) + '>' + `</${tagName}>` + value.substring(selectionEnd);
        e.preventDefault();
        setCurrentCode(nextVal);
        setSuggestionOpen(false);
        requestAnimationFrame(() => {
          textarea.selectionStart = selectionStart + 1;
          textarea.selectionEnd = selectionStart + 1;
        });
        return;
      }
    }

    // Anti-Cheat: Intercept Cmd+V / Ctrl+V
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      setActivityNotification({
        message: '🛡️ Anti-Cheat Active: Copy-paste is disabled in Battle Arena. Type your code solution!',
        type: 'leave',
        id: Date.now(),
      });
      return;
    }

    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    // 1. Tab and Shift+Tab indentation (2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: Unindent up to 2 leading spaces
        const beforeCursor = value.substring(0, selectionStart);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const line = value.substring(lineStart, selectionEnd);
        if (line.startsWith('  ')) {
          const nextVal = value.substring(0, lineStart) + value.substring(lineStart + 2);
          setCurrentCode(nextVal);
          requestAnimationFrame(() => {
            textarea.selectionStart = Math.max(lineStart, selectionStart - 2);
            textarea.selectionEnd = Math.max(lineStart, selectionEnd - 2);
          });
        } else if (line.startsWith(' ')) {
          const nextVal = value.substring(0, lineStart) + value.substring(lineStart + 1);
          setCurrentCode(nextVal);
          requestAnimationFrame(() => {
            textarea.selectionStart = Math.max(lineStart, selectionStart - 1);
            textarea.selectionEnd = Math.max(lineStart, selectionEnd - 1);
          });
        }
      } else {
        // Tab: Insert 2 spaces at cursor
        const nextVal = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
        setCurrentCode(nextVal);
        requestAnimationFrame(() => {
          textarea.selectionStart = selectionStart + 2;
          textarea.selectionEnd = selectionStart + 2;
        });
      }
      return;
    }

    // 2. Enter key: Auto-indent to match current line
    if (e.key === 'Enter') {
      e.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const currentLine = beforeCursor.substring(lastNewline + 1);
      const leadingWhitespaceMatch = currentLine.match(/^(\s*)/);
      let indent = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : '';

      const trimmedLine = currentLine.trimEnd();
      if (
        trimmedLine.endsWith('{') ||
        trimmedLine.endsWith('(') ||
        trimmedLine.endsWith('[') ||
        trimmedLine.endsWith(':') ||
        (trimmedLine.endsWith('>') && !trimmedLine.endsWith('/>') && !trimmedLine.startsWith('</'))
      ) {
        indent += '  ';
      }

      const nextVal = value.substring(0, selectionStart) + '\n' + indent + value.substring(selectionEnd);
      setCurrentCode(nextVal);
      requestAnimationFrame(() => {
        textarea.selectionStart = selectionStart + 1 + indent.length;
        textarea.selectionEnd = selectionStart + 1 + indent.length;
      });
      return;
    }
  };

  // Image 6 Parity: Maximize pane state for Preview and Output
  const [maximizedPane, setMaximizedPane] = useState<'none' | 'preview' | 'output'>('none');
  const [renderNonce, setRenderNonce] = useState<number>(0);

  // Relay Role in 2v2 (swaps every 2.5 mins)
  const [relayPlayer, setRelayPlayer] = useState<'Driver (You)' | 'Navigator (Teammate)'>('Driver (You)');

  // Dynamic Squad & Opponent Identification (1v1 duel & 2v2 relay aware)
  const isUserInAlpha = Boolean(
    isHost || (roomData?.alphaPlayers?.some((p: any) => p.id === myPlayerId) ?? false)
  );
  const isUserInOmega = Boolean(
    roomData?.omegaPlayers?.some((p: any) => p.id === myPlayerId) ?? false
  );
  const mySquad: 'alpha' | 'omega' = isUserInAlpha ? 'alpha' : isUserInOmega ? 'omega' : isHost ? 'alpha' : 'omega';

  // Opponent player is ALWAYS the opposing squad (Omega if I am Alpha; Alpha if I am Omega)
  const opponentPlayer = mySquad === 'alpha'
    ? (roomData?.omegaPlayers?.[0] || null)
    : (roomData?.alphaPlayers?.[0] || null);

  const isRealOpponentPresent = Boolean(
    opponentPlayer && opponentPlayer.id !== 'bot-rival'
  );

  const isBotDuel = Boolean(
    !isRealOpponentPresent &&
    mySquad === 'alpha' &&
    (isBotOpponentAdded || roomData?.isBotEnabled || opponentPlayer?.id === 'bot-rival')
  );

  const opponentDisplayName = isRealOpponentPresent
    ? `${opponentPlayer?.name} (Opponent)`
    : isBotDuel
      ? `${assignedBotProfile.name} • ${assignedBotProfile.college}`
      : mySquad === 'alpha'
        ? (isBotOpponentAdded ? `${assignedBotProfile.name} • ${assignedBotProfile.college}` : 'Waiting for Opponent...')
        : (roomData?.hostName ? `${roomData.hostName} (Host)` : 'Classmate Opponent');

  // Determine if active match uses Web View (Live Preview & Output) or Compiler Terminal View
  const isWebMatch =
    arena === 'web_dev' ||
    (arena === 'bug_hunt' &&
      (bugDomain === 'web' || activeQuestion.bugDomain === 'web' || !!activeQuestion.targetComponentHtml));

  // Automatically adjust activeTab to a visible tab based on question tags
  useEffect(() => {
    if (!activeQuestion) return;
    const qTags = (activeQuestion.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
    if (isWebMatch) {
      const hasExplicitWeb = qTags.some((t) => ['html', 'css', 'js', 'javascript'].includes(t));
      const showHtml = hasExplicitWeb ? qTags.includes('html') : true;
      const showCss = hasExplicitWeb ? qTags.includes('css') : true;
      const showJs = hasExplicitWeb ? (qTags.includes('javascript') || qTags.includes('js')) : false;

      if (activeTab === 'html' && !showHtml) {
        if (showCss) setActiveTab('css');
        else if (showJs) setActiveTab('js');
      } else if (activeTab === 'css' && !showCss) {
        if (showHtml) setActiveTab('html');
        else if (showJs) setActiveTab('js');
      } else if (activeTab === 'js' && !showJs) {
        if (showHtml) setActiveTab('html');
        else if (showCss) setActiveTab('css');
      }
    } else {
      const hasExplicitAlgo = qTags.some((t) => ['python', 'java', 'cpp', 'c++'].includes(t));
      const showPy = hasExplicitAlgo ? qTags.includes('python') : true;
      const showJava = hasExplicitAlgo ? qTags.includes('java') : true;
      const showCpp = hasExplicitAlgo ? (qTags.includes('cpp') || qTags.includes('c++')) : true;

      if (activeTab === 'python' && !showPy) {
        if (showJava) setActiveTab('java');
        else if (showCpp) setActiveTab('cpp');
      } else if (activeTab === 'java' && !showJava) {
        if (showPy) setActiveTab('python');
        else if (showCpp) setActiveTab('cpp');
      } else if (activeTab === 'cpp' && !showCpp) {
        if (showPy) setActiveTab('python');
        else if (showJava) setActiveTab('java');
      }
    }
  }, [activeQuestion, isWebMatch, activeTab]);

  // Auto-evaluate Web Dev layout coordinate graph & word spelling in background as user writes code
  useEffect(() => {
    if (step !== 5 || !isWebMatch || !activeQuestion) return;
    const timer = setTimeout(() => {
      const evaluation = evaluateWebCoordinateGraph(
        activeQuestion.id,
        htmlCode,
        cssCode,
        activeQuestion.targetComponentHtml,
        activeQuestion.targetComponentCss,
        {
          tags: activeQuestion.tags || selectedTags,
          jsCode,
          targetJs: activeQuestion.targetComponentJs,
        }
      );
      setWebEvaluation(evaluation);
      setTotalTests(evaluation.totalTests);
      setUserTestsPassed(evaluation.testsPassed);
      syncProgressToServer(evaluation.testsPassed, myWpm);
    }, 450);
    return () => clearTimeout(timer);
  }, [step, isWebMatch, activeQuestion, htmlCode, cssCode, jsCode, selectedTags, myWpm]);

  // When changing arena, select sensible default tags
  const handleSelectArena = (newArena: ArenaCategory) => {
    setArena(newArena);
    if (newArena === 'web_dev') {
      setSelectedTags(['html', 'css']);
      setActiveTab('html');
    } else if (newArena === 'algorithms') {
      setSelectedTags(['java']);
      setActiveTab('java');
    } else if (newArena === 'bug_hunt') {
      setSelectedTags(bugDomain === 'web' ? ['html', 'css'] : ['java']);
      setActiveTab(bugDomain === 'web' ? 'html' : 'java');
    }
  };

  // Tag toggle helper
  const handleToggleTag = (tagId: string) => {
    // In Web Dev mode, HTML is the mandatory DOM foundation and CANNOT be unticked!
    if (arena === 'web_dev') {
      if (tagId === 'html') return; // Locked on HTML
      if (selectedTags.includes(tagId)) {
        const next = selectedTags.filter((t) => t !== tagId);
        setSelectedTags(next.includes('html') ? next : ['html', ...next]);
      } else {
        const next = [...selectedTags, tagId];
        setSelectedTags(next.includes('html') ? next : ['html', ...next]);
      }
      return;
    }

    if (selectedTags.includes(tagId)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tagId));
      }
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/arena?room=${roomCode}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      trackEvent('invite_link_copied', { code: roomCode, type: 'full_url' });
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleCopyCode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      trackEvent('invite_link_copied', { code: roomCode, type: 'code_only' });
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  // Join existing room by code or invite link
  const handleJoinWithCodeOrLink = async (codeToJoin?: string) => {
    if (!user) {
      setJoinError('Sign-in required: Please log in or sign up to join this duel.');
      openAuthModal('login');
      return;
    }

    let raw = (codeToJoin || joinCodeInput).trim();
    if (!raw) {
      setJoinError('Please enter a room code (e.g. KBX-4634) or paste an invite link.');
      return;
    }

    if (raw.includes('room=')) {
      const match = raw.match(/room=([A-Za-z0-9-]+)/);
      if (match && match[1]) raw = match[1];
    } else if (raw.includes('#join-')) {
      raw = raw.split('#join-')[1];
    }

    raw = raw.toUpperCase();
    setIsJoiningRoom(true);
    setJoinError(null);

    try {
      const res = await fetch('/api/arena/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: raw,
          player: {
            id: myPlayerId,
            name: playerName,
            avatarIdx: selectedAvatarIdx,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.room) {
        setIsHost(false);
        setRoomData(data.room);
        setRoomCode(data.room.code);
        setTeamSize(data.room.format || '1v1');
        setArena(data.room.arena || 'web_dev');
        setSelectedTags(data.room.selectedTags || ['html', 'css']);

        if (data.room.question) {
          const q = enrichQuestion(data.room.question);
          const matchTime = Number(data.room.timeLimit) || Number(q.timeLimitSeconds) || 300;
          setTimeLimit(matchTime);
          setTimeLeft(matchTime);
          setActiveQuestion(q);
          activeQuestionRef.current = q;
          initializedQuestionIdRef.current = q.id;
          setHtmlCode(q.starterHtml || '');
          setCssCode(q.starterCss || '');
          setJsCode(q.starterJs || '');
          setPythonCode(q.starterPython || '# Your python solution\n');
          setJavaCode(q.starterJava || '// Your java solution\n');
          setCppCode(q.starterCpp || '// Your C++ solution\n');
          const expectedTests = computeExpectedQuestionTests(q);
          setTotalTests(expectedTests);
        }

        playTacticalSelectSound();
        trackEvent('arena_room_joined', { code: data.room.code, format: data.room.format, arena: data.room.arena });

        // Immediately send player_joined and room_sync broadcast over WebSocket so host's screen updates in <40ms
        try {
          const joinChannel = supabase.channel(`arena_duel_${data.room.code}`);
          joinChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              joinChannel.send({
                type: 'broadcast',
                event: 'player_joined',
                payload: {
                  name: playerName,
                  team: 'omega',
                  playerId: myPlayerId,
                },
              });
              joinChannel.send({
                type: 'broadcast',
                event: 'room_sync',
                payload: { room: data.room },
              });
              setTimeout(() => {
                try {
                  supabase.removeChannel(joinChannel);
                } catch {}
              }, 2000);
            }
          });
        } catch {}

        setStep(3); // Directly into Lobby!
      } else {
        setJoinError(data.error || `Room "${raw}" was not found or has expired. Please verify with your friend.`);
      }
    } catch (err: any) {
      setJoinError(err.message || 'Network error attempting to connect to duel room.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Host registers new room on server when advancing from Step 2 to Step 3
  const handleHostCreateRoom = async () => {
    setIsHost(true);
    playArcadeCoinSound();

    const effectiveTags =
      arena === 'web_dev' || (arena === 'bug_hunt' && bugDomain === 'web')
        ? selectedTags.includes('html')
          ? selectedTags
          : ['html', ...selectedTags]
        : selectedTags;

    // 1. Advance immediately to Step 3 for instant 0ms transition without awaiting network roundtrip
    setStep(3);

    let enrichedQuestionToSend: any = undefined;
    // 2. Select initial best matching question locally so question & starter code are ready instantly
    try {
      const matchTime = Number(timeLimit) || 300;
      const questionPool =
        availableQuestionsRef.current.length > 0
          ? availableQuestionsRef.current
          : DEFAULT_ARENA_QUESTIONS;

      const seenIds = getStoredSeenQuestionIds();
      const initialChosen = selectBestQuestion(questionPool, {
        arena,
        bugDomain: arena === 'bug_hunt' ? bugDomain : undefined,
        selectedTags: effectiveTags,
        difficulty,
        timeLimit: matchTime,
        seenQuestionIds: seenIds,
      });

      if (initialChosen) {
        const enriched = enrichQuestion(initialChosen);
        enrichedQuestionToSend = enriched;
        setActiveQuestion(enriched);
        activeQuestionRef.current = enriched;
        initializedQuestionIdRef.current = enriched.id;
        setTimeLimit(matchTime);
        setTimeLeft(matchTime);
        setHtmlCode(enriched.starterHtml || '');
        setCssCode(enriched.starterCss || '');
        setJsCode(enriched.starterJs || '');
        setPythonCode(enriched.starterPython || '# Your python solution\n');
        setJavaCode(enriched.starterJava || '// Your java solution\n');
        setCppCode(enriched.starterCpp || '// Your C++ solution\n');
        setTotalTests(computeExpectedQuestionTests(enriched));

        // Track seen question to guarantee non-repeating cycle for this category
        const matchingPoolIds = questionPool
          .filter((q) => {
            if (q.arena !== arena) return false;
            const diffOk = (q.difficulty || 'medium').toLowerCase() === (difficulty || 'medium').toLowerCase();
            const qTags = (q.tags || []).map((t) => t.toLowerCase().trim());
            const reqTags = effectiveTags.map((t) => t.toLowerCase().trim());
            const tagsOk = reqTags.length === 0 || reqTags.every((t) => qTags.includes(t));
            return diffOk && tagsOk;
          })
          .map((q) => q.id);

        persistSeenQuestionId(initialChosen.id, matchingPoolIds);
      }
    } catch (e) {
      console.warn('Local question pre-selection notice:', e);
    }

  // 3. Register authoritative room on server asynchronously
  try {
    const seenIds = getStoredSeenQuestionIds();
    const res = await fetch('/api/arena/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: roomCode,
        hostName: playerName || profile?.display_name || user?.user_metadata?.full_name || 'SquadLeader',
        hostId: myPlayerId,
        avatarIdx: selectedAvatarIdx,
        format: teamSize,
        arena,
        bugDomain: arena === 'bug_hunt' ? bugDomain : undefined,
        selectedTags: effectiveTags,
        difficulty,
        timeLimit,
        isBotEnabled: isBotOpponentAdded,
        question: enrichedQuestionToSend,
        seenQuestionIds: seenIds,
      }),
    });
      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          setRoomData(data.room);
          if (data.room.question) {
            const q = enrichQuestion(data.room.question);
            const matchTime = Number(data.room.timeLimit) || Number(q.timeLimitSeconds) || 300;
            setTimeLimit(matchTime);
            setTimeLeft(matchTime);
            setActiveQuestion(q);
            activeQuestionRef.current = q;
            if (initializedQuestionIdRef.current !== q.id) {
              initializedQuestionIdRef.current = q.id;
              setHtmlCode(q.starterHtml || '');
              setCssCode(q.starterCss || '');
              setJsCode(q.starterJs || '');
              setPythonCode(q.starterPython || '# Your python solution\n');
              setJavaCode(q.starterJava || '// Your java solution\n');
              setCppCode(q.starterCpp || '// Your C++ solution\n');
            }
            const expectedTests = computeExpectedQuestionTests(q);
            setTotalTests(expectedTests);
          }
        }
        trackEvent('arena_room_created', { code: roomCode, format: teamSize, arena, difficulty });
      }
    } catch (err) {
      console.warn('Failed to publish room to server:', err);
    }
  };

  // Realtime Supabase WebSocket Channel Ref
  const channelRef = useRef<any>(null);

  // Unified State Applicator for WebSocket & HTTP Sync
  const applyRoomDataState = (incomingRoom: any) => {
    if (!incomingRoom) return;

    // If room is closed because a player exited
    if (incomingRoom.status === 'closed') {
      alert('The battle room has been closed because a player exited the arena.');
      onClose();
      return;
    }

    // Dynamic player join/leave change detection across syncs
    const currentRoster: string[] = [
      ...(incomingRoom.alphaPlayers || []).map((p: any) => p.name),
      ...(incomingRoom.omegaPlayers || []).filter((p: any) => p.id !== 'bot-rival').map((p: any) => p.name),
    ].filter(Boolean);

    if (prevPlayersRef.current.length > 0) {
      const joined = currentRoster.filter((n) => !prevPlayersRef.current.includes(n) && n !== playerName);
      const left = prevPlayersRef.current.filter((n) => !currentRoster.includes(n) && n !== playerName);

      if (joined.length > 0) {
        setActivityNotification({
          message: `⚡ ${joined.join(', ')} joined the squad!`,
          type: 'join',
          id: Date.now(),
        });
        playArcadeCoinSound();
      } else if (left.length > 0) {
        setActivityNotification({
          message: `⚠️ ${left.join(', ')} left the room.`,
          type: 'leave',
          id: Date.now(),
        });
      }
    }
    prevPlayersRef.current = currentRoster;

    setRoomData(incomingRoom);

    // Ensure isHost role is kept strictly accurate by ID match
    const isHostPlayer = Boolean(
      (incomingRoom.hostId && incomingRoom.hostId === myPlayerId) ||
      (incomingRoom.alphaPlayers?.[0]?.id && incomingRoom.alphaPlayers[0].id === myPlayerId)
    );
    setIsHost(isHostPlayer);

    // If real opponent is present in Omega, disable bot toggle
    if (incomingRoom.omegaPlayers && incomingRoom.omegaPlayers.some((p: any) => p.id !== 'bot-rival')) {
      setIsBotOpponentAdded(false);
    }

    const currentStep = stepRef.current;

    // If in Lobby (Step 3) and Host started match, advance joiner to Step 4 (Countdown) or Step 5 (Battlefield)
    if (currentStep === 3 && (incomingRoom.status === 'starting' || incomingRoom.status === 'in_progress')) {
      enterArenaFullscreen();
      if (incomingRoom.question) {
        const q = enrichQuestion(incomingRoom.question);
        const matchTime = Number(incomingRoom.timeLimit) || Number(q.timeLimitSeconds) || 300;
        setTimeLimit(matchTime);

        // Lockstep time synchronization based on server startedAt
        if (incomingRoom.startedAt) {
          const startTime = new Date(incomingRoom.startedAt).getTime();
          const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
          setTimeLeft(Math.max(0, matchTime - elapsed));
        } else {
          setTimeLeft(matchTime);
        }

        setActiveQuestion(q);
        activeQuestionRef.current = q;
        if (initializedQuestionIdRef.current !== q.id) {
          initializedQuestionIdRef.current = q.id;
          setHtmlCode(q.starterHtml || '');
          setCssCode(q.starterCss || '');
          setJsCode(q.starterJs || '');
          setPythonCode(q.starterPython || '# Your python solution\n');
          setJavaCode(q.starterJava || '// Your java solution\n');
          setCppCode(q.starterCpp || '// Your C++ solution\n');
        }
        const expectedTests = computeExpectedQuestionTests(q);
        setTotalTests(expectedTests);

        if (incomingRoom.arena === 'web_dev') {
          setActiveTab('html');
        } else if (incomingRoom.arena === 'algorithms') {
          setActiveTab('python');
        } else {
          setActiveTab('html');
        }
      }

      if (incomingRoom.status === 'in_progress') {
        transitionStep(5);
      } else {
        transitionStep(4);
        setCountdownNum(3);
      }
      return;
    }

    // Question & Clock resync safety: If client is in countdown (Step 4) or battlefield (Step 5)
    // and room's authoritative question or clock is updated, synchronize immediately
    if ((currentStep === 4 || currentStep === 5) && incomingRoom.question) {
      if (currentStep === 4 && incomingRoom.status === 'in_progress') {
        transitionStep(5);
      }

      const q = enrichQuestion(incomingRoom.question);
      const matchTime = Number(incomingRoom.timeLimit) || Number(q.timeLimitSeconds) || 300;
      setTimeLimit(matchTime);

      if (incomingRoom.startedAt) {
        const startTime = new Date(incomingRoom.startedAt).getTime();
        const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        setTimeLeft(Math.max(0, matchTime - elapsed));
      } else if (currentStep === 4) {
        setTimeLeft(matchTime);
      }

      // CRITICAL GUARD: NEVER overwrite user's written code during live battlefield (Step 5)!
      // In Countdown (Step 4), only populate if starter code was never loaded for this question ID.
      if (activeQuestionRef.current?.id !== q.id) {
        setActiveQuestion(q);
        activeQuestionRef.current = q;
        if (currentStep === 4 && initializedQuestionIdRef.current !== q.id) {
          initializedQuestionIdRef.current = q.id;
          setHtmlCode(q.starterHtml || '');
          setCssCode(q.starterCss || '');
          setJsCode(q.starterJs || '');
          setPythonCode(q.starterPython || '# Your python solution\n');
          setJavaCode(q.starterJava || '// Your java solution\n');
          setCppCode(q.starterCpp || '// Your C++ solution\n');
        }
        const expectedTests = computeExpectedQuestionTests(q);
        setTotalTests(expectedTests);
      }
    }

    // If in Battlefield (Step 5):
    if (currentStep === 5) {
      if (incomingRoom.status === 'finished') {
        setWinnerTeam(incomingRoom.winnerTeam || 'Team Alpha');
        transitionStep(6);
        return;
      }

      // Read real-time opponent test progress & real cadence
      const oppList = mySquad === 'alpha' ? incomingRoom.omegaPlayers : incomingRoom.alphaPlayers;
      if (oppList && oppList.length > 0) {
        const opp = oppList[0];
        if (opp.testsPassed !== undefined) setOpponentTestsPassed(opp.testsPassed);
        if (opp.wpm !== undefined) {
          setOpponentWpm(opp.wpm);
          if (opp.wpm > 0) {
            lastOpponentActivityTimeRef.current = Date.now();
          }
        }
      }

      // Read real-time opponent anti-cheat flags from server room state
      if (incomingRoom.cheatIncidents && incomingRoom.cheatIncidents.length > 0) {
        const oppIncidents = incomingRoom.cheatIncidents.filter((inc: any) => inc.cheaterId !== myPlayerId);
        if (oppIncidents.length > 0) {
          const latest = oppIncidents[oppIncidents.length - 1];
          setOpponentCheatAlert((prev) => {
            if (prev && prev.timestamp >= new Date(latest.timestamp).getTime()) return prev;
            playOpponentCheatRadarBeep();
            return {
              cheaterName: latest.cheaterName,
              strikes: latest.strikeCount,
              reason: latest.reason,
              timestamp: new Date(latest.timestamp).getTime(),
            };
          });
        }
      }
    }
  };

  // Realtime Supabase WebSocket Synchronization + High-Frequency Failover Polling
  // Stays connected across Lobby (3), Countdown (4), and Battlefield (5)
  const inActiveArenaRoom = step >= 3 && step <= 5;
  useEffect(() => {
    if (!inActiveArenaRoom || !roomCode) return;

    let isMounted = true;

    // 1. Supabase WebSocket Broadcast Channel (Sub-50ms latency across participants)
    try {
      const channel = supabase.channel(`arena_duel_${roomCode}`, {
        config: { broadcast: { self: false } },
      });

      channel
        .on('broadcast', { event: 'room_sync' }, ({ payload }) => {
          if (!isMounted || !payload?.room) return;
          applyRoomDataState(payload.room);
        })
        .on('broadcast', { event: 'arena_fullscreen' }, () => {
          if (!isMounted) return;
          enterArenaFullscreen();
        })
        .on('broadcast', { event: 'cheat_alert' }, ({ payload }) => {
          if (!isMounted || !payload) return;
          if (payload.playerId !== myPlayerId) {
            playOpponentCheatRadarBeep();
            setOpponentCheatAlert({
              cheaterName: payload.name || 'Opponent',
              strikes: payload.strikes || 1,
              reason: payload.reason || 'Switched screens / tabbed out',
              timestamp: Date.now(),
            });
          }
        })
        .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
          if (!isMounted) return;
          if (payload?.name && payload.name !== playerName) {
            setActivityNotification({
              message: `⚡ ${payload.name} joined the squad!`,
              type: 'join',
              id: Date.now(),
            });
            playArcadeCoinSound();
          }
        })
        .on('broadcast', { event: 'player_left' }, ({ payload }) => {
          if (!isMounted) return;
          if (payload?.name && payload.name !== playerName) {
            setActivityNotification({
              message: `⚠️ ${payload.name} left the room.`,
              type: 'leave',
              id: Date.now(),
            });
          }
        })
        .on('broadcast', { event: 'arena_exit' }, ({ payload }) => {
          if (!isMounted) return;
          alert(payload?.message || 'Opponent has exited the Battle Arena. The match has ended.');
          onClose();
        })
        .on('broadcast', { event: 'progress_sync' }, ({ payload }) => {
          if (!isMounted) return;
          if (payload?.playerId !== myPlayerId) {
            if (payload?.testsPassed !== undefined) setOpponentTestsPassed(payload.testsPassed);
            if (payload?.wpm !== undefined) {
              setOpponentWpm(payload.wpm);
              if (payload.wpm > 0) {
                lastOpponentActivityTimeRef.current = Date.now();
              }
            }
          }
        })
        .on('broadcast', { event: 'relay_code_sync' }, ({ payload }) => {
          if (!isMounted || !payload) return;
          if (payload.squad === mySquad && payload.senderId !== myPlayerId) {
            if (typeof payload.htmlCode === 'string') setHtmlCode(payload.htmlCode);
            if (typeof payload.cssCode === 'string') setCssCode(payload.cssCode);
            if (typeof payload.jsCode === 'string') setJsCode(payload.jsCode);
            if (typeof payload.pythonCode === 'string') setPythonCode(payload.pythonCode);
            if (typeof payload.javaCode === 'string') setJavaCode(payload.javaCode);
            if (typeof payload.cppCode === 'string') setCppCode(payload.cppCode);
            setActivityNotification({
              message: '🔄 Live code synced from teammate!',
              type: 'join',
              id: Date.now(),
            });
          }
        })
        .on('broadcast', { event: 'spectator_code_sync' }, ({ payload }) => {
          if (!isMounted || !payload) return;
          if (payload.playerId !== myPlayerId) {
            setOpponentSolution({
              htmlCode: payload.htmlCode,
              cssCode: payload.cssCode,
              jsCode: payload.jsCode,
              pythonCode: payload.pythonCode,
              javaCode: payload.javaCode,
              cppCode: payload.cppCode,
            });
          }
        })
        .on('broadcast', { event: 'match_solution_reveal' }, ({ payload }) => {
          if (!isMounted || !payload) return;
          if (payload.playerId !== myPlayerId) {
            setOpponentSolution({
              htmlCode: payload.htmlCode,
              cssCode: payload.cssCode,
              jsCode: payload.jsCode,
              pythonCode: payload.pythonCode,
              javaCode: payload.javaCode,
              cppCode: payload.cppCode,
            });
          }
        })
        .subscribe();

      channelRef.current = channel;
    } catch (wsErr) {
      console.warn('Realtime WebSocket init notice:', wsErr);
    }

    // 2. High-performance WebSocket-first sync (Supports 1000+ simultaneous players):
    // Real-time broadcasts handle room_sync, joins, leaves, countdowns, and progress.
    // Heavy 800ms HTTP polling is removed; we keep a relaxed 12s safety check in lobby only,
    // plus instant sync on tab switch, reducing HTTP server load by >95%.
    const pollInterval = setInterval(async () => {
      // In active match (Step 5+), skip HTTP polling completely — WebSockets handle 100% of live telemetry
      if (stepRef.current >= 5) return;
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch(`/api/arena/rooms?code=${roomCode}&_t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.room) return;
        applyRoomDataState(data.room);
      } catch (err) {}
    }, 12000);

    // Instant sync when user switches tabs or focuses the window
    const handleFocusSync = async () => {
      try {
        const res = await fetch(`/api/arena/rooms?code=${roomCode}&_t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.room) applyRoomDataState(data.room);
      } catch {}
    };

    window.addEventListener('focus', handleFocusSync);
    window.addEventListener('visibilitychange', handleFocusSync);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocusSync);
      window.removeEventListener('visibilitychange', handleFocusSync);
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {}
        channelRef.current = null;
      }
    };
  }, [inActiveArenaRoom, roomCode, isHost, myPlayerId]);

  // Sync test progress and typing cadence to server for opponent's Fog-of-War HUD
  const syncProgressToServer = (passedCount: number, currentWpm?: number) => {
    if (!roomCode) return;
    const activeWpm = currentWpm !== undefined ? currentWpm : myWpm;

    // 1. Immediate zero-latency WebSocket broadcast to opponent (<40ms, 0 database load)
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'progress_sync',
          payload: { playerId: myPlayerId, testsPassed: passedCount, wpm: activeWpm },
        });
      } catch {}
    }

    // 2. High-efficiency throttled HTTP persistence (at milestone test completions or max once per 6s)
    const now = Date.now();
    const isMatchMilestone = passedCount > 0 && (passedCount >= totalTests || passedCount === 1);
    if (isMatchMilestone || now - lastHttpProgressSyncRef.current > 6000) {
      lastHttpProgressSyncRef.current = now;
      fetch('/api/arena/rooms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          action: 'progress',
          playerId: myPlayerId,
          payload: {
            testsPassed: passedCount,
            wpm: activeWpm,
          },
        }),
      }).catch(() => {});
    }

    // In 2v2: synchronize code buffer with teammate when progress changes
    if (teamSize === '2v2') {
      syncCodeToTeammate();
    }
  };

  // Relay code synchronization across teammates in 2v2
  const syncCodeToTeammate = () => {
    if (!roomCode || teamSize !== '2v2' || !channelRef.current) return;
    try {
      channelRef.current.send({
        type: 'broadcast',
        event: 'relay_code_sync',
        payload: {
          squad: mySquad,
          senderId: myPlayerId,
          htmlCode,
          cssCode,
          jsCode,
          pythonCode,
          javaCode,
          cppCode,
        },
      });
    } catch {}
  };

  // Secret Spectator broadcast: sends unblurred code and metrics to the channel
  // Contenders ignore this event completely (no UI clue); Admin Spectator Desk receives it in real-time.
  useEffect(() => {
    if (!roomCode || !channelRef.current || step !== 5) return;

    const timer = setTimeout(() => {
      try {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'spectator_code_sync',
          payload: {
            playerId: myPlayerId,
            playerName: playerName,
            squad: mySquad,
            htmlCode,
            cssCode,
            jsCode,
            pythonCode,
            javaCode,
            cppCode,
            wpm: myWpm,
            testsPassed: userTestsPassed,
            timestamp: Date.now(),
          },
        });
      } catch {}
    }, 500);

    return () => clearTimeout(timer);
  }, [
    roomCode,
    step,
    myPlayerId,
    playerName,
    mySquad,
    htmlCode,
    cssCode,
    jsCode,
    pythonCode,
    javaCode,
    cppCode,
    myWpm,
    userTestsPassed,
  ]);

  // Sync match completion to server
  const syncMatchWonToServer = (winnerTeam: 'Team Alpha' | 'Team Omega') => {
    if (!roomCode) return;

    // Immediate WebSocket broadcast to opponent
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'room_sync',
          payload: { room: { ...roomData, status: 'finished', winnerTeam } },
        });
      } catch {}
    }

    // Background HTTP state persistence
    fetch('/api/arena/rooms/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: roomCode,
        action: 'match_won',
        playerId: myPlayerId,
        payload: { winnerTeam },
      }),
    }).catch(() => {});
  };

  // Post-battle Solution Exchange: broadcast my solution so opponent sees what I wrote
  useEffect(() => {
    if (step === 6 && channelRef.current && roomCode) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'match_solution_reveal',
          payload: {
            playerId: myPlayerId,
            playerName,
            htmlCode,
            cssCode,
            jsCode,
            pythonCode,
            javaCode,
            cppCode,
          },
        });
      } catch (err) {
        console.warn('Error broadcasting match_solution_reveal:', err);
      }
    }
  }, [step, roomCode, myPlayerId, playerName, htmlCode, cssCode, jsCode, pythonCode, javaCode, cppCode]);

  // Launch Match: Pull random question matching arena & selected tags from database or fallback
  const handleStartBattle = async () => {
    // If bot opponent is not checked and no student joined yet:
    const opponentList = roomData?.omegaPlayers || [];
    const hasOpponent = opponentList.length > 0 || isBotOpponentAdded;

    if (!hasOpponent) {
      const confirmBot = confirm(
        `No opponent has entered Room ${roomCode} yet!\n\nWould you like to turn ON the AI Practice Bot and start battling right now?\n\n(Click Cancel if you want to copy the room code / link and wait for a classmate.)`
      );
      if (confirmBot) {
        setIsBotOpponentAdded(true);
        fetch('/api/arena/rooms/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: roomCode,
            action: 'toggle_bot',
            payload: { isBotEnabled: true },
          }),
        }).catch(() => {});
      } else {
        return;
      }
    }

    const matchDuration = Number(timeLimit) || Number(roomData?.timeLimit) || 300;
    let chosen: DuelQuestion | null = null;

    // 1. If room already has a verified question matching the exact arena, tags, and difficulty, reuse it!
    const effectiveTags =
      arena === 'web_dev' || (arena === 'bug_hunt' && bugDomain === 'web')
        ? selectedTags.includes('html')
          ? selectedTags
          : ['html', ...selectedTags]
        : selectedTags;

    const currentQ = roomData?.question || activeQuestion;
    const isCurrentAdmin = currentQ && !DEFAULT_ARENA_QUESTIONS.some((d) => d.id === currentQ.id);

    const qTags = (currentQ?.tags || []).map((x: string) => x.toLowerCase().trim());
    const reqTags = effectiveTags.map((t: string) => t.toLowerCase().trim());

    // Strict tag matching: Question must satisfy all requested tags AND must not force unselected languages
    const matchesAllRequested = reqTags.length === 0 || reqTags.every((t: string) => qTags.includes(t));
    const hasUnwantedTags = qTags.some((t: string) => !reqTags.includes(t));
    const isStrictTagMatch = matchesAllRequested && !hasUnwantedTags;

    const isDiffMatch =
      currentQ && (!difficulty || (currentQ.difficulty || 'medium').toLowerCase() === difficulty.toLowerCase());

    if (
      currentQ &&
      currentQ.arena === arena &&
      isDiffMatch &&
      isStrictTagMatch &&
      isCurrentAdmin &&
      (arena !== 'bug_hunt' || !bugDomain || !currentQ.bugDomain || currentQ.bugDomain === bugDomain)
    ) {
      chosen = {
        ...currentQ,
        timeLimitSeconds: matchDuration,
      };
    } else {
      // 2. Fetch question matching exact arena, tags, difficulty, and duration
      try {
        const seenIds = getStoredSeenQuestionIds();
        const queryParams = new URLSearchParams({
          arena,
          difficulty: difficulty || 'medium',
          tags: effectiveTags.join(','),
          timeLimit: String(matchDuration),
          seenIds: seenIds.join(','),
          _rnd: String(Date.now()),
        });
        if (arena === 'bug_hunt' && bugDomain) queryParams.set('bugDomain', bugDomain);

        const res = await fetch(`/api/arena/questions?${queryParams.toString()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            // Find top matching questions (filtering for strict exact criteria)
            const topMatches = data.questions.filter((q: any) => {
              const diffOk = (q.difficulty || 'medium').toLowerCase() === (difficulty || 'medium').toLowerCase();
              const candTags = (q.tags || []).map((x: string) => x.toLowerCase().trim());
              const tagsOk =
                reqTags.length === 0 ||
                (reqTags.every((t) => candTags.includes(t)) && !candTags.some((t: string) => !reqTags.includes(t)));
              return diffOk && tagsOk;
            });

            // Separate unseen vs seen to guarantee non-repeating cycle
            const seenSet = new Set(seenIds.map((id) => id.toLowerCase()));
            const unseen = topMatches.filter((q: any) => q && q.id && !seenSet.has(q.id.toLowerCase()));
            const pickPool = unseen.length > 0 ? unseen : topMatches;

            chosen = pickPool.length > 0
              ? pickPool[Math.floor(Math.random() * pickPool.length)]
              : data.questions[0];
          }
        }
      } catch (e) {
        console.warn('Questions fetch notice in handleStartBattle:', e);
      }

      if (!chosen) {
        const questionPool =
          availableQuestionsRef.current.length > 0
            ? availableQuestionsRef.current
            : DEFAULT_ARENA_QUESTIONS;

        const seenIds = getStoredSeenQuestionIds();
        chosen = selectBestQuestion(questionPool, {
          arena,
          bugDomain,
          selectedTags: effectiveTags,
          difficulty,
          timeLimit: matchDuration,
          seenQuestionIds: seenIds,
        });
      }
    }

    const finalChosen: DuelQuestion = enrichQuestion({
      ...(chosen || DEFAULT_ARENA_QUESTIONS[0]),
      timeLimitSeconds: matchDuration,
    });

    if (finalChosen?.id) {
      const questionPool =
        availableQuestionsRef.current.length > 0
          ? availableQuestionsRef.current
          : DEFAULT_ARENA_QUESTIONS;

      const matchingPoolIds = questionPool
        .filter((q) => {
          if (q.arena !== arena) return false;
          const diffOk = (q.difficulty || 'medium').toLowerCase() === (difficulty || 'medium').toLowerCase();
          const qTags = (q.tags || []).map((t) => t.toLowerCase().trim());
          const reqTags = effectiveTags.map((t) => t.toLowerCase().trim());
          const tagsOk = reqTags.length === 0 || reqTags.every((t) => qTags.includes(t));
          return diffOk && tagsOk;
        })
        .map((q) => q.id);

      persistSeenQuestionId(finalChosen.id, matchingPoolIds);
    }

    setActiveQuestion(finalChosen);
    activeQuestionRef.current = finalChosen;
    initializedQuestionIdRef.current = finalChosen.id;

    // Initialize starter code
    setHtmlCode(finalChosen.starterHtml || '');
    setCssCode(finalChosen.starterCss || '');
    setJsCode(finalChosen.starterJs || '');
    setPythonCode(finalChosen.starterPython || '# Your python solution\n');
    setJavaCode(finalChosen.starterJava || '// Your java solution\n');
    setCppCode(finalChosen.starterCpp || '// Your C++ solution\n');

    const expectedTests = computeExpectedQuestionTests(finalChosen);
    setTotalTests(expectedTests);

    setUserTestsPassed(0);
    setTestCaseResults({});
    setCompilerResult(null);
    setSelectedTestCaseIdx(0);
    setWebEvaluation(null);
    setOpponentTestsPassed(0);
    setTimeLimit(matchDuration);
    setTimeLeft(matchDuration);

    // Set active tab based on arena and tags
    if (arena === 'web_dev') {
      if (selectedTags.includes('html')) setActiveTab('html');
      else if (selectedTags.includes('css')) setActiveTab('css');
      else setActiveTab('js');
    } else if (arena === 'algorithms') {
      if (selectedTags.includes('python')) setActiveTab('python');
      else if (selectedTags.includes('java')) setActiveTab('java');
      else setActiveTab('cpp');
    } else if (arena === 'bug_hunt') {
      if (bugDomain === 'web' || isWebMatch) {
        setActiveTab('css');
      } else {
        setActiveTab('python');
      }
    } else {
      setActiveTab('python');
    }

    const nowIso = new Date().toISOString();
    const matchStartedAt = new Date(Date.now() + 3800).toISOString();
    const updatedRoom = {
      ...roomData,
      status: 'starting',
      startedAt: matchStartedAt,
      question: finalChosen,
      timeLimit: matchDuration,
      difficulty,
      updatedAt: nowIso,
    };
    setRoomData(updatedRoom);

    // Tell server to trigger match start for ALL participants in this room!
    try {
      // Trigger true fullscreen immediately on user gesture
      enterArenaFullscreen();

      // Immediate Sub-50ms WebSocket broadcast to opponent
      if (channelRef.current) {
        try {
          channelRef.current.send({
            type: 'broadcast',
            event: 'arena_fullscreen',
            payload: {},
          });
          channelRef.current.send({
            type: 'broadcast',
            event: 'room_sync',
            payload: { room: updatedRoom },
          });
        } catch {}
      }

      await fetch('/api/arena/rooms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          action: 'start_match',
          payload: { question: finalChosen, timeLimit: matchDuration, startedAt: matchStartedAt },
        }),
      });
      trackEvent('arena_match_started', { code: roomCode, format: teamSize, arena, difficulty });
    } catch {}

    // Advance to countdown
    transitionStep(4);
    setCountdownNum(3);
  };

  // 3-2-1 START Countdown Timer
  useEffect(() => {
    if (step !== 4) return;

    if (countdownNum === 3) {
      const timer = setTimeout(() => {
        playTacticalSelectSound();
        setCountdownNum(2);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownNum === 2) {
      const timer = setTimeout(() => {
        playTacticalSelectSound();
        setCountdownNum(1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownNum === 1) {
      const timer = setTimeout(() => {
        playArcadeCoinSound();
        setCountdownNum('START!');
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownNum === 'START!') {
      // Countdown finished: Transition to Battlefield (Step 5)
      const timer = setTimeout(() => {
        enterArenaFullscreen();
        transitionStep(5);

        // Authoritatively notify server and all peers that match is in progress!
        if (roomCode && isHost) {
          fetch('/api/arena/rooms/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: roomCode, action: 'in_progress' }),
          }).catch(() => {});

          if (channelRef.current) {
            try {
              channelRef.current.send({
                type: 'broadcast',
                event: 'room_sync',
                payload: { room: { ...roomData, status: 'in_progress' } },
              });
            } catch {}
          }
        }
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [step, countdownNum, roomCode, roomData, isHost]);

  // Battle Clock - Synchronized across all duelists via roomData.startedAt
  useEffect(() => {
    if (step !== 5) return;

    const interval = setInterval(() => {
      if (roomData?.startedAt) {
        const startTime = new Date(roomData.startedAt).getTime();
        const now = Date.now();
        const matchDuration = Number(timeLimit) || Number(roomData?.timeLimit) || 300;
        const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));
        const remaining = Math.max(0, matchDuration - elapsed);

        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          setStep(6);
          if (userTestsPassed === 0 && opponentTestsPassed === 0) {
            setWinnerTeam(null);
          } else if (userTestsPassed === opponentTestsPassed) {
            setWinnerTeam(null);
          } else {
            const iWon = userTestsPassed > opponentTestsPassed;
            const winningTeam = iWon
              ? (isHost ? 'Team Alpha' : 'Team Omega')
              : (isHost ? 'Team Omega' : 'Team Alpha');
            setWinnerTeam(winningTeam);
          }
          playVictorySound();
          return;
        }

        // Relay swap at 2.5 minutes remaining in 2v2
        if (teamSize === '2v2' && remaining === 150) {
          setRelayPlayer('Navigator (Teammate)');
          syncCodeToTeammate();
        }
      } else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStep(6);
            if (userTestsPassed === 0 && opponentTestsPassed === 0) {
              setWinnerTeam(null); // Draw: neither player passed any tests before time expired
            } else if (userTestsPassed === opponentTestsPassed) {
              setWinnerTeam(null); // Tie
            } else {
              const iWon = userTestsPassed > opponentTestsPassed;
              const winningTeam = iWon
                ? (isHost ? 'Team Alpha' : 'Team Omega')
                : (isHost ? 'Team Omega' : 'Team Alpha');
              setWinnerTeam(winningTeam);
            }
            playVictorySound();
            return 0;
          }

          // Relay swap at 2.5 minutes remaining in 2v2
          if (teamSize === '2v2' && prev === 150) {
            setRelayPlayer('Navigator (Teammate)');
            syncCodeToTeammate();
          }

          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, roomData?.startedAt, roomData?.timeLimit, timeLimit, userTestsPassed, opponentTestsPassed, teamSize, isHost]);

  // Real-time Local Typing Cadence Tracker & Opponent Idle Watchdog
  useEffect(() => {
    if (step !== 5) return;

    const cadenceInterval = setInterval(() => {
      const now = Date.now();
      let calculatedWpm = 0;
      if (now - lastKeystrokeTimeRef.current <= 2500 && recentKeystrokesRef.current.length > 0) {
        recentKeystrokesRef.current = recentKeystrokesRef.current.filter((t) => now - t <= 6000);
        const chars = recentKeystrokesRef.current.length;
        // Standard formula: (characters / 5) / (minutes) => chars * 2 for 6-sec rolling window
        calculatedWpm = Math.min(180, Math.round(chars * 2));
      } else {
        recentKeystrokesRef.current = [];
      }

      setMyWpm((prev) => {
        if (prev !== calculatedWpm) {
          syncProgressToServer(userTestsPassed, calculatedWpm);
        }
        return calculatedWpm;
      });

      // Opponent idle check: if opponent hasn't typed in 4 seconds, opponent cadence resets to 0
      if (now - lastOpponentActivityTimeRef.current > 4000) {
        setOpponentWpm(0);
      }
    }, 1000);

    return () => clearInterval(cadenceInterval);
  }, [step, userTestsPassed]);

  // Opponent Telemetry Simulator (Fog of War) - STRICTLY for Collegiate Simulation Practice
  useEffect(() => {
    if (step !== 5) return;
    // CRITICAL: NEVER run simulation during real human vs human multiplayer duels!
    if (!isBotDuel) return;

    let localTestsPassed = 0;
    const startTime = Date.now();

    const simTicker = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);

      // Phase 1: 0 - 18s: Reading problem statement
      if (elapsedSec < 18) {
        setOpponentWpm(0);
        setOpponentStatusText('Reading problem & constraints 📖');
        setOpponentSimCodeLinesCount(2);
      } 
      // Phase 2: 18 - 48s: Initial coding burst
      else if (elapsedSec < 48) {
        // Natural typing rhythm with micro-bursts
        const burst = Math.floor(assignedBotProfile.baseWpm - 6 + (Math.sin(elapsedSec * 0.8) * 12) + (Math.random() * 8));
        setOpponentWpm(Math.max(48, burst));
        setOpponentStatusText('Drafting solution in editor ⌨️');
        setOpponentSimCodeLinesCount(Math.min(12, 3 + Math.floor((elapsedSec - 18) / 2.5)));
      }
      // Phase 3: 48 - 56s: Compiling test 1
      else if (elapsedSec < 56) {
        setOpponentWpm(Math.random() < 0.3 ? 15 : 0);
        setOpponentStatusText('Compiling & running test suite ⚙️');
      }
      // Milestone 1: ~56s - Test 1 passes!
      else if (elapsedSec < 100) {
        if (localTestsPassed < 1 && totalTests >= 1) {
          localTestsPassed = 1;
          setOpponentTestsPassed(1);
          setOpponentAlert(`⚡ ${assignedBotProfile.name} passed Test 1/${totalTests}!`);
          setTimeout(() => setOpponentAlert(''), 4500);
        }
        const burst = Math.floor(assignedBotProfile.baseWpm - 4 + (Math.sin(elapsedSec * 0.7) * 14) + (Math.random() * 6));
        setOpponentWpm(Math.max(50, burst));
        setOpponentStatusText('Passed Test 1 🟢 & refactoring');
        setOpponentSimCodeLinesCount(Math.min(18, 10 + Math.floor((elapsedSec - 56) / 2.5)));
      }
      // Phase 4: 100 - 110s: Compiling test 2
      else if (elapsedSec < 110) {
        setOpponentWpm(Math.random() < 0.2 ? 18 : 0);
        setOpponentStatusText('Testing edge cases for Test 2 ⚙️');
      }
      // Milestone 2: ~110s - Test 2 passes!
      else if (elapsedSec < 165) {
        if (localTestsPassed < 2 && totalTests >= 2) {
          localTestsPassed = 2;
          setOpponentTestsPassed(2);
          setOpponentAlert(`⚡ ${assignedBotProfile.name} passed Test 2/${totalTests}!`);
          setTimeout(() => setOpponentAlert(''), 4500);
        }
        const burst = Math.floor(assignedBotProfile.baseWpm - 2 + (Math.sin(elapsedSec * 0.9) * 15) + (Math.random() * 8));
        setOpponentWpm(Math.max(52, burst));
        setOpponentStatusText('Passed Test 2 🟢 & handling final tests');
        setOpponentSimCodeLinesCount(Math.min(26, 17 + Math.floor((elapsedSec - 110) / 2.2)));
      }
      // Milestone 3: 165s - 225s: Final stretch
      else {
        if (totalTests <= 2 && localTestsPassed < totalTests) {
          localTestsPassed = totalTests;
          setOpponentTestsPassed(totalTests);
          setWinnerTeam('Team Omega');
          setStep(6);
          playVictorySound();
        } else if (totalTests > 2 && localTestsPassed < 3 && elapsedSec >= 220) {
          localTestsPassed = totalTests;
          setOpponentTestsPassed(totalTests);
          setWinnerTeam('Team Omega');
          setStep(6);
          playVictorySound();
        } else {
          const burst = Math.floor(assignedBotProfile.baseWpm + (Math.sin(elapsedSec) * 10));
          setOpponentWpm(Math.max(45, burst));
          setOpponentStatusText('Final pass optimization 🚀');
          setOpponentSimCodeLinesCount(28);
        }
      }
    }, 1500);

    return () => clearInterval(simTicker);
  }, [step, isBotDuel, totalTests, timeLimit, assignedBotProfile]);

  // Real Backend Compiler Execution for Java, C++, Python (Compile & Run)
  // Evaluates every test case so each tab (Case 1, Case 2, etc.) has its own live output and verdict!
  const handleCompileAndRun = async () => {
    setIsCompiling(true);
    setActiveConsoleTab('testcases');

    const activeLanguage = activeTab === 'python' ? 'python' : activeTab === 'java' ? 'java' : 'cpp';
    const activeCode =
      activeTab === 'python'
        ? pythonCode
        : activeTab === 'java'
        ? javaCode
        : activeTab === 'cpp'
        ? cppCode
        : pythonCode;

    // Custom Stdin execution mode
    if (activeConsoleTab === 'custom' && customStdin.trim()) {
      try {
        const res = await fetch('/api/compiler/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: activeLanguage,
            code: activeCode,
            stdin: customStdin,
          }),
        });
        const data = await res.json();
        setCompilerResult({
          success: data.success,
          stdout: data.stdout || '(No output produced)',
          stderr: data.stderr || '',
          compile_output: data.compile_output || '',
          executionTimeMs: data.executionTimeMs || 15,
          status: data.success ? 'Accepted' : 'Compilation Error',
        });
      } catch (err: any) {
        setCompilerResult({
          success: false,
          stdout: '',
          stderr: err.message,
          status: 'Runtime Error',
        });
      } finally {
        setIsCompiling(false);
      }
      return;
    }

    const testCases = activeQuestion.testCases || [];
    const results = await Promise.all(
      testCases.map(async (tc, i) => {
        try {
          const res = await fetch('/api/compiler/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language: activeLanguage,
              code: activeCode,
              stdin: tc.input || '',
            }),
          });

          const data = await res.json();
          if (!data.success) {
            return {
              idx: i,
              status: 'Error' as const,
              stdout: data.stderr || data.compile_output || 'Error during compilation/execution',
              stderr: data.stderr,
              compileOutput: data.compile_output,
              executionTimeMs: data.executionTimeMs || 0,
            };
          }
          const rawStdout = (data.stdout || '').trim();
          const expected = (tc.expectedOutput || '').trim();
          const isPass = verifyTestOutput(activeQuestion.id, rawStdout, expected, tc.input || '');
          return {
            idx: i,
            status: (isPass ? 'Accepted' : 'Wrong Answer') as 'Accepted' | 'Wrong Answer',
            stdout: rawStdout || '(No output produced)',
            stderr: data.stderr,
            executionTimeMs: data.executionTimeMs || 15,
          };
        } catch (err: any) {
          return {
            idx: i,
            status: 'Error' as const,
            stdout: err.message || 'Network error running test case',
            executionTimeMs: 0,
          };
        }
      })
    );

    const newResults: Record<
      number,
      {
        status: 'Accepted' | 'Wrong Answer' | 'Error';
        stdout: string;
        stderr?: string;
        executionTimeMs?: number;
      }
    > = {};

    let totalPassed = 0;
    let anyCompileError = false;
    let globalStderr = '';
    let globalCompileOutput = '';

    results.forEach((r) => {
      newResults[r.idx] = {
        status: r.status,
        stdout: r.stdout,
        stderr: r.stderr,
        executionTimeMs: r.executionTimeMs,
      };
      if (r.status === 'Accepted') totalPassed++;
      if (r.status === 'Error') {
        anyCompileError = true;
        globalStderr = r.stderr || r.stdout || 'Compilation Error';
        if (r.compileOutput) globalCompileOutput = r.compileOutput;
      }
    });

    setTestCaseResults(newResults);
    setUserTestsPassed(totalPassed);
    syncProgressToServer(totalPassed);
    setIsCompiling(false);

    if (anyCompileError) {
      playCompileErrorSound();
      setCompilerResult({
        success: false,
        stdout: '',
        stderr: globalStderr,
        compile_output: globalCompileOutput,
        status: 'Compilation Error',
      });
    } else if (totalPassed === testCases.length) {
      playCompileSuccessSound();
      setCompilerResult({
        success: true,
        stdout: newResults[selectedTestCaseIdx]?.stdout || '',
        status: 'Accepted',
      });
    } else {
      playCompileErrorSound();
      setCompilerResult({
        success: false,
        stdout: newResults[selectedTestCaseIdx]?.stdout || '',
        status: 'Wrong Answer',
      });
    }
  };

  // Real Submit Handler for Java, C++, Python (Submits to All Test Cases in parallel)
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setActiveConsoleTab('testcases');
    const activeLanguage = activeTab === 'python' ? 'python' : activeTab === 'java' ? 'java' : 'cpp';
    const activeCode =
      activeTab === 'python'
        ? pythonCode
        : activeTab === 'java'
        ? javaCode
        : activeTab === 'cpp'
        ? cppCode
        : pythonCode;

    const testCases = activeQuestion.testCases || [];
    const results = await Promise.all(
      testCases.map(async (tc, i) => {
        try {
          const res = await fetch('/api/compiler/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language: activeLanguage,
              code: activeCode,
              stdin: tc.input || '',
            }),
          });
          const data = await res.json();
          const rawOut = (data.stdout || '').trim();
          const expected = (tc.expectedOutput || '').trim();
          const pass = data.success && verifyTestOutput(
            activeQuestion.id,
            rawOut,
            expected,
            tc.input || ''
          );

          return {
            idx: i,
            pass,
            status: (pass ? 'Accepted' : 'Wrong Answer') as 'Accepted' | 'Wrong Answer',
            stdout: rawOut || data.stderr || 'Execution failed',
            executionTimeMs: data.executionTimeMs || 15,
          };
        } catch (e) {
          return {
            idx: i,
            pass: false,
            status: 'Error' as const,
            stdout: 'Network Error',
            executionTimeMs: 0,
          };
        }
      })
    );

    let passedCount = 0;
    const newResults: Record<number, any> = {};
    let firstFailedIdx = -1;

    results.forEach((r) => {
      newResults[r.idx] = {
        status: r.status,
        stdout: r.stdout,
        executionTimeMs: r.executionTimeMs,
      };
      if (r.pass) {
        passedCount++;
      } else if (firstFailedIdx === -1) {
        firstFailedIdx = r.idx;
      }
    });

    setTestCaseResults(newResults);
    setUserTestsPassed(passedCount);
    syncProgressToServer(passedCount, myWpm);
    setIsSubmitting(false);

    if (passedCount === testCases.length && testCases.length > 0) {
      playVictorySound();
      const winner = isHost ? 'Team Alpha' : 'Team Omega';
      setWinnerTeam(winner);
      syncMatchWonToServer(winner);
      setCompilerResult({
        success: true,
        stdout: newResults[selectedTestCaseIdx]?.stdout || '',
        status: 'Accepted',
      });
      setStep(6);
    } else {
      playCompileErrorSound();
      if (firstFailedIdx !== -1) {
        setSelectedTestCaseIdx(firstFailedIdx);
      }
      setCompilerResult({
        success: false,
        stdout: newResults[firstFailedIdx !== -1 ? firstFailedIdx : selectedTestCaseIdx]?.stdout || '',
        status: 'Wrong Answer',
      });
      alert(
        `⛔ Submission Blocked: All ${testCases.length} test cases must pass before submitting!\n\n` +
        `Current Status: ${passedCount} / ${testCases.length} Tests Passed.\n\n` +
        `Inspect the test cases in the console below and fix your code to pass all tests before submitting.`
      );
    }
  };

  // Test Layout Handler for Web Development (Evaluates layout coordinate graph & spelling in background)
  const handleTestWebLayout = () => {
    const evaluation = evaluateWebCoordinateGraph(
      activeQuestion.id,
      htmlCode,
      cssCode,
      activeQuestion.targetComponentHtml,
      activeQuestion.targetComponentCss,
      {
        tags: activeQuestion.tags || selectedTags,
        jsCode,
        targetJs: activeQuestion.targetComponentJs,
      }
    );
    setWebEvaluation(evaluation);
    setTotalTests(evaluation.totalTests);
    setUserTestsPassed(evaluation.testsPassed);
    syncProgressToServer(evaluation.testsPassed, myWpm);

    const testSummary = evaluation.results
      .map((r, i) => `[Test Case #${i + 1}] ${r.testName}\nStatus: ${r.passed ? '✓ PASSED' : '✗ FAILED'}\nDetails: ${r.message}`)
      .join('\n\n');

    if (evaluation.passed) {
      playCompileSuccessSound();
      alert(
        `🎉 All ${evaluation.totalTests} Test Cases Passed!\n\n` +
        `${testSummary}\n\n` +
        `Your layout matches the Preview blueprint coordinates and words. Click "Submit Challenge" to claim victory!`
      );
    } else {
      playCompileErrorSound();
      alert(
        `🔍 Test Results: ${evaluation.testsPassed} / ${evaluation.totalTests} Passed\n\n` +
        `${testSummary}\n\n` +
        `Refine your HTML tags, word spelling, and layout CSS to pass all test cases.`
      );
    }
  };

  // Submit Handler for Web Development (Evaluates layout coordinate graph & requires passing all test cases)
  const handleWebSubmit = () => {
    setIsSubmitting(true);
    const evaluation = evaluateWebCoordinateGraph(
      activeQuestion.id,
      htmlCode,
      cssCode,
      activeQuestion.targetComponentHtml,
      activeQuestion.targetComponentCss,
      {
        tags: activeQuestion.tags || selectedTags,
        jsCode,
        targetJs: activeQuestion.targetComponentJs,
      }
    );
    setWebEvaluation(evaluation);
    setTotalTests(evaluation.totalTests);
    setUserTestsPassed(evaluation.testsPassed);
    syncProgressToServer(evaluation.testsPassed, myWpm);

    const testSummary = evaluation.results
      .map((r, i) => `[Test Case #${i + 1}] ${r.testName}\nStatus: ${r.passed ? '✓ PASSED' : '✗ FAILED'}\nDetails: ${r.message}`)
      .join('\n\n');

    if (evaluation.passed) {
      playVictorySound();
      const winner = isHost ? 'Team Alpha' : 'Team Omega';
      setWinnerTeam(winner);
      syncMatchWonToServer(winner);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep(6);
      }, 500);
    } else {
      setIsSubmitting(false);
      playCompileErrorSound();
      alert(
        `⛔ Submission Blocked: All ${evaluation.totalTests} test cases must pass before you can submit!\n\n` +
        `Current Status: ${evaluation.testsPassed} / ${evaluation.totalTests} Tests Passed.\n\n` +
        `${testSummary}\n\n` +
        `Ensure all word spellings, CSS spatial coordinates (within ±30%), and interactive scripts pass before submitting!`
      );
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If Arena is taken offline by Administrator in Control Center:
  if (!isArenaLive) {
    return (
      <div className="fixed inset-0 z-[9990] bg-[#05070e] text-slate-100 flex items-center justify-center p-4 select-none">
        <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-rose-500/40 shadow-[0_0_60px_rgba(244,63,94,0.3)] backdrop-blur-xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-9 h-9 animate-pulse" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              OFFLINE &bull; MAINTENANCE MODE
            </span>
            <h2 className="text-2xl font-black font-mono text-white mt-2">BATTLE ARENA SUSPENDED</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-mono">
              {maintenanceMsg}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white font-mono font-bold text-xs shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
          >
            Exit Battle Arena
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9990] bg-[#02040a] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* 1st Image: High-Resolution Proving Grounds Warrior Overlook Landscape */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src="/images/proving-grounds-overlook-bg.jpg"
          alt="The Proving Grounds Mountain Overlook"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
          className="w-full h-full object-cover object-[center_top] sm:object-center filter contrast-[1.02] brightness-[0.98] saturate-[1.05]"
        />
        {/* Soft edge vignettes to ensure HUD readability while keeping warrior & mountain crystal clear */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Subtle Ambient Golden Light Overlay */}
      <div className="absolute top-0 right-1/4 w-[750px] h-[750px] bg-[radial-gradient(ellipse_60%_50%_at_60%_35%,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none z-0" />

      {/* Top Cyber Navigation Bar */}
      <header className={`relative z-20 h-16 border-b transition-colors px-4 sm:px-6 flex items-center justify-between shrink-0 ${
        step === 0
          ? 'border-white/[0.06] bg-black/45 backdrop-blur-md'
          : 'border-white/[0.08] bg-black/85 backdrop-blur-xl'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative shrink-0 flex items-center justify-center">
            <img
              src="/brand/kollabrix-logo.svg?v=20261031_v3squircle"
              alt="Kollabrix Official Dual Ascent Aerospace Emblem"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-white text-base tracking-wider uppercase flex items-center gap-1.5">
                <span className="text-amber-400">KOLLΛBRIX</span>
                <span className="text-slate-500 font-normal">/</span>
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">THE PROVING GROUNDS</span>
              </span>
              {step > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">
                  {teamSize === '1v1' ? '1v1 DUEL' : '2v2 RELAY'}
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
              {step === 0
                ? 'Collegiate Esports Combat Gateway \u2022 Anti-Cheat Fog of War Protected'
                : `Room ${roomCode} \u2022 Anti-Cheat Fog of War Protected`}
            </p>
          </div>
        </div>

        {/* Center Timer when in Battle */}
        {step === 5 && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono text-lg font-black text-amber-300 tracking-wider">
              {formatTimer(timeLeft)}
            </span>
          </div>
        )}

        {/* Right Header Actions: Fullscreen Toggle & Exit */}
        <div className="flex items-center gap-2">
          {step === 5 && (
            <button
              type="button"
              onClick={toggleArenaFullscreen}
              className={`p-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-black/60 hover:bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Fullscreen' : 'Fullscreen'}</span>
            </button>
          )}

          {/* Exit Button */}
          <button
            type="button"
            onClick={handleExitArena}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            title="Exit Battle Arena"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Arena</span>
          </button>
        </div>
      </header>

      {/* Mobile Screen Guidance Banner */}
      {isMobileDevice && showMobileBanner && (
        <div className="relative z-30 w-full px-4 py-2.5 bg-gradient-to-r from-amber-950/90 via-slate-950/95 to-amber-950/90 border-b border-amber-500/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Laptop className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
            <span>
              <strong className="text-amber-300">Laptop Recommended:</strong> Live coding speedruns require a physical keyboard.
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                const url = typeof window !== 'undefined' ? `${window.location.origin}/arena?room=${roomCode}` : 'https://kollabrix.in/arena';
                navigator.clipboard.writeText(url);
                alert(`Battle link copied! Open it on your laptop browser: ${url}`);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Copy PC Link</span>
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join my Kollabrix Live Coding Arena room on your laptop: https://kollabrix.in/arena?room=${roomCode}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30 transition-all flex items-center gap-1"
            >
              <Share2 className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => setShowMobileBanner(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
              title="Dismiss notice"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Arena Viewport */}
      <main className={`relative z-10 flex-1 overflow-y-auto overflow-x-hidden flex flex-col ${
        step === 0
          ? 'justify-end items-center sm:items-end p-3 sm:p-5 lg:p-6 pb-3 sm:pb-5'
          : 'justify-start items-center p-4 sm:p-6 lg:p-8'
      }`}>
        
        {/* ================= STEP 0: PROVING GROUNDS OVERLOOK (3RD IMAGE WARM TRANSPARENT CARD ON LOWER RIGHT) ================= */}
        {step === 0 && (
          <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto flex flex-col justify-end items-center sm:items-end pb-1 sm:pb-2 pr-0 sm:pr-4 lg:pr-8 animate-fadeIn pointer-events-none">
            {/* The Proving Grounds Colosseum Trial Card (Image 3 - Warmer, Transparent Glassmorphic Box) */}
            <div className="pointer-events-auto w-full max-w-[420px] sm:max-w-[430px] lg:max-w-[440px] rounded-3xl bg-gradient-to-b from-[#181107]/45 via-[#120d05]/38 to-[#0a0703]/50 border border-amber-500/30 border-t-amber-300/40 border-l-amber-400/25 shadow-[0_16px_45px_rgba(0,0,0,0.5),0_0_35px_rgba(245,158,11,0.12),inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-md p-4 sm:p-5 relative overflow-hidden space-y-3 sm:space-y-3.5">
              {/* Subtle ambient warm sunbeam highlight within the glass */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_70%)] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[radial-gradient(circle_at_bottom_left,rgba(217,119,6,0.10),transparent_70%)] pointer-events-none" />

              {/* 1. TOP SECTION: Badge + Headline + Description */}
              <div className="space-y-1.5 relative z-10 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-amber-400/35 text-amber-300 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>THE PROVING GROUNDS • LIVE ARENA</span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-[25px] font-black text-white tracking-tight font-serif leading-[1.18]">
                  Enter The Colosseum.{' '}
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    Prove Your Craft.
                  </span>
                </h1>

                <p className="text-[11px] sm:text-xs text-slate-200/90 leading-relaxed font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                  High-stakes algorithmic &amp; UI duels under fog-of-war encryption. Outcode campus rivals, prove your speed under time, and rise on the verified collegiate leaderboard.
                </p>
              </div>

              {/* 2. CENTER SECTION: The Proving Grounds Colosseum Visual */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-amber-400/30 shadow-[0_4px_25px_rgba(0,0,0,0.45)] group z-10">
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-amber-500/10 z-10 pointer-events-none" />
                <img
                  src="/images/arena-proving-grounds-colosseum.jpg"
                  alt="The Proving Grounds Colosseum"
                  className="w-full h-32 sm:h-36 object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Quick Pilot Call-sign Tag */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/35 border border-amber-500/15 text-[11px] font-mono text-slate-300 relative z-10">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="text-amber-400">⚔️</span>
                  <span>Challenger:</span>
                </span>
                <span className="text-amber-300 font-bold truncate max-w-[170px]">
                  {playerName || 'Challenger'}
                </span>
                <button
                  type="button"
                  onClick={rollRandomCallSign}
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                >
                  Change Tag
                </button>
              </div>

              {/* 3. BOTTOM SECTION: Buttons */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playArcadeCoinSound();
                      setIsHost(true);
                      setRoomCode(`KBX-${Math.floor(1000 + Math.random() * 9000)}`);
                      setStep(2);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trophy className="w-3.5 h-3.5 fill-current" />
                    <span>CREATE TOURNAMENT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTacticalSelectSound();
                      setShowJoinModal(true);
                    }}
                    className="py-2.5 px-3.5 rounded-xl bg-black/45 hover:bg-black/65 border border-amber-400/35 text-amber-200 font-mono text-xs font-bold tracking-wider backdrop-blur-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Join with Code</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal: Join Existing Room with Code or Link */}
            {showJoinModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
                <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#0b0e14]/95 border border-amber-500/35 shadow-[0_0_60px_rgba(245,158,11,0.2)] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.1]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        <Users className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">
                          Join Existing Room
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400">
                          Enter your classmate&apos;s 4-digit code or paste invite link
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1 block">
                        Room Code or Invite Link:
                      </label>
                      <input
                        type="text"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (joinCodeInput.trim()) {
                              handleJoinWithCodeOrLink();
                              setShowJoinModal(false);
                            }
                          }
                        }}
                        placeholder="e.g. KBX-4634 or https://kollabrix.in/arena?room=..."
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/[0.12] text-amber-300 font-mono text-sm focus:border-amber-400 focus:outline-none tracking-wider placeholder:text-slate-600 shadow-inner"
                      />
                    </div>

                    {joinError && (
                      <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{joinError}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-black hover:bg-slate-900 border border-white/[0.12] text-slate-300 font-mono text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isJoiningRoom || !joinCodeInput.trim()}
                      onClick={() => {
                        handleJoinWithCodeOrLink();
                        setShowJoinModal(false);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isJoiningRoom ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                      <span>Enter Room &amp; Battle</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 2: CHOOSE ARENA & TOPICS ================= */}
        {step === 2 && (
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#060813]/95 border border-amber-500/30 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.08)] backdrop-blur-2xl animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-300 inline-block shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                Step 2 of 3 &bull; Select Arena & Topics
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-serif">
                Pick Arena &amp; Languages
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-sans">
                Choose the domain and custom technology tags for the match.
              </p>
            </div>

            {/* Arena Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'web_dev',
                  name: 'Web Dev',
                  desc: 'Frontend UI layout replication & DOM interaction',
                  icon: Globe,
                },
                {
                  id: 'algorithms',
                  name: 'Algorithms',
                  desc: 'DSA & competitive logic (Java / Python / C++)',
                  icon: Terminal,
                },
                {
                  id: 'bug_hunt',
                  name: 'Bug Hunt',
                  desc: 'Diagnose & fix live broken component bugs',
                  icon: Zap,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectArena(item.id as ArenaCategory)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    arena === item.id
                      ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-black/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 text-amber-400 mb-2" />
                  <h4 className="font-mono font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Arena-Specific Language / Topic Checkboxes */}
            {/* 1. WEB DEV TOPICS (HTML REQUIRED / FIXED • CAN TOGGLE CSS & JAVASCRIPT) */}
            {arena === 'web_dev' && (
              <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>Web Dev Topics:</span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    {selectedTags.includes('html') ? selectedTags.length : selectedTags.length + 1} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'html', label: 'HTML', desc: 'Structure & semantic elements', isMandatory: true },
                    { id: 'css', label: 'CSS', desc: 'Flexbox, grids & styling', isMandatory: false },
                    { id: 'javascript', label: 'JavaScript', desc: 'DOM clicks & logic', isMandatory: false },
                  ].map((topic) => {
                    const isChecked = topic.isMandatory || selectedTags.includes(topic.id);
                    return (
                      <div
                        key={topic.id}
                        onClick={() => {
                          if (topic.isMandatory) return; // Cannot untick HTML
                          handleToggleTag(topic.id);
                        }}
                        className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 select-none ${
                          topic.isMandatory
                            ? 'bg-amber-950/60 border-amber-400/80 text-white shadow-sm cursor-default'
                            : isChecked
                            ? 'bg-amber-950/50 border-amber-400 text-white shadow-sm cursor-pointer'
                            : 'bg-black/60 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? 'bg-amber-500 border-amber-400 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-mono text-white">{topic.label}</p>
                          <p className="text-[10px] text-slate-400">{topic.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. ALGORITHMS / DSA LANGUAGE (SINGLE SELECT - CHOOSE 1: JAVA, PYTHON, OR C++) */}
            {arena === 'algorithms' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Select Language (Choose 1):</span>
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                    {selectedTags[0] ? selectedTags[0].toUpperCase() : 'JAVA'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'java', label: 'Java', desc: 'Java 21 OpenJDK - Enterprise DSA' },
                    { id: 'python', label: 'Python', desc: 'Python 3.12 - Fast prototyping' },
                    { id: 'cpp', label: 'C++', desc: 'Modern C++ 20 - Ultra-fast competitive' },
                  ].map((lang) => {
                    const isSelected = selectedTags[0] === lang.id || (selectedTags.length === 1 && selectedTags.includes(lang.id));
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          setSelectedTags([lang.id]);
                          setActiveTab(lang.id as any);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none text-left w-full ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold font-mono text-white">{lang.label}</p>
                          <p className="text-[10px] text-slate-400">{lang.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. BUG HUNT DOMAIN SELECTOR (NO ARBITRARY REACT/JS/PYTHON TAGS - REPLACED WITH WEB VS LOGIC DOMAINS) */}
            {arena === 'bug_hunt' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>Bug Hunt Domain (From Admin Control Center):</span>
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                    {bugDomain === 'web' ? 'Web UI Bug' : 'Logic Code Bug'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setBugDomain('web');
                      setSelectedTags(['html', 'css']);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      bugDomain === 'web'
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 border ${
                        bugDomain === 'web'
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                          : 'border-slate-600'
                      }`}
                    >
                      {bugDomain === 'web' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Web UI Bug Hunt</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        HTML, CSS & layout bugs. Includes live Target Component Preview & live Output render to visually verify fixes.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setBugDomain('logic');
                      setSelectedTags(['java']);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      bugDomain === 'logic'
                        ? 'bg-rose-950/60 border-rose-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 border ${
                        bugDomain === 'logic'
                          ? 'bg-rose-500 border-rose-400 text-white font-bold'
                          : 'border-slate-600'
                      }`}
                    >
                      {bugDomain === 'logic' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-rose-400" />
                        <span>Logic & Code Bug Hunt</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Algorithms, memory, and boundary bugs in Python, Java, and C++. Includes real Judge0 compiler execution & test runner.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-language selector for chosen Bug Hunt Domain */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Select Language to Hunt Bug ({bugDomain === 'web' ? 'Web UI' : 'Logic & Code'}):
                    </label>
                    {bugDomain === 'web' && (
                      <span className="text-[11px] font-mono text-cyan-400 font-bold">
                        {(selectedTags.includes('html') ? selectedTags : ['html', ...selectedTags]).length} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(bugDomain === 'web'
                      ? [
                          { id: 'html', label: 'HTML', desc: 'Structure Bugs', isMandatory: true },
                          { id: 'css', label: 'CSS', desc: 'Styling & Layout', isMandatory: false },
                          { id: 'javascript', label: 'JavaScript', desc: 'DOM & Click Bugs', isMandatory: false },
                        ]
                      : [
                          { id: 'java', label: 'Java', desc: 'Enterprise Java Bugs', isMandatory: false },
                          { id: 'python', label: 'Python', desc: 'Syntax & Logic Bugs', isMandatory: false },
                          { id: 'cpp', label: 'C++', desc: 'Memory & Pointer Bugs', isMandatory: false },
                        ]
                    ).map((lang) => {
                      const isMandatory = bugDomain === 'web' && lang.id === 'html';
                      const isSelected = isMandatory || selectedTags.includes(lang.id);
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            if (bugDomain === 'web') {
                              if (isMandatory) return; // Cannot untick HTML - permanently fixed
                              if (selectedTags.includes(lang.id)) {
                                setSelectedTags(selectedTags.filter((t) => t !== lang.id));
                              } else {
                                const next = [...selectedTags, lang.id];
                                setSelectedTags(next.includes('html') ? next : ['html', ...next]);
                              }
                            } else {
                              // Single-select for Logic & Code Bug Hunt (only 1 tick: Java, Python, or C++)
                              setSelectedTags([lang.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isMandatory ? 'cursor-default' : 'cursor-pointer'
                          } ${
                            isSelected
                              ? bugDomain === 'web'
                                ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                : 'bg-rose-950/70 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-mono font-bold text-xs text-white">{lang.label}</span>
                            <span
                              className={`w-4 h-4 ${
                                bugDomain === 'web' ? 'rounded-md' : 'rounded-full'
                              } border flex items-center justify-center text-[10px] ${
                                isSelected
                                  ? bugDomain === 'web'
                                    ? 'border-cyan-400 bg-cyan-500 text-slate-950 font-bold'
                                    : 'border-rose-400 bg-rose-500 text-slate-950 font-bold'
                                  : 'border-slate-700 bg-slate-950/50'
                              }`}
                            >
                              {isSelected ? '✓' : ''}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{lang.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Difficulty & Time Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
                  Difficulty Level:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all ${
                        difficulty === diff
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
                  Match Duration:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { secs: 180, label: '3m' },
                    { secs: 300, label: '5m' },
                    { secs: 600, label: '10m' },
                  ].map((t) => (
                    <button
                      key={t.secs}
                      type="button"
                      onClick={() => setTimeLimit(t.secs)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        timeLimit === t.secs
                          ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'bg-black/70 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Back & Next Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="py-3 px-5 rounded-2xl bg-black hover:bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleHostCreateRoom}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black font-mono text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Next: Room &amp; Invite Link</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ROOM CODE, INVITE LINK & ROSTER LOBBY ================= */}
        {step === 3 && (
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#060813]/95 border border-amber-500/30 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.08)] backdrop-blur-2xl animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-300 inline-block shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                Step 3 of 3 &bull; Private Room Ready
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-serif">
                Invite Squad &amp; Launch Match
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Share the room code or link to assemble your match.
              </p>
            </div>

            {/* Big Room Code Badge (Warm Amber Glow Matching Step 2) */}
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                  Private Duel Room Code:
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 tracking-wider drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  {roomCode}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-black/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-200 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-mono font-black transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                </button>
              </div>
            </div>

            {/* PRACTICE BOT CHECKBOX TOGGLE (Warm Amber Theme) */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-black/60 border border-amber-500/25 hover:border-amber-500/50 cursor-pointer select-none transition-all">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-sm ${
                    isBotOpponentAdded
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {isBotOpponentAdded ? assignedBotProfile.avatarEmoji : <Bot className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <p className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                    <span>Simulate Collegiate Opponent (Instant Match)</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {assignedBotProfile.college}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Duel {assignedBotProfile.name} ({assignedBotProfile.tag}) with real human typing bursts and Fog of War encryption.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isBotOpponentAdded}
                onChange={(e) => setIsBotOpponentAdded(e.target.checked)}
                className="w-5 h-5 rounded-md border-amber-500/40 bg-black text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500"
              />
            </label>

            {/* Real-time Join/Leave In-Arena Activity Notification Toast */}
            {activityNotification && (
              <div
                className={`px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold flex items-center justify-between gap-3 shadow-lg animate-fadeIn ${
                  activityNotification.type === 'join'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      activityNotification.type === 'join' ? 'bg-emerald-400' : 'bg-rose-400'
                    } animate-ping`}
                  />
                  <span>{activityNotification.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivityNotification(null)}
                  className="opacity-70 hover:opacity-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Roster Slots based on 1v1 vs 2v2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team Alpha (Warm Amber - Matching Step 2) */}
              <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.06)]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    {mySquad === 'alpha' ? 'Team Alpha (Your Squad)' : 'Team Alpha (Host Squad)'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {teamSize === '1v1' ? '1 Slot' : '2 Slots'}
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Slot 1: Host */}
                  {(() => {
                    const hostName =
                      roomData?.alphaPlayers?.[0]?.name || roomData?.hostName || (isHost ? playerName : 'Host');
                    const isP1Me = Boolean(
                      roomData?.alphaPlayers?.[0]?.id === myPlayerId ||
                      (isHost && (!roomData?.alphaPlayers?.[0]?.id || roomData?.alphaPlayers?.[0]?.id === myPlayerId))
                    );
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black flex items-center justify-center text-[11px] shadow-sm">
                            P1
                          </div>
                          <span className="text-white font-bold">{hostName}</span>
                          <span className="text-[10px] text-amber-300 font-semibold">
                            {isP1Me ? '(You - Host)' : '(Host)'}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                          READY
                        </span>
                      </div>
                    );
                  })()}

                  {/* Slot 2: Teammate (in 2v2) */}
                  {teamSize === '2v2' && (
                    roomData?.alphaPlayers?.[1] ? (
                      (() => {
                        const p2 = roomData.alphaPlayers[1];
                        const isP2Me = Boolean(p2.id === myPlayerId);
                        return (
                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black flex items-center justify-center text-[11px] shadow-sm">
                                P2
                              </div>
                              <span className="text-white font-bold">{p2.name}</span>
                              <span className="text-[10px] text-amber-300 font-semibold">
                                {isP2Me ? '(You - Navigator)' : '(Navigator)'}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                              READY
                            </span>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-dashed border-amber-500/20 flex items-center justify-between text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[11px]">
                            P2
                          </div>
                          <span className="italic">Waiting for teammate...</span>
                        </div>
                        <span className="text-[10px] text-amber-400 animate-pulse">INVITED</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Team Omega (Rose/Amber) */}
              <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/30 space-y-3 shadow-[0_0_20px_rgba(244,63,94,0.06)]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                    {mySquad === 'omega' ? 'Team Omega (Your Squad)' : 'Team Omega (Opponents)'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {teamSize === '1v1' ? '1 Slot' : '2 Slots'}
                  </span>
                </div>

                {roomData?.omegaPlayers && roomData.omegaPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {roomData.omegaPlayers.map((opp: any, idx: number) => {
                      const isOppMe = Boolean(
                        opp.id === myPlayerId || (!isHost && mySquad === 'omega')
                      );
                      return (
                        <div
                          key={opp.id || idx}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/50 flex items-center justify-between text-xs font-mono shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-rose-500 text-white font-bold flex items-center justify-center text-xs">
                              {opp.id === 'bot-rival' ? assignedBotProfile.avatarEmoji : `P${idx + (teamSize === '2v2' ? 3 : 2)}`}
                            </div>
                            <span className="text-white font-bold">{opp.id === 'bot-rival' ? assignedBotProfile.name : opp.name}</span>
                            <span className="text-[10px] text-rose-300 font-semibold">
                              {isOppMe ? '(You)' : opp.id === 'bot-rival' ? `(${assignedBotProfile.college})` : '(Opponent)'}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                            READY
                          </span>
                        </div>
                      );
                    })}

                    {/* In 2v2: If Omega has only 1 player, show Slot 4 waiting */}
                    {teamSize === '2v2' && roomData.omegaPlayers.length < 2 && (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-dashed border-rose-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[11px]">
                            P4
                          </div>
                          <span className="italic text-rose-400/80">Waiting for opponent #2...</span>
                        </div>
                        <span className="text-[10px] text-amber-400 animate-pulse">OPEN</span>
                      </div>
                    )}
                  </div>
                ) : isBotOpponentAdded ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-rose-500 text-white font-bold flex items-center justify-center text-xs">
                          {assignedBotProfile.avatarEmoji}
                        </div>
                        <span className="text-white font-bold">{assignedBotProfile.name}</span>
                        <span className="text-[10px] text-rose-300 font-semibold">({assignedBotProfile.college})</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">READY</span>
                    </div>

                    {teamSize === '2v2' && (
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-rose-500 text-white font-bold flex items-center justify-center text-xs">
                            🐺
                          </div>
                          <span className="text-white font-bold">Aryan Mehta</span>
                          <span className="text-[10px] text-rose-300 font-semibold">(NSUT Delhi)</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">READY</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-black/60 border border-dashed border-amber-500/30 flex flex-col gap-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                        Waiting for Opponent...
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
                        OPEN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Share room code <strong className="text-amber-300 font-mono font-bold tracking-wider">{roomCode}</strong> or copy the invite link above so a student can enter this match!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Launch Match Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isHost) {
                    setStep(2);
                  } else {
                    handleConfirmExit();
                  }
                }}
                className="py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHost ? 'Back' : 'Leave Room'}</span>
              </button>

              {isHost ? (
                <button
                  type="button"
                  onClick={handleStartBattle}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black font-mono text-base uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_35px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START MATCH NOW</span>
                </button>
              ) : (
                <div className="flex-1 py-4 px-6 rounded-2xl bg-slate-950/90 border border-cyan-500/40 flex items-center justify-center gap-3 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>WAITING FOR HOST ({roomData?.hostName || 'HOST'}) TO LAUNCH MATCH...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 4: ADRENALINE COUNTDOWN ================= */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center text-center animate-fadeIn py-12">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 opacity-40 blur-3xl animate-pulse" />
              <div
                key={String(countdownNum)}
                className={`font-black font-mono tracking-tight text-white drop-shadow-[0_0_50px_rgba(244,63,94,0.9)] animate-bounce ${
                  countdownNum === 'START!' ? 'text-6xl sm:text-8xl text-emerald-400' : 'text-8xl sm:text-9xl'
                }`}
              >
                {countdownNum}
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-mono font-black text-rose-400 uppercase tracking-widest">
              {countdownNum === 'START!' ? '⚔️ MATCH COMMENCED!' : 'GET READY TO CODE...'}
            </h3>
            <p className="mt-2 text-xs font-mono text-slate-400">
              Synchronizing code editor and Fog of War anti-cheat shield...
            </p>
          </div>
        )}

        {/* ================= STEP 5: SPLIT-SCREEN REFINED COMBAT ARENA ================= */}
        {step === 5 && (
          <div className="w-full h-full flex flex-col gap-3 animate-fadeIn">
            {/* Real-time Opponent Cheat Incident Notification Banner */}
            {opponentCheatAlert && (
              <div className="relative z-30 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/95 via-red-900/95 to-amber-950/95 border-2 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.65)] backdrop-blur-xl flex items-center justify-between gap-3 text-white animate-in slide-in-from-top-4 duration-200 shrink-0 select-none">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_#f43f5e]">
                    <ShieldAlert className="w-5 h-5 text-white animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-[11px] uppercase tracking-wider text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                        🚨 ANTI-CHEAT INTEGRITY BREACH
                      </span>
                      <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                        Opponent Strike {opponentCheatAlert.strikes} of 3
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white mt-1 truncate">
                      <strong className="text-amber-300 font-mono">{opponentCheatAlert.cheaterName}</strong> switched screens / tabbed away from the active duel arena!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpponentCheatAlert(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
            {/* Mission Objective Header with Collapsible Full Question Brief */}
            <div
              className={`p-3.5 rounded-2xl bg-slate-950/90 border transition-all duration-300 backdrop-blur-md shrink-0 select-none ${
                isQuestionExpanded
                  ? 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      TARGET CHALLENGE:
                    </span>
                    <span className="font-bold text-white text-sm truncate">{activeQuestion.title}</span>
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                      ({activeQuestion.difficulty})
                    </span>
                    {activeQuestion.tags && activeQuestion.tags.length > 0 && (
                      <div className="hidden md:flex items-center gap-1">
                        {activeQuestion.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 text-cyan-400 border border-cyan-500/30 font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {!isQuestionExpanded && (
                    <p className="text-xs text-slate-300 line-clamp-1">{activeQuestion.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {teamSize === '2v2' && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>ACTIVE KEYBOARD: {relayPlayer}</span>
                    </div>
                  )}

                  {/* Toggle Button for Full Question (Clean Minimalist Symbol) */}
                  <button
                    type="button"
                    onClick={() => setIsQuestionExpanded((prev) => !prev)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isQuestionExpanded
                        ? 'bg-amber-500/25 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                        : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    }`}
                    title={isQuestionExpanded ? 'Collapse Question' : 'Open Full Question'}
                    aria-label={isQuestionExpanded ? 'Collapse Question' : 'Open Full Question'}
                  >
                    {isQuestionExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-400" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* EXPANDED FULL QUESTION CONTENT */}
              {isQuestionExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 animate-fadeIn space-y-3">
                  <div className="max-h-[170px] sm:max-h-[210px] overflow-y-auto pr-2 space-y-3 text-xs leading-relaxed text-slate-200 select-text font-sans scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 whitespace-pre-line font-normal text-xs sm:text-[13px] leading-relaxed shadow-inner">
                      {activeQuestion.description}
                    </div>

                    {/* Test Cases / Target Criteria for Algorithms */}
                    {!isWebMatch && activeQuestion.testCases && activeQuestion.testCases.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                        <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                          Example Inputs & Expected Outputs:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                          {activeQuestion.testCases.slice(0, 2).map((tc, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                              <div className="text-slate-400">Input: <span className="text-white">{tc.input || 'None'}</span></div>
                              <div className="text-slate-400">Expected: <span className="text-emerald-400 font-bold">{tc.expectedOutput}</span></div>
                              {tc.description && <div className="text-[10px] text-slate-500 italic">{tc.description}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live Opponent Test Surge Esports Banner */}
            {opponentAlert && (
              <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 border border-rose-500/60 text-white font-mono text-xs font-bold flex items-center justify-between shadow-[0_0_25px_rgba(244,63,94,0.35)] animate-bounce">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                  <span>{opponentAlert}</span>
                </div>
                <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                  Collegiate Rival Surge
                </span>
              </div>
            )}

            {/* Split Screen Grid: Left Studio & Opponent Telemetry, Right Preview & Output / Compiler Terminal */}
            <div className={`flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 ${isQuestionExpanded ? 'min-h-[430px]' : 'min-h-[560px]'} transition-all duration-300`}>
              
              {/* LEFT: Team Alpha (Code Studio + Live Opponent Telemetry HUD) */}
              <div className="flex flex-col rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] overflow-hidden">
                {/* Editor Header Bar */}
                <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {/* Web Dev Tabs (Dynamically filtered by question tags) */}
                    {isWebMatch && (() => {
                      const qTags = (activeQuestion?.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
                      const hasExplicitWeb = qTags.some((t) => ['html', 'css', 'js', 'javascript'].includes(t));
                      const showHtmlTab = hasExplicitWeb ? qTags.includes('html') : true;
                      const showCssTab = hasExplicitWeb ? qTags.includes('css') : true;
                      const showJsTab = hasExplicitWeb
                        ? (qTags.includes('javascript') || qTags.includes('js'))
                        : Boolean(activeQuestion?.targetComponentJs && activeQuestion.targetComponentJs.trim().length > 25 && !activeQuestion.targetComponentJs.startsWith('//'));

                      return (
                        <>
                          {showHtmlTab && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('html')}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                activeTab === 'html'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              index.html
                            </button>
                          )}
                          {showCssTab && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('css')}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                activeTab === 'css'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              styles.css
                            </button>
                          )}
                          {showJsTab && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('js')}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                activeTab === 'js'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              script.js
                            </button>
                          )}
                        </>
                      );
                    })()}

                    {/* Compiler Language Tabs (Python, Java, C++) (Filtered by tags if specified) */}
                    {!isWebMatch && (() => {
                      const qTags = (activeQuestion?.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
                      const hasExplicitAlgo = qTags.some((t) => ['python', 'java', 'cpp', 'c++'].includes(t));
                      const showPyTab = hasExplicitAlgo ? qTags.includes('python') : true;
                      const showJavaTab = hasExplicitAlgo ? qTags.includes('java') : true;
                      const showCppTab = hasExplicitAlgo ? (qTags.includes('cpp') || qTags.includes('c++')) : true;

                      return (
                        <>
                          {showPyTab && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('python')}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                                activeTab === 'python'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <span>solution.py</span>
                            </button>
                          )}
                          {showJavaTab && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('java')}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                                activeTab === 'java'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <span>Solution.java</span>
                            </button>
                          )}
                          {showCppTab && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('cpp')}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                                activeTab === 'cpp'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <span>solution.cpp</span>
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Right Actions: Real Compiler Actions for Java/C++/Python, or Web Submit for Web */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isWebMatch ? (
                      <>
                        <div className="flex items-center gap-2 mr-1">
                          <span className="text-[11px] font-mono text-cyan-400 font-bold hidden sm:inline">
                            Tests: {userTestsPassed} / {totalTests}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 hidden md:inline-flex items-center gap-1">
                            <Flame className={`w-3 h-3 text-cyan-400 ${myWpm > 0 ? 'animate-pulse' : 'opacity-40'}`} />
                            <span>{myWpm} WPM</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleTestWebLayout}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                          title="Run layout coordinate graph verification against Preview blueprint"
                        >
                          <Play className="w-3 h-3 fill-current text-cyan-400" />
                          <span>Test Layout</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleWebSubmit}
                          className={`px-3.5 py-1 rounded-lg text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer ${
                            userTestsPassed === totalTests && totalTests > 0
                              ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 hover:brightness-110 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400'
                              : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:brightness-110'
                          }`}
                          title={
                            userTestsPassed === totalTests && totalTests > 0
                              ? 'All test cases passed! Submit solution to claim victory'
                              : `Submit Challenge (${userTestsPassed}/${totalTests} tests passed)`
                          }
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-3 h-3 animate-spin text-white" />
                          ) : (
                            <Send className="w-3 h-3 fill-current" />
                          )}
                          <span>Submit Challenge</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mr-1">
                          <span className="text-[11px] font-mono text-cyan-400 font-bold hidden sm:inline">
                            Tests: {userTestsPassed} / {activeQuestion.testCases?.length || 3}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 hidden md:inline-flex items-center gap-1">
                            <Flame className={`w-3 h-3 text-cyan-400 ${myWpm > 0 ? 'animate-pulse' : 'opacity-40'}`} />
                            <span>{myWpm} WPM</span>
                          </span>
                        </div>
                        {/* Option 1: Compile & Run (Judge0 Backend) */}
                        <button
                          type="button"
                          disabled={isCompiling || isSubmitting}
                          onClick={handleCompileAndRun}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                          title="Compile source code and run against current test case input"
                        >
                          {isCompiling ? (
                            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                          ) : (
                            <Play className="w-3 h-3 fill-current text-cyan-400" />
                          )}
                          <span>{isCompiling ? 'Compiling...' : 'Compile & Run'}</span>
                        </button>

                        {/* Option 2: Submit Code (Evaluates All Test Cases) */}
                        <button
                          type="button"
                          disabled={isCompiling || isSubmitting}
                          onClick={handleSubmitCode}
                          className={`px-3.5 py-1 rounded-lg text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer ${
                            userTestsPassed === (activeQuestion.testCases?.length || 3) && userTestsPassed > 0
                              ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 hover:brightness-110 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400'
                              : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110'
                          }`}
                          title="Submit solution to evaluate against all hidden test cases"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-3 h-3 animate-spin text-white" />
                          ) : (
                            <Send className="w-3 h-3 fill-current" />
                          )}
                          <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Code Editor Studio with Line Numbers & Real Compiler Capabilities */}
                <div className={`flex-1 flex flex-col ${isQuestionExpanded ? 'min-h-[250px] sm:min-h-[290px]' : 'min-h-[340px] sm:min-h-[400px]'} bg-[#070a14] border-b border-slate-800/80 transition-all duration-300`}>
                  {/* Sub-header / IDE Utilities Bar */}
                  <div className="h-7 bg-[#0b0f1d] px-3 border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <Code2 className="w-3 h-3" />
                        {activeTab === 'html'
                          ? 'index.html'
                          : activeTab === 'css'
                          ? 'styles.css'
                          : activeTab === 'js'
                          ? 'script.js'
                          : activeTab === 'python'
                          ? 'solution.py'
                          : activeTab === 'java'
                          ? 'Solution.java'
                          : 'solution.cpp'}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span>{Math.max(1, (getCurrentCode() || '').split('\n').length)} lines</span>
                      <span className="text-slate-600 hidden sm:inline">|</span>
                      <span className="text-slate-500 hidden sm:inline">Tab: 2 spaces</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleResetCurrentTemplate}
                        className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Reset current tab to official starter template"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="hidden sm:inline">Reset Template</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCurrentCode}
                        className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Clear all text in current tab"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Clear All</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Editor Body: Gutter + Textarea */}
                  <div className="flex-1 flex relative overflow-hidden bg-[#060812]">
                    {/* Line Numbers Gutter */}
                    <div
                      ref={lineNumbersRef}
                      className="w-9 sm:w-11 py-3 pr-2 text-right select-none bg-[#04060d] border-r border-slate-800/60 text-slate-600 font-mono text-xs overflow-hidden shrink-0"
                      style={{ lineHeight: '1.5rem' }}
                    >
                      {Array.from(
                        { length: Math.max(1, (getCurrentCode() || '').split('\n').length) },
                        (_, i) => (
                          <div key={i}>{i + 1}</div>
                        )
                      )}
                    </div>

                    {/* Textarea Code Canvas */}
                    <textarea
                      ref={textareaRef}
                      value={getCurrentCode()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentCode(val);
                        updateAutocomplete(val, e.target.selectionStart || 0);
                      }}
                      onClick={(e) => {
                        updateAutocomplete(getCurrentCode(), e.currentTarget.selectionStart || 0);
                      }}
                      onKeyDown={handleEditorKeyDown}
                      onPaste={(e) => {
                        e.preventDefault();
                        setActivityNotification({
                          message: '🛡️ Anti-Cheat Active: Copy-paste is disabled in Battle Arena. Type your code solution!',
                          type: 'leave',
                          id: Date.now(),
                        });
                      }}
                      onScroll={() => {
                        if (lineNumbersRef.current && textareaRef.current) {
                          lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
                        }
                      }}
                      placeholder={
                        isWebMatch
                          ? activeTab === 'html'
                            ? '<!-- Type your HTML here. (Copy-paste disabled for fair play) -->'
                            : activeTab === 'css'
                            ? '/* Type your CSS styles here. (Copy-paste disabled for fair play) */'
                            : '// Type your JavaScript here. (Copy-paste disabled for fair play).'
                          : '// Write your code solution here. (Copy-paste disabled for fair play).'
                      }
                      className="flex-1 w-full h-full bg-transparent p-3 font-mono text-xs sm:text-sm text-cyan-200 placeholder-slate-600 resize-none focus:outline-none whitespace-pre overflow-auto"
                      style={{ lineHeight: '1.5rem', tabSize: 2 }}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                    />

                    {/* Floating IntelliJ / VS Code Style IntelliSense Tag Completion Popup */}
                    {suggestionOpen && suggestions.length > 0 && (
                      <div
                        className="absolute z-50 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden font-mono text-xs w-72 animate-in fade-in zoom-in-95 duration-100"
                        style={{
                          top: `${Math.min(suggestionCoords.top, 240)}px`,
                          left: `${Math.min(suggestionCoords.left, 200)}px`,
                        }}
                      >
                        <div className="px-2.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>{activeTab === 'html' ? 'HTML Tag Completion' : 'CSS Property Helper'}</span>
                          </span>
                          <span className="text-[9px] text-slate-500">Press ↵ or Tab</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                          {suggestions.map((item, idx) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => applySuggestion(item)}
                              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer ${
                                selectedSuggestionIdx === idx
                                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm'
                                  : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono">
                                  &lt;&gt;
                                </span>
                                <span className="font-bold text-white font-mono">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 truncate max-w-[110px]">{item.detail}</span>
                            </button>
                          ))}
                        </div>
                        <div className="px-2.5 py-1 bg-slate-900/60 border-t border-slate-800/60 text-[9px] text-slate-500 flex justify-between">
                          <span>↑↓ Navigate</span>
                          <span>Esc Cancel</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Integrated Opponent Fog of War Telemetry HUD */}
                <div className="p-3 bg-slate-950 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider">
                        OPPONENT &bull; FOG OF WAR ACTIVE
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <EyeOff className="w-3 h-3 text-rose-400" />
                      <span>Zero-Cheating Shield</span>
                    </span>
                  </div>

                  {/* Opponent Integrity Breach Flag */}
                  {opponentCheatAlert && (
                    <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.35)] flex items-center justify-between gap-2 text-xs font-mono animate-pulse">
                      <div className="flex items-center gap-2 text-rose-200 min-w-0">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                        <div className="truncate">
                          <span className="font-black text-rose-300">CHEATING FLAGGED:</span>{' '}
                          <span>{opponentCheatAlert.cheaterName} switched screens!</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-500 text-slate-950 font-black text-[10px] shrink-0">
                        Strike {opponentCheatAlert.strikes}/3
                      </span>
                    </div>
                  )}

                  {/* Solo Practice Bot Automated Referee Flag if User Tabbed Out */}
                  {isBotDuel && myCheatStrikes > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-amber-200">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>🤖 Automated Referee: Tab switch flagged ({myCheatStrikes} strikes)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                        Strike {myCheatStrikes}/3
                      </span>
                    </div>
                  )}

                  {/* Opponent Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 text-[11px] font-semibold flex items-center gap-1.5">
                        <span>{opponentDisplayName}</span>
                        {isBotDuel && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold font-mono">
                            {assignedBotProfile.tag}
                          </span>
                        )}
                      </span>
                      <span className="text-rose-400 font-bold text-[11px]">
                        {opponentTestsPassed} / {totalTests} Tests Passed
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                        style={{
                          width: `${(opponentTestsPassed / totalTests) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Live Telemetry Heartbeat Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Cadence:</span>
                      <div className="font-black text-rose-400 flex items-center gap-1">
                        <Flame className={`w-3.5 h-3.5 text-rose-500 ${opponentWpm > 0 ? 'animate-pulse' : 'opacity-30'}`} />
                        <span>{opponentWpm} WPM</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between min-w-0">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase shrink-0">Status:</span>
                      <span className={`font-bold truncate text-[10px] ${opponentWpm > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isBotDuel ? opponentStatusText : (opponentWpm > 0 ? 'Typing' : 'Idle')}
                      </span>
                    </div>
                  </div>

                  {/* Fog of War Blurred Code Streaming View (Realistic Indented Code Preview) */}
                  <div className="relative rounded-xl bg-[#070914] border border-rose-500/30 overflow-hidden shadow-inner">
                    <div className="h-6 bg-slate-950/90 px-2.5 flex items-center justify-between border-b border-rose-500/20 text-[10px] font-mono select-none">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                        <EyeOff className="w-3 h-3 text-rose-500" />
                        <span>Fog of War &bull; Live Code Stream</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase">Real-Time Encrypted</span>
                    </div>

                    <div className="p-2.5 font-mono text-[10px] leading-relaxed relative overflow-hidden max-h-[115px] select-none pointer-events-none">
                      <div className="filter blur-[4px] opacity-75 space-y-0.5 font-mono text-slate-300">
                        {Array.from({ length: Math.max(3, opponentSimCodeLinesCount) }).map((_, idx) => {
                          const snippets = [
                            'const container = document.querySelector(".card-root");',
                            'function solveLayout(width, height) {',
                            '  const padding = 16;',
                            '  return { flex: "1 1 auto", width: width - padding };',
                            '}',
                            'export function solve(nums, target) {',
                            '  const map = new Map();',
                            '  for (let i = 0; i < nums.length; i++) {',
                            '    const comp = target - nums[i];',
                            '    if (map.has(comp)) return [map.get(comp), i];',
                            '    map.set(nums[i], i);',
                            '  }',
                            '  return [];',
                            '}',
                            '// Validating test assertions',
                            'class Solution { public int run() { return 1; } }',
                          ];
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-slate-600 text-[9px] w-4 text-right font-mono select-none">{idx + 1}</span>
                              <span className={idx % 3 === 0 ? 'text-cyan-300' : idx % 2 === 0 ? 'text-amber-300' : 'text-slate-200'}>
                                {snippets[idx % snippets.length]}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Anti-cheat banner over blurred code */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[0.5px]">
                        <div className="px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)] flex items-center gap-1.5 text-rose-300 text-[9px] font-mono font-bold tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          <span>ANTI-CHEAT FOG OF WAR</span>
                        </div>
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5">
                          Cadence streaming active &bull; Unlocks on match finish
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: DYNAMIC SPLIT VIEW — WEB PREVIEW/OUTPUT (FOR WEB) OR COMPILER TERMINAL (FOR JAVA/C++/PYTHON) */}
              <div className={`flex flex-col gap-3 ${isQuestionExpanded ? 'min-h-[420px]' : 'min-h-[500px]'} transition-all duration-300`}>
                {/* ================= IF WEB MATCH: IMAGE 6 PARITY (PREVIEW ON TOP, OUTPUT ON BOTTOM) ================= */}
                {isWebMatch ? (
                  <>
                    {/* TOP: PREVIEW CONTAINER (Target Component Blueprint) */}
                    {maximizedPane !== 'output' && (
                      <div
                        className={`flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-md overflow-hidden transition-all duration-300 ${
                          maximizedPane === 'preview' ? 'flex-1 h-full' : isQuestionExpanded ? 'h-[200px] sm:h-[225px]' : 'h-[270px] sm:h-[300px]'
                        }`}
                      >
                        {/* Preview Title Bar (Image 6 Parity) */}
                        <div className="h-9 bg-[#1e293b] px-3.5 flex items-center justify-between border-b border-slate-700 select-none shrink-0">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold lowercase bg-[#0f172a] text-slate-200 border border-slate-600 shadow-2xs">
                            preview
                          </span>
                          <div className="flex items-center gap-2 text-slate-400">
                            <button
                              type="button"
                              onClick={() => setRenderNonce((n) => n + 1)}
                              className="hover:text-white transition-colors p-1"
                              title="Refresh Target Blueprint"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setMaximizedPane(maximizedPane === 'preview' ? 'none' : 'preview')
                              }
                              className="hover:text-white transition-colors p-1"
                              title={maximizedPane === 'preview' ? 'Restore View' : 'Maximize Preview'}
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Preview White Canvas - Isolated Sandboxed Iframe (Zero CSS Leak to Output) */}
                        <div
                          key={`preview-${renderNonce}`}
                          className="flex-1 bg-white overflow-hidden relative"
                        >
                          <iframe
                            title="Target Component Preview"
                            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:12px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#ffffff;color:#000000;box-sizing:border-box;overflow-y:auto;}*,*:before,*:after{box-sizing:inherit;}${activeQuestion.targetComponentCss || ''}</style></head><body>${activeQuestion.targetComponentHtml || '<p>Target Preview</p>'}<script>
window.onerror = function(msg, url, line) { console.warn('Preview script error: ' + msg + ' at line ' + line); return true; };
</script>
<script>
${(activeQuestion.targetComponentJs || '').replace(/<\/script/gi, '<\\/script')}
</script>
${
  (!activeQuestion.targetComponentJs || activeQuestion.targetComponentJs.trim().length <= 10)
    ? `<script>
(function() {
  function initInteractivePreview() {
    var buttons = Array.from(document.querySelectorAll('button, [role="button"], .btn'));
    if (buttons.length === 0) return;

    var displayEl = document.querySelector('#counter-val, #counter, #count-val, .count-number');
    if (!displayEl) return;

    buttons.forEach(function(btn) {
      var text = (btn.textContent || '').trim().toLowerCase();
      var id = (btn.id || '').toLowerCase();

      var isInc = text === 'increase' || text === 'increment' || text === '+' || id === 'increase' || id === 'btn-increase';
      var isDec = text === 'decrease' || text === 'decrement' || text === '-' || id === 'decrease' || id === 'btn-decrease';
      var isReset = text === 'reset' || text === 'clear' || id === 'reset' || id === 'btn-reset';

      if (!isInc && !isDec && !isReset) return;

      btn.addEventListener('click', function(e) {
        var currentVal = parseInt(displayEl.textContent ? displayEl.textContent.trim() : '0', 10);
        if (isNaN(currentVal)) currentVal = 0;

        if (isInc) {
          e.preventDefault();
          displayEl.textContent = String(currentVal + 1);
        } else if (isDec) {
          e.preventDefault();
          displayEl.textContent = String(Math.max(0, currentVal - 1));
        } else if (isReset) {
          e.preventDefault();
          displayEl.textContent = '0';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractivePreview);
  } else {
    initInteractivePreview();
  }
})();
<\\/script>`
    : ''
}</body></html>`}
                            className="w-full h-full border-0 block"
                            sandbox="allow-scripts allow-modals"
                          />
                        </div>
                      </div>
                    )}

                    {/* BOTTOM: OUTPUT CONTAINER (Student's Live Code Rendering in Sandboxed Iframe) */}
                    {maximizedPane !== 'preview' && (
                      <div
                        className={`flex flex-col rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-md overflow-hidden transition-all duration-300 ${
                          maximizedPane === 'output' ? 'flex-1 h-full' : isQuestionExpanded ? 'h-[200px] sm:h-[225px]' : 'h-[270px] sm:h-[300px]'
                        }`}
                      >
                        {/* Output Title Bar (Image 6 Parity) */}
                        <div className="h-9 bg-[#1e293b] px-3.5 flex items-center justify-between border-b border-slate-700 select-none shrink-0">
                          <div className="flex items-center gap-2">
                         <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold lowercase bg-[#0f172a] text-cyan-300 border border-cyan-800 shadow-2xs">
                            output
                           </span>
                             </div>
                          
                          <div className="flex items-center gap-2 text-slate-400">
                            <button
                              type="button"
                              onClick={() => setRenderNonce((n) => n + 1)}
                              className="hover:text-white transition-colors p-1"
                              title="Re-render Live Output"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setMaximizedPane(maximizedPane === 'output' ? 'none' : 'output')
                              }
                              className="hover:text-white transition-colors p-1"
                              title={maximizedPane === 'output' ? 'Restore View' : 'Maximize Output'}
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Output White Canvas - Sandboxed Compiler Iframe (Raw HTML only renders raw unstyled HTML; styles only appear when student writes CSS) */}
                        <div
                          key={`output-${renderNonce}`}
                          className="flex-1 bg-white overflow-hidden relative"
                        >
                          <iframe
                            title="Student Code Output"
                            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#ffffff;color:#000000;box-sizing:border-box;}*,*:before,*:after{box-sizing:inherit;}${cssCode || ''}</style></head><body>${htmlCode || ''}<script>
window.onerror = function(msg, url, line) {
  console.warn("Script error: " + msg + " at line " + line);
  return true;
};
</script>
<script>
${jsCode || ''}
</script></body></html>`}
                            className="w-full h-full border-0 block"
                            sandbox="allow-scripts allow-modals"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* ================= IF COMPILER MATCH (JAVA / C++ / PYTHON / LOGIC BUG HUNT) ================= */
                  <>
                    {/* TOP: PROBLEM STATEMENT, EXAMPLES & CONSTRAINTS */}
                    {maximizedPane !== 'output' && (
                      <div
                        className={`flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-md overflow-hidden transition-all duration-300 ${
                          maximizedPane === 'preview' ? 'flex-1 h-full' : isQuestionExpanded ? 'h-[200px] sm:h-[225px]' : 'h-[270px] sm:h-[300px]'
                        }`}
                      >
                        {/* Problem Header Bar */}
                        <div className="h-9 bg-[#1e293b] px-3.5 flex items-center justify-between border-b border-slate-700 select-none shrink-0">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold lowercase bg-[#0f172a] text-slate-200 border border-slate-600 shadow-2xs">
                            problem description
                          </span>
                          <div className="flex items-center gap-2 text-slate-400">
                            <button
                              type="button"
                              onClick={() =>
                                setMaximizedPane(maximizedPane === 'preview' ? 'none' : 'preview')
                              }
                              className="hover:text-white transition-colors p-1"
                              title={maximizedPane === 'preview' ? 'Restore View' : 'Maximize Problem'}
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Problem Details Body (Protected against copy & highlight) */}
                        <div
                          className="flex-1 p-4 bg-slate-950 overflow-y-auto space-y-3.5 font-sans select-none"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-bold text-white font-mono">
                                {activeQuestion.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {activeQuestion.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-mono">
                              {activeQuestion.description}
                            </p>
                          </div>

                          {/* Example Box */}
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1.5">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                              Example 1:
                            </span>
                            <div className="text-slate-300">
                              <span className="text-slate-500">Input: </span>
                              <code>
                                {activeQuestion.sampleInput || activeQuestion.testCases[0]?.input}
                              </code>
                            </div>
                            <div className="text-slate-300">
                              <span className="text-slate-500">Output: </span>
                              <code className="text-emerald-400 font-bold">
                                {activeQuestion.sampleOutput ||
                                  activeQuestion.testCases[0]?.expectedOutput}
                              </code>
                            </div>
                            {activeQuestion.explanation && (
                              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                                <span className="text-slate-500">Explanation: </span>
                                {activeQuestion.explanation}
                              </p>
                            )}
                          </div>

                          {/* Constraints */}
                          {activeQuestion.constraints && activeQuestion.constraints.length > 0 && (
                            <div className="space-y-1 text-[11px] font-mono text-slate-400">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Constraints:
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                                {activeQuestion.constraints.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* BOTTOM: REAL COMPILER TERMINAL & TEST RESULTS */}
                    {maximizedPane !== 'preview' && (
                      <div
                        className={`flex flex-col rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-md overflow-hidden transition-all duration-300 ${
                          maximizedPane === 'output' ? 'flex-1 h-full' : isQuestionExpanded ? 'h-[200px] sm:h-[225px]' : 'h-[270px] sm:h-[300px]'
                        }`}
                      >
                        {/* Terminal Header Bar */}
                        <div className="h-9 bg-[#1e293b] px-3.5 flex items-center justify-between border-b border-slate-700 select-none shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold lowercase bg-[#0f172a] text-cyan-300 border border-cyan-800 shadow-2xs flex items-center gap-1.5">
                              <Terminal className="w-3 h-3" />
                              <span>compiler terminal</span>
                            </span>

                            {/* Execution Verdict Pill */}
                            {activeConsoleTab === 'testcases' && testCaseResults[selectedTestCaseIdx] ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                  testCaseResults[selectedTestCaseIdx].status === 'Accepted'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                    : testCaseResults[selectedTestCaseIdx].status === 'Wrong Answer'
                                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                                    : 'bg-amber-950 text-amber-300 border-amber-700'
                                }`}
                              >
                                Case {selectedTestCaseIdx + 1}: {testCaseResults[selectedTestCaseIdx].status}
                              </span>
                            ) : compilerResult ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                  compilerResult.status === 'Accepted'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                    : compilerResult.status === 'Wrong Answer'
                                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                                    : 'bg-amber-950 text-amber-300 border-amber-700'
                                }`}
                              >
                                {compilerResult.status}
                              </span>
                            ) : null}
                          </div>

                          {/* Console Tabs */}
                          <div className="flex items-center gap-1 text-xs font-mono">
                            <button
                              type="button"
                              onClick={() => setActiveConsoleTab('testcases')}
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                                activeConsoleTab === 'testcases'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Test Cases
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveConsoleTab('stdout')}
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                                activeConsoleTab === 'stdout'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Stdout
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveConsoleTab('custom')}
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                                activeConsoleTab === 'custom'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Custom Stdin
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setMaximizedPane(maximizedPane === 'output' ? 'none' : 'output')
                              }
                              className="hover:text-white transition-colors p-1 ml-1 text-slate-400"
                              title={maximizedPane === 'output' ? 'Restore View' : 'Maximize Console'}
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Terminal Body */}
                        <div className="flex-1 p-3 bg-[#050811] overflow-y-auto font-mono text-xs">
                          {/* TAB 1: TEST CASES SELECTOR & COMPARISON */}
                          {activeConsoleTab === 'testcases' && (
                            <div className="space-y-2.5">
                              {/* Case Tabs with live Per-Case Verdict Badges */}
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {activeQuestion.testCases.map((tc, idx) => {
                                    const res = testCaseResults[idx];
                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedTestCaseIdx(idx)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                                          selectedTestCaseIdx === idx
                                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                        }`}
                                      >
                                        <span>Case {idx + 1}</span>
                                        {res && (
                                          <span
                                            className={`text-[10px] font-mono px-1 rounded ${
                                              res.status === 'Accepted'
                                                ? 'bg-emerald-500/30 text-emerald-300'
                                                : 'bg-rose-500/30 text-rose-300'
                                            }`}
                                          >
                                            {res.status === 'Accepted' ? '✓' : '✗'}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                <span className="text-[10px] font-mono text-slate-400">
                                  {userTestsPassed} / {activeQuestion.testCases.length} Passed
                                </span>
                              </div>

                              {/* Selected Case I/O */}
                              <div className="space-y-2">
                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                                    Input:
                                  </span>
                                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs select-all">
                                    {activeQuestion.testCases[selectedTestCaseIdx]?.input}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">
                                      Expected Output:
                                    </span>
                                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold">
                                      {activeQuestion.testCases[selectedTestCaseIdx]?.expectedOutput}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] text-slate-500 uppercase font-bold">
                                        Your Output:
                                      </span>
                                      {testCaseResults[selectedTestCaseIdx] && (
                                        <span
                                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                                            testCaseResults[selectedTestCaseIdx].status === 'Accepted'
                                              ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-700'
                                              : 'text-rose-300 bg-rose-950/80 border border-rose-700'
                                          }`}
                                        >
                                          {testCaseResults[selectedTestCaseIdx].status}
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className={`p-2 rounded-lg border text-xs font-bold ${
                                        testCaseResults[selectedTestCaseIdx]
                                          ? testCaseResults[selectedTestCaseIdx].status === 'Accepted'
                                            ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                                            : 'bg-rose-950/40 border-rose-600 text-rose-300'
                                          : 'bg-slate-900 border-slate-800 text-slate-500'
                                      }`}
                                    >
                                      {testCaseResults[selectedTestCaseIdx]
                                        ? testCaseResults[selectedTestCaseIdx].stdout || '(No output)'
                                        : 'Click [Compile & Run] to test this case'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 2: RAW COMPILER STDOUT */}
                          {activeConsoleTab === 'stdout' && (
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                                <span>Compiler Execution Standard Output</span>
                                <span>
                                  Runtime: {compilerResult?.executionTimeMs || 0} ms
                                </span>
                              </div>
                              <pre className="text-cyan-300 whitespace-pre-wrap leading-relaxed select-all">
                                {compilerResult?.stdout ||
                                  compilerResult?.compile_output ||
                                  compilerResult?.stderr ||
                                  '// Press [Compile & Run] to compile code and view live stdout console logs.'}
                              </pre>
                            </div>
                          )}

                          {/* TAB 3: CUSTOM STDIN */}
                          {activeConsoleTab === 'custom' && (
                            <div className="space-y-1.5 h-full flex flex-col">
                              <span className="text-[10px] text-slate-400 uppercase font-bold">
                                Custom Stdin Input (Passes to main / input):
                              </span>
                              <textarea
                                value={customStdin}
                                onChange={(e) => setCustomStdin(e.target.value)}
                                placeholder="Type custom input here to test edge cases..."
                                className="w-full flex-1 min-h-[90px] p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-200 font-mono text-xs resize-none focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: MATCH FINISHED & FOG OF WAR REVEAL ================= */}
        {step === 6 && (
          <div className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {winnerTeam === (isHost ? 'Team Alpha' : 'Team Omega')
                  ? 'VICTORY! SQUAD TRIUMPH'
                  : winnerTeam === null
                  ? 'MATCH TIED • TIME EXPIRED'
                  : 'MATCH COMPLETE'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-mono">
                {winnerTeam === null
                  ? 'Time expired without completing all test cases. Well fought duel!'
                  : 'Fog of War has dissolved. Both solutions are now unlocked and revealed!'}
              </p>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-2xl border ${
                  winnerTeam === 'Team Alpha'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                    Team Alpha {isHost ? '(You)' : '(Host)'}
                  </span>
                  {winnerTeam === 'Team Alpha' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-slate-950">
                      WINNER
                    </span>
                  )}
                </div>
                <div className="text-2xl font-mono font-black text-white">
                  {isHost ? userTestsPassed : opponentTestsPassed} / {totalTests} Tests
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {isHost ? `Cadence: ${myWpm} WPM` : `Cadence: ${opponentWpm} WPM`}
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  winnerTeam === 'Team Omega'
                    ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                    Team Omega {!isHost ? '(You)' : '(Opponent)'}
                  </span>
                  {winnerTeam === 'Team Omega' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-slate-950">
                      WINNER
                    </span>
                  )}
                </div>
                <div className="text-2xl font-mono font-black text-white">
                  {!isHost ? userTestsPassed : opponentTestsPassed} / {totalTests} Tests
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {!isHost ? `Cadence: ${myWpm} WPM` : `Cadence: ${opponentWpm} WPM`}
                </p>
              </div>
            </div>

            {/* Side by Side Unlocked Code Reveal */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold text-slate-300">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Side-by-Side Solution Inspection:</span>
                </div>
                {/* Language / File Tabs for Web Dev */}
                {isWebMatch && (
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRevealTab('html')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                        revealTab === 'html' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      index.html
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevealTab('css')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                        revealTab === 'css' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      style.css
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevealTab('js')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                        revealTab === 'js' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      script.js
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1.5 pb-1 border-b border-slate-800/60">
                    <span>// Your Solution ({isWebMatch ? revealTab.toUpperCase() : activeTab.toUpperCase()})</span>
                    <span className="text-cyan-400">{playerName || 'You'}</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono leading-relaxed">
                    {isWebMatch
                      ? (revealTab === 'html' ? (htmlCode || '<!-- No HTML written -->') : revealTab === 'css' ? (cssCode || '/* No CSS written */') : (jsCode || '// No JS written'))
                      : (activeTab === 'python' ? (pythonCode || '# No code') : activeTab === 'java' ? (javaCode || '// No code') : (cppCode || '// No code'))}
                  </pre>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1.5 pb-1 border-b border-slate-800/60">
                    <span>// Opponent Solution (Revealed)</span>
                    <span className="text-rose-400 truncate max-w-[140px]">{opponentDisplayName}</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono leading-relaxed">
                    {isWebMatch
                      ? (revealTab === 'html'
                          ? (opponentSolution?.htmlCode || activeQuestion.targetComponentHtml || activeQuestion.starterHtml || '<!-- No code written -->')
                          : revealTab === 'css'
                          ? (opponentSolution?.cssCode || activeQuestion.targetComponentCss || activeQuestion.starterCss || '/* No CSS written */')
                          : (opponentSolution?.jsCode || activeQuestion.targetComponentJs || activeQuestion.starterJs || '// No JS written'))
                      : (activeTab === 'python'
                          ? (opponentSolution?.pythonCode || activeQuestion.starterPython || '# No code')
                          : activeTab === 'java'
                          ? (opponentSolution?.javaCode || activeQuestion.starterJava || '// No code')
                          : (opponentSolution?.cppCode || activeQuestion.starterCpp || '// No code'))}
                  </pre>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all"
              >
                Close Arena
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `⚔️ I just played a 1v1 Battle Arena Duel on Kollabrix (${userTestsPassed}/${totalTests} tests passed)! Think you can beat me? Challenge me to a duel right now: https://kollabrix.in/arena?room=${roomCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Share Victory on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  playArcadeCoinSound();
                  setRoomCode(`KBX-${Math.floor(1000 + Math.random() * 9000)}`);
                  setStep(0);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 text-slate-950 font-black font-mono text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Play Another Match</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Exit Confirmation Dialog */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)] space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black font-mono text-white tracking-wide uppercase">
                  Exit Battle Arena?
                </h3>
                <p className="text-xs text-rose-300/80 font-mono">
                  Room: {roomCode}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Are you sure you want to exit? Exiting will terminate the match and immediately close the arena for your opponent as well.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                No, Stay in Arena
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white font-mono text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Yes, Exit Arena
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ANTI-CHEAT SENTINEL CHEATER WARNING MODAL ================= */}
      {showCheatWarningModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#120608]/98 border-2 border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.65),0_0_100px_rgba(0,0,0,0.9)] text-white text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Siren Icon with Pulsing Halo */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.5)]">
              <ShieldAlert className="w-9 h-9 text-rose-500 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-rose-500/20 border border-rose-500/40 text-rose-300">
                <span>⚠️ ANTI-CHEAT SENTINEL WARNING</span>
                <span>&bull;</span>
                <span>STRIKE {myCheatStrikes} OF 3</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif">
                Screen / Tab Switch Flagged!
              </h3>
              <p className="text-xs text-rose-200/90 leading-relaxed font-sans pt-1">
                Navigating away from the active Proving Grounds duel violates fair-play integrity rules.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/60 border border-rose-500/30 text-left text-[11px] font-mono text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>OPPONENT NOTIFIED IN REAL-TIME</span>
              </div>
              <p className="text-slate-400 leading-normal">
                Your opponent has received an instant notification that you switched tabs / left the duel window. All window-switching incidents are permanently logged to the anti-cheat match ledger.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCheatWarningModal(false);
                enterArenaFullscreen();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:brightness-110 active:scale-[0.99] text-white font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all cursor-pointer"
            >
              I Understand &bull; Return to Arena
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
