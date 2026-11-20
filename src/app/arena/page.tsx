'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { FullArenaExperience } from '@/components/arena/FullArenaExperience';
import {
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Terminal,
  Wrench,
  Swords,
  Sparkles,
  Zap,
  Flame,
  Trophy,
} from 'lucide-react';

function ArenaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room') || undefined;
  const { user, profile } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'goyalmayank142@gmail.com';

  // Toggle between 1v1 Arena Showcase (Image 1 style with Image 2 character) and the Live Match Lobby (Image 4)
  const [showPlayLobby, setShowPlayLobby] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return Boolean(urlParams.get('room') || urlParams.get('play') === 'true');
    }
    return Boolean(roomParam);
  });

  const [isLive, setIsLive] = useState<boolean>(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'Battle Arena is temporarily offline for scheduled system tuning, anti-cheat calibration, and challenge additions. Please check back shortly!'
  );

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play crisp cyber duel launch sound
  const playEnterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }, []);

  const checkArenaStatus = async () => {
    try {
      const res = await fetch('/api/arena/status');
      if (res.ok) {
        const data = await res.json();
        const live = data.isLive !== false;
        setIsLive(live);
        try {
          localStorage.setItem('kollabrix_arena_is_live', String(live));
        } catch {}
        if (data.maintenanceMessage) {
          setMaintenanceMessage(data.maintenanceMessage);
        }
      }
    } catch (err) {
      setIsLive(true);
    }
  };

  useEffect(() => {
    checkArenaStatus();
  }, []);

  const handleLaunchLobby = () => {
    playEnterSound();
    setShowPlayLobby(true);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('play', 'true');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleClose = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('kollabrix_arena_session');
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('arena_code_') || key.startsWith('kollabrix_arena_')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (e) {}

    // Return to the 1v1 Showcase page
    setShowPlayLobby(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('play');
      url.searchParams.delete('room');
      window.history.pushState({}, '', url.pathname);
    }
  };

  // If Arena is OFFLINE / UNDER MAINTENANCE (Admins bypass so they can build & test live):
  if (!isLive && !isAdmin) {
    return (
      <div className="fixed inset-0 bg-[#04060d] text-slate-100 flex items-center justify-center p-4 z-50 overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-rose-500/40 shadow-[0_0_60px_rgba(244,63,94,0.25)] backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-inner">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  MAINTENANCE MODE ACTIVE
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
                Battle Arena Offline
              </h1>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-400 pb-2 border-b border-slate-800">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] uppercase tracking-wider">SYSTEM DIAGNOSTIC TELEMETRY</span>
            </div>

            <div className="space-y-1.5 text-slate-300">
              <p className="text-rose-400 font-bold">&gt; ARENA GATEWAY: OFFLINE (ADMIN OVERRIDE)</p>
              <p className="text-slate-400">&gt; REASON: SYSTEM UPGRADES &amp; QUESTION INGESTION</p>
              <p className="text-cyan-400">&gt; ANTI-CHEAT ENGINE: STANDBY CALIBRATION</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-amber-300/90 leading-relaxed text-xs">
              <p className="font-bold text-[11px] text-amber-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Wrench className="w-3 h-3" />
                <span>Admin Broadcast:</span>
              </p>
              <p className="font-sans text-sm">{maintenanceMessage}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Kollabrix</span>
            </button>

            <button
              type="button"
              onClick={checkArenaStatus}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-mono text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md hover:brightness-110"
            >
              <RotateCw className="w-4 h-4" />
              <span>Check Status Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. SHOWCASE MODE (Built to replicate Image 1 style with Image 2 Cosmic Character)
  // =========================================================================
  if (!showPlayLobby) {
    return (
      <div className="min-h-screen bg-[#030611] text-white relative overflow-hidden select-none flex flex-col justify-between">
        {/* Real Cosmic Orbital Background from 1st Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/arena-orbital-bg.jpg"
            alt="Arena Cosmic Orbital Background"
            fill
            priority
            quality={95}
            className="object-cover object-center select-none"
          />
          {/* Atmospheric Vignette Overlays: Keeps text crisp & readable while blending edges seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
        </div>

        {/* Ambient Atmospheric Glow Highlights */}
        <div className="absolute top-0 right-1/4 w-[750px] h-[750px] bg-[radial-gradient(ellipse_60%_50%_at_60%_35%,rgba(14,165,233,0.18),transparent_70%)] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[radial-gradient(circle_at_20%_80%,rgba(37,99,235,0.12),transparent_65%)] pointer-events-none z-0" />

        {/* Top Navigation Bar (Replicating Image 1 top bar with edge-to-edge layout & dark/grey styling) */}
        <header className="relative z-20 w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 pt-8 pb-4 flex items-center justify-between">
          {/* Left Brand Identity: "1v1 Arena | KOLLABRIX" */}
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
              1v1 Arena
            </span>
            <span className="text-white/25 font-light text-sm select-none">|</span>
            <span className="text-xs sm:text-sm font-mono font-black tracking-widest text-slate-400 uppercase">
              KOLLABRIX
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 font-mono"
            >
              Exit to Home
            </Link>

            {/* Dark / Smoked Charcoal Frosted Glass Button (Replacing bright cyan) */}
            <button
              type="button"
              onClick={handleLaunchLobby}
              className="group px-5 sm:px-6 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.18] hover:border-white/35 text-slate-200 hover:text-white font-mono font-bold text-xs sm:text-sm backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <Swords className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
              <span>Live Lobby</span>
            </button>
          </div>
        </header>

        {/* Hero Grid Container: Wide Full-Bleed Layout with No Empty Left/Right Margins */}
        <main className="relative z-10 w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 py-4 lg:py-8 flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center w-full">
            {/* Left Column: Heading + Description + Feature Pills + CTA */}
            <div className="lg:col-span-7 xl:col-span-6 2xl:col-span-7 flex flex-col justify-center text-left">
              {/* Massive Editorial Headline: "Welcome To" / "1v1 Arena" (Vibrant Cyan Glow Gradient) */}
              <h1 className="font-heading font-black tracking-tight leading-[0.96] select-none text-white text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl 2xl:text-[5.8rem]">
                <span className="block text-white">Welcome To</span>
                <span className="block mt-2 bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(6,182,212,0.45)]">
                  1v1 Arena
                </span>
              </h1>

              {/* Explanatory Paragraph ("show what it is") */}
              <p className="text-slate-300/90 text-sm sm:text-base md:text-lg leading-relaxed mt-6 max-w-2xl font-normal drop-shadow-sm">
                Battle Arena is the high-stakes live coding combat for collegiate builders. Duel
                real-time in fast-paced 3-minute blitz sprints, solve algorithmic hurdles under
                anti-cheat fog of war, and defeat campus rivals to climb the verified leaderboard.
              </p>

              {/* Pills & CTA Row (Matching "NFTs", "Crypto", "Games" & "Find Your Niche" in Image 1) */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-8 sm:mt-10">
                {/* Feature Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-4 py-2 rounded-full border border-white/20 bg-white/[0.04] text-xs sm:text-sm text-slate-200 font-medium backdrop-blur-md">
                    3-Min Blitz
                  </span>
                  <span className="px-4 py-2 rounded-full border border-white/20 bg-white/[0.04] text-xs sm:text-sm text-slate-200 font-medium backdrop-blur-md">
                    Anti-Cheat Fog
                  </span>
                  <span className="px-4 py-2 rounded-full border border-white/20 bg-white/[0.04] text-xs sm:text-sm text-slate-200 font-medium backdrop-blur-md">
                    Ranked Elo
                  </span>
                </div>

                {/* Primary Pill Button (Matching "Find Your Niche" in Image 1) */}
                <button
                  type="button"
                  onClick={handleLaunchLobby}
                  className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_35px_rgba(255,255,255,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ml-1"
                >
                  <span>⚔️ Enter Battle Arena</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Bottom Telemetry Strip */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-slate-400 font-mono mt-10 sm:mt-12 pt-6 border-t border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                  <span className="text-slate-300">LIVE MULTIPLAYER SQUADS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-slate-300" />
                  <span>&lt;20MS LOW LATENCY</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                  <span>ANTI-CHEAT SENTINEL</span>
                </div>
              </div>
            </div>

            {/* Right Column: Character Entity Expands to Lavishly Fill the Right Area */}
            <div className="lg:col-span-5 xl:col-span-6 2xl:col-span-5 relative flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
              <div className="relative w-full max-w-[560px] lg:max-w-[620px] xl:max-w-[720px] 2xl:max-w-[800px] aspect-[16/9] flex items-center justify-center rounded-2xl sm:rounded-3xl overflow-hidden border border-sky-400/30 bg-[#060A14]/90 shadow-[0_0_50px_rgba(6,182,212,0.25)] backdrop-blur-xl group transition-all duration-300 hover:border-sky-400/50">
                {/* Atmospheric Glow Highlights matching Cyan Pixel Eyes & Golden Flora */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_48%,rgba(6,182,212,0.28),transparent_65%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_75%,rgba(245,158,11,0.22),transparent_60%)] pointer-events-none" />

                {/* The Character Image from 3rd Image (Clean, Sleek Retro Robot Sentinel) */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/arena-retro-sentinel-v1.jpg"
                    alt="Kollabrix 1v1 Battle Arena Retro Robot Sentinel"
                    width={1024}
                    height={576}
                    priority
                    unoptimized
                    className="w-full h-full object-cover object-center select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>

                {/* Floating Telemetry Badge Top Right */}
                <div className="absolute top-3.5 sm:top-4 right-3 sm:right-5 z-20 px-3 py-1.5 rounded-full bg-slate-950/85 border border-cyan-400/40 backdrop-blur-md shadow-lg flex items-center gap-2 text-[11px] font-mono text-cyan-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>RETRO SENTINEL • ONLINE</span>
                </div>

                {/* Floating Telemetry Badge Bottom Left */}
                <div className="absolute bottom-3.5 sm:bottom-4 left-3 sm:left-5 z-20 px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-sky-400/40 backdrop-blur-md shadow-lg flex items-center gap-2 text-[11px] font-mono text-sky-200">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>CIRCUIT 01 • MYSTIC GUARDIAN</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Sub-bar with Expanded Width */}
        <footer className="relative z-20 w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 py-6 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Kollabrix Esports Gateway • Anti-Cheat Fog of War Protected</span>
          <span className="hidden sm:inline">Engineered for Collegiate Hackers</span>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // 2. LIVE ARENA EXPERIENCE (Image 4 Matchmaking, Code Editor, Tournaments)
  // =========================================================================
  return (
    <FullArenaExperience
      onClose={handleClose}
      initialRoomCode={roomParam}
      currentUser={{
        displayName:
          profile?.display_name ||
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email?.split('@')[0] ||
          'CyberCoder',
        username:
          profile?.username ||
          user?.user_metadata?.username ||
          user?.email?.split('@')[0] ||
          'coder',
        avatarUrl: profile?.avatar_url || user?.user_metadata?.avatar_url || undefined,
      }}
    />
  );
}

export default function ArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#000000] flex flex-col items-center justify-center font-mono text-cyan-400 gap-3 z-50">
          <div className="w-8 h-8 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      }
    >
      <ArenaPageContent />
    </Suspense>
  );
}
