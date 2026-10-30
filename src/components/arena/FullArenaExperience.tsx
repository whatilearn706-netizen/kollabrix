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
} from 'lucide-react';
import { ArenaBackgroundMatrix } from '@/components/arena/ArenaBackgroundMatrix';
import { ArenaCategory, DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';
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
  currentUser?: {
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  };
}

export function FullArenaExperience({
  onClose,
  initialRoomCode,
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
  const [joinCodeInput, setJoinCodeInput] = useState(() => initialRoomCode || '');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

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

  // Multiplayer Server State
  const [myPlayerId] = useState(() => currentUser?.username || `pilot-${Math.random().toString(36).substring(2, 9)}`);
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
  const [activeQuestion, setActiveQuestion] = useState<DuelQuestion>(DEFAULT_ARENA_QUESTIONS[0]);

  // Arena Live Status check
  const [isArenaLive, setIsArenaLive] = useState<boolean>(true);
  const [maintenanceMsg, setMaintenanceMsg] = useState<string>(
    'Battle Arena is temporarily offline for scheduled system tuning, anti-cheat calibration, and challenge additions. Please check back shortly!'
  );

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

  const [userTestsPassed, setUserTestsPassed] = useState<number>(0);
  const [totalTests, setTotalTests] = useState<number>(3);
  const [testLog, setTestLog] = useState<string>('Ready to test code');
  const [webEvaluation, setWebEvaluation] = useState<WebGraphEvaluation | null>(null);

  // Opponent Team Omega (Fog of War)
  const [opponentTestsPassed, setOpponentTestsPassed] = useState<number>(0);
  const [opponentWpm, setOpponentWpm] = useState<number>(64);
  const [opponentAlert, setOpponentAlert] = useState<string>('');
  const [winnerTeam, setWinnerTeam] = useState<'Team Alpha' | 'Team Omega' | null>(null);

  // Image 6 Parity: Maximize pane state for Preview and Output
  const [maximizedPane, setMaximizedPane] = useState<'none' | 'preview' | 'output'>('none');
  const [renderNonce, setRenderNonce] = useState<number>(0);

  // Relay Role in 2v2 (swaps every 2.5 mins)
  const [relayPlayer, setRelayPlayer] = useState<'Driver (You)' | 'Navigator (Teammate)'>('Driver (You)');

  // Determine if active match uses Web View (Live Preview & Output) or Compiler Terminal View
  const isWebMatch =
    arena === 'web_dev' ||
    (arena === 'bug_hunt' &&
      (bugDomain === 'web' || activeQuestion.bugDomain === 'web' || !!activeQuestion.targetComponentHtml));

  // When changing arena, select sensible default tags
  const handleSelectArena = (newArena: ArenaCategory) => {
    setArena(newArena);
    if (newArena === 'web_dev') {
      setSelectedTags(['html', 'css']);
      setActiveTab('html');
    } else if (newArena === 'algorithms') {
      setSelectedTags(['python']);
      setActiveTab('python');
    } else if (newArena === 'bug_hunt') {
      setSelectedTags([bugDomain === 'web' ? 'bug_web' : 'bug_logic']);
      setActiveTab(bugDomain === 'web' ? 'html' : 'python');
    }
  };

  // Tag toggle helper
  const handleToggleTag = (tagId: string) => {
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
          const q = data.room.question;
          setActiveQuestion(q);
          setHtmlCode(q.starterHtml || '');
          setCssCode(q.starterCss || '');
          setJsCode(q.starterJs || '');
          setPythonCode(q.starterPython || '# Your python solution\n');
          setJavaCode(q.starterJava || '// Your java solution\n');
          setCppCode(q.starterCpp || '// Your C++ solution\n');
          setTotalTests(q.testCases?.length || 3);
          setTimeLeft(q.timeLimitSeconds || 300);
        }

        playTacticalSelectSound();
        trackEvent('arena_room_joined', { code: data.room.code, format: data.room.format, arena: data.room.arena });
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
    try {
      const res = await fetch('/api/arena/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          hostName: playerName,
          hostId: myPlayerId,
          avatarIdx: selectedAvatarIdx,
          format: teamSize,
          arena,
          selectedTags,
          difficulty,
          timeLimit,
          question: activeQuestion,
          isBotEnabled: isBotOpponentAdded,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.room) setRoomData(data.room);
        trackEvent('arena_room_created', { code: roomCode, format: teamSize, arena, difficulty });
      }
    } catch (err) {
      console.warn('Failed to publish room to server:', err);
    }
    playArcadeCoinSound();
    setStep(3);
  };

  // Realtime Supabase WebSocket Channel Ref
  const channelRef = useRef<any>(null);

  // Unified State Applicator for WebSocket & HTTP Sync
  const applyRoomDataState = (incomingRoom: any) => {
    if (!incomingRoom) return;
    setRoomData(incomingRoom);

    // If in Lobby (Step 3) and Host started match, advance joiner to Step 4 (Countdown) instantly!
    if (step === 3 && (incomingRoom.status === 'starting' || incomingRoom.status === 'in_progress')) {
      if (incomingRoom.question) {
        const q = incomingRoom.question;
        setActiveQuestion(q);
        setHtmlCode(q.starterHtml || '');
        setCssCode(q.starterCss || '');
        setJsCode(q.starterJs || '');
        setPythonCode(q.starterPython || '# Your python solution\n');
        setJavaCode(q.starterJava || '// Your java solution\n');
        setCppCode(q.starterCpp || '// Your C++ solution\n');
        setTotalTests(q.testCases?.length || 3);
        setTimeLeft(q.timeLimitSeconds || 300);

        if (incomingRoom.arena === 'web_dev') {
          setActiveTab('html');
        } else if (incomingRoom.arena === 'algorithms') {
          setActiveTab('python');
        } else {
          setActiveTab('html');
        }
      }
      setStep(4);
      setCountdownNum(3);
      return;
    }

    // If in Battlefield (Step 5):
    if (step === 5) {
      if (incomingRoom.status === 'finished') {
        setWinnerTeam(incomingRoom.winnerTeam || 'Team Alpha');
        setStep(6);
        return;
      }

      // Read real-time opponent test progress
      const oppList = isHost ? incomingRoom.omegaPlayers : incomingRoom.alphaPlayers;
      if (oppList && oppList.length > 0) {
        const opp = oppList[0];
        if (opp.testsPassed !== undefined) setOpponentTestsPassed(opp.testsPassed);
        if (opp.wpm) setOpponentWpm(opp.wpm);
      }
    }
  };

  // Realtime Supabase WebSocket Synchronization + Low-Frequency Failover Polling
  useEffect(() => {
    if (step !== 3 && step !== 5) return;
    if (!roomCode) return;

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
        .on('broadcast', { event: 'progress_sync' }, ({ payload }) => {
          if (!isMounted) return;
          if (payload?.playerId !== myPlayerId) {
            if (payload?.testsPassed !== undefined) setOpponentTestsPassed(payload.testsPassed);
            if (payload?.wpm !== undefined) setOpponentWpm(payload.wpm);
          }
        })
        .subscribe();

      channelRef.current = channel;
    } catch (wsErr) {
      console.warn('Realtime WebSocket init notice:', wsErr);
    }

    // 2. Low-frequency background HTTP safety check (10s interval, reducing DB load by >85%)
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/arena/rooms?code=${roomCode}&_t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.room) return;
        applyRoomDataState(data.room);
      } catch (err) {}
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {}
        channelRef.current = null;
      }
    };
  }, [step, roomCode, isHost, myPlayerId]);

  // Sync test progress to server for opponent's Fog-of-War HUD
  const syncProgressToServer = (passedCount: number) => {
    if (!roomCode) return;

    // Immediate WebSocket broadcast to opponent (<40ms)
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'progress_sync',
          payload: { playerId: myPlayerId, testsPassed: passedCount, wpm: 74 },
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
          wpm: 74,
        },
      }),
    }).catch(() => {});
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

    let chosen: DuelQuestion | null = roomData?.question || null;
    if (!chosen) {
      try {
        const res = await fetch(
          `/api/arena/questions?arena=${arena}&tags=${selectedTags.join(',')}`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            chosen = data.questions[Math.floor(Math.random() * data.questions.length)];
          }
        }
      } catch (e) {}

      if (!chosen) {
        const matching = DEFAULT_ARENA_QUESTIONS.filter((q) => {
          if (q.arena !== arena) return false;
          if (arena === 'bug_hunt' && q.bugDomain && q.bugDomain !== bugDomain) return false;
          return selectedTags.some((t) => q.tags.includes(t));
        });
        chosen =
          matching.length > 0
            ? matching[Math.floor(Math.random() * matching.length)]
            : DEFAULT_ARENA_QUESTIONS.find(
                (q) => q.arena === arena && (arena !== 'bug_hunt' || q.bugDomain === bugDomain)
              ) ||
              DEFAULT_ARENA_QUESTIONS.find((q) => q.arena === arena) ||
              DEFAULT_ARENA_QUESTIONS[0];
      }
    }

    setActiveQuestion(chosen);

    // Initialize starter code
    setHtmlCode(chosen.starterHtml || '');
    setCssCode(chosen.starterCss || '');
    setJsCode(chosen.starterJs || '');
    setPythonCode(chosen.starterPython || '# Your python solution\n');
    setJavaCode(chosen.starterJava || '// Your java solution\n');
    setCppCode(chosen.starterCpp || '// Your C++ solution\n');

    setTotalTests(chosen.testCases?.length || 3);
    setUserTestsPassed(0);
    setTestCaseResults({});
    setCompilerResult(null);
    setSelectedTestCaseIdx(0);
    setWebEvaluation(null);
    setOpponentTestsPassed(0);
    setTimeLeft(chosen.timeLimitSeconds || 300);

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

    // Tell server to trigger match start for ALL participants in this room!
    try {
      // Immediate Sub-50ms WebSocket broadcast to opponent
      if (channelRef.current) {
        try {
          channelRef.current.send({
            type: 'broadcast',
            event: 'room_sync',
            payload: { room: { ...roomData, status: 'starting', question: chosen } },
          });
        } catch {}
      }

      await fetch('/api/arena/rooms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          action: 'start_match',
          payload: { question: chosen },
        }),
      });
      trackEvent('arena_match_started', { code: roomCode, format: teamSize, arena });
    } catch {}

    // Advance to countdown
    setStep(4);
    setCountdownNum(3);
  };

  // 3-2-1 Countdown Timer
  useEffect(() => {
    if (step !== 4) return;
    if (countdownNum > 1) {
      const timer = setTimeout(() => setCountdownNum(countdownNum - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setStep(5), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdownNum]);

  // Battle Clock
  useEffect(() => {
    if (step !== 5) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStep(6);
          setWinnerTeam(userTestsPassed >= opponentTestsPassed ? 'Team Alpha' : 'Team Omega');
          playVictorySound();
          return 0;
        }

        // Relay swap at 2.5 minutes remaining in 2v2
        if (teamSize === '2v2' && prev === 150) {
          setRelayPlayer('Navigator (Teammate)');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, userTestsPassed, opponentTestsPassed, teamSize]);

  // Opponent Telemetry Simulator (Fog of War)
  useEffect(() => {
    if (step !== 5) return;

    const oppInterval = setInterval(() => {
      setOpponentWpm(Math.floor(58 + Math.random() * 32));

      // Realistic collegiate pacing: Bot solves tests at ~45s-60s intervals
      const roll = Math.random();
      if (roll < 0.22 && opponentTestsPassed < totalTests) {
        setOpponentTestsPassed((prev) => {
          const next = prev + 1;
          setOpponentAlert(`🔥 Opponent Team Omega passed Test Case ${next}/${totalTests}!`);
          setTimeout(() => setOpponentAlert(''), 3500);
          if (next >= totalTests) {
            setStep(6);
            setWinnerTeam('Team Omega');
            playVictorySound();
          }
          return next;
        });
      } else if (roll > 0.88) {
        setOpponentAlert('⚠️ Opponent encountered a CSS Syntax Warning!');
        setTimeout(() => setOpponentAlert(''), 2800);
      }
    }, 7500);

    return () => clearInterval(oppInterval);
  }, [step, opponentTestsPassed, totalTests]);

  // Run Tests Handler for Player (Web Fallback)
  const handleRunTests = () => {
    playArcadeCoinSound();
    if (userTestsPassed < totalTests) {
      const next = userTestsPassed + 1;
      setUserTestsPassed(next);
      setTestLog(`✓ Test Case ${next}/${totalTests} Passed!`);
      if (next >= totalTests) {
        setStep(6);
        setWinnerTeam('Team Alpha');
        playVictorySound();
      }
    } else {
      setTestLog('All tests verified! Submitting solution...');
      setStep(6);
      setWinnerTeam('Team Alpha');
      playVictorySound();
    }
  };

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
      syncMatchWonToServer(isHost ? 'Team Alpha' : 'Team Omega');
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
    syncProgressToServer(passedCount);
    setIsSubmitting(false);

    if (passedCount === testCases.length) {
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
    }
  };

  // Test Layout Handler for Web Development (Evaluates layout coordinate graph in background)
  const handleTestWebLayout = () => {
    const evaluation = evaluateWebCoordinateGraph(
      activeQuestion.id,
      htmlCode,
      cssCode,
      activeQuestion.targetComponentHtml
    );
    setWebEvaluation(evaluation);
    setUserTestsPassed(evaluation.testsPassed);
    syncProgressToServer(evaluation.testsPassed);

    if (evaluation.passed) {
      playCompileSuccessSound();
    } else {
      playCompileErrorSound();
    }
  };

  // Submit Handler for Web Development (Evaluates layout coordinate graph & requires passing)
  const handleWebSubmit = () => {
    setIsSubmitting(true);
    const evaluation = evaluateWebCoordinateGraph(
      activeQuestion.id,
      htmlCode,
      cssCode,
      activeQuestion.targetComponentHtml
    );
    setWebEvaluation(evaluation);
    setUserTestsPassed(evaluation.testsPassed);
    syncProgressToServer(evaluation.testsPassed);

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
      const failed = evaluation.results.filter((r) => !r.passed);
      const failMsg = failed.map((f, i) => `${i + 1}. ${f.testName}:\n   → ${f.message}`).join('\n\n');
      alert(
        `✗ Web Challenge Verdict: Incomplete (${evaluation.testsPassed} / ${evaluation.totalTests} Tests Passed)\n\n` +
        `Coordinate graph does not match the Preview blueprint:\n\n${failMsg}\n\n` +
        `Build the required HTML structure and layout CSS to pass all test cases!`
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
              src="/brand/kollabrix-k.png?v=20261030j"
              alt="Kollabrix"
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
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
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
                  onClick={() => handleJoinWithCodeOrLink(initialRoomCode)}
                  disabled={isJoiningRoom}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isJoiningRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>Join Room {initialRoomCode} Now</span>
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
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playArcadeCoinSound();
                    setIsHost(true);
                    setStep(1);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black font-mono text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>CONFIGURE PRIVATE ROOM</span>
                  <ArrowRight className="w-4 h-4" />
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
                  disabled={isJoiningRoom || !joinCodeInput.trim()}
                  onClick={() => handleJoinWithCodeOrLink()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:brightness-110 text-white font-black font-mono text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isJoiningRoom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>CONNECTING TO DUEL...</span>
                    </>
                  ) : (
                    <>
                      <span>ENTER ROOM &amp; BATTLE</span>
                      <ArrowRight className="w-4 h-4" />
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

            {/* Main 3-Column Tactical Pod Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Pod 1: Pilot Holographic Dossier (Col 1-3) */}
              <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between space-y-4">
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

              {/* Pod 2: Engagement Specification & Mode Selection (Col 4-9) */}
              <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between space-y-5">
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
                          <h3 className="font-bold text-white text-base font-mono flex items-center gap-1.5">
                            <span>1 v 1 Solo Showdown</span>
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
                          <h3 className="font-bold text-white text-base font-mono flex items-center gap-1.5">
                            <span>2 v 2 Relay Squad</span>
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

              {/* Pod 3: Tournament Telemetry & Integrity Gauntlet (Col 10-12) */}
              <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ARENA TELEMETRY</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      SHIELD ACTIVE
                    </span>
                  </div>

                  {/* Live Security Specifications */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5 font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-white font-bold block">Fog of War Shield</span>
                        <span className="text-[10px] text-slate-400">Zero screen-peeking encryption</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <div>
                        <span className="text-white font-bold block">Anti-Cheat Proctor</span>
                        <span className="text-[10px] text-slate-400">Keystroke cadence & paste lock</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-white font-bold block">Judge0 Multi-Language</span>
                        <span className="text-[10px] text-slate-400">Java 21, Python 3.12, C++20, Web</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-white font-bold block">Edge WebSocket Mesh</span>
                        <span className="text-[10px] text-slate-400">Sub-15ms realtime sync</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Bounty Reward Card */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>MATCH BOUNTY STAKE</span>
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-mono font-black text-white">+150 ELO</span>
                      <span className="text-xs font-mono font-bold text-amber-300">+500 XP</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Winner claimable immediately upon all test cases passed or sudden-death timeout.
                    </p>
                  </div>
                </div>

                {/* Telemetry Status Bar */}
                <div className="pt-2 border-t border-slate-800/60 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                  <span>SPECTATORS:</span>
                  <span className="text-cyan-400 font-bold">1,842 CONNECTED</span>
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
            {/* 1. WEB DEV CHECKBOXES */}
            {arena === 'web_dev' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Web Dev Topics (Pick 1, 2, or All 3):
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {selectedTags.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'html', label: 'HTML', desc: 'Structure & semantic elements' },
                    { id: 'css', label: 'CSS', desc: 'Flexbox, grids & styling' },
                    { id: 'javascript', label: 'JavaScript', desc: 'DOM clicks & logic' },
                  ].map((topic) => {
                    const isChecked = selectedTags.includes(topic.id);
                    return (
                      <div
                        key={topic.id}
                        onClick={() => handleToggleTag(topic.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                          isChecked
                            ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
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
                        <div>
                          <p className="text-xs font-bold font-mono text-white">{topic.label}</p>
                          <p className="text-[10px] text-slate-400">{topic.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. ALGORITHMS / DSA LANGUAGE CHECKBOXES */}
            {arena === 'algorithms' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Algorithms Languages (Choose 1, 2, or All 3):
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {selectedTags.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'python', label: 'Python', desc: 'Python 3.12 - Fast prototyping' },
                    { id: 'java', label: 'Java', desc: 'Java 21 OpenJDK - Enterprise DSA' },
                    { id: 'cpp', label: 'C++', desc: 'Modern C++ 20 - Ultra-fast competitive' },
                  ].map((lang) => {
                    const isChecked = selectedTags.includes(lang.id);
                    return (
                      <div
                        key={lang.id}
                        onClick={() => handleToggleTag(lang.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                          isChecked
                            ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
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
                        <div>
                          <p className="text-xs font-bold font-mono text-white">{lang.label}</p>
                          <p className="text-[10px] text-slate-400">{lang.desc}</p>
                        </div>
                      </div>
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
                      setSelectedTags(['bug_web', 'css', 'html']);
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
                      setSelectedTags(['bug_logic', 'python', 'java', 'cpp']);
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

            {/* Roster Slots based on 1v1 vs 2v2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team Alpha (Cyan) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Team Alpha (Your Squad)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {teamSize === '1v1' ? '1 Slot' : '2 Slots'}
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Slot 1: You */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                        P1
                      </div>
                      <span className="text-white font-bold">{playerName}</span>
                      <span className="text-[10px] text-cyan-400 font-semibold">(Driver)</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">READY</span>
                  </div>

                  {/* Slot 2: Teammate (in 2v2) */}
                  {teamSize === '2v2' && (
                    <div className="p-2.5 rounded-xl bg-slate-900/50 border border-dashed border-slate-700 flex items-center justify-between text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[11px]">
                          P2
                        </div>
                        <span className="italic">Waiting for teammate...</span>
                      </div>
                      <span className="text-[10px] text-amber-400 animate-pulse">INVITED</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Omega (Rose) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Team Omega (Opponents)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {teamSize === '1v1' ? '1 Slot' : '2 Slots'}
                  </span>
                </div>

                {roomData?.omegaPlayers && roomData.omegaPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {roomData.omegaPlayers.map((opp: any, idx: number) => (
                      <div
                        key={opp.id || idx}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/50 flex items-center justify-between text-xs font-mono shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-rose-500 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                            {opp.id === 'bot-rival' ? <Bot className="w-3.5 h-3.5" /> : `P${idx + 2}`}
                          </div>
                          <span className="text-white font-bold">{opp.name}</span>
                          <span className="text-[10px] text-rose-400 font-semibold">({opp.role || 'Driver'})</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                          READY
                        </span>
                      </div>
                    ))}
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
                onClick={() => setStep(isHost ? 2 : 0)}
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
                    {/* Web Dev Tabs (Only shown in Web mode) */}
                    {isWebMatch && (
                      <>
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
                      </>
                    )}

                    {/* Compiler Language Tabs (Python, Java, C++) */}
                    {!isWebMatch && (
                      <>
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
                      </>
                    )}
                  </div>

                  {/* Right Actions: Real Compiler Actions for Java/C++/Python, or Web Submit for Web */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isWebMatch ? (
                      <>
                        <span className="text-[11px] font-mono text-cyan-400 font-bold hidden sm:inline">
                          Tests: {userTestsPassed} / {totalTests}
                        </span>
                        <button
                          type="button"
                          onClick={handleTestWebLayout}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Run layout coordinate graph verification against Preview blueprint"
                        >
                          <Play className="w-3 h-3 fill-current text-cyan-400" />
                          <span>Test Layout</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleWebSubmit}
                          className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:brightness-110 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
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
                        {/* Option 1: Compile & Run (Judge0 Backend) */}
                        <button
                          type="button"
                          disabled={isCompiling || isSubmitting}
                          onClick={handleCompileAndRun}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
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
                          className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
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

                {/* Code Textarea Studio */}
                <div className="flex-1 min-h-[300px] sm:min-h-[350px] relative bg-[#060812] p-3 border-b border-slate-800">
                  <textarea
                    value={
                      activeTab === 'html'
                        ? htmlCode
                        : activeTab === 'css'
                        ? cssCode
                        : activeTab === 'js'
                        ? jsCode
                        : activeTab === 'python'
                        ? pythonCode
                        : activeTab === 'java'
                        ? javaCode
                        : activeTab === 'cpp'
                        ? cppCode
                        : pythonCode
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeTab === 'html') setHtmlCode(val);
                      else if (activeTab === 'css') setCssCode(val);
                      else if (activeTab === 'js') setJsCode(val);
                      else if (activeTab === 'python') setPythonCode(val);
                      else if (activeTab === 'java') setJavaCode(val);
                      else if (activeTab === 'cpp') setCppCode(val);
                      else setPythonCode(val);
                    }}
                    placeholder={
                      isWebMatch
                        ? '<!-- Write your HTML/CSS solution here (replicate the preview blueprint) -->'
                        : '// Write your code solution here. Implement the required method / logic.'
                    }
                    className="w-full h-full bg-transparent font-mono text-xs sm:text-sm text-cyan-200 resize-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                  />
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
                      <span className="text-slate-400 text-[11px]">
                        {isBotOpponentAdded ? 'ByteRival Bot (Practice AI)' : 'Classmate Opponent'}
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
                        <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span>{opponentWpm} WPM</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Compile:</span>
                      <span className="font-black text-cyan-400">Active</span>
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

                        {/* Preview White Canvas (Image 6 Design) */}
                        <div
                          key={`preview-${renderNonce}`}
                          className="flex-1 p-3 bg-white overflow-auto flex items-center justify-center"
                        >
                          <div
                            className="w-full"
                            dangerouslySetInnerHTML={{
                              __html: activeQuestion.targetComponentHtml || '<p>Target Preview</p>',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* BOTTOM: OUTPUT CONTAINER (Student's Live Code Rendering) */}
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

                        {/* Output White Canvas (Image 6 Live Render) */}
                        <div
                          key={`output-${renderNonce}`}
                          className="flex-1 p-3 bg-white overflow-auto"
                        >
                          <style>{cssCode}</style>
                          <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
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
                {winnerTeam === 'Team Alpha' ? 'VICTORY! SQUAD TRIUMPH' : 'MATCH COMPLETE'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-mono">
                Fog of War has dissolved. Both solutions are now unlocked and revealed!
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
                    Team Alpha (You)
                  </span>
                  {winnerTeam === 'Team Alpha' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-slate-950">
                      WINNER
                    </span>
                  )}
                </div>
                <div className="text-2xl font-mono font-black text-white">
                  {userTestsPassed} / {totalTests} Tests
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Completed in {formatTimer(timeLimit - timeLeft)}
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
                    Team Omega (Opponent)
                  </span>
                  {winnerTeam === 'Team Omega' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-slate-950">
                      WINNER
                    </span>
                  )}
                </div>
                <div className="text-2xl font-mono font-black text-white">
                  {opponentTestsPassed} / {totalTests} Tests
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">Cadence: {opponentWpm} WPM</p>
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
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all"
              >
                Close Arena
              </button>

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
    </div>
  );
}
