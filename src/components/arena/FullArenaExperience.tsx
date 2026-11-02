'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Crosshair,
  Activity,
  Shield,
  ShieldCheck,
  Wifi,
  UserCheck,
  Laptop,
  Lock,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ArenaBackgroundMatrix } from '@/components/arena/ArenaBackgroundMatrix';
import { ArenaCategory, DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';
import { selectBestQuestion } from '@/lib/arena/questionSelector';
import {
  playVictorySound,
  playArcadeCoinSound,
  playCompileSuccessSound,
  playCompileErrorSound,
  playTacticalSelectSound,
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

export function FullArenaExperience({
  onClose,
  initialRoomCode,
  initialQuestion,
  currentUser,
}: FullArenaExperienceProps) {
  // Navigation Steps:
  // 0: Arena Gateway (Create Private Room vs Join with Code/Link)
  // 1: Name & Team Size (1v1 / 2v2)
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
        const stored = sessionStorage.getItem('kollabrix_arena_pid');
        if (stored) return stored;
        const fresh = `pilot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        sessionStorage.setItem('kollabrix_arena_pid', fresh);
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
    } else if (step > 0) {
      // Security defense: Never allow unauthenticated users past Step 0
      setStep(0);
    }
  }, [user, profile, step]);

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
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(300);
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

        // Determine host role
        const isHostPlayer = Boolean(
          rm.hostId === myPlayerId ||
          rm.alphaPlayers?.[0]?.id === myPlayerId ||
          (playerName && rm.hostName && rm.hostName.toLowerCase() === playerName.toLowerCase())
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
    } else if (step === 0) {
      try {
        sessionStorage.removeItem('kollabrix_arena_session');
      } catch {}
    }
  }, [step, roomCode, isHost, myPlayerId, playerName]);

  // Exit Arena with confirmation and mutual opponent termination
  const handleExitArena = () => {
    // If on Gateway (Step 0), Pilot Dossier (Step 1), Arena Picker (Step 2), or Victory (Step 6), exit immediately
    if (step < 3 || step === 6 || !roomCode) {
      try {
        sessionStorage.removeItem('kollabrix_arena_session');
        window.history.replaceState(null, '', '/arena');
      } catch {}
      onClose();
      return;
    }
    // In Lobby (Step 3), Countdown (Step 4), or Battlefield (Step 5), ask confirmation
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
  const [winnerTeam, setWinnerTeam] = useState<'Team Alpha' | 'Team Omega' | null>(null);

  // Real-time Keystrokes & Cadence Tracking
  const [myWpm, setMyWpm] = useState<number>(0);
  const recentKeystrokesRef = useRef<number[]>([]);
  const lastKeystrokeTimeRef = useRef<number>(0);
  const lastOpponentActivityTimeRef = useRef<number>(0);

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

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    roomData?.alphaPlayers?.some(
      (p: any) => p.id === myPlayerId || (playerName && p.name?.toLowerCase() === playerName.toLowerCase())
    )
  );
  const mySquad: 'alpha' | 'omega' = isUserInAlpha ? 'alpha' : isHost ? 'alpha' : 'omega';

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

  const opponentDisplayName = isBotDuel
    ? 'ByteRival Bot (Practice AI)'
    : opponentPlayer?.name
      ? `${opponentPlayer.name} (Opponent)`
      : mySquad === 'alpha'
        ? (isBotOpponentAdded ? 'ByteRival Bot (Practice AI)' : 'Waiting for Opponent...')
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
      setSelectedTags([bugDomain === 'web' ? 'bug_web' : 'bug_logic']);
      setActiveTab(bugDomain === 'web' ? 'html' : 'python');
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
                  team: data.room.alphaPlayers?.some((p: any) => p.name === playerName) ? 'alpha' : 'omega',
                },
              });
              joinChannel.send({
                type: 'broadcast',
                event: 'room_sync',
                payload: { room: data.room },
              });
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

    // 1. Advance immediately to Step 3 for instant 0ms transition without awaiting network roundtrip
    setStep(3);

    // 2. Select initial best matching question locally so question & starter code are ready instantly
    try {
      const matchTime = Number(timeLimit) || 300;
      const initialChosen = selectBestQuestion(DEFAULT_ARENA_QUESTIONS, {
        arena,
        bugDomain: arena === 'bug_hunt' ? bugDomain : undefined,
        selectedTags,
        difficulty,
        timeLimit: matchTime,
      });

      if (initialChosen) {
        const enriched = enrichQuestion(initialChosen);
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
      }
    } catch (e) {
      console.warn('Local question pre-selection notice:', e);
    }

    // 3. Register authoritative room on server asynchronously
    try {
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
          selectedTags,
          difficulty,
          timeLimit,
          isBotEnabled: isBotOpponentAdded,
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

    const currentStep = stepRef.current;

    // If in Lobby (Step 3) and Host started match, advance joiner to Step 4 (Countdown) or Step 5 (Battlefield)
    if (currentStep === 3 && (incomingRoom.status === 'starting' || incomingRoom.status === 'in_progress')) {
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
        .subscribe();

      channelRef.current = channel;
    } catch (wsErr) {
      console.warn('Realtime WebSocket init notice:', wsErr);
    }

    // 2. High-frequency background HTTP safety check (1s in lobby & countdown, 3s in match)
    const pollInterval = setInterval(async () => {
      // In Step 3 & 4 (Lobby waiting & Countdown), DO NOT skip when document.hidden
      if (stepRef.current > 4 && typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch(`/api/arena/rooms?code=${roomCode}&_t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.room) return;
        applyRoomDataState(data.room);
      } catch (err) {}
    }, stepRef.current <= 4 ? 1000 : 3000);

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

    // Immediate WebSocket broadcast to opponent (<40ms)
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'progress_sync',
          payload: { playerId: myPlayerId, testsPassed: passedCount, wpm: activeWpm },
        });
      } catch {}
    }

    // Background HTTP state persistence
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

    // 1. If room already has a verified question matching the arena, reuse it for 100% host/joiner parity!
    if (
      roomData?.question &&
      roomData.question.arena === arena &&
      (arena !== 'bug_hunt' || !bugDomain || !roomData.question.bugDomain || roomData.question.bugDomain === bugDomain)
    ) {
      chosen = {
        ...roomData.question,
        timeLimitSeconds: matchDuration,
      };
    } else {
      // 2. Fetch question matching exact arena, tags, difficulty, and duration
      try {
        const queryParams = new URLSearchParams({
          arena,
          difficulty,
          tags: selectedTags.join(','),
          timeLimit: String(matchDuration),
          _rnd: String(Date.now()),
        });
        if (arena === 'bug_hunt' && bugDomain) queryParams.set('bugDomain', bugDomain);

        const res = await fetch(`/api/arena/questions?${queryParams.toString()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            chosen = data.questions[0];
          }
        }
      } catch (e) {}

      if (!chosen) {
        chosen = selectBestQuestion(DEFAULT_ARENA_QUESTIONS, {
          arena,
          bugDomain,
          selectedTags,
          difficulty,
          timeLimit: matchDuration,
        });
      }
    }

    const finalChosen: DuelQuestion = enrichQuestion({
      ...(chosen || DEFAULT_ARENA_QUESTIONS[0]),
      timeLimitSeconds: matchDuration,
    });

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

    const updatedRoom = {
      ...roomData,
      status: 'starting',
      question: finalChosen,
      timeLimit: matchDuration,
      difficulty,
    };
    setRoomData(updatedRoom);

    // Tell server to trigger match start for ALL participants in this room!
    try {
      // Immediate Sub-50ms WebSocket broadcast to opponent
      if (channelRef.current) {
        try {
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
          payload: { question: finalChosen, timeLimit: matchDuration },
        }),
      });
      trackEvent('arena_match_started', { code: roomCode, format: teamSize, arena, difficulty });
    } catch {}

    // Advance to countdown
    transitionStep(4);
    setCountdownNum(3);
  };

  // 3-2-1 Countdown Timer
  useEffect(() => {
    if (step !== 4) return;

    if (countdownNum > 1) {
      const timer = setTimeout(() => {
        setCountdownNum((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished: Transition to Battlefield (Step 5)
      const timer = setTimeout(() => {
        transitionStep(5);

        // Authoritatively notify server and all peers that match is in progress!
        if (roomCode) {
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
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdownNum, roomCode, roomData]);

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

  // Opponent Telemetry Simulator (Fog of War) - STRICTLY for Solo Practice vs AI Bot
  useEffect(() => {
    if (step !== 5) return;
    // CRITICAL: NEVER run simulation during real human vs human multiplayer duels!
    if (!isBotDuel) return;

    const oppInterval = setInterval(() => {
      // In practice mode, simulated bot types at variable pacing
      setOpponentWpm(Math.floor(45 + Math.random() * 25));

      // Bot solves tests slowly during solo practice
      const roll = Math.random();
      if (roll < 0.15 && opponentTestsPassed < totalTests) {
        setOpponentTestsPassed((prev) => {
          const next = prev + 1;
          setOpponentAlert(`🔥 ByteRival Bot passed Test Case ${next}/${totalTests}!`);
          setTimeout(() => setOpponentAlert(''), 3500);
          if (next >= totalTests) {
            setStep(6);
            setWinnerTeam('Team Omega');
            playVictorySound();
          }
          return next;
        });
      }
    }, 9000);

    return () => clearInterval(oppInterval);
  }, [step, isBotDuel, opponentTestsPassed, totalTests]);

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
    <div className="fixed inset-0 z-[9990] bg-[#05070e] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Real-time Animated Cyber Arena Background Canvas */}
      <ArenaBackgroundMatrix />

      {/* Top Cyber Navigation Bar */}
      <header className="relative z-20 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
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
                <span>BATTLE ARENA</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">
                {teamSize === '1v1' ? '1v1 DUEL' : '2v2 RELAY'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
              Room {roomCode} &bull; Anti-Cheat Fog of War Protected
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
      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-center items-center p-4 sm:p-6">
        
        {/* ================= STEP 0: ARENA LOBBY GATEWAY (CREATE ROOM OR JOIN WITH CODE/LINK) ================= */}
        {step === 0 && (
          <div className="w-full max-w-4xl p-6 sm:p-8 md:p-10 rounded-3xl bg-slate-950/95 border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-fadeIn space-y-8">
            {/* Top Gateway Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>ARENA PROTOCOL 00 // MULTIPLAYER GATEWAY</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono uppercase">
                Choose Battle Entry Protocol
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Host a private multiplayer duel for your friends, or enter a room code or invite link to join an active squad.
              </p>
            </div>

            {/* Authentication Gate Notice if Student is Not Signed In */}
            {!user && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] animate-pulse">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                        Collegiate Account Login Required
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                        Gate Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      You must sign in to your Kollabrix account before entering or hosting live 1v1 Battle Arena matches.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:brightness-110 active:scale-95 text-slate-950 font-black font-mono text-xs uppercase tracking-wider shrink-0 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Log In / Sign Up</span>
                </button>
              </div>
            )}

            {/* Prompt if initialRoomCode was provided in URL */}
            {initialRoomCode && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-400/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                    <Swords className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                      Duel Invitation Detected!
                    </p>
                    <p className="text-sm font-bold text-white">
                      You were invited to battle in Room <span className="text-cyan-400 font-mono font-bold">{initialRoomCode}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      setJoinError('Sign in required: Please log in or sign up before joining this room.');
                      openAuthModal('login');
                      return;
                    }
                    handleJoinWithCodeOrLink(initialRoomCode);
                  }}
                  disabled={isJoiningRoom}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isJoiningRoom ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : user ? (
                    <Play className="w-4 h-4 fill-current" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{user ? `Join Room ${initialRoomCode} Now` : `Log In to Join Room ${initialRoomCode}`}</span>
                </button>
              </div>
            )}

            {/* Two Master Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: Create Private Room */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-cyan-950/30 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col justify-between space-y-6 transition-all hover:scale-[1.01]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      <Swords className="w-6 h-6" />
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      HOST A MATCH
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white font-mono uppercase tracking-tight">
                      Create Private Room
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      Host a 1v1 duel or 2v2 relay match. Configure challenge topics (Web Dev, Algorithms, Bug Hunt), generate a unique room code &amp; invite link, or play solo against our AI Practice Bot.
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs font-mono text-slate-300">
                    <li className="flex items-center gap-2 text-cyan-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Custom 1v1 &amp; 2v2 Team Relay format</span>
                    </li>
                    <li className="flex items-center gap-2 text-cyan-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Instant room code &amp; shareable invite link</span>
                    </li>
                    <li className="flex items-center gap-2 text-cyan-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Anti-cheat live Fog of War protection</span>
                    </li>
                  </ul>

                  {authGateError && (
                    <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono flex items-center gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{authGateError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      setAuthGateError('Account required: Please log in or sign up before configuring a duel room.');
                      openAuthModal('login');
                      return;
                    }
                    playArcadeCoinSound();
                    setIsHost(true);
                    setStep(1);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black font-mono text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {user ? (
                    <>
                      <span>CONFIGURE PRIVATE ROOM</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>LOG IN TO CONFIGURE ROOM</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: Join Existing Room with Code or Link */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-rose-950/30 border border-rose-500/40 hover:border-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.15)] flex flex-col justify-between space-y-6 transition-all hover:scale-[1.01]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                      <Users className="w-6 h-6" />
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      MULTIPLAYER JOIN
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white font-mono uppercase tracking-tight">
                      Join Existing Room
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      Entering a match hosted by a classmate? Paste the full invite link or type their 4-digit duel code below to jump directly into their squad or opponent slot.
                    </p>
                  </div>

                  {/* Room Code or Link Input */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
                        Room Code or Invite Link:
                      </label>
                      <input
                        type="text"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value)}
                        placeholder="e.g. KBX-4634 or https://kollabrix.in/arena?room=..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-sm focus:border-rose-400 focus:outline-none tracking-wider placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Your Pilot Battle Tag:</span>
                        <button
                          type="button"
                          onClick={rollRandomCallSign}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-normal cursor-pointer"
                        >
                          🎲 Randomize
                        </button>
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Your display name"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-rose-400 focus:outline-none placeholder:text-slate-600"
                      />
                    </div>

                    {joinError && (
                      <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{joinError}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isJoiningRoom || (Boolean(user) && !joinCodeInput.trim())}
                  onClick={() => {
                    if (!user) {
                      setJoinError('Sign in required: Please log in or sign up before joining a multiplayer duel.');
                      openAuthModal('login');
                      return;
                    }
                    handleJoinWithCodeOrLink();
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:brightness-110 text-white font-black font-mono text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isJoiningRoom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>CONNECTING TO DUEL...</span>
                    </>
                  ) : user ? (
                    <>
                      <span>ENTER ROOM &amp; BATTLE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>LOG IN TO ENTER ROOM</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 1: AAA ESPORTS TOURNAMENT COMMAND CONSOLE ================= */}
        {step === 1 && (
          <div className="w-full max-w-6xl p-4 sm:p-6 md:p-8 rounded-3xl bg-slate-950/95 border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-fadeIn space-y-6">
            {/* Top Command Status Strip */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Swords className="w-6 h-6 animate-pulse" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      KBX-ARENA-OS // PROTOCOL 01: PILOT INITIALIZATION
                    </span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono uppercase">
                    Tournament Command Center
                  </h2>
                </div>
              </div>

              {/* 3-Step Circuit Node Navigation */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono font-bold tracking-wider">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>01 PILOT SPEC</span>
                </div>
                <span className="text-slate-600">&bull;</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500">
                  <span>02 ARENA MATRIX</span>
                </div>
                <span className="text-slate-600">&bull;</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500">
                  <span>03 SQUAD LINK</span>
                </div>
              </div>
            </div>

            {/* Main Balanced Tactical Pod Matrix (Clean 2-Column Cyber Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Pod 1: Pilot Holographic Dossier (Col 1-5) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                      <span>PILOT DOSSIER</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      LIVE
                    </span>
                  </div>

                  {/* Holographic Avatar Pod */}
                  <div
                    className={`relative w-full aspect-square rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 ${COMBAT_AVATARS[selectedAvatarIdx].border} ${COMBAT_AVATARS[selectedAvatarIdx].glow} flex flex-col items-center justify-center overflow-hidden transition-all duration-300`}
                  >
                    {/* Background Holographic Scanline Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[size:100%_4px] pointer-events-none opacity-40" />
                    <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

                    {/* Avatar Emoji */}
                    <span className="text-5xl sm:text-6xl select-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-bounce-short">
                      {COMBAT_AVATARS[selectedAvatarIdx].emoji}
                    </span>

                    {/* Avatar Title */}
                    <span className="mt-2 text-xs font-mono font-black text-white tracking-widest uppercase">
                      {COMBAT_AVATARS[selectedAvatarIdx].name}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      {COMBAT_AVATARS[selectedAvatarIdx].badge}
                    </span>
                  </div>

                  {/* Persona Switcher Chips */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Select Persona Class:
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {COMBAT_AVATARS.map((avatar, idx) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => {
                            playTacticalSelectSound();
                            setSelectedAvatarIdx(idx);
                          }}
                          className={`p-2 rounded-xl text-center text-sm sm:text-base border transition-all ${
                            selectedAvatarIdx === idx
                              ? `${avatar.border} bg-slate-800 scale-105 shadow-md`
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700 opacity-60 hover:opacity-100'
                          }`}
                          title={`${avatar.name} - ${avatar.trait}`}
                        >
                          {avatar.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio / Keystroke Visualizer Bars */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>KEYSTROKE FREQUENCY</span>
                      <span className="text-emerald-400 font-bold">98.4% CADENCE</span>
                    </div>
                    <div className="flex items-end justify-between h-5 gap-1 px-1">
                      {[40, 75, 55, 90, 60, 100, 45, 80, 65, 85, 50, 95].map((val, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-cyan-500 to-rose-500 rounded-full animate-pulse"
                          style={{
                            height: `${val}%`,
                            animationDelay: `${i * 70}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pilot Telemetry Footnote */}
                <div className="pt-2 border-t border-slate-800/60 font-mono text-[10px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>RANKING:</span>
                    <span className="text-amber-400 font-bold">
                      {COMBAT_AVATARS[selectedAvatarIdx].rank}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TRAIT:</span>
                    <span className="text-slate-200">{COMBAT_AVATARS[selectedAvatarIdx].trait}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span className="text-emerald-400 font-bold">● ARMED &amp; READY</span>
                  </div>
                </div>
              </div>

              {/* Pod 2: Engagement Specification & Mode Selection (Col 6-12) */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between space-y-5 shadow-xl">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-rose-400" />
                      <span>ENGAGEMENT SPECIFICATION</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      STEP 1 OF 3
                    </span>
                  </div>

                  {/* Input Name / Call-Sign with Randomizer */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Tactical Pilot Call-Sign / Battle Tag:</span>
                      <span className="text-[10px] text-cyan-400">VISIBLE IN ARENA HUD</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-xs select-none">
                          &gt;
                        </span>
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Enter your battle alias..."
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={rollRandomCallSign}
                        className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 shrink-0 shadow-md active:scale-95"
                        title="Roll a random tactical hacker call-sign"
                      >
                        <Dices className="w-4 h-4 text-amber-400" />
                        <span className="hidden sm:inline">Randomize</span>
                      </button>
                    </div>
                  </div>

                  {/* 3D Combat Format Selection Cards: 1v1 vs 2v2 */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Select Code Duel Combat Format:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* 1v1 Solo Duel Card */}
                      <button
                        type="button"
                        onClick={() => {
                          playTacticalSelectSound();
                          setTeamSize('1v1');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          teamSize === '1v1'
                            ? 'bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-950 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)] scale-[1.01]'
                            : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                              <Zap className="w-5 h-5" />
                            </span>
                            {teamSize === '1v1' ? (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold">
                                SELECTED
                              </span>
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                            )}
                          </div>
                          <h3 className="font-bold text-white text-base font-mono flex items-center justify-between gap-1.5">
                            <span>1 v 1 Solo Showdown</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              OFFICIAL STABLE
                            </span>
                          </h3>
                          <p className="text-[11px] font-mono text-cyan-400/90 mt-0.5 font-bold">
                            ULTRA LOW LATENCY DUEL
                          </p>
                          <ul className="text-xs text-slate-300 mt-2.5 space-y-1 font-sans">
                            <li className="flex items-center gap-1.5">
                              <span className="text-cyan-400">&bull;</span>
                              <span>Pure 1-on-1 head-to-head clash</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="text-cyan-400">&bull;</span>
                              <span>Fog of War live code encryption</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="text-cyan-400">&bull;</span>
                              <span>0% interference &bull; Pure speedrun</span>
                            </li>
                          </ul>
                        </div>
                      </button>

                      {/* 2v2 Relay Squad Card */}
                      <button
                        type="button"
                        onClick={() => {
                          playTacticalSelectSound();
                          setTeamSize('2v2');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          teamSize === '2v2'
                            ? 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.35)] scale-[1.01]'
                            : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <Users className="w-5 h-5" />
                            </span>
                            {teamSize === '2v2' ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                                SELECTED
                              </span>
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                            )}
                          </div>
                          <h3 className="font-bold text-white text-base font-mono flex items-center justify-between gap-1.5">
                            <span>2 v 2 Relay Squad</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              BETA (EXPERIMENTAL)
                            </span>
                          </h3>
                          <p className="text-[11px] font-mono text-rose-400/90 mt-0.5 font-bold">
                            DUAL-PILOT CO-OP WARFARE
                          </p>
                          <ul className="text-xs text-slate-300 mt-2.5 space-y-1 font-sans">
                            <li className="flex items-center gap-1.5">
                              <span className="text-rose-400">&bull;</span>
                              <span>Driver + Navigator tag-team pairing</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="text-rose-400">&bull;</span>
                              <span>Auto keyboard swap every 2.5 mins</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="text-rose-400">&bull;</span>
                              <span>Synchronized team test suite</span>
                            </li>
                          </ul>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Match Pace Chips */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-bold mr-1">
                      PACING:
                    </span>
                    {[
                      { label: 'Blitz (3m)', sec: 180 },
                      { label: 'Competitive (5m)', sec: 300 },
                      { label: 'Marathon (10m)', sec: 600 },
                    ].map((p) => (
                      <button
                        key={p.sec}
                        type="button"
                        onClick={() => {
                          playTacticalSelectSound();
                          setTimeLimit(p.sec);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          timeLimit === p.sec
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Command Bar: High-Voltage CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
              <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  FORMAT: <strong className="text-white">{teamSize.toUpperCase()}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  DURATION: <strong className="text-white">{timeLimit / 60} MINS</strong>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Entry Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playArcadeCoinSound();
                    setRoomCode(`KBX-${Math.floor(1000 + Math.random() * 9000)}`);
                    setStep(2);
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 hover:brightness-110 text-slate-950 font-black font-mono text-sm uppercase tracking-wider transition-all shadow-[0_0_35px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>⚡ INITIALIZE ARENA COMBAT PROTOCOL</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CHOOSE ARENA & TOPICS ================= */}
        {step === 2 && (
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/30 text-rose-300 inline-block">
                Step 2 of 3 &bull; Select Arena & Topics
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Pick Arena & Languages
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
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
                      ? 'bg-rose-950/40 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 text-rose-400 mb-2" />
                  <h4 className="font-mono font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Arena-Specific Language / Topic Checkboxes */}
            {/* 1. WEB DEV TOPICS (HTML REQUIRED / LOCKED • CAN TOGGLE CSS & JAVASCRIPT) */}
            {arena === 'web_dev' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Web Dev Topics (HTML Locked • Customize CSS & JS):</span>
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">
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
                            ? 'bg-cyan-950/60 border-cyan-400/80 text-white shadow-sm cursor-default'
                            : isChecked
                            ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-sm cursor-pointer'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold font-mono text-white">{topic.label}</p>
                            {topic.isMandatory && (
                              <span className="text-[9px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold">
                                Locked
                              </span>
                            )}
                          </div>
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
                        {selectedTags.length}/3 selected (tick 1, 2, or 3)
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(bugDomain === 'web'
                      ? [
                          { id: 'html', label: 'HTML', desc: 'Structure Bugs' },
                          { id: 'css', label: 'CSS', desc: 'Styling & Layout' },
                          { id: 'javascript', label: 'JavaScript', desc: 'DOM & Click Bugs' },
                        ]
                      : [
                          { id: 'java', label: 'Java', desc: 'Enterprise Java Bugs' },
                          { id: 'python', label: 'Python', desc: 'Syntax & Logic Bugs' },
                          { id: 'cpp', label: 'C++', desc: 'Memory & Pointer Bugs' },
                        ]
                    ).map((lang) => {
                      const isSelected = selectedTags.includes(lang.id);
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            if (bugDomain === 'web') {
                              // Multi-select for Web UI: can tick 1, 2, or 3!
                              if (isSelected) {
                                if (selectedTags.length > 1) {
                                  setSelectedTags(selectedTags.filter((t) => t !== lang.id));
                                }
                              } else {
                                setSelectedTags([...selectedTags, lang.id]);
                              }
                            } else {
                              // Single-select for Logic & Code Bug Hunt (only 1 tick: Java, Python, or C++)
                              setSelectedTags([lang.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
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

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Admins feed code with bugs directly in the Admin Center. Competitors must diagnose, edit, and fix the code to pass!
                  </span>
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
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
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
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleHostCreateRoom}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 text-slate-950 font-black font-mono text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Next: Room & Invite Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ROOM CODE, INVITE LINK & ROSTER LOBBY ================= */}
        {step === 3 && (
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300 inline-block">
                Step 3 of 3 &bull; Private Room Ready
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Invite Squad & Launch Match
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Share the room code or link to assemble your match.
              </p>
            </div>

            {/* Big Room Code Badge */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Private Duel Room Code:
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 tracking-wider">
                  {roomCode}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                </button>
              </div>
            </div>

            {/* PRACTICE BOT CHECKBOX TOGGLE */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-all">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isBotOpponentAdded
                      ? 'bg-rose-500 text-white shadow-[0_0_12px_#f43f5e]'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-mono font-bold text-white text-xs">
                    Play vs AI Practice Bot (Solo Instant Start)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Tick this box to practice immediately without waiting for a classmate.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isBotOpponentAdded}
                onChange={(e) => setIsBotOpponentAdded(e.target.checked)}
                className="w-5 h-5 rounded-md border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500 cursor-pointer"
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
              {/* Team Alpha (Cyan) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
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
                    const isP1Me =
                      roomData?.alphaPlayers?.[0]?.id === myPlayerId ||
                      (playerName && roomData?.alphaPlayers?.[0]?.name?.toLowerCase() === playerName.toLowerCase()) ||
                      isHost;
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                            P1
                          </div>
                          <span className="text-white font-bold">{hostName}</span>
                          <span className="text-[10px] text-cyan-400 font-semibold">
                            {isP1Me ? '(You - Host)' : '(Host)'}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">READY</span>
                      </div>
                    );
                  })()}

                  {/* Slot 2: Teammate (in 2v2) */}
                  {teamSize === '2v2' && (
                    roomData?.alphaPlayers?.[1] ? (
                      (() => {
                        const p2 = roomData.alphaPlayers[1];
                        const isP2Me =
                          p2.id === myPlayerId ||
                          (playerName && p2.name?.toLowerCase() === playerName.toLowerCase());
                        return (
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                                P2
                              </div>
                              <span className="text-white font-bold">{p2.name}</span>
                              <span className="text-[10px] text-cyan-400 font-semibold">
                                {isP2Me ? '(You - Navigator)' : '(Navigator)'}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold">READY</span>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-dashed border-slate-700 flex items-center justify-between text-xs font-mono text-slate-400">
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

              {/* Team Omega (Rose) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    {mySquad === 'omega' ? 'Team Omega (Your Squad)' : 'Team Omega (Opponents)'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {teamSize === '1v1' ? '1 Slot' : '2 Slots'}
                  </span>
                </div>

                {roomData?.omegaPlayers && roomData.omegaPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {roomData.omegaPlayers.map((opp: any, idx: number) => {
                      const isOppMe =
                        opp.id === myPlayerId ||
                        (playerName && opp.name?.toLowerCase() === playerName.toLowerCase());
                      return (
                        <div
                          key={opp.id || idx}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/50 flex items-center justify-between text-xs font-mono shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-rose-500 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                              {opp.id === 'bot-rival' ? <Bot className="w-3.5 h-3.5" /> : `P${idx + (teamSize === '2v2' ? 3 : 2)}`}
                            </div>
                            <span className="text-white font-bold">{opp.name}</span>
                            <span className="text-[10px] text-rose-400 font-semibold">
                              {isOppMe ? '(You)' : opp.id === 'bot-rival' ? '(Practice AI)' : '(Opponent)'}
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
                        <div className="w-6 h-6 rounded-lg bg-rose-500 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-white font-bold">ByteRival Bot</span>
                        <span className="text-[10px] text-rose-400 font-semibold">(Practice AI)</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">READY</span>
                    </div>

                    {teamSize === '2v2' && (
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-rose-500 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-white font-bold">ApexAI Partner</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">READY</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-rose-500/40 flex flex-col gap-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                        Waiting for Opponent...
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                        OPEN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Share room code <strong className="text-cyan-300">{roomCode}</strong> or copy the invite link above so a student can enter this match!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Launch Match Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExitArena}
                className="py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHost ? 'Back' : 'Leave Room'}</span>
              </button>

              {isHost ? (
                <button
                  type="button"
                  onClick={handleStartBattle}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-cyan-500 text-slate-950 font-black font-mono text-base uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_30px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 opacity-40 blur-3xl animate-pulse" />
              <div className="text-8xl sm:text-9xl font-black font-mono text-white drop-shadow-[0_0_50px_rgba(244,63,94,0.8)] animate-ping-short">
                {countdownNum}
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-mono font-black text-rose-400 uppercase tracking-widest">
              GET READY TO CODE...
            </h3>
            <p className="mt-2 text-xs font-mono text-slate-400">
              Anti-Cheat Fog of War will engage automatically upon match start.
            </p>
          </div>
        )}

        {/* ================= STEP 5: SPLIT-SCREEN REFINED COMBAT ARENA ================= */}
        {step === 5 && (
          <div className="w-full h-full flex flex-col gap-3 animate-fadeIn">
            {/* Mission Objective Header */}
            <div className="p-3 rounded-2xl bg-slate-950/85 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    TARGET CHALLENGE:
                  </span>
                  <span className="font-bold text-white text-sm">{activeQuestion.title}</span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    ({activeQuestion.difficulty})
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">{activeQuestion.description}</p>
              </div>

              {teamSize === '2v2' && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>ACTIVE KEYBOARD: {relayPlayer}</span>
                </div>
              )}
            </div>

            {/* Split Screen Grid: Left Studio & Opponent Telemetry, Right Preview & Output / Compiler Terminal */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[560px]">
              
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
                <div className="flex-1 flex flex-col min-h-[340px] sm:min-h-[400px] bg-[#070a14] border-b border-slate-800/80">
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
                      }}
                      onKeyDown={handleEditorKeyDown}
                      onScroll={() => {
                        if (lineNumbersRef.current && textareaRef.current) {
                          lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
                        }
                      }}
                      placeholder={
                        isWebMatch
                          ? activeTab === 'html'
                            ? '<!-- Type or paste your HTML here. Delete all content anytime. -->'
                            : activeTab === 'css'
                            ? '/* Type or paste your CSS styles here. Delete all content anytime. */'
                            : '// Type or paste your JavaScript here.'
                          : '// Write your code solution here. Implement the required method / logic.'
                      }
                      className="flex-1 w-full h-full bg-transparent p-3 font-mono text-xs sm:text-sm text-cyan-200 placeholder-slate-600 resize-none focus:outline-none whitespace-pre overflow-auto"
                      style={{ lineHeight: '1.5rem', tabSize: 2 }}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                    />
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

                  {/* Opponent Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 text-[11px] font-semibold">
                        {opponentDisplayName}
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
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Status:</span>
                      <span className={`font-black ${opponentWpm > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {opponentWpm > 0 ? 'Typing' : 'Idle'}
                      </span>
                    </div>
                  </div>

                  {/* Encrypted Code Glitch preview (Unlocks at finish) */}
                  <div className="p-2 rounded-xl bg-[#070914] border border-rose-500/20 font-mono text-[9px] text-rose-400/70 select-none overflow-hidden">
                    <p className="truncate">0x7F4A89C // ENCRYPTED_BLOCK // 01001011 01001111 // TESTS_LOCKED</p>
                    <p className="truncate">0x3E8B12A // ENCRYPTED_HASH  // 01100010 01111001 // RUNNER_ACTIVE</p>
                  </div>
                </div>
              </div>

              {/* RIGHT: DYNAMIC SPLIT VIEW — WEB PREVIEW/OUTPUT (FOR WEB) OR COMPILER TERMINAL (FOR JAVA/C++/PYTHON) */}
              <div className="flex flex-col gap-3 min-h-[500px]">
                {/* ================= IF WEB MATCH: IMAGE 6 PARITY (PREVIEW ON TOP, OUTPUT ON BOTTOM) ================= */}
                {isWebMatch ? (
                  <>
                    {/* TOP: PREVIEW CONTAINER (Target Component Blueprint) */}
                    {maximizedPane !== 'output' && (
                      <div
                        className={`flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-md overflow-hidden transition-all duration-200 ${
                          maximizedPane === 'preview' ? 'flex-1 h-full' : 'h-[270px] sm:h-[300px]'
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
                        className={`flex flex-col rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-md overflow-hidden transition-all duration-200 ${
                          maximizedPane === 'output' ? 'flex-1 h-full' : 'h-[270px] sm:h-[300px]'
                        }`}
                      >
                        {/* Output Title Bar (Image 6 Parity) */}
                        <div className="h-9 bg-[#1e293b] px-3.5 flex items-center justify-between border-b border-slate-700 select-none shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold lowercase bg-[#0f172a] text-cyan-300 border border-cyan-800 shadow-2xs">
                              output
                            </span>
                            {webEvaluation && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  webEvaluation.passed
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                Coordinate Graph: {webEvaluation.score}% ({webEvaluation.testsPassed}/{webEvaluation.totalTests} passed)
                              </span>
                            )}
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
                        className={`flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-md overflow-hidden transition-all duration-200 ${
                          maximizedPane === 'preview' ? 'flex-1 h-full' : 'h-[270px] sm:h-[300px]'
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

                        {/* Problem Details Body */}
                        <div className="flex-1 p-4 bg-slate-950 overflow-y-auto space-y-3.5 font-sans">
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
                        className={`flex flex-col rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-md overflow-hidden transition-all duration-200 ${
                          maximizedPane === 'output' ? 'flex-1 h-full' : 'h-[270px] sm:h-[300px]'
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Side-by-Side Solution Inspection:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">// Your Squad Code</p>
                  <pre>{htmlCode || cssCode || pythonCode || javaCode || cppCode || 'Solution'}</pre>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">// Opponent Code (Revealed)</p>
                  <pre>{activeQuestion.starterHtml || activeQuestion.starterPython || 'Solution'}</pre>
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
                  setStep(1);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 text-slate-950 font-black font-mono text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2"
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
    </div>
  );
}
