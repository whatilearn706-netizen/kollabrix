'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
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
  Eye,
  EyeOff,
  Radio,
  Award,
} from 'lucide-react';
import {
  ArenaCategory,
  DuelQuestion,
  DuelRoom,
  DEFAULT_ARENA_QUESTIONS,
} from '@/types/arenaDuel';
import { playVictorySound } from '@/lib/arena/soundEffects';

interface MultiplayerDuelLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { displayName?: string; username?: string; avatarUrl?: string };
}

export function MultiplayerDuelLobbyModal({
  isOpen,
  onClose,
  currentUser,
}: MultiplayerDuelLobbyModalProps) {
  // Lobby Setup States
  const [roomCode] = useState(() => `KBX-${Math.floor(1000 + Math.random() * 9000)}`);
  const [arena, setArena] = useState<ArenaCategory>('web_dev');
  const [selectedTags, setSelectedTags] = useState<string[]>(['html', 'css']);
  const [timeLimit, setTimeLimit] = useState<number>(300); // 5 mins
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [copiedLink, setCopiedLink] = useState(false);

  // In-Game Battle States
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'battling' | 'finished'>('lobby');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [activeQuestion, setActiveQuestion] = useState<DuelQuestion>(DEFAULT_ARENA_QUESTIONS[3]); // Default HTML+CSS

  // Team A (Your team) Code state
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [userTestsPassed, setUserTestsPassed] = useState<number>(1);
  const [totalTests, setTotalTests] = useState<number>(3);

  // Team B (Opponent simulation with Fog of War)
  const [opponentTestsPassed, setOpponentTestsPassed] = useState<number>(0);
  const [opponentWpm, setOpponentWpm] = useState<number>(68);
  const [opponentAlert, setOpponentAlert] = useState<string>('');
  const [winnerTeam, setWinnerTeam] = useState<'Team A' | 'Team B' | null>(null);

  // 2v2 Relay Switch Timer (locks keyboard every 2.5 mins)
  const [relayPlayer, setRelayPlayer] = useState<'Driver (You)' | 'Navigator (Teammate)'>('Driver (You)');

  // Tag options per Arena
  const webDevTagOptions = [
    { id: 'html', label: 'HTML', desc: 'Structure & semantic elements' },
    { id: 'css', label: 'CSS', desc: 'Layout, flex, gradients & styling' },
    { id: 'javascript', label: 'JavaScript', desc: 'Click events & DOM logic' },
  ];

  const algoTagOptions = [
    { id: 'java', label: 'Java', desc: 'Java 21 OpenJDK' },
    { id: 'python', label: 'Python', desc: 'Python 3.12' },
    { id: 'cpp', label: 'C++', desc: 'Modern C++ 20' },
  ];

  const handleToggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tagId));
      }
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleCopyInvite = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/arena?room=${roomCode}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // Launch the match: Server picks random question matching selected arena & tags!
  const handleStartMatch = async () => {
    let chosen: DuelQuestion | null = null;

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
    } catch {
      // Fallback to local default questions if offline or fetch fails
    }

    if (!chosen) {
      const matching = DEFAULT_ARENA_QUESTIONS.filter((q) => {
        if (q.arena !== arena) return false;
        return selectedTags.some((t) => q.tags.includes(t));
      });
      chosen = matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)] : DEFAULT_ARENA_QUESTIONS[0];
    }

    setActiveQuestion(chosen);

    // Initialize starter code
    setHtmlCode(chosen.starterHtml || '');
    setCssCode(chosen.starterCss || '');
    setJsCode(chosen.starterJs || '');
    setTotalTests(chosen.testCases.length || 3);
    setUserTestsPassed(1);
    setOpponentTestsPassed(0);
    setTimeLeft(chosen.timeLimitSeconds || 300);

    // Start 3-2-1 Countdown
    setGameState('countdown');
    setCountdownNum(3);
  };

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'countdown') return;
    if (countdownNum > 1) {
      const timer = setTimeout(() => setCountdownNum(countdownNum - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setGameState('battling'), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, countdownNum]);

  // Battle Active Clock
  useEffect(() => {
    if (gameState !== 'battling') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timeout
          setGameState('finished');
          setWinnerTeam(userTestsPassed >= opponentTestsPassed ? 'Team A' : 'Team B');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, userTestsPassed, opponentTestsPassed]);

  // Opponent AI / Telemetry Simulator (Fog of War)
  useEffect(() => {
    if (gameState !== 'battling') return;

    const oppTimer = setInterval(() => {
      // Randomly adjust WPM
      setOpponentWpm(Math.floor(55 + Math.random() * 40));

      // Opponent progress step
      const roll = Math.random();
      if (roll > 0.72 && opponentTestsPassed < totalTests) {
        setOpponentTestsPassed((prev) => {
          const next = prev + 1;
          if (next === totalTests) {
            setGameState('finished');
            setWinnerTeam('Team B');
          }
          return next;
        });
      } else if (roll < 0.15) {
        // Trigger simulated panic error alert
        const alerts = [
          'Opponent triggered: Flexbox Alignment Mismatch!',
          'Opponent triggered: NullPointerException on Test 2',
          'Opponent triggered: SyntaxError: Unexpected token',
        ];
        setOpponentAlert(alerts[Math.floor(Math.random() * alerts.length)]);
        setTimeout(() => setOpponentAlert(''), 3000);
      }
    }, 3500);

    return () => clearInterval(oppTimer);
  }, [gameState, opponentTestsPassed, totalTests]);

  // Handle user run tests
  const handleRunTests = () => {
    if (userTestsPassed < totalTests) {
      const next = userTestsPassed + 1;
      setUserTestsPassed(next);
      if (next === totalTests) {
        playVictorySound();
        setWinnerTeam('Team A');
        setGameState('finished');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl select-none animate-fadeIn">
      {/* Outer Game Container */}
      <div className="relative w-full max-w-6xl max-h-[95vh] rounded-3xl bg-[#090B10] border border-charcoal-700 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-charcoal-900/90 border-b border-charcoal-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-wider uppercase font-mono">
                  KOLLABRIX 2v2 CODE ARENA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400 uppercase">
                  ROOM #{roomCode}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {gameState === 'lobby' ? 'Custom Multiplayer Matchmaking Lobby' : `Active Clash &bull; ${activeQuestion.title}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {gameState === 'battling' && (
              <div className="px-3.5 py-1.5 rounded-xl bg-charcoal-800 border border-charcoal-700 font-mono text-xs font-black text-rose-400 flex items-center gap-1.5 shadow-inner">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= VIEW 1: LOBBY SETUP & TOPIC FILTER ================= */}
        {gameState === 'lobby' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            
            {/* Step 1: Invite Friends & Room Code */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-cyan-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                  STEP 1: SQUAD & OPPONENT SLOTS
                </div>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  Share Room Link with Your Teammate & Rivals
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Send code <span className="font-mono text-amber-300 font-bold">{roomCode}</span> on WhatsApp. Teammates enter Team A; rivals enter Team B.
                </p>
              </div>

              <button
                onClick={handleCopyInvite}
                className="px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-md shrink-0 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Room Invite'}</span>
              </button>
            </div>

            {/* Squad Slots Visualization (Team A vs Team B) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Team A */}
              <div className="p-4 rounded-2xl bg-charcoal-900 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    TEAM A (YOUR SQUAD)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">2 / 2 Filled</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 flex-1">
                    <span className="text-xs font-bold text-white truncate">
                      {currentUser?.displayName || 'Mayank Goyal'} (Host)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 flex-1">
                    <span className="text-xs font-bold text-slate-300 truncate">Viraj Bashishtha</span>
                  </div>
                </div>
              </div>

              {/* Team B */}
              <div className="p-4 rounded-2xl bg-charcoal-900 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    TEAM B (OPPOSING SQUAD)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Rivals Ready</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 flex-1">
                    <span className="text-xs font-bold text-slate-300 truncate">IIT Rival Dev 1</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 flex-1">
                    <span className="text-xs font-bold text-slate-300 truncate">IIT Rival Dev 2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Choose Arena Track */}
            <div className="space-y-3 pt-2">
              <div className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                STEP 2: CHOOSE ARENA BATTLEGROUND
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => {
                    setArena('web_dev');
                    setSelectedTags(['html', 'css']);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    arena === 'web_dev'
                      ? 'bg-rose-500/10 border-rose-500 shadow-lg shadow-rose-950/30'
                      : 'bg-charcoal-900 border-charcoal-800 hover:border-charcoal-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <span>🎨 Web Development</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pixel-clash component building. HTML, CSS, & JavaScript duels.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setArena('algorithms');
                    setSelectedTags(['java', 'python']);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    arena === 'algorithms'
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-lg shadow-cyan-950/30'
                      : 'bg-charcoal-900 border-charcoal-800 hover:border-charcoal-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <span>⚡ Algorithmic Speedrun</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Java, Python, & C++ competitive DSA testbenches.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setArena('bug_hunt');
                    setSelectedTags(['react']);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    arena === 'bug_hunt'
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-950/30'
                      : 'bg-charcoal-900 border-charcoal-800 hover:border-charcoal-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <span>🐛 Nightmare Bug Hunt</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Fix broken production codebases under a tight deadline.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Choose Topics / Multi-tag checkboxes */}
            <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                  STEP 3: SELECT TOPIC FILTERS ({arena === 'web_dev' ? 'PICK 1, 2, OR ALL 3' : 'LANGUAGES'})
                </span>
                <span className="text-[10px] font-mono text-rose-400">
                  {selectedTags.length} Selected &bull; Server picks random matching challenge
                </span>
              </div>

              {arena === 'web_dev' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {webDevTagOptions.map((opt) => {
                    const isChecked = selectedTags.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-charcoal-800 border-rose-500/60 shadow-sm'
                            : 'bg-charcoal-950/50 border-charcoal-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTag(opt.id)}
                          className="mt-0.5 rounded text-rose-500 focus:ring-rose-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-white font-mono">{opt.label}</div>
                          <div className="text-[10px] text-slate-400">{opt.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {algoTagOptions.map((opt) => {
                    const isChecked = selectedTags.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-charcoal-800 border-cyan-500/60'
                            : 'bg-charcoal-950/50 border-charcoal-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTag(opt.id)}
                          className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-white font-mono">{opt.label}</div>
                          <div className="text-[10px] text-slate-400">{opt.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Launch CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-mono text-slate-400">
                Mode: <span className="text-rose-400 font-bold">2v2 Tag-Team</span> &bull; Time: 5 Minutes &bull; Anti-Cheat Fog of War Active
              </div>

              <button
                onClick={handleStartMatch}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono text-xs font-black uppercase tracking-wider shadow-xl shadow-rose-950/60 flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START 2v2 BATTLEGROUND</span>
              </button>
            </div>

          </div>
        )}

        {/* ================= VIEW 2: 3-2-1 COUNTDOWN ================= */}
        {gameState === 'countdown' && (
          <div className="flex-1 p-16 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
            <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
              PREPARE SQUADS &bull; FOG OF WAR ENGAGED
            </div>
            <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-rose-500 to-amber-400 animate-ping">
              {countdownNum}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Generating challenge from server for tags: {selectedTags.join(' + ').toUpperCase()}
            </p>
          </div>
        )}

        {/* ================= VIEW 3: ACTIVE SPLIT-SCREEN COMBAT ================= */}
        {gameState === 'battling' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Match Banner */}
            <div className="px-6 py-2.5 bg-charcoal-950 border-b border-charcoal-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">TARGET:</span>
                <span className="text-white font-bold">{activeQuestion.title}</span>
                <span className="text-slate-500">({activeQuestion.difficulty.toUpperCase()})</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-cyan-400">
                  ⌨️ ACTIVE KEYBOARD: <strong className="text-white">{relayPlayer}</strong>
                </span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-rose-400">
                  Relay Switch in: <strong>01:45</strong>
                </span>
              </div>
            </div>

            {/* Split Screen Grid (Left: You | Right: Opponent with Fog of War) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* LEFT SIDE: YOUR TEAM (Team A) */}
              <div className="lg:col-span-7 border-r border-charcoal-800 flex flex-col bg-charcoal-900/40 overflow-hidden">
                
                {/* Editor Tabs */}
                <div className="px-4 py-2 bg-charcoal-900 border-b border-charcoal-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {selectedTags.includes('html') && (
                      <button
                        onClick={() => setActiveTab('html')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          activeTab === 'html'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        index.html
                      </button>
                    )}

                    {selectedTags.includes('css') && (
                      <button
                        onClick={() => setActiveTab('css')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          activeTab === 'css'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        styles.css
                      </button>
                    )}

                    {selectedTags.includes('javascript') && (
                      <button
                        onClick={() => setActiveTab('js')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          activeTab === 'js'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        script.js
                      </button>
                    )}
                  </div>

                  {/* Your Progress */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      TESTS: {userTestsPassed} / {totalTests}
                    </span>
                    <button
                      onClick={handleRunTests}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Run & Test Code</span>
                    </button>
                  </div>
                </div>

                {/* Code Editor Box */}
                <div className="flex-1 p-3 overflow-hidden flex flex-col">
                  {activeTab === 'html' && (
                    <textarea
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      placeholder="Write HTML code here..."
                      className="w-full flex-1 p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                    />
                  )}

                  {activeTab === 'css' && (
                    <textarea
                      value={cssCode}
                      onChange={(e) => setCssCode(e.target.value)}
                      placeholder="Write CSS rules here..."
                      className="w-full flex-1 p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                    />
                  )}

                  {activeTab === 'js' && (
                    <textarea
                      value={jsCode}
                      onChange={(e) => setJsCode(e.target.value)}
                      placeholder="Write JavaScript logic here..."
                      className="w-full flex-1 p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                    />
                  )}
                </div>

                {/* Target Component Checklist or Preview Footer */}
                {activeQuestion.targetComponentHtml && (
                  <div className="p-3 bg-charcoal-950 border-t border-charcoal-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        TARGET COMPONENT TO REPLICATE:
                      </span>
                    </div>
                    <div className="max-w-[200px] max-h-[80px] overflow-hidden rounded-lg border border-charcoal-800 scale-75 origin-right">
                      <div dangerouslySetInnerHTML={{ __html: activeQuestion.targetComponentHtml }} />
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: OPPONENT WITH FOG OF WAR (No Cheating!) */}
              <div className="lg:col-span-5 flex flex-col bg-charcoal-950/90 overflow-hidden relative">
                
                {/* Fog of War Header */}
                <div className="px-4 py-2 bg-charcoal-900 border-b border-charcoal-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>OPPONENT &bull; FOG OF WAR (LOCKED)</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">Zero-Cheating Shield</span>
                </div>

                {/* Opponent Telemetry Screen */}
                <div className="flex-1 p-6 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Blurred Code Background Simulation */}
                  <div className="absolute inset-0 p-6 filter blur-md opacity-20 pointer-events-none font-mono text-xs leading-relaxed text-slate-400 select-none">
                    {`function solve() {\n  const map = new Map();\n  for (let i = 0; i < 100; i++) {\n    // Hidden algorithm logic\n    processTelemetry();\n  }\n}`}
                  </div>

                  {/* Center Telemetry Readout */}
                  <div className="relative z-10 space-y-4">
                    <div className="p-4 rounded-2xl bg-charcoal-900/90 border border-charcoal-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                          Opponent Test Cases Passed
                        </span>
                        <span className="text-xs font-mono font-black text-rose-400">
                          {opponentTestsPassed} / {totalTests}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-3 rounded-full bg-charcoal-800 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                          style={{ width: `${(opponentTestsPassed / totalTests) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-charcoal-900/80 border border-charcoal-800">
                        <span className="text-[10px] text-slate-500 block">TYPING CADENCE</span>
                        <span className="text-sm font-bold text-white mt-0.5 block">{opponentWpm} WPM</span>
                      </div>

                      <div className="p-3 rounded-xl bg-charcoal-900/80 border border-charcoal-800">
                        <span className="text-[10px] text-slate-500 block">LAST COMPILE</span>
                        <span className="text-sm font-bold text-cyan-400 mt-0.5 block">14s ago</span>
                      </div>
                    </div>

                    {/* Panic / Error Alert Notification */}
                    {opponentAlert && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{opponentAlert}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer Note */}
                  <div className="relative z-10 text-[10px] font-mono text-slate-500 text-center">
                    Opponent's code unlocks automatically at match conclusion.
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: MATCH CONCLUDED & POST-GAME REVIEW ================= */}
        {gameState === 'finished' && (
          <div className="p-8 flex flex-col items-center justify-center space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <Trophy className="w-3.5 h-3.5" />
                <span>MATCH COMPLETED &bull; {winnerTeam === 'Team A' ? 'VICTORY!' : 'DEFEAT'}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white">
                {winnerTeam === 'Team A' ? '🏆 SQUAD A CLAIMS VICTORY!' : '⚡ SQUAD B CLAIMS VICTORY!'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 font-mono">
                {winnerTeam === 'Team A'
                  ? 'All test cases passed in 3m 42s &bull; +24 ELO Awarded'
                  : 'Opponent passed all test cases first &bull; -12 ELO'}
              </p>
            </div>

            {/* Fog of War is lifted: Side-by-side solutions reveal */}
            <div className="w-full max-w-4xl p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400 pb-2 border-b border-charcoal-800">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> FOG OF WAR LIFTED: SIDE-BY-SIDE REVIEW
                </span>
                <span className="text-slate-400">Optimal Runtime: 8ms</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-charcoal-950 border border-cyan-500/30">
                  <div className="text-cyan-400 font-bold mb-1">Your Squad's Solution:</div>
                  <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-black/40 rounded">
                    {htmlCode || cssCode || 'Clean modular solution delivered.'}
                  </pre>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-950 border border-rose-500/30">
                  <div className="text-rose-400 font-bold mb-1">Opponent's Solution:</div>
                  <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-black/40 rounded">
                    {`/* Opponent's CSS */\n.card {\n  border-radius: 16px;\n  background: #090B10;\n}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Rematch & Close Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGameState('lobby')}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Play Rematch</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 font-mono text-xs font-bold transition-all"
              >
                Close Arena
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
