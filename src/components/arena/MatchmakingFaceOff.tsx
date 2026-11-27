'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, Loader2, Play, Radio, Share2, Swords } from 'lucide-react';
import { useArenaEngine } from './useArenaEngine';
import { AVATAR_CLASS_META, ColoredMechBadge } from './ArenaIdentitySetupModal';

interface MatchmakingFaceOffProps {
  engine: ReturnType<typeof useArenaEngine>;
}

/**
 * Handles both Custom Room invite staging ('room') and the Stage 2 Face-Off /
 * 3-second hardware countdown ('faceoff') right before launching into the 3-Pane IDE.
 */
export function MatchmakingFaceOff({ engine }: MatchmakingFaceOffProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(engine.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const copyInviteLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/arena?room=${engine.roomCode}` : '';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  if (engine.stage === 'room') {
    const alpha = engine.roomData?.alphaPlayers || [{ id: 'host', name: engine.playerName }];
    const omega = engine.roomData?.omegaPlayers || [];

    return (
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl rounded-3xl bg-[#0A0E17]/95 border border-white/15 shadow-[0_28px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">
              {engine.teamSize.toUpperCase()} CUSTOM ROOM &bull; READY TO LAUNCH
            </span>
            <button
              type="button"
              onClick={() => engine.setStage('lobby')}
              className="text-xs font-mono text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lobby</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#060910] border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Private Room Code</span>
              <div className="text-2xl font-black font-mono text-white tracking-wider">{engine.roomCode}</div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={copyCode}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-mono font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Code'}</span>
              </button>
              <button
                type="button"
                onClick={copyInviteLink}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-mono font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Invite Link'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#060910] border border-white/15 space-y-2">
              <div className="text-[11px] font-mono font-bold text-slate-300 uppercase">Team Alpha</div>
              {alpha.map((p: any, i: number) => (
                <div key={p.id || i} className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-white">
                  {p.name} {i === 0 ? '(Host)' : ''}
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-[#060910] border border-white/15 space-y-2">
              <div className="text-[11px] font-mono font-bold text-slate-300 uppercase">Team Omega</div>
              {omega.length > 0 ? (
                omega.map((p: any, i: number) => (
                  <div key={p.id || i} className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-white">
                    {p.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 rounded-xl border border-dashed border-white/15 text-xs font-mono text-slate-400">
                  Waiting for friend or launch vs Ghost Rival
                </div>
              )}
            </div>
          </div>

          {engine.isHost ? (
            <button
              type="button"
              onClick={engine.startCustomRoomMatch}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-950 font-mono text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Match Now</span>
            </button>
          ) : (
            <div className="py-3.5 px-4 rounded-xl bg-[#060910] border border-white/15 text-center text-xs font-mono text-slate-300 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Waiting for host to launch the duel...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Stage 2: Face-Off VS Screen + Hardware Countdown
  const isLocked = engine.faceOffStatus !== 'scanning';

  return (
    <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#03050C]/85 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#080C16]/95 border border-sky-400/25 shadow-[0_32px_100px_rgba(0,0,0,0.96),0_0_60px_rgba(56,189,248,0.12)] overflow-hidden p-6 sm:p-10 space-y-8">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/35 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-sky-200">
            KΛ ARENA &bull; {engine.activeQuestion.title.toUpperCase()}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 font-mono text-xs text-slate-300">
            STAKES: <strong className="text-emerald-400">+24 ELO</strong> / <strong className="text-rose-400">-14 ELO</strong>
          </span>
        </div>

        {/* BGMI / Street-Fighter Split-Screen VS Clash */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Left Challenger: YOU (Cyan Aura) */}
          <div className="md:col-span-4 relative p-6 rounded-2xl bg-gradient-to-br from-sky-500/15 via-[#070B14] to-[#05070C] border border-sky-400/45 text-center space-y-2.5 shadow-[0_0_32px_rgba(56,189,248,0.16)]">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-sky-300">
              CHALLENGER 01
            </span>
            {(() => {
              const meta = AVATAR_CLASS_META[engine.selectedAvatarId] || AVATAR_CLASS_META.walker;
              return (
                <div className="w-20 h-20 rounded-2xl mx-auto border border-sky-400/40 bg-gradient-to-b from-[#131D30] to-[#060911] flex items-center justify-center shadow-lg">
                  <ColoredMechBadge
                    armorHex={meta.armorHex}
                    armorDarkHex={meta.armorDarkHex}
                    jointHex={meta.jointHex}
                    uid={`faceoff-${engine.selectedAvatarId}`}
                    size="md"
                  />
                </div>
              );
            })()}
            <div className="font-sans font-black text-white text-lg truncate">{engine.playerName}</div>
            <div className="text-[11px] font-mono text-sky-200/80">
              {engine.playerCollege} &bull; <strong className="text-amber-300">{engine.stats.elo.toLocaleString()} ELO</strong>
            </div>
          </div>

          {/* Center Clash VS Bolt */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center py-2 space-y-2">
            {engine.faceOffStatus === 'scanning' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center shadow-[0_0_24px_rgba(56,189,248,0.3)]">
                  <Radio className="w-7 h-7 text-sky-300 animate-ping" />
                </div>
                <span className="font-mono text-[11px] font-black text-sky-200 uppercase tracking-[0.2em]">
                  Scanning Arena...
                </span>
              </>
            )}
            {engine.faceOffStatus === 'locked' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-[0_0_32px_rgba(245,158,11,0.65)] -skew-x-6">
                  <span className="skew-x-6 font-mono text-xl font-black">VS</span>
                </div>
                <span className="font-mono text-xs font-black text-amber-300 uppercase tracking-[0.24em]">
                  OPPONENT LOCKED!
                </span>
              </>
            )}
            {engine.faceOffStatus === 'countdown' && (
              <div className="space-y-1">
                <div
                  className={`font-mono font-black tracking-tight drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] ${
                    engine.countdownNum === 'COMPILE!' ? 'text-2xl text-amber-400' : 'text-6xl text-white'
                  }`}
                >
                  {engine.countdownNum}
                </div>
                <div className="font-mono text-[10px] text-sky-300 uppercase tracking-[0.2em]">
                  Deploying Sandbox...
                </div>
              </div>
            )}
          </div>

          {/* Right Challenger: RIVAL (Crimson Aura) */}
          <div
            className={`md:col-span-4 relative p-6 rounded-2xl bg-gradient-to-bl from-rose-500/15 via-[#090B14] to-[#05070C] border text-center space-y-2.5 transition-all ${
              isLocked
                ? 'border-rose-400/50 opacity-100 shadow-[0_0_32px_rgba(244,63,94,0.18)]'
                : 'border-white/10 opacity-65'
            }`}
          >
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-rose-300">
              RIVAL DUELIST
            </span>
            {isLocked ? (
              <>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#2A111A] to-[#09070C] border border-rose-400/40 mx-auto flex items-center justify-center shadow-lg">
                  <ColoredMechBadge
                    armorHex="#5F1322"
                    armorDarkHex="#14070B"
                    jointHex="#F43F5E"
                    uid="faceoff-rival"
                    size="md"
                  />
                </div>
                <div className="font-sans font-black text-white text-lg truncate">{engine.rivalProfile.name}</div>
                <div className="text-[11px] font-mono text-rose-200/80">
                  {engine.rivalProfile.college} &bull; <strong className="text-amber-300">{engine.rivalProfile.elo.toLocaleString()} ELO</strong>
                </div>
              </>
            ) : (
              <div className="py-6 space-y-2">
                <Loader2 className="w-9 h-9 text-rose-400/70 animate-spin mx-auto" />
                <div className="font-mono text-xs text-slate-400">Matching ~{engine.stats.elo} ELO rival</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={engine.cancelMatchmaking}
            className="text-xs font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            Abort Matchmaking
          </button>
        </div>
      </div>
    </div>
  );
}
