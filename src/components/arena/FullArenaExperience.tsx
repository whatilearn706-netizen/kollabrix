'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { ArenaBackgroundMatrix } from '@/components/arena/ArenaBackgroundMatrix';
import { ArenaCategory, DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';
import { playVictorySound, playArcadeCoinSound } from '@/lib/arena/soundEffects';

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
  // Navigation Step:
  // 1: Name & Team Size (1v1 / 2v2)
  // 2: Choose Arena & Topics (HTML, CSS, JS checkboxes)
  // 3: Room Code & Invite Link Lobby
  // 4: Countdown (3-2-1)
  // 5: Battling Split-Screen
  // 6: Match Finished & Fog of War Lifted
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 1: Identity & Mode
  const [playerName, setPlayerName] = useState(
    currentUser?.displayName || currentUser?.username || 'CyberCoder'
  );
  const [teamSize, setTeamSize] = useState<'1v1' | '2v2'>('2v2');

  // Step 2: Arena & Topic Selection
  const [arena, setArena] = useState<ArenaCategory>('web_dev');
  const [selectedTags, setSelectedTags] = useState<string[]>(['html', 'css']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState<number>(300);

  // Step 3: Room & Invite
  const [roomCode] = useState(
    () => initialRoomCode || `KBX-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isBotOpponentAdded, setIsBotOpponentAdded] = useState(true);

  // Step 4 & 5: Battlefield States
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [activeQuestion, setActiveQuestion] = useState<DuelQuestion>(DEFAULT_ARENA_QUESTIONS[3]);

  // Code editors for Team Alpha
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [userTestsPassed, setUserTestsPassed] = useState<number>(1);
  const [totalTests, setTotalTests] = useState<number>(3);
  const [testLog, setTestLog] = useState<string>('Ready to test code');

  // Opponent Team Omega (Fog of War)
  const [opponentTestsPassed, setOpponentTestsPassed] = useState<number>(0);
  const [opponentWpm, setOpponentWpm] = useState<number>(64);
  const [opponentAlert, setOpponentAlert] = useState<string>('');
  const [winnerTeam, setWinnerTeam] = useState<'Team Alpha' | 'Team Omega' | null>(null);

  // Relay Role in 2v2 (swaps every 2.5 mins)
  const [relayPlayer, setRelayPlayer] = useState<'Driver (You)' | 'Navigator (Teammate)'>('Driver (You)');

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
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleCopyCode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  // Launch Match: Server questions or fallback
  const handleStartBattle = async () => {
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
    } catch (e) {
      // offline fallback
    }

    if (!chosen) {
      const matching = DEFAULT_ARENA_QUESTIONS.filter((q) => {
        if (q.arena !== arena) return false;
        return selectedTags.some((t) => q.tags.includes(t));
      });
      chosen = matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)] : DEFAULT_ARENA_QUESTIONS[0];
    }

    setActiveQuestion(chosen);
    setHtmlCode(chosen.starterHtml || '');
    setCssCode(chosen.starterCss || '');
    setJsCode(chosen.starterJs || '');
    setTotalTests(chosen.testCases?.length || 3);
    setUserTestsPassed(1);
    setOpponentTestsPassed(0);
    setTimeLeft(chosen.timeLimitSeconds || 300);

    // Switch tab to the first selected tag
    if (selectedTags.includes('html')) setActiveTab('html');
    else if (selectedTags.includes('css')) setActiveTab('css');
    else if (selectedTags.includes('javascript')) setActiveTab('js');

    // Go to countdown
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

      const roll = Math.random();
      if (roll < 0.12 && opponentTestsPassed < totalTests) {
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
    }, 3200);

    return () => clearInterval(oppInterval);
  }, [step, opponentTestsPassed, totalTests]);

  // Run Tests Handler for Player
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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-[#05070e] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Real-time Animated Cyber Arena Background Canvas */}
      <ArenaBackgroundMatrix />

      {/* Top Cyber Navigation Bar */}
      <header className="relative z-20 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 via-amber-500 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Swords className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-white text-base tracking-wider uppercase">
                BATTLE ARENA
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

      {/* Main Arena Viewport */}
      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-center items-center p-4 sm:p-6">
        
        {/* ================= STEP 1: ENTER NAME & CHOOSE TEAM SIZE ================= */}
        {step === 1 && (
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 inline-block">
                Step 1 of 3 &bull; Player Tag & Match Format
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Enter the Battleground
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Choose your alias and select your preferred code duel combat format.
              </p>
            </div>

            {/* Input Name */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Your Battle Alias / Tag:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your battle tag..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
              />
            </div>

            {/* Select Team Size: 1v1 vs 2v2 */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Select Team Combat Format:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1v1 Option */}
                <button
                  type="button"
                  onClick={() => setTeamSize('1v1')}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    teamSize === '1v1'
                      ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Zap className="w-5 h-5" />
                    </span>
                    {teamSize === '1v1' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base font-mono">1 v 1 Solo Duel</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Head-to-head coding clash. Pure speed, precision, and speedrun execution.
                  </p>
                </button>

                {/* 2v2 Option */}
                <button
                  type="button"
                  onClick={() => setTeamSize('2v2')}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    teamSize === '2v2'
                      ? 'bg-gradient-to-br from-rose-950/60 to-slate-900 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <Users className="w-5 h-5" />
                    </span>
                    {teamSize === '2v2' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base font-mono">2 v 2 Relay Squad</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Tag-team pairing. Driver & Navigator with live keyboard swaps every 2.5 mins.
                  </p>
                </button>
              </div>
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => {
                playArcadeCoinSound();
                setStep(2);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 text-slate-950 font-black font-mono text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Continue to Arena Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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
                  onClick={() => setArena(item.id as ArenaCategory)}
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

            {/* If Web Dev, Multi-checkboxes for HTML, CSS, JavaScript */}
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
                onClick={() => {
                  playArcadeCoinSound();
                  setStep(3);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 text-slate-950 font-black font-mono text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2"
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
              </div>
            </div>

            {/* Launch Match Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleStartBattle}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-cyan-500 text-slate-950 font-black font-mono text-base uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_30px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START MATCH NOW</span>
              </button>
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
              Fog of War will engage automatically upon match start.
            </p>
          </div>
        )}

        {/* ================= STEP 5: SPLIT-SCREEN REFINED COMBAT ARENA ================= */}
        {step === 5 && (
          <div className="w-full h-full flex flex-col gap-4 animate-fadeIn">
            {/* Mission Objective Header */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
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

            {/* Split Screen Grid (Left: Squad Studio, Right: Opponent Fog of War) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[460px]">
              {/* LEFT: Team Alpha (Your Team Code Studio) */}
              <div className="flex flex-col rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] overflow-hidden">
                {/* Editor Header Bar */}
                <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    {selectedTags.includes('html') && (
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
                    {selectedTags.includes('css') && (
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
                    {selectedTags.includes('javascript') && (
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
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      Tests: {userTestsPassed} / {totalTests}
                    </span>
                    <button
                      type="button"
                      onClick={handleRunTests}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run & Test Code</span>
                    </button>
                  </div>
                </div>

                {/* Code Textarea */}
                <div className="flex-1 relative bg-[#060812] p-3">
                  <textarea
                    value={
                      activeTab === 'html'
                        ? htmlCode
                        : activeTab === 'css'
                        ? cssCode
                        : jsCode
                    }
                    onChange={(e) => {
                      if (activeTab === 'html') setHtmlCode(e.target.value);
                      else if (activeTab === 'css') setCssCode(e.target.value);
                      else setJsCode(e.target.value);
                    }}
                    placeholder="// Type code here..."
                    className="w-full h-full bg-transparent font-mono text-xs sm:text-sm text-cyan-200 resize-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Bottom Previews (Target Component vs Live Preview) */}
                <div className="h-44 border-t border-slate-800 bg-slate-900/60 p-2.5 grid grid-cols-2 gap-2 shrink-0">
                  {/* Target Component */}
                  <div className="flex flex-col rounded-xl bg-slate-950 border border-slate-800 p-2 overflow-hidden">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">
                      Target Goal to Match:
                    </span>
                    <div
                      className="flex-1 overflow-auto flex items-center justify-center p-2"
                      dangerouslySetInnerHTML={{
                        __html: activeQuestion.targetComponentHtml || '<p>Target</p>',
                      }}
                    />
                  </div>

                  {/* Live Rendered Iframe */}
                  <div className="flex flex-col rounded-xl bg-slate-950 border border-cyan-500/30 p-2 overflow-hidden">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Your Live Render:
                    </span>
                    <div className="flex-1 overflow-auto bg-white/5 rounded p-2">
                      <style>{cssCode}</style>
                      <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Team Omega (Opponent Screen under Anti-Cheat Fog of War) */}
              <div className="flex flex-col rounded-2xl bg-slate-950/90 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)] overflow-hidden">
                {/* Header Bar */}
                <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider">
                      OPPONENT &bull; FOG OF WAR ACTIVE
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>Zero-Cheating Shield</span>
                  </span>
                </div>

                {/* Fog of War Obscured Editor Matrix */}
                <div className="flex-1 relative bg-[#070914] p-5 flex flex-col justify-between overflow-hidden">
                  {/* Encrypted Glitch Scanline Background */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none font-mono text-[10px] text-rose-400/80 p-4 select-none filter blur-[2px] overflow-hidden">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <p key={i} className="whitespace-nowrap">
                        0x7F4A89C // ENCRYPTED_BLOCK // 01001011 01001111 01001100 // COMPILING_TESTS_LOCKED
                      </p>
                    ))}
                  </div>

                  {/* Shield Notification Box */}
                  <div className="relative z-10 p-5 rounded-2xl bg-slate-950/80 border border-rose-500/40 backdrop-blur-md space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <ShieldAlert className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-mono font-bold text-white text-sm">
                          Anti-Cheat Privacy Shield Engaged
                        </h4>
                        <p className="text-xs text-slate-400">
                          Opponent code is securely encrypted during the match to prevent copying. Full code diff unlocks instantly upon match finish.
                        </p>
                      </div>
                    </div>

                    {/* Opponent Live Telemetry Meter */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Opponent Test Cases Passed:</span>
                        <span className="text-rose-400 font-bold">
                          {opponentTestsPassed} / {totalTests}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                          style={{
                            width: `${(opponentTestsPassed / totalTests) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Alerts & Telemetry Cards */}
                  <div className="relative z-10 grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                        Typing Cadence:
                      </span>
                      <div className="text-xl font-mono font-black text-white mt-0.5 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span>{opponentWpm} WPM</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                        Last Compile:
                      </span>
                      <div className="text-xl font-mono font-black text-cyan-400 mt-0.5">
                        Active
                      </div>
                    </div>
                  </div>

                  {/* Opponent Event Toast */}
                  {opponentAlert && (
                    <div className="relative z-10 mt-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs font-mono text-rose-200 animate-fadeIn flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                      <span>{opponentAlert}</span>
                    </div>
                  )}
                </div>
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
                  <pre>{htmlCode || cssCode || 'Solution'}</pre>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">// Opponent Code (Revealed)</p>
                  <pre>{activeQuestion.starterHtml ? `<div class="card">\n  <h2>Article</h2>\n</div>` : 'Solution'}</pre>
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
