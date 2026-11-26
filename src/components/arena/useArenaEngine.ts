'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';
import { selectBestQuestion } from '@/lib/arena/questionSelector';
import { verifyTestOutput } from '@/lib/arena/testCaseVerifier';
import { evaluateWebCoordinateGraph, WebGraphEvaluation } from '@/lib/arena/webCoordinateGraph';
import {
  playArcadeCoinSound,
  playBattleSlamSound,
  playCheatWarningSiren,
  playCompileErrorSound,
  playCompileSuccessSound,
  playCyberSwordClashSound,
  playTacticalSelectSound,
  playVictorySound,
} from '@/lib/arena/soundEffects';
import { trackEvent } from '@/lib/analytics/tracker';
import {
  AlgoLanguage,
  ArenaStage,
  ArenaStatsSummary,
  BotProfile,
  CheatAlertInfo,
  CombatModeId,
  EditorTab,
  MatchFormat,
  OpponentSolutionBuffer,
  PROVING_GROUNDS_AVATARS,
  RANDOM_CALLSIGNS,
  StackLanguage,
  TestCaseVerdict,
  computeExpectedQuestionTests,
  enrichQuestion,
  getSmartDurationSeconds,
  getTierFromElo,
  getVisibleWebTabs,
  isWebArenaQuestion,
  mapModeToConfig,
  sanitizeCallsign,
} from './arenaTypes';
import { getStoredSeenQuestionIds, persistSeenQuestionId, pickRivalProfile } from './arenaHelpers';
import { useArenaSocket } from './useArenaSocket';

export interface ArenaEngineProps {
  onClose: () => void;
  initialRoomCode?: string;
  initialQuestion?: DuelQuestion;
  currentUser?: { displayName?: string; username?: string; avatarUrl?: string };
}

/**
 * Core state & side-effect orchestrator for the 4-stage Kollabrix Battle Arena.
 */
export function useArenaEngine({ onClose, initialRoomCode, initialQuestion, currentUser }: ArenaEngineProps) {
  const { user, profile } = useAuth();
  const [stage, setStage] = useState<ArenaStage>('lobby');
  const stageRef = useRef<ArenaStage>('lobby');
  stageRef.current = stage;

  // Player identity (auto-sanitized on arrival so the user never starts with a callsign error)
  const [myPlayerId] = useState(() => `p-${Math.random().toString(36).slice(2, 9)}`);
  const initialCallsign = sanitizeCallsign(
    currentUser?.displayName || profile?.display_name || currentUser?.username || profile?.username || 'Builder'
  );
  const [playerName, setPlayerName] = useState<string>(initialCallsign);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('available');
  const [usernameMessage, setUsernameMessage] = useState<string>('Verified callsign ready');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('ronin');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(currentUser?.avatarUrl || '');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const playerCollege = (profile as any)?.college || (profile as any)?.university || 'DTU';

  const activeAvatarUrl =
    customAvatarUrl ||
    PROVING_GROUNDS_AVATARS.find((a) => a.id === selectedAvatarId)?.image ||
    PROVING_GROUNDS_AVATARS[0].image;

  // Player rating & stats
  const [stats, setStats] = useState<ArenaStatsSummary>({ elo: 1200, wins: 0, losses: 0, winStreak: 0, tier: 'SILVER I' });
  const [eloBefore, setEloBefore] = useState<number>(1200);

  // Lobby combat config
  const [combatMode, setCombatMode] = useState<CombatModeId>('blitz');
  const [algoLanguage, setAlgoLanguage] = useState<StackLanguage>('python');
  const [webTags, setWebTags] = useState<string[]>(['html', 'css', 'javascript']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('single');
  const [teamSize, setTeamSize] = useState<'1v1' | '2v2'>('1v1');
  const [timeLimit, setTimeLimit] = useState<number>(300);

  const selectCombatMode = (nextMode: CombatModeId) => {
    setLobbyNotice('');
    setCombatMode(nextMode);
    let nextStack = algoLanguage;
    if (nextMode === 'blitz' && nextStack === 'web') {
      nextStack = 'python';
      setAlgoLanguage('python');
    }
    const smartSecs = getSmartDurationSeconds(nextMode, difficulty, nextStack);
    setTimeLimit(smartSecs);
    setTimeLeft(smartSecs);
  };

  const selectDifficulty = (nextDiff: 'easy' | 'medium' | 'hard') => {
    setLobbyNotice('');
    setDifficulty(nextDiff);
    const smartSecs = getSmartDurationSeconds(combatMode, nextDiff, algoLanguage);
    setTimeLimit(smartSecs);
    setTimeLeft(smartSecs);
  };

  const selectStackLanguage = (nextStack: StackLanguage) => {
    setLobbyNotice('');
    setAlgoLanguage(nextStack);
    if (combatMode === 'custom') {
      const smartSecs = getSmartDurationSeconds(combatMode, difficulty, nextStack);
      setTimeLimit(smartSecs);
      setTimeLeft(smartSecs);
    }
  };

  // Room & Matchmaking
  const [roomCode, setRoomCode] = useState<string>('');
  const [roomData, setRoomData] = useState<any>(null);
  const [isHost, setIsHost] = useState<boolean>(true);
  const [isGhostDuel, setIsGhostDuel] = useState<boolean>(true);
  const [rivalProfile, setRivalProfile] = useState<BotProfile>(() => pickRivalProfile(0));
  const [faceOffStatus, setFaceOffStatus] = useState<'scanning' | 'locked' | 'countdown'>('scanning');
  const [countdownNum, setCountdownNum] = useState<number | 'COMPILE!'>(3);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoiningRoom, setIsJoiningRoom] = useState<boolean>(false);

  // Round & BO3 state
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [roundWins, setRoundWins] = useState<{ you: number; rival: number }>({ you: 0, rival: 0 });

  // Active Battle HUD + Code Buffers
  const questionPoolRef = useRef<DuelQuestion[]>([]);
  const previewInteractUntilRef = useRef<number>(0);
  const queueTicketIdRef = useRef<string | null>(null);
  const markPreviewInteraction = useCallback(() => {
    previewInteractUntilRef.current = Date.now() + 2000;
  }, []);
  const [availableQuestionsCount, setAvailableQuestionsCount] = useState<number | null>(null);
  const [lobbyNotice, setLobbyNotice] = useState<string>('');
  const [activeQuestion, setActiveQuestion] = useState<DuelQuestion>(enrichQuestion(initialQuestion));
  const [activeTab, setActiveTab] = useState<EditorTab>('python');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
  const [pythonCode, setPythonCode] = useState<string>('# Your Python solution\n');
  const [javaCode, setJavaCode] = useState<string>('// Your Java solution\n');
  const [cppCode, setCppCode] = useState<string>('// Your C++ solution\n');

  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [totalTests, setTotalTests] = useState<number>(5);
  const [userTestsPassed, setUserTestsPassed] = useState<number>(0);
  const [rivalTestsPassed, setRivalTestsPassed] = useState<number>(0);
  const [myWpm, setMyWpm] = useState<number>(0);
  const [peakWpm, setPeakWpm] = useState<number>(0);
  const [rivalWpm, setRivalWpm] = useState<number>(0);
  const [rivalLine, setRivalLine] = useState<number>(1);
  const [rivalActivityText, setRivalActivityText] = useState<string>('THINKING');
  const [rivalToast, setRivalToast] = useState<string>('');

  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [totalRuns, setTotalRuns] = useState<number>(0);
  const [testVerdicts, setTestVerdicts] = useState<Record<number, TestCaseVerdict>>({});
  const [webEvaluation, setWebEvaluation] = useState<WebGraphEvaluation | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ type: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [winnerSide, setWinnerSide] = useState<'you' | 'rival' | 'draw' | null>(null);
  const [rivalSolution, setRivalSolution] = useState<OpponentSolutionBuffer>({});

  // Fullscreen & Anti-cheat
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [myCheatStrikes, setMyCheatStrikes] = useState<number>(0);
  const [showCheatModal, setShowCheatModal] = useState<boolean>(false);
  const [rivalCheatAlert, setRivalCheatAlert] = useState<CheatAlertInfo | null>(null);

  const keystrokesRef = useRef<number[]>([]);
  const lastKeyTimeRef = useRef<number>(0);
  const hasRecordedEloRef = useRef<boolean>(false);
  const matchEndedRef = useRef<boolean>(false);

  const finalizeMatchResult = useCallback(
    (side: 'you' | 'rival' | 'draw') => {
      if (matchEndedRef.current) return;
      matchEndedRef.current = true;
      if (audioEnabled) {
        if (side === 'you') playVictorySound();
        else if (side === 'rival') playCompileErrorSound();
      }
      setWinnerSide(side);
      setStage('results');
    },
    [audioEnabled]
  );

  // Sync auth profile safely
  useEffect(() => {
    if (!user) return;
    const rawName = profile?.display_name || user.user_metadata?.full_name || profile?.username || user.email?.split('@')[0];
    if (rawName) setPlayerName(sanitizeCallsign(rawName));
  }, [user, profile]);

  // Fetch player rating and server question bank on mount
  const ratingUserId = user?.id || myPlayerId;
  useEffect(() => {
    fetch(`/api/arena/rating?userId=${encodeURIComponent(ratingUserId)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.stats) {
          const elo = d.stats.elo || 1200;
          setStats({
            elo,
            wins: d.stats.wins || 0,
            losses: d.stats.losses || 0,
            winStreak: d.stats.winStreak || 0,
            tier: getTierFromElo(elo),
          });
          if (stageRef.current === 'lobby') setEloBefore(elo);
        }
      })
      .catch(() => {});

    fetch('/api/arena/questions?summary=true', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (typeof d?.total === 'number') {
          setAvailableQuestionsCount(d.total);
        }
      })
      .catch(() => {});
  }, [ratingUserId]);

  // Debounced callsign check
  useEffect(() => {
    const clean = playerName.trim();
    if (clean.length < 3) {
      setUsernameStatus('idle');
      setUsernameMessage('Minimum 3 characters required');
      return;
    }
    setUsernameStatus('checking');
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/check-username?username=${encodeURIComponent(clean)}&userId=${user?.id || ''}`);
        const d = await res.json();
        setUsernameStatus(d.available === false ? 'taken' : 'available');
        setUsernameMessage(d.available === false ? d.message || 'Callsign taken' : 'Verified callsign ready');
      } catch {
        setUsernameStatus('available');
        setUsernameMessage('Verified callsign ready');
      }
    }, 300);
    return () => clearTimeout(t);
  }, [playerName, user?.id]);

  // Populate editor buffers for a chosen DuelQuestion
  const loadQuestionIntoWorkspace = useCallback(
    (q: DuelQuestion, durationSecs: number, lang: StackLanguage, mode: CombatModeId) => {
      const enriched = enrichQuestion({ ...q, timeLimitSeconds: durationSecs });
      const webMode = isWebArenaQuestion(enriched, mode);
      setActiveQuestion(enriched);
      setHtmlCode(enriched.starterHtml || (webMode ? enriched.codeWithBug || '' : ''));
      setCssCode(enriched.starterCss || '');
      setJsCode(enriched.starterJs || '');
      setPythonCode(enriched.starterPython || (!webMode && enriched.codeWithBug ? enriched.codeWithBug : '# Write your Python solution\n'));
      setJavaCode(enriched.starterJava || (!webMode && enriched.codeWithBug ? enriched.codeWithBug : '// Write your Java solution\n'));
      setCppCode(enriched.starterCpp || (!webMode && enriched.codeWithBug ? enriched.codeWithBug : '// Write your C++ solution\n'));
      setTotalTests(computeExpectedQuestionTests(enriched));
      setUserTestsPassed(0);
      setRivalTestsPassed(0);
      setTotalRuns(0);
      setTestVerdicts({});
      setWebEvaluation(null);
      setStatusNotice(null);
      setRivalSolution({});
      setTimeLimit(durationSecs);
      setTimeLeft(durationSecs);
      setWinnerSide(null);
      matchEndedRef.current = false;
      setMyCheatStrikes(0);
      setShowCheatModal(false);

      if (webMode) {
        const visibleTabs = getVisibleWebTabs(enriched);
        const hasCss = visibleTabs.includes('css');
        const hasJs = visibleTabs.includes('js');
        if (!hasCss) setCssCode('');
        if (!hasJs) setJsCode('');

        const htmlSame = Boolean(enriched.starterHtml && enriched.targetComponentHtml && enriched.starterHtml.replace(/\s+/g, '') === enriched.targetComponentHtml.replace(/\s+/g, ''));
        const cssSame = !hasCss || !enriched.targetComponentCss || Boolean(enriched.starterCss && enriched.starterCss.replace(/\s+/g, '') === enriched.targetComponentCss.replace(/\s+/g, ''));
        if (htmlSame && !cssSame && hasCss) setActiveTab('css');
        else if (htmlSame && cssSame && hasJs) setActiveTab('js');
        else setActiveTab('html');
      } else {
        const qTags = (enriched.tags || []).map((t) => t.toLowerCase().trim());
        const inferredLang: AlgoLanguage =
          lang !== 'web'
            ? lang
            : qTags.includes('cpp') || qTags.includes('c++') || Boolean(enriched.starterCpp)
              ? 'cpp'
              : qTags.includes('java') || Boolean(enriched.starterJava)
                ? 'java'
                : 'python';
        setActiveTab(inferredLang);
      }
    },
    []
  );

  // Pick next question based on current Lobby configuration (returns null if Admin bank has no matching question)
  const pickQuestionForConfig = useCallback(
    async (mode: CombatModeId, lang: StackLanguage, diff: 'easy' | 'medium' | 'hard', secs: number): Promise<DuelQuestion | null> => {
      if (initialQuestion) return enrichQuestion(initialQuestion);
      const { arena, bugDomain, tags } = mapModeToConfig(mode, lang, webTags);
      const isRandomWebBug = arena === 'bug_hunt' && bugDomain === 'web';
      const seenIds = getStoredSeenQuestionIds();
      let chosen: DuelQuestion | null = null;
      try {
        const qs = new URLSearchParams({
          arena,
          difficulty: isRandomWebBug ? 'random' : diff,
          tags: tags.join(','),
          ...(mode !== 'bug_hunt' ? { timeLimit: String(secs) } : {}),
          seenIds: seenIds.join(','),
          ...(bugDomain ? { bugDomain } : {}),
        });
        const res = await fetch(`/api/arena/questions?${qs.toString()}`, { cache: 'no-store' });
        const d = await res.json();
        if (Array.isArray(d?.questions) && d.questions.length > 0) {
          chosen = selectBestQuestion(d.questions, {
            arena,
            bugDomain,
            selectedTags: tags,
            difficulty: isRandomWebBug ? undefined : diff,
            timeLimit: mode === 'bug_hunt' ? undefined : secs,
            seenQuestionIds: seenIds,
          });
        }
      } catch {}
      if (!chosen && questionPoolRef.current.length > 0) {
        const hasMatch = questionPoolRef.current.some((q) => {
          if (q.arena !== arena) return false;
          if (arena === 'bug_hunt' && bugDomain) {
            const qIsWeb = q.bugDomain === 'web' || Boolean(q.targetComponentHtml);
            return bugDomain === 'web' ? qIsWeb : !qIsWeb;
          }
          return true;
        });
        if (hasMatch) {
          chosen = selectBestQuestion(questionPoolRef.current, {
            arena,
            bugDomain,
            selectedTags: tags,
            difficulty: diff,
            timeLimit: mode === 'bug_hunt' ? undefined : secs,
            seenQuestionIds: seenIds,
          });
        }
      }
      if (!chosen) return null;
      if (chosen.id) persistSeenQuestionId(chosen.id);
      return enrichQuestion(chosen);
    },
    [initialQuestion, webTags]
  );

  const toggleFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      } else {
        document.documentElement.requestFullscreen?.().catch(() => {});
        setIsFullscreen(true);
      }
    } catch {}
  }, []);

  // Socket hook
  const { sendEvent } = useArenaSocket({
    active: (stage === 'room' || stage === 'faceoff' || stage === 'battle') && !isGhostDuel,
    roomCode,
    myPlayerId,
    playerName,
    isHost,
    stage,
    onRoomSync: (rm) => {
      setRoomData(rm);
      if (rm.status === 'closed') {
        setStage('lobby');
        setStatusNotice({ type: 'info', text: 'Room closed by host.' });
        return;
      }
      const amHost = rm.hostId ? rm.hostId === myPlayerId : isHost;
      const oppTeam = amHost ? rm.omegaPlayers : rm.alphaPlayers;
      const realOpp = oppTeam?.find((p: any) => p.id !== 'bot-rival' && p.id !== myPlayerId);
      if (realOpp) {
        setIsGhostDuel(false);
        setRivalProfile((prev) => ({
          ...prev,
          name: realOpp.name,
          college: prev.college === 'DTU Delhi' && realOpp.name !== prev.name ? 'Campus Builder' : prev.college,
          branch: 'Live Rival',
          tag: 'ONLINE',
          avatarIdx: realOpp.avatarIdx || prev.avatarIdx || 1,
          avatarEmoji: prev.avatarEmoji || '⚔️',
          baseWpm: realOpp.wpm || prev.baseWpm || 60,
        }));
        if (typeof realOpp.testsPassed === 'number') {
          setRivalTestsPassed((prev) => Math.max(prev, realOpp.testsPassed));
        }
        if (typeof realOpp.wpm === 'number' && realOpp.wpm > 0) {
          setRivalWpm(realOpp.wpm);
          setRivalActivityText('TYPING');
        }
      }
      if (stageRef.current === 'room' && (rm.status === 'starting' || rm.status === 'in_progress')) {
        const roomMode: CombatModeId = rm.arena === 'web_dev' ? 'web_clash' : rm.arena === 'bug_hunt' ? 'bug_hunt' : 'blitz';
        const qTags = [...(rm.selectedTags || []), ...(rm.question?.tags || [])].map((t: string) => String(t).toLowerCase().trim());
        const isWebRoom = roomMode === 'web_clash' || Boolean(rm.question?.targetComponentHtml) || qTags.includes('web') || qTags.includes('html');
        const roomLang: StackLanguage = isWebRoom ? 'web' : (qTags.includes('cpp') || qTags.includes('c++')) ? 'cpp' : qTags.includes('java') ? 'java' : 'python';
        setCombatMode(roomMode);
        setAlgoLanguage(roomLang);
        if (rm.question) loadQuestionIntoWorkspace(rm.question, rm.timeLimit || timeLimit, roomLang, roomMode);
        setFaceOffStatus('countdown');
        setCountdownNum(3);
        setStage('faceoff');
      }
      if (rm.status === 'finished' && rm.winnerTeam && (stageRef.current === 'battle' || stageRef.current === 'faceoff')) {
        const iWon = (rm.winnerTeam === 'Team Alpha' && isHost) || (rm.winnerTeam === 'Team Omega' && !isHost);
        finalizeMatchResult(iWon ? 'you' : 'rival');
      }
    },
    onMatchWon: (payload) => {
      if (stageRef.current !== 'battle') return;
      const iWon =
        payload.winnerId === myPlayerId ||
        (payload.winnerTeam && payload.winnerTeam === (isHost ? 'Team Alpha' : 'Team Omega'));
      finalizeMatchResult(iWon ? 'you' : 'rival');
    },
    onProgress: (testsPassed, wpm, cursorLine) => {
      if (typeof testsPassed === 'number') {
        if (testsPassed > rivalTestsPassed) setRivalToast(`🔥 Rival just passed Case ${testsPassed}/${totalTests}`);
        setRivalTestsPassed(testsPassed);
      }
      if (typeof wpm === 'number') {
        setRivalWpm(wpm);
        setRivalActivityText(wpm > 0 ? 'TYPING' : 'THINKING');
      }
      if (typeof cursorLine === 'number') setRivalLine(cursorLine);
    },
    onCheatAlert: setRivalCheatAlert,
    onRivalSolution: setRivalSolution,
    onRoomClosed: () => setStage('lobby'),
    onNotice: (text) => setStatusNotice({ type: 'info', text }),
  });

  // Auto-hide rival toast after 4s
  useEffect(() => {
    if (!rivalToast) return;
    const t = setTimeout(() => setRivalToast(''), 4000);
    return () => clearTimeout(t);
  }, [rivalToast]);

  // Launch 1-click Quick Blitz / Bug Hunt / Web Clash OR Warmup vs Ghost
  const launchInstantMatch = async (ghostOnly: boolean) => {
    if (usernameStatus === 'taken') return;
    setLobbyNotice('');
    const duration = combatMode === 'bug_hunt' ? 60 : (timeLimit || getSmartDurationSeconds(combatMode, difficulty, algoLanguage));
    const chosenQ = await pickQuestionForConfig(combatMode, algoLanguage, difficulty, duration);
    if (!chosenQ) {
      setLobbyNotice('No questions published yet for this selection. Add challenges in Admin Control Center → Battle Arena.');
      return;
    }

    if (audioEnabled) playBattleSlamSound();
    const fallbackCode = `KBX-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(fallbackCode);
    setIsHost(true);
    setTeamSize('1v1');
    setEloBefore(stats.elo);
    setRoundNumber(1);
    setRoundWins({ you: 0, rival: 0 });
    loadQuestionIntoWorkspace(chosenQ, duration, algoLanguage, combatMode);

    if (ghostOnly) {
      setIsGhostDuel(true);
      setRivalProfile(pickRivalProfile());
      setFaceOffStatus('locked');
      setStage('faceoff');
      trackEvent('arena_match_started', { mode: combatMode, ghostOnly: true, language: algoLanguage });
      return;
    }

    // Ranked Matchmaking: Scan for real human contender first!
    setRivalProfile(pickRivalProfile());
    setFaceOffStatus('scanning');
    setStage('faceoff');

    try {
      const res = await fetch('/api/arena/matchmake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          playerId: myPlayerId,
          playerName,
          college: playerCollege || 'Campus Contender',
          avatarIdx: Math.max(0, PROVING_GROUNDS_AVATARS.findIndex((a) => a.id === selectedAvatarId)),
          elo: stats.elo,
          combatMode,
          algoLanguage,
          webTags,
          difficulty,
          timeLimit: duration,
          question: chosenQ,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.matched && data?.roomInfo) {
          // Immediately paired with another real waiting player!
          const info = data.roomInfo;
          setIsGhostDuel(false);
          setRoomCode(info.code);
          setIsHost(info.isHost);
          setRivalProfile({
            name: info.opponent.name,
            college: info.opponent.college || 'Campus Contender',
            branch: 'Live Contender',
            tag: (info.opponent.college || 'ONLINE').slice(0, 12).toUpperCase(),
            avatarIdx: info.opponent.avatarIdx ?? 1,
            avatarEmoji: '⚡',
            baseWpm: 66,
            elo: info.opponent.elo || 1200,
          });
          if (!info.isHost && info.question) {
            loadQuestionIntoWorkspace(info.question, info.timeLimit, algoLanguage, combatMode);
          }
          setFaceOffStatus('locked');
          if (audioEnabled) playArcadeCoinSound();
          trackEvent('arena_match_started', { mode: combatMode, ghostOnly: false, humanPvP: true });
          return;
        } else if (data?.ticketId) {
          queueTicketIdRef.current = data.ticketId;
        }
      }
    } catch (_) {}

    trackEvent('arena_match_started', { mode: combatMode, ghostOnly: false, language: algoLanguage });
  };

  // Launch Custom / 2v2 Private Room Lobby
  const createCustomRoom = async () => {
    if (usernameStatus === 'taken') return;
    setLobbyNotice('');
    const chosenQ = await pickQuestionForConfig(combatMode, algoLanguage, difficulty, timeLimit);
    if (!chosenQ) {
      setLobbyNotice('No questions published yet for this Custom selection. Add challenges in Admin Control Center → Battle Arena.');
      return;
    }

    if (audioEnabled) playArcadeCoinSound();
    const code = `KBX-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(code);
    setIsHost(true);
    setIsGhostDuel(false);
    setEloBefore(stats.elo);
    loadQuestionIntoWorkspace(chosenQ, timeLimit, algoLanguage, combatMode);
    setStage('room');

    const { arena, bugDomain, tags } = mapModeToConfig(combatMode, algoLanguage, webTags);
    try {
      const res = await fetch('/api/arena/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          hostName: playerName,
          hostId: myPlayerId,
          format: teamSize,
          arena,
          bugDomain,
          selectedTags: tags,
          difficulty,
          timeLimit,
          isBotEnabled: false,
          question: chosenQ,
        }),
      });
      const d = await res.json();
      if (d?.room) setRoomData(d.room);
    } catch {}
  };

  // Join existing room by code
  const joinRoomByCode = async (rawInput: string) => {
    const clean = rawInput.trim().toUpperCase();
    if (!clean) {
      setJoinError('Enter a room code (e.g. KBX-4821)');
      return false;
    }
    setIsJoiningRoom(true);
    setJoinError(null);
    try {
      const res = await fetch('/api/arena/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, player: { id: myPlayerId, name: playerName, avatarIdx: 1 } }),
      });
      const d = await res.json();
      if (!res.ok || !d?.success || !d?.room) {
        setJoinError(d?.error || `Room ${clean} not found.`);
        return false;
      }
      setIsHost(false);
      setIsGhostDuel(false);
      setRoomData(d.room);
      setRoomCode(d.room.code);
      setTeamSize(d.room.format || '1v1');
      const rm = d.room;
      const roomMode: CombatModeId = rm.arena === 'web_dev' ? 'web_clash' : rm.arena === 'bug_hunt' ? 'bug_hunt' : 'blitz';
      const qTags = [...(rm.selectedTags || []), ...(rm.question?.tags || [])].map((t: string) => String(t).toLowerCase().trim());
      const isWebRoom = roomMode === 'web_clash' || Boolean(rm.question?.targetComponentHtml) || qTags.includes('web') || qTags.includes('html');
      const roomLang: StackLanguage = isWebRoom ? 'web' : (qTags.includes('cpp') || qTags.includes('c++')) ? 'cpp' : qTags.includes('java') ? 'java' : 'python';
      setCombatMode(roomMode);
      setAlgoLanguage(roomLang);
      if (rm.question) loadQuestionIntoWorkspace(rm.question, rm.timeLimit || 300, roomLang, roomMode);
      setStage('room');
      return true;
    } catch (e: any) {
      setJoinError(e?.message || 'Unable to join room.');
      return false;
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Handle ?room= URL entry
  useEffect(() => {
    if (initialRoomCode) joinRoomByCode(initialRoomCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRoomCode]);

  // Start match from Custom Room
  const startCustomRoomMatch = () => {
    const hasHuman = roomData?.omegaPlayers?.some((p: any) => p.id !== 'bot-rival');
    if (!hasHuman) setIsGhostDuel(true);
    setFaceOffStatus('countdown');
    setCountdownNum(3);
    setStage('faceoff');
    sendEvent('match_starting', { room: { ...roomData, status: 'starting', question: activeQuestion } });
    fetch('/api/arena/rooms/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: roomCode, action: 'start_match', payload: { question: activeQuestion, timeLimit } }),
    }).catch(() => {});
  };

  // Face-off Queue Scanner (max 4.2s) -> Real PvP match OR seamless bot fallback -> Lock -> 3-2-1-COMPILE Countdown -> Battle
  useEffect(() => {
    if (stage !== 'faceoff') return;
    if (faceOffStatus === 'scanning') {
      let isSubscribed = true;
      const ticketId = queueTicketIdRef.current;

      // Fast polling loop to check if matched with another human contender
      const pollInterval = setInterval(async () => {
        if (!ticketId || !isSubscribed) return;
        try {
          const res = await fetch(`/api/arena/matchmake?ticketId=${ticketId}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data?.matched && data?.roomInfo && isSubscribed) {
            clearInterval(pollInterval);
            clearTimeout(scanTimer);
            queueTicketIdRef.current = null;
            const info = data.roomInfo;
            setIsGhostDuel(false);
            setRoomCode(info.code);
            setIsHost(info.isHost);
            setRivalProfile({
              name: info.opponent.name,
              college: info.opponent.college || 'Campus Contender',
              branch: 'Live Contender',
              tag: (info.opponent.college || 'ONLINE').slice(0, 12).toUpperCase(),
              avatarIdx: info.opponent.avatarIdx ?? 1,
              avatarEmoji: '⚡',
              baseWpm: 66,
              elo: info.opponent.elo || 1200,
            });
            if (!info.isHost && info.question) {
              loadQuestionIntoWorkspace(info.question, info.timeLimit, algoLanguage, combatMode);
            }
            setFaceOffStatus('locked');
            if (audioEnabled) playArcadeCoinSound();
          }
        } catch (_) {}
      }, 500);

      // Fallback to simulated collegiate bot rival if no human found within 4.2s
      const scanTimer = setTimeout(() => {
        if (!isSubscribed) return;
        clearInterval(pollInterval);
        if (ticketId) {
          fetch(`/api/arena/matchmake?ticketId=${ticketId}`, { method: 'DELETE' }).catch(() => {});
          queueTicketIdRef.current = null;
        }
        setIsGhostDuel(true);
        setFaceOffStatus('locked');
        if (audioEnabled) playArcadeCoinSound();
      }, 4200);

      return () => {
        isSubscribed = false;
        clearInterval(pollInterval);
        clearTimeout(scanTimer);
        if (queueTicketIdRef.current) {
          const staleId = queueTicketIdRef.current;
          queueTicketIdRef.current = null;
          fetch(`/api/arena/matchmake?ticketId=${staleId}`, { method: 'DELETE' }).catch(() => {});
        }
      };
    }
    if (faceOffStatus === 'locked') {
      const lockTimer = setTimeout(() => {
        setCountdownNum(3);
        setFaceOffStatus('countdown');
      }, 1100);
      return () => clearTimeout(lockTimer);
    }
    if (faceOffStatus === 'countdown') {
      const steps: Array<[number | 'COMPILE!', number | 'COMPILE!', () => void]> = [
        [3, 2, () => audioEnabled && playTacticalSelectSound()],
        [2, 1, () => audioEnabled && playTacticalSelectSound()],
        [1, 'COMPILE!', () => audioEnabled && playBattleSlamSound()],
      ];
      const match = steps.find(([cur]) => cur === countdownNum);
      if (match) {
        const t = setTimeout(() => {
          match[2]();
          setCountdownNum(match[1]);
        }, 850);
        return () => clearTimeout(t);
      }
      if (countdownNum === 'COMPILE!') {
        if (audioEnabled) playCyberSwordClashSound();
        const t = setTimeout(() => {
          setStage('battle');
          if (!isGhostDuel && roomCode) {
            fetch('/api/arena/rooms/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: roomCode, action: 'in_progress' }),
            }).catch(() => {});
          }
        }, 650);
        return () => clearTimeout(t);
      }
    }
  }, [stage, faceOffStatus, countdownNum, audioEnabled, roomCode]);

  // Countdown clock during battle
  useEffect(() => {
    if (stage !== 'battle') return;
    const iv = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(iv);
          const side: 'you' | 'rival' | 'draw' =
            userTestsPassed > rivalTestsPassed ? 'you' : rivalTestsPassed > userTestsPassed ? 'rival' : 'draw';
          finalizeMatchResult(side);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [stage, userTestsPassed, rivalTestsPassed]);

  // Ref snapshot for safe unmount / pagehide leave-forfeit without false triggers on stage transitions or re-renders
  const livePvpRef = useRef({
    active: false,
    roomCode: '',
    isHost: true,
    myPlayerId: '',
    rivalName: '',
    sendEvent: (_ev: string, _p: Record<string, any>) => {},
  });
  livePvpRef.current = {
    active: !isGhostDuel && Boolean(roomCode) && stage === 'battle' && !matchEndedRef.current,
    roomCode,
    isHost,
    myPlayerId,
    rivalName: rivalProfile.name,
    sendEvent,
  };

  // Tab close / refresh / Next.js route unmount auto-forfeit ONLY when truly leaving an active PvP battle
  useEffect(() => {
    let sentLeave = false;
    const notifyLeaveForfeit = () => {
      const snap = livePvpRef.current;
      if (!snap.active || sentLeave || matchEndedRef.current) return;
      sentLeave = true;
      const oppTeam = snap.isHost ? 'Team Omega' : 'Team Alpha';
      const body = JSON.stringify({
        code: snap.roomCode,
        action: 'match_won',
        playerId: snap.myPlayerId,
        payload: { forfeit: true, winnerTeam: oppTeam },
      });
      try {
        snap.sendEvent('match_won', { winnerName: snap.rivalName, winnerTeam: oppTeam });
      } catch {}
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon('/api/arena/rooms/sync', new Blob([body], { type: 'application/json' }));
          return;
        }
      } catch {}
      fetch('/api/arena/rooms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener('pagehide', notifyLeaveForfeit);
    window.addEventListener('beforeunload', notifyLeaveForfeit);
    return () => {
      window.removeEventListener('pagehide', notifyLeaveForfeit);
      window.removeEventListener('beforeunload', notifyLeaveForfeit);
      notifyLeaveForfeit();
    };
  }, []);

  // Periodic PvP heartbeat during active battle to detect silent opponent disconnects
  useEffect(() => {
    if (stage !== 'battle' || isGhostDuel || !roomCode) return;
    const hb = setInterval(() => {
      if (matchEndedRef.current || stageRef.current !== 'battle') return;
      fetch('/api/arena/rooms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, action: 'heartbeat', playerId: myPlayerId }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.room?.status === 'finished' && d?.room?.winnerTeam && !matchEndedRef.current) {
            const amHost = d.room.hostId ? d.room.hostId === myPlayerId : isHost;
            const iWon = (d.room.winnerTeam === 'Team Alpha' && amHost) || (d.room.winnerTeam === 'Team Omega' && !amHost);
            finalizeMatchResult(iWon ? 'you' : 'rival');
          }
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(hb);
  }, [stage, isGhostDuel, roomCode, isHost, myPlayerId, finalizeMatchResult]);

  // Typing cadence tracker
  const handleCodeChange = (nextCode: string, setter: (v: string) => void) => {
    setter(nextCode);
    const now = Date.now();
    lastKeyTimeRef.current = now;
    keystrokesRef.current = [...keystrokesRef.current.filter((t) => now - t <= 6000), now];
    const wpm = Math.min(180, Math.round(keystrokesRef.current.length * 2));
    setMyWpm(wpm);
    if (wpm > peakWpm) setPeakWpm(wpm);
    const lineCount = nextCode.split('\n').length;
    sendEvent('progress_sync', { playerId: myPlayerId, testsPassed: userTestsPassed, wpm, cursorLine: lineCount });
  };

  // Ghost Rival telemetry simulator (only runs in Ghost/Shadow duels)
  useEffect(() => {
    if (stage !== 'battle' || !isGhostDuel) return;
    const startMs = Date.now();
    const t1 = Math.floor(timeLimit * 0.28);
    const t2 = Math.floor(timeLimit * 0.62);
    const tFinish = Math.floor(timeLimit * 0.92);
    let passed = 0;

    const iv = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      if (elapsed < 6) {
        setRivalWpm(0);
        setRivalActivityText('READING SPEC');
        setRivalLine(1);
        return;
      }
      const wpm = Math.max(38, Math.round(rivalProfile.baseWpm + Math.sin(elapsed) * 14));
      setRivalWpm(wpm);
      setRivalActivityText('TYPING');
      setRivalLine(Math.min(14, 2 + Math.floor((elapsed - 5) / 4)));

      if (elapsed >= t1 && passed < 1 && totalTests >= 2) {
        passed = 1;
        setRivalTestsPassed(1);
        setRivalToast(`🔥 ${rivalProfile.name} passed Case 1/${totalTests}`);
      } else if (elapsed >= t2 && passed < Math.min(2, Math.max(1, totalTests - 1)) && totalTests >= 3) {
        passed = 2;
        setRivalTestsPassed(2);
        setRivalToast(`🔥 ${rivalProfile.name} passed Case 2/${totalTests}`);
      } else if (elapsed >= tFinish && passed < totalTests) {
        passed = totalTests;
        setRivalTestsPassed(totalTests);
        finalizeMatchResult('rival');
      }
    }, 1200);
    return () => clearInterval(iv);
  }, [stage, isGhostDuel, timeLimit, rivalProfile, totalTests, finalizeMatchResult]);

  // Immediate match termination invariant: as soon as Rival completes ALL tests, Rival wins
  useEffect(() => {
    if (stage === 'battle' && totalTests > 0 && rivalTestsPassed >= totalTests) {
      finalizeMatchResult('rival');
    }
  }, [stage, rivalTestsPassed, totalTests, finalizeMatchResult]);

  // Anti-cheat tab/window focus sentinel during active battle (ignores clicks inside live preview iframes)
  useEffect(() => {
    if (stage !== 'battle') return;
    let lastFlag = 0;
    let blurTimer: ReturnType<typeof setTimeout> | null = null;

    const flag = (reason: string) => {
      const now = Date.now();
      if (now - lastFlag < 2000) return;
      lastFlag = now;
      setMyCheatStrikes((s) => {
        const next = s + 1;
        if (audioEnabled) playCheatWarningSiren();
        setShowCheatModal(true);
        sendEvent('cheat_alert', { playerId: myPlayerId, name: playerName, strikes: next, reason });
        return next;
      });
    };

    const onVis = () => document.visibilityState === 'hidden' && flag('Tab switched away from Arena');
    const onBlur = () => {
      if (blurTimer) clearTimeout(blurTimer);
      blurTimer = setTimeout(() => {
        if (document.hidden || document.visibilityState === 'hidden') return;
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === 'IFRAME' || activeEl.getAttribute('data-arena-preview') === 'true')
        ) {
          return;
        }
        if (Date.now() < previewInteractUntilRef.current) return;
        if (document.hasFocus()) return;
        flag('Window focus lost during duel');
      }, 90);
    };

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    return () => {
      if (blurTimer) clearTimeout(blurTimer);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
    };
  }, [stage, audioEnabled, myPlayerId, playerName, sendEvent]);

  // Claim win on server first so rival loses immediately on race condition
  const claimWinAuthoritatively = async (passedCount: number) => {
    const myTeam = isHost ? 'Team Alpha' : 'Team Omega';
    if (!isGhostDuel && roomCode) {
      try {
        const res = await fetch('/api/arena/rooms/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: roomCode,
            action: 'match_won',
            playerId: myPlayerId,
            payload: { playerName, testsPassed: passedCount, winnerTeam: myTeam },
          }),
        });
        const d = await res.json();
        if (d?.alreadyFinished && d?.room?.winnerTeam && d.room.winnerTeam !== myTeam) {
          finalizeMatchResult('rival');
          return;
        }
      } catch {}
      sendEvent('match_won', { winnerId: myPlayerId, winnerName: playerName, winnerTeam: myTeam });
      sendEvent('room_sync', { room: { ...roomData, status: 'finished', winnerTeam: myTeam } });
    }
    finalizeMatchResult('you');
  };

  // Real Test Execution (Judge0 Compiler OR Web Coordinate Graph)
  const runOrSubmit = async (isSubmit: boolean) => {
    if (isSubmit) setIsSubmitting(true);
    else setIsCompiling(true);
    setTotalRuns((r) => r + 1);
    setStatusNotice(null);

    const isWeb = isWebArenaQuestion(activeQuestion, combatMode);
    if (isWeb) {
      const visibleTabs = getVisibleWebTabs(activeQuestion);
      const allowCss = visibleTabs.includes('css');
      const allowJs = visibleTabs.includes('js');
      const evalRes = evaluateWebCoordinateGraph(
        activeQuestion.id,
        htmlCode,
        allowCss ? cssCode : '',
        activeQuestion.targetComponentHtml,
        allowCss ? activeQuestion.targetComponentCss : '',
        {
          tags: activeQuestion.tags || webTags,
          jsCode: allowJs ? jsCode : '',
          targetJs: allowJs ? activeQuestion.targetComponentJs : '',
          starterHtml: activeQuestion.starterHtml,
          starterCss: allowCss ? activeQuestion.starterCss : '',
          starterJs: allowJs ? activeQuestion.starterJs : '',
          isBugHunt: activeQuestion.arena === 'bug_hunt',
          validationCriteria: activeQuestion.validationCriteria,
        }
      );
      setWebEvaluation(evalRes);
      setTotalTests(evalRes.totalTests);
      setUserTestsPassed(evalRes.testsPassed);
      sendEvent('progress_sync', { playerId: myPlayerId, testsPassed: evalRes.testsPassed, wpm: myWpm });
      if (!isGhostDuel && roomCode) {
        fetch('/api/arena/rooms/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: roomCode, action: 'progress', playerId: myPlayerId, payload: { testsPassed: evalRes.testsPassed, wpm: myWpm } }),
        }).catch(() => {});
      }

      const verdicts: Record<number, TestCaseVerdict> = {};
      evalRes.results.forEach((r, idx) => {
        verdicts[idx] = { status: r.passed ? 'Accepted' : 'Wrong Answer', stdout: r.message };
      });
      setTestVerdicts(verdicts);

      if (evalRes.passed) {
        if (isSubmit) {
          await claimWinAuthoritatively(evalRes.testsPassed);
        } else {
          if (audioEnabled) playCompileSuccessSound();
          setStatusNotice({ type: 'ok', text: `All ${evalRes.totalTests} layout checks passed! Click Submit Solution to claim victory.` });
        }
      } else {
        if (audioEnabled) playCompileErrorSound();
        setStatusNotice({ type: 'err', text: `${evalRes.testsPassed}/${evalRes.totalTests} checks passed. Refine HTML/CSS/JS before submitting.` });
      }
      setIsCompiling(false);
      setIsSubmitting(false);
      return;
    }

    // Compiler Execution (Python / Java / C++)
    const lang = activeTab === 'java' ? 'java' : activeTab === 'cpp' ? 'cpp' : 'python';
    const code = lang === 'python' ? pythonCode : lang === 'java' ? javaCode : cppCode;
    const tcs = activeQuestion.testCases || [];

    const results = await Promise.all(
      tcs.map(async (tc, idx) => {
        try {
          const res = await fetch('/api/compiler/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: lang, code, stdin: tc.input || '' }),
          });
          const d = await res.json();
          const out = (d.stdout || '').trim();
          const errText = (d.stderr || d.compile_output || (!d.success ? d.error : '') || '').trim();
          const pass = Boolean(d.success) && verifyTestOutput(activeQuestion.id, out, (tc.expectedOutput || '').trim(), tc.input || '');
          return {
            idx,
            verdict: {
              status: (!d.success ? 'Error' : pass ? 'Accepted' : 'Wrong Answer') as TestCaseVerdict['status'],
              stdout: out || (errText ? '' : '(No output)'),
              stderr: errText || undefined,
              executionTimeMs: d.executionTimeMs || 15,
            },
          };
        } catch {
          return { idx, verdict: { status: 'Error' as const, stdout: '', stderr: 'Execution service unreachable' } };
        }
      })
    );

    const map: Record<number, TestCaseVerdict> = {};
    let passed = 0;
    let firstErrSnippet = '';
    results.forEach(({ idx, verdict }) => {
      map[idx] = verdict;
      if (verdict.status === 'Accepted') passed++;
      else if (!firstErrSnippet && verdict.stderr) {
        firstErrSnippet = verdict.stderr.split('\n').map((l: string) => l.trim()).filter(Boolean).pop() || '';
      }
    });
    setTestVerdicts(map);
    setUserTestsPassed(passed);
    sendEvent('progress_sync', { playerId: myPlayerId, testsPassed: passed, wpm: myWpm });
    if (!isGhostDuel && roomCode) {
      fetch('/api/arena/rooms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, action: 'progress', playerId: myPlayerId, payload: { testsPassed: passed, wpm: myWpm } }),
      }).catch(() => {});
    }

    if (passed === tcs.length && tcs.length > 0) {
      if (isSubmit) {
        await claimWinAuthoritatively(passed);
      } else {
        if (audioEnabled) playCompileSuccessSound();
        setStatusNotice({ type: 'ok', text: `All ${tcs.length} test cases accepted! Ready to Submit Solution.` });
      }
    } else {
      if (audioEnabled) playCompileErrorSound();
      setStatusNotice({
        type: 'err',
        text: firstErrSnippet
          ? `${passed}/${tcs.length} passed · ${firstErrSnippet}`
          : `${passed}/${tcs.length} cases passed. Check Test Runner details on the left.`,
      });
    }
    setIsCompiling(false);
    setIsSubmitting(false);
  };

  // Post ELO & BO3 round updates when reaching Results
  useEffect(() => {
    if (stage !== 'results') {
      hasRecordedEloRef.current = false;
      return;
    }
    if (hasRecordedEloRef.current) return;
    hasRecordedEloRef.current = true;

    sendEvent('match_solution_reveal', {
      playerId: myPlayerId,
      playerName,
      htmlCode,
      cssCode,
      jsCode,
      pythonCode,
      javaCode,
      cppCode,
    });

    const outcome = winnerSide === 'you' ? 'win' : winnerSide === 'rival' ? 'loss' : 'draw';
    const optimisticDelta = outcome === 'win' ? 24 : outcome === 'loss' ? -16 : 0;
    const optimisticElo = Math.max(800, eloBefore + optimisticDelta);
    setStats((prev) => ({
      ...prev,
      elo: optimisticElo,
      tier: getTierFromElo(optimisticElo),
      winStreak: outcome === 'win' ? prev.winStreak + 1 : 0,
    }));

    fetch('/api/arena/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: ratingUserId,
        userName: playerName,
        outcome,
        timeRemaining: timeLeft,
        matchDuration: timeLimit,
        testsPassed: userTestsPassed,
        totalTests,
        opponentName: rivalProfile.name,
        arena: activeQuestion.arena,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success && d?.stats) {
          const nextElo = d.stats.elo || d.newElo || optimisticElo;
          setStats({
            elo: nextElo,
            wins: d.stats.wins || stats.wins,
            losses: d.stats.losses || stats.losses,
            winStreak: d.stats.winStreak || 0,
            tier: getTierFromElo(nextElo),
          });
        }
      })
      .catch(() => {});
  }, [stage, winnerSide, ratingUserId, myPlayerId, eloBefore, playerName, timeLeft, timeLimit, userTestsPassed, totalTests, rivalProfile.name, activeQuestion.arena, matchFormat, htmlCode, cssCode, jsCode, pythonCode, javaCode, cppCode, sendEvent, stats.elo, stats.wins, stats.losses]);

  const rollCallsign = () => {
    if (audioEnabled) playTacticalSelectSound();
    setPlayerName(RANDOM_CALLSIGNS[Math.floor(Math.random() * RANDOM_CALLSIGNS.length)]);
  };

  const cancelMatchmaking = () => {
    if (queueTicketIdRef.current) {
      const staleId = queueTicketIdRef.current;
      queueTicketIdRef.current = null;
      fetch(`/api/arena/matchmake?ticketId=${staleId}`, { method: 'DELETE' }).catch(() => {});
    }
    setStage('lobby');
  };

  const handleForfeit = () => {
    if (!isGhostDuel && roomCode) {
      const oppTeam = isHost ? 'Team Omega' : 'Team Alpha';
      sendEvent('match_won', { winnerName: rivalProfile.name, winnerTeam: oppTeam });
      fetch('/api/arena/rooms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          action: 'match_won',
          playerId: myPlayerId,
          payload: { forfeit: true, winnerTeam: oppTeam },
        }),
      }).catch(() => {});
    }
    finalizeMatchResult('rival');
  };

  return {
    onClose,
    stage,
    setStage,
    playerName,
    setPlayerName,
    usernameStatus,
    usernameMessage,
    rollCallsign,
    activeAvatarUrl,
    selectedAvatarId,
    setSelectedAvatarId,
    setCustomAvatarUrl,
    playerCollege,
    stats,
    eloBefore,
    audioEnabled,
    setAudioEnabled,
    combatMode,
    setCombatMode,
    selectCombatMode,
    algoLanguage,
    setAlgoLanguage,
    webTags,
    setWebTags,
    difficulty,
    setDifficulty,
    selectDifficulty,
    selectStackLanguage,
    matchFormat,
    setMatchFormat,
    availableQuestionsCount,
    lobbyNotice,
    setLobbyNotice,
    teamSize,
    setTeamSize,
    timeLimit,
    setTimeLimit,
    roomCode,
    roomData,
    isHost,
    isGhostDuel,
    rivalProfile,
    faceOffStatus,
    countdownNum,
    joinError,
    isJoiningRoom,
    roundNumber,
    roundWins,
    activeQuestion,
    activeTab,
    setActiveTab,
    htmlCode,
    setHtmlCode,
    cssCode,
    setCssCode,
    jsCode,
    setJsCode,
    pythonCode,
    setPythonCode,
    javaCode,
    setJavaCode,
    cppCode,
    setCppCode,
    handleCodeChange,
    timeLeft,
    totalTests,
    userTestsPassed,
    rivalTestsPassed,
    myWpm,
    peakWpm,
    rivalWpm,
    rivalLine,
    rivalActivityText,
    rivalToast,
    isCompiling,
    isSubmitting,
    totalRuns,
    testVerdicts,
    webEvaluation,
    statusNotice,
    winnerSide,
    rivalSolution,
    isFullscreen,
    toggleFullscreen,
    myCheatStrikes,
    showCheatModal,
    setShowCheatModal,
    rivalCheatAlert,
    launchInstantMatch,
    createCustomRoom,
    joinRoomByCode,
    startCustomRoomMatch,
    runOrSubmit,
    markPreviewInteraction,
    cancelMatchmaking,
    handleForfeit,
  };
}
