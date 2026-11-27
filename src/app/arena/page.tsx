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
  Volume2,
  VolumeX,
  Headphones,
} from 'lucide-react';

function ArenaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room') || undefined;
  const { user, profile, openAuthModal } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'goyalmayank142@gmail.com';

  // Starts ASLEEP (0% GPU/CPU Three.js footprint) until the user enters Battle Arena.
  // Exits back to Kollabrix (/) unmount WebGL and return Arena to sleep on next visit.
  const [showPlayLobby, setShowPlayLobby] = useState<boolean>(Boolean(roomParam));
  const [pendingWakeAfterAuth, setPendingWakeAfterAuth] = useState<boolean>(false);

  const [isLive, setIsLive] = useState<boolean>(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'Battle Arena is temporarily offline for scheduled system tuning, anti-cheat calibration, and challenge additions. Please check back shortly!'
  );

  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start mountain wind atmospheric soundscape with smooth 1.5s volume fade-in
  const startAmbiance = useCallback(() => {
    try {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      if (!ambientAudioRef.current && typeof Audio !== 'undefined') {
        const audio = new Audio('/sounds/arena-mountain-wind-eagle.wav');
        audio.loop = true;
        audio.volume = 0.0;
        ambientAudioRef.current = audio;
      }

      const audio = ambientAudioRef.current;
      if (audio) {
        audio.volume = 0.0;
        audio.play().then(() => {
          setIsAudioPlaying(true);
          // Smooth 1.5-second volume ramp up to 0.15 so it never startles listeners
          const targetVolume = 0.15;
          const steps = 30;
          const stepTime = 1500 / steps;
          let currentStep = 0;

          fadeIntervalRef.current = setInterval(() => {
            currentStep++;
            if (ambientAudioRef.current) {
              const nextVol = Math.min(targetVolume, (currentStep / steps) * targetVolume);
              ambientAudioRef.current.volume = nextVol;
              if (currentStep >= steps) {
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
              }
            } else {
              if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
              fadeIntervalRef.current = null;
            }
          }, stepTime);
        }).catch(() => {
          // Browser prevented autoplay before explicit interaction
          setIsAudioPlaying(false);
        });
      }
    } catch {}
  }, []);

  const stopAmbiance = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.volume = 0.0;
      setIsAudioPlaying(false);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => {
      const next = !prev;
      if (next) {
        setTimeout(startAmbiance, 50);
      } else {
        stopAmbiance();
      }
      return next;
    });
  }, [startAmbiance, stopAmbiance]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAmbiance();
    };
  }, [stopAmbiance]);

  // Play resonant dual-harmonic cinematic portal launch sound
  const playEnterSound = useCallback(() => {
    if (!audioEnabled) return;
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
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(261.63, now);
      osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.25);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(392.0, now);
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch {}
  }, [audioEnabled]);

  const playHoverSound = useCallback(() => {
    if (!audioEnabled) return;
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

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }, [audioEnabled]);

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

  // Eagerly prefetch homepage so exiting the arena is instant and seamless
  useEffect(() => {
    try {
      router.prefetch('/');
    } catch {}
  }, [router]);

  // Auto-wake Battle Arena once user finishes creating/signing into their Kollabrix account
  useEffect(() => {
    if (pendingWakeAfterAuth && user) {
      setPendingWakeAfterAuth(false);
      setShowPlayLobby(true);
    }
  }, [pendingWakeAfterAuth, user]);

  const handleLaunchLobby = () => {
    playEnterSound();
    if (!user) {
      setPendingWakeAfterAuth(true);
      openAuthModal('signup');
      return;
    }
    setShowPlayLobby(true);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('play', 'true');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleEnterLocalGuestPreview = () => {
    playEnterSound();
    setShowPlayLobby(true);
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
        window.location.assign('/');
        return;
      }
    } catch (e) {}
    router.replace('/');
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
  // 1. ZERO-GPU STANDBY GATEWAY (Sleeps until user creates account & wakes Arena)
  // =========================================================================
  if (!showPlayLobby) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#050609] text-white overflow-hidden select-none flex flex-col justify-between p-6 sm:p-10">
        {/* Lightweight Pure CSS Dark-Smoke Ambient Glow (Zero Three.js GPU Load while sleeping!) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(148, 163, 184, 0.08) 0%, rgba(15, 18, 25, 0.75) 55%, #040508 100%)',
          }}
        />

        {/* Minimal Header */}
        <header className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D1017] hover:bg-white/[0.08] border border-white/15 text-xs font-mono font-bold text-zinc-200 hover:text-white transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Kollabrix</span>
          </Link>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1017] border border-zinc-400/25 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>3D ENGINE SLEEPING &bull; ZERO GPU LOAD</span>
          </span>
        </header>

        {/* Centered Dark-Smoke Awakening Panel */}
        <main className="relative z-10 w-full max-w-2xl mx-auto my-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-b from-[#1B1E26] via-[#0F1117] to-[#08090D] border border-zinc-400/25 border-t-zinc-200/35 shadow-xl">
            <span className="w-1.5 h-1.5 rotate-45 bg-zinc-200" />
            <span className="font-heading font-black text-xs tracking-[0.28em] uppercase bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              THE PROVING GROUNDS
            </span>
            <span className="w-1.5 h-1.5 rotate-45 bg-zinc-200" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Enter Battle Arena
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
            {user
              ? 'Your 3D Mech & Matchmaking engine stays asleep until you enter—keeping your laptop cool until combat begins.'
              : 'Sign in or create your Kollabrix account to wake the 3D Mech lobby, save your rank, and enter live 1v1 duels.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="begin-portal-btn"
              type="button"
              onClick={handleLaunchLobby}
              className="px-9 py-4 rounded-2xl bg-gradient-to-b from-[#232732] via-[#13161D] to-[#090B0F] text-white border border-zinc-300/50 hover:border-white/85 font-mono text-xs sm:text-sm font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(226,232,240,0.22),inset_0_1px_0_rgba(255,255,255,0.28)] hover:shadow-[0_0_40px_rgba(226,232,240,0.38)] hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Swords className="w-4 h-4 text-zinc-200" />
              <span>{user ? 'Wake & Enter Arena' : 'Create Account & Enter Arena'}</span>
              <ArrowRight className="w-4 h-4 text-zinc-200" />
            </button>

            {!user && (
              <button
                type="button"
                onClick={handleEnterLocalGuestPreview}
                className="px-5 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/12 text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                Preview 3D Lobby (Guest)
              </button>
            )}
          </div>
        </main>

        <footer className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>KOLLΛBRIX &bull; ECO STANDBY ACTIVE</span>
          <span>EXITS TO SLEEP ON LEAVE</span>
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
      currentUser={
        user
          ? {
              displayName:
                profile?.display_name ||
                user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                user?.email?.split('@')[0] ||
                undefined,
              username:
                profile?.username ||
                user?.user_metadata?.username ||
                user?.email?.split('@')[0] ||
                undefined,
              avatarUrl: profile?.avatar_url || user?.user_metadata?.avatar_url || undefined,
            }
          : undefined
      }
    />
  );
}

export default function ArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#02040a] flex flex-col items-center justify-center font-mono text-amber-400 gap-3 z-50 select-none">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border border-amber-500/20 animate-ping absolute" />
            <div className="w-9 h-9 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-300/80 mt-1">
            ENTERING THE ARENA...
          </span>
        </div>
      }
    >
      <ArenaPageContent />
    </Suspense>
  );
}
