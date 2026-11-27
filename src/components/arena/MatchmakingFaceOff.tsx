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
    <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl rounded-3xl bg-[#0A0E17]/95 border border-white/15 shadow-[0_28px_80px_rgba(0,0,0,0.92)] backdrop-blur-2xl p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">
            {engine.activeQuestion.title.toUpperCase()}
          </span>
          <span className="font-mono text-xs text-slate-400">
            Stake: <strong className="text-emerald-400">+24</strong> / <strong className="text-red-400">-14</strong> ELO
          </span>
        </div>

        {/* VS Face-Off Cards */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Left: You */}
          <div className="md:col-span-4 p-5 rounded-2xl bg-[#060910] border border-white/25 text-center space-y-2">
            {(() => {
              const meta = AVATAR_CLASS_META[engine.selectedAvatarId] || AVATAR_CLASS_META.walker;
              return (
                <div className="w-16 h-16 rounded-2xl mx-auto border border-white/25 bg-gradient-to-b from-[#171A23] to-[#080A0F] flex items-center justify-center">
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
            <div className="font-sans font-bold text-white text-base truncate">{engine.playerName}</div>
            <div className="text-[11px] font-mono text-slate-400">
              {engine.playerCollege} &bull; {engine.stats.elo.toLocaleString()} ELO
            </div>
          </div>

          {/* Center: Scanning / Countdown */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center py-2 space-y-2">
            {engine.faceOffStatus === 'scanning' && (
              <>
                <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-emerald-400 animate-ping" />
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Scanning Campus Queue...
                </span>
              </>
            )}
            {engine.faceOffStatus === 'locked' && (
              <>
                <div className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg">
                  <Swords className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-black text-emerald-400 uppercase tracking-widest">
                  MATCH FOUND!
                </span>
              </>
            )}
            {engine.faceOffStatus === 'countdown' && (
              <div className="space-y-1">
                <div
                  className={`font-mono font-black tracking-tight ${
                    engine.countdownNum === 'COMPILE!' ? 'text-2xl text-red-400' : 'text-5xl text-white'
                  }`}
                >
                  {engine.countdownNum}
                </div>
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                  Initializing IDE &amp; Shield
                </div>
              </div>
            )}
          </div>

          {/* Right: Opponent */}
          <div
            className={`md:col-span-4 p-5 rounded-2xl bg-[#060910] border text-center space-y-2 transition-all ${
              isLocked ? 'border-white/25 opacity-100' : 'border-white/10 opacity-60'
            }`}
          >
            {isLocked ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/20 mx-auto flex items-center justify-center text-2xl">
                  {engine.rivalProfile.avatarEmoji}
                </div>
                <div className="font-sans font-bold text-white text-base truncate">{engine.rivalProfile.name}</div>
                <div className="text-[11px] font-mono text-slate-400">
                  {engine.rivalProfile.college} &bull; {engine.rivalProfile.elo.toLocaleString()} ELO
                </div>
              </>
            ) : (
              <div className="py-5 space-y-2">
                <Loader2 className="w-8 h-8 text-slate-500 animate-spin mx-auto" />
                <div className="font-mono text-xs text-slate-400">Matching rival at ~{engine.stats.elo} ELO</div>
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
            Cancel Matchmaking
          </button>
        </div>
      </div>
    </div>
  );
}
