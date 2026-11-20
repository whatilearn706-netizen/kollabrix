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
  // 1. SHOWCASE MODE: Full-Screen Retro Robot Sentinel Visual (Image 2)
  // Shown after user taps on Battle Arena from the homepage
  // =========================================================================
  if (!showPlayLobby) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#030611] text-white overflow-hidden select-none flex flex-col justify-between">
        {/* Ultra-HD Edge-to-Edge Retro Sentinel Artwork (Image 2 - 2048x1152 HD, Vibrant & Crisp) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <Image
            src="/images/arena-retro-sentinel-hd.jpg"
            alt="Kollabrix 1v1 Battle Arena Retro Robot Sentinel"
            fill
            priority
            quality={100}
            className="object-cover object-center select-none filter contrast-[1.06] brightness-[1.04] saturate-[1.10]"
          />
          {/* Soft directional shade on left to ensure high headline readability while leaving the 3D robot bright & vivid */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-1/2 bg-gradient-to-r from-black/75 via-black/35 to-transparent pointer-events-none" />
          {/* Subtle top & bottom vignettes for sleek control integration */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/25 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
        </div>

        {/* Minimalist Top Navigation Header */}
        <header className="relative z-20 w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 pt-6 sm:pt-8 flex items-center justify-between">
          {/* Brand Pill */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-md shadow-lg">
            <span className="text-sm sm:text-base font-bold text-white tracking-tight font-sans">
              1v1 Arena
            </span>
            <span className="text-white/25 font-light text-sm select-none">|</span>
            <span className="text-xs sm:text-sm font-mono font-black tracking-widest text-slate-300 uppercase">
              KOLLABRIX
            </span>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 hover:border-white/30 text-xs sm:text-sm text-slate-300 hover:text-white font-mono backdrop-blur-md transition-all shadow-md"
            >
              Exit to Home
            </Link>

            <button
              type="button"
              onClick={handleLaunchLobby}
              className="group px-5 sm:px-6 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Swords className="w-3.5 h-3.5 text-slate-950" />
              <span>Enter Live Arena</span>
            </button>
          </div>
        </header>

        {/* Left-Aligned Headline & Description (Positioned directly in the blue marked box) */}
        <main className="relative z-10 w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 py-4 flex-1 flex items-center">
          <div className="max-w-xl lg:max-w-2xl text-left">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-200 text-xs font-mono font-medium mb-3 backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
              <span>COLLEGIATE 1V1 COMBAT</span>
            </div>

            {/* Headline: Welcome To 1v1 Arena */}
            <h1 className="font-heading font-black tracking-tight leading-[0.96] text-white text-5xl sm:text-6xl lg:text-7xl xl:text-8xl select-none">
              <span className="block text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
                Welcome To
              </span>
              <span className="block mt-1.5 bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(6,182,212,0.6)]">
                1v1 Arena
              </span>
            </h1>

            {/* Description under the blue marked area */}
            <p className="text-slate-200/90 text-sm sm:text-base md:text-lg leading-relaxed mt-5 font-normal drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] max-w-lg">
              Battle Arena is the high-stakes live coding combat for collegiate builders. Duel real-time in fast-paced 3-minute blitz sprints, solve algorithmic hurdles under anti-cheat fog of war, and defeat campus rivals to climb the verified leaderboard.
            </p>

            {/* Quick Action Button below description */}
            <div className="mt-7 flex items-center gap-4">
              <button
                type="button"
                onClick={handleLaunchLobby}
                className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_35px_rgba(255,255,255,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>⚔️ Enter Battle Arena</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </main>

        {/* Floating Bottom Bar (Brown-marked status badge completely removed, only Start Duel button) */}
        <footer className="relative z-20 w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 pb-6 sm:pb-10 pt-4 flex items-center justify-end">
          {/* Start Battle Duel Button */}
          <button
            type="button"
            onClick={handleLaunchLobby}
            className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_40px_rgba(255,255,255,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>⚔️ Start 1v1 Battle Duel</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
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
