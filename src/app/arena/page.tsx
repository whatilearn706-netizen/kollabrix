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

  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // Start mountain wind atmospheric soundscape
  const startAmbiance = useCallback(() => {
    if (!audioEnabled) return;
    try {
      if (!ambientAudioRef.current && typeof Audio !== 'undefined') {
        const audio = new Audio('/sounds/arena-mountain-wind-eagle.wav');
        audio.loop = true;
        audio.volume = 0.22;
        ambientAudioRef.current = audio;
      }
      if (ambientAudioRef.current) {
        ambientAudioRef.current.play().then(() => {
          setIsAudioPlaying(true);
        }).catch(() => {
          // Browser prevented autoplay before interaction
        });
      }
    } catch {}
  }, [audioEnabled]);

  const stopAmbiance = useCallback(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
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

  // Unblock audio on first user touch/click/keypress anywhere on screen
  useEffect(() => {
    const handleGesture = () => {
      if (audioEnabled) {
        startAmbiance();
      }
    };
    window.addEventListener('pointerdown', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      stopAmbiance();
    };
  }, [audioEnabled, startAmbiance, stopAmbiance]);

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
  // 1. THE PROVING GROUNDS CINEMATIC GATEWAY (Middle-Earth Chrome Experiment Style)
  // Symmetrical layout with epic mountain landscape, grand typography, and central pulsing BEGIN button
  // =========================================================================
  if (!showPlayLobby) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#030611] text-white overflow-hidden select-none flex flex-col justify-between">
        {/* Full-Screen Ultra-HD Proving Grounds Alpine Horizon */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <img
            src="/images/arena-proving-grounds-bg.jpg"
            alt="The Proving Grounds • Collegiate Speed Coding Combat"
            className="w-full h-full object-cover object-center select-none filter contrast-[1.05] brightness-[0.92] saturate-[1.10]"
          />
          {/* Symmetrical dark vignettes to focus user attention onto center portal */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
        </div>

        {/* Minimalist Top Navigation Header */}
        <header className="relative z-20 w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 pt-6 sm:pt-8 flex items-center justify-between">
          {/* Brand Pill */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/15 hover:border-white/30 backdrop-blur-md transition-all text-slate-300 hover:text-white shadow-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-white">
              KOLLABRIX
            </span>
            <span className="text-white/20 select-none">|</span>
            <span className="text-xs sm:text-sm font-sans font-medium text-slate-300">
              Exit
            </span>
          </Link>

          {/* Audio & Status Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/15 hover:border-amber-400 text-xs font-mono text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
              title="Toggle atmospheric mountain soundscape"
            >
              {audioEnabled && isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline text-amber-300">Atmospheric Ambiance</span>
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-0.5 h-2.5 bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 h-3.5 bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 h-2 bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline text-slate-400">Audio Muted (Tap to Play)</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Central Epic Stage: Symmetrical Cinematic Presentation (Middle-Earth Chrome Experiment) */}
        <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-4 flex-1 flex flex-col items-center justify-center text-center">
          {/* Poetic Pre-Title Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase mb-4 sm:mb-6 backdrop-blur-md shadow-lg animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            <span>A JOURNEY THROUGH SPEED &amp; LOGIC</span>
          </div>

          {/* Grand Cinematic Title */}
          <h1 className="font-heading font-black tracking-[0.08em] sm:tracking-[0.15em] leading-[0.95] text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl select-none uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            <span className="bg-gradient-to-b from-white via-amber-100 to-amber-300/80 bg-clip-text text-transparent">
              THE PROVING GROUNDS
            </span>
          </h1>

          {/* Elegant Gold Separator Line */}
          <div className="w-32 sm:w-56 h-[1px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent my-4 sm:my-6" />

          {/* Poetic Subtitle */}
          <p className="text-slate-200/90 text-xs sm:text-sm md:text-base font-mono uppercase tracking-[0.25em] max-w-xl text-center drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
            WHERE REAL BUILDERS ARE PROVEN UNDER TIME
          </p>

          {/* The Iconic Central BEGIN Circular Portal Button */}
          <div className="mt-8 sm:mt-12 relative flex items-center justify-center">
            {/* Ambient Pulsing Radar Rings */}
            <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-amber-400/30 animate-ping pointer-events-none opacity-40" />
            <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full border border-white/10 animate-pulse pointer-events-none" />

            {/* Interactive Circular Portal */}
            <button
              id="begin-portal-btn"
              type="button"
              onClick={handleLaunchLobby}
              onMouseEnter={playHoverSound}
              className="group relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black/45 hover:bg-black/65 border border-white/40 hover:border-amber-400 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(251,191,36,0.25)] hover:shadow-[0_0_55px_rgba(251,191,36,0.55)] flex flex-col items-center justify-center cursor-pointer select-none"
            >
              {/* Inner Decorative Accent Ring */}
              <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-white/15 group-hover:border-amber-400/40 transition-colors pointer-events-none" />

              <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-white group-hover:text-amber-300 transition-colors">
                BEGIN
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 group-hover:text-amber-200/80 tracking-wider transition-colors mt-0.5">
                ENTER ARENA
              </span>
            </button>
          </div>
        </main>

        {/* Minimalist Chrome Experiment Style Footer */}
        <footer className="relative z-20 w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 pb-6 sm:pb-8 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
          {/* Left: Powered By */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 tracking-wider">
              KOLLABRIX &bull; COLLEGIATE CODE COMBAT
            </span>
          </div>

          {/* Middle: Audio Recommendation */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>Best Experienced in Chrome &bull; 1v1 Speed Battle</span>
          </div>

          {/* Right: Live Ticker */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300">Live Campus Matchmaking Active</span>
          </div>
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
