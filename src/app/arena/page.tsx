'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { FullArenaExperience } from '@/components/arena/FullArenaExperience';
import { ShieldAlert, ArrowLeft, RotateCw, Terminal, Wrench } from 'lucide-react';

function ArenaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room') || undefined;
  const { user, profile } = useAuth();

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'Battle Arena is temporarily offline for scheduled system tuning, anti-cheat calibration, and challenge additions. Please check back shortly!'
  );

  const checkArenaStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/arena/status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setIsLive(data.isLive !== false);
        if (data.maintenanceMessage) {
          setMaintenanceMessage(data.maintenanceMessage);
        }
      }
    } catch (err) {
      // In case of network error, default to live
      setIsLive(true);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkArenaStatus();
  }, []);

  const handleClose = () => {
    router.push('/');
  };

  if (isLoadingStatus) {
    return (
      <div className="fixed inset-0 bg-[#04060d] flex flex-col items-center justify-center font-mono text-cyan-400 gap-3 z-50">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest animate-pulse">
          AUTHENTICATING ARENA BATTLEFIELD STATUS...
        </span>
      </div>
    );
  }

  // If Arena is OFFLINE / UNDER MAINTENANCE:
  if (!isLive) {
    return (
      <div className="fixed inset-0 bg-[#04060d] text-slate-100 flex items-center justify-center p-4 z-50 overflow-hidden select-none">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Ambient red glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-rose-500/40 shadow-[0_0_60px_rgba(244,63,94,0.25)] backdrop-blur-xl space-y-6">
          {/* Header */}
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

          {/* Terminal Readout Box */}
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

            {/* Custom Admin Notice */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-amber-300/90 leading-relaxed text-xs">
              <p className="font-bold text-[11px] text-amber-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Wrench className="w-3 h-3" />
                <span>Admin Broadcast:</span>
              </p>
              <p className="font-sans text-sm">{maintenanceMessage}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
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

  // Live Arena Experience:
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
        <div className="fixed inset-0 bg-[#05070e] flex items-center justify-center font-mono text-cyan-400">
          INITIALIZING BATTLE ARENA...
        </div>
      }
    >
      <ArenaPageContent />
    </Suspense>
  );
}
