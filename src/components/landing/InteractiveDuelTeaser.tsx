'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Swords,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Terminal,
  Smartphone,
  Monitor,
  Eye,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function InteractiveDuelTeaser() {
  const [activeTab, setActiveTab] = useState<'duel' | 'proctor'>('duel');
  const [testCasesPassed, setTestCasesPassed] = useState<number>(2);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'python'>('cpp');
  const [simulatedSwipeViolation, setSimulatedSwipeViolation] = useState<boolean>(false);
  const [opponentProgress, setOpponentProgress] = useState<number>(68);

  // Sound synthesis via Web Audio API (zero audio file dependencies)
  const playChime = (type: 'win' | 'alarm' | 'click') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(850, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {}
  };

  // Simulate opponent typing & progress
  useEffect(() => {
    if (activeTab !== 'duel' || hasWon) return;
    const interval = setInterval(() => {
      setOpponentProgress((prev) => {
        if (prev >= 92) return 65;
        return prev + Math.floor(Math.random() * 4);
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [activeTab, hasWon]);

  const handleRunCode = () => {
    playChime('click');
    setIsCompiling(true);
    setHasWon(false);
    setTimeout(() => {
      setIsCompiling(false);
      setTestCasesPassed(3);
      setHasWon(true);
      playChime('win');
    }, 900);
  };

  const handleSimulateSwipe = () => {
    playChime('alarm');
    setSimulatedSwipeViolation(true);
    setTimeout(() => {
      setSimulatedSwipeViolation(false);
    }, 3200);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-cyan-500/30 via-orange-500/20 to-transparent shadow-2xl shadow-cyan-950/40">
      <div className="relative rounded-[22px] bg-[#0c0f17]/95 border border-white/[0.08] backdrop-blur-2xl overflow-hidden text-left">
        {/* Top Control Bar with Segmented Switcher */}
        <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-black/50 border border-white/[0.08]">
            <button
              onClick={() => {
                setActiveTab('duel');
                playChime('click');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'duel'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>1v1 Code Duel</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('proctor');
                playChime('click');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'proctor'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dual-Lens Anti-Cheat</span>
            </button>
          </div>

          {/* Telemetry pill */}
          <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>48ms Serverless Latency</span>
            </span>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Judge0 Clustered</span>
            </span>
          </div>
        </div>

        {/* Tab Content 1: 1v1 Battle Arena */}
        {activeTab === 'duel' && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Arena Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-orange-500/40 text-orange-400 bg-orange-500/10 font-mono text-[10px]">
                  ROOM #KBX-9241
                </Badge>
                <span className="font-bold text-white">Problem: Longest Substring Without Repeating</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] text-amber-300">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Time Left: 02:41</span>
                </div>
                {/* Language Switch */}
                <div className="flex rounded-lg overflow-hidden border border-white/10 text-[10px] font-mono">
                  <button
                    onClick={() => setSelectedLanguage('cpp')}
                    className={`px-2 py-0.5 ${selectedLanguage === 'cpp' ? 'bg-orange-600 text-white font-bold' : 'bg-charcoal-900 text-slate-400'}`}
                  >
                    C++20
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('python')}
                    className={`px-2 py-0.5 ${selectedLanguage === 'python' ? 'bg-orange-600 text-white font-bold' : 'bg-charcoal-900 text-slate-400'}`}
                  >
                    Python 3
                  </button>
                </div>
              </div>
            </div>

            {/* Split Screen 1v1 Arena */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Left Pane: Player (You) */}
              <div className="relative rounded-2xl bg-black/80 border border-cyan-500/30 p-3.5 font-mono text-xs overflow-hidden shadow-lg shadow-cyan-950/20">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 border-b border-white/[0.06] pb-1.5">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>YOU (IIT Bombay #1)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">84 WPM • 0 Compile Errors</span>
                </div>

                <div className="text-slate-300 space-y-1 text-[11px] leading-relaxed">
                  {selectedLanguage === 'cpp' ? (
                    <>
                      <p className="text-slate-500">// Sliding Window + Hash Map Lookup</p>
                      <p><span className="text-purple-400">int</span> <span className="text-blue-400">lengthOfLongestSubstring</span>(<span className="text-purple-400">string</span> s) &#123;</p>
                      <p className="pl-4"><span className="text-purple-400">vector</span>&lt;<span className="text-purple-400">int</span>&gt; last(256, -1);</p>
                      <p className="pl-4"><span className="text-purple-400">int</span> left = 0, ans = 0;</p>
                      <p className="pl-4"><span className="text-amber-400">for</span> (<span className="text-purple-400">int</span> r = 0; r &lt; s.size(); ++r) &#123;</p>
                      <p className="pl-8">left = max(left, last[s[r]] + 1);</p>
                      <p className="pl-8">ans = max(ans, r - left + 1);</p>
                      <p className="pl-4">&#125;</p>
                      <p className="pl-4"><span className="text-amber-400">return</span> ans;</p>
                      <p>&#125;</p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-500"># Sliding Window in Python 3</p>
                      <p><span className="text-amber-400">def</span> <span className="text-blue-400">length_of_longest_substring</span>(s: str) -&gt; int:</p>
                      <p className="pl-4">last, left, ans = &#123;&#125;, 0, 0</p>
                      <p className="pl-4"><span className="text-amber-400">for</span> r, ch <span className="text-amber-400">in</span> enumerate(s):</p>
                      <p className="pl-8"><span className="text-amber-400">if</span> ch <span className="text-amber-400">in</span> last and last[ch] &gt;= left:</p>
                      <p className="pl-12">left = last[ch] + 1</p>
                      <p className="pl-8">ans = max(ans, r - left + 1)</p>
                      <p className="pl-4"><span className="text-amber-400">return</span> ans</p>
                    </>
                  )}
                </div>

                {/* Victory Banner Overlay */}
                <AnimatePresence>
                  {hasWon && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce mb-1" />
                      <div className="text-sm font-bold text-white font-mono">ALL TEST CASES PASSED (3/3)</div>
                      <div className="text-xs text-emerald-300 font-mono mt-0.5">+45 ELO Gained • Match Won!</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Pane: Rival (Fog of War) */}
              <div className="relative rounded-2xl bg-black/80 border border-rose-500/30 p-3.5 font-mono text-xs overflow-hidden shadow-lg shadow-rose-950/20">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 border-b border-white/[0.06] pb-1.5">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>RIVAL (BITS Pilani)</span>
                  </div>
                  <span className="text-[10px] text-amber-400">76 WPM • Passing 2/3</span>
                </div>

                {/* Blurred Code (Anti-Cheat Fog of War) */}
                <div className="text-slate-300 space-y-1 text-[11px] filter blur-[3.5px] select-none opacity-60">
                  <p>int solve(string s) &#123;</p>
                  <p className="pl-4">unordered_map&lt;char, int&gt; m;</p>
                  <p className="pl-4">int i = 0, j = 0, maxLen = 0;</p>
                  <p className="pl-4">while (j &lt; s.length()) &#123;</p>
                  <p className="pl-8">m[s[j]]++;</p>
                  <p className="pl-8">if (m.size() == j - i + 1) &#123;</p>
                  <p className="pl-12">maxLen = max(maxLen, j - i + 1);</p>
                  <p className="pl-8">&#125;</p>
                  <p className="pl-4">&#125;</p>
                  <p>&#125;</p>
                </div>

                {/* Fog of War Badge Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                  <div className="px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md shadow-xl text-center">
                    <div className="text-[10px] font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>ANTI-CHEAT FOG OF WAR</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Rival code unblurs at match finish</div>
                  </div>
                </div>

                {/* Live Opponent Progress Bar */}
                <div className="absolute bottom-2 left-3 right-3">
                  <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                    <span>Opponent Submission</span>
                    <span>{opponentProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-charcoal-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${opponentProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Execution Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Test Cases:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${testCasesPassed === 3 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {testCasesPassed} / 3 Passing
                </span>
              </div>

              <button
                onClick={handleRunCode}
                disabled={isCompiling}
                className="group inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-mono font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isCompiling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling in Sandbox...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run & Submit Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 2: Dual-Lens Anti-Cheat Theater */}
        {activeTab === 'proctor' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10 font-mono text-[10px]">
                  P2P WEBRTC RADAR
                </Badge>
                <span className="font-bold text-white">Continuous Dual-Angle Live Proctor Inspection</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero Bypass Architecture</span>
              </span>
            </div>

            {/* Dual Feed Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Feed 1: Laptop Screen Share */}
              <div className="relative aspect-video rounded-2xl bg-black border border-cyan-500/40 overflow-hidden flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-[10px] font-mono z-10">
                  <span className="px-2 py-0.5 rounded bg-black/80 border border-white/10 text-white font-bold flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-cyan-400" />
                    <span>1. ENTIRE SCREEN SHARE</span>
                  </span>
                  <span className="text-emerald-400">60 FPS Live</span>
                </div>

                {/* Animated scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent opacity-40 animate-pulse pointer-events-none" />

                <div className="text-[10px] font-mono text-slate-400 space-y-1 select-none">
                  <div className="text-slate-500">&gt; Window state: Fullscreen Arena</div>
                  <div className="text-slate-500">&gt; OS Space Switch Traps: Active</div>
                  <div className="text-cyan-300">&gt; Monaco Editor: Clean focus verified</div>
                </div>

                <div className="text-[9px] font-mono text-slate-500 z-10">
                  Resolution: 1920x1080 • Bitrate: 2.5 Mbps
                </div>
              </div>

              {/* Feed 2: Secondary Side Mobile Camera */}
              <div className="relative aspect-video rounded-2xl bg-black border border-amber-500/40 overflow-hidden flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-[10px] font-mono z-10">
                  <span className="px-2 py-0.5 rounded bg-black/80 border border-white/10 text-white font-bold flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-amber-400" />
                    <span>2. SIDE CAM (DESK & LAP)</span>
                  </span>
                  <span className="text-emerald-400">Synced via QR</span>
                </div>

                {/* Radar Grid overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <div className="w-24 h-24 rounded-full border border-amber-500/40 animate-ping" />
                </div>

                <div className="text-[10px] font-mono text-slate-400 space-y-1 select-none">
                  <div className="text-emerald-300">&gt; Desk surface: In frame (Hands on keyboard)</div>
                  <div className="text-slate-500">&gt; Lap area: Clear (No hidden device)</div>
                  <div className="text-slate-500">&gt; Angle: 45° Side Profile Verified</div>
                </div>

                <div className="text-[9px] font-mono text-slate-500 z-10">
                  Camera: iPhone 15 Pro • 30 FPS Stream
                </div>
              </div>
            </div>

            {/* Interactive Cheat-Simulate Test */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Test Our Anti-Cheat Defense Right Now</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Click to see what happens when a student tries to 4-finger swipe or switch windows.
                </div>
              </div>

              <button
                onClick={handleSimulateSwipe}
                className="px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white font-mono text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate 4-Finger Desktop Swipe</span>
              </button>
            </div>

            {/* Violation Overlay Simulation */}
            <AnimatePresence>
              {simulatedSwipeViolation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-4 md:inset-10 bg-rose-950/95 border-2 border-rose-500 rounded-3xl backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center z-50 shadow-2xl shadow-rose-950/80"
                >
                  <AlertTriangle className="w-16 h-16 text-rose-400 animate-bounce mb-3" />
                  <div className="text-lg sm:text-2xl font-bold text-white font-mono">
                    🚨 4-FINGER DESKTOP SWIPE DETECTED
                  </div>
                  <div className="text-xs sm:text-sm text-rose-200 font-mono mt-2 max-w-md leading-relaxed">
                    OS-level Space switch / Window blur intercepted instantly. Blackout triggered &amp; proctor alert dispatched to faculty theater.
                  </div>
                  <div className="mt-4 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[11px] border border-rose-500/30">
                    Warning 1/10 Issued • Penalty Applied
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
