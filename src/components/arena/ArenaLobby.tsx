'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Pencil,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import { useArenaEngine } from './useArenaEngine';
import {
  ArenaIdentitySetupModal,
  AVATAR_CLASS_META,
  ColoredMechBadge,
} from './ArenaIdentitySetupModal';
import { Arena3DHangarWorld } from './Arena3DHangarWorld';
import { ArenaLeftWing, ArenaRightWing } from './ArenaLobbyWings';
import { ArenaMatchPortalModal } from './ArenaMatchPortalModal';

type Engine = ReturnType<typeof useArenaEngine>;

interface ArenaLobbyProps {
  engine: Engine;
  onOpenJoinModal: () => void;
}

const MODE_LABELS: Record<string, string> = {
  blitz: '1v1 Quick Blitz',
  bug_hunt: '60s Bug Hunt',
  web_clash: 'Web Pixel Clash',
  custom: 'Custom Room',
};

/**
 * Stage 1: Full-Viewport Kollabrix 3D Dark-Luxury Esports Lobby.
 * Clean uncluttered center floor underneath the 3D Ganker Mech (per user's red markups),
 * with Create Match -> Start The Match + Join Room cleanly anchored at the bottom.
 */
export function ArenaLobby({ engine, onOpenJoinModal }: ArenaLobbyProps) {
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showMatchPortal, setShowMatchPortal] = useState(false);
  const [matchConfigured, setMatchConfigured] = useState(false);

  const needsFirstSetup = !engine.hasCompletedIdentitySetup;
  const isCustomMode = engine.combatMode === 'custom';
  const activeMeta = AVATAR_CLASS_META[engine.selectedAvatarId] || AVATAR_CLASS_META.walker;

  const configuredSummary = `${MODE_LABELS[engine.combatMode] || 'Battle'} · ${engine.algoLanguage.toUpperCase()} · ${engine.difficulty.toUpperCase()} · ${
    engine.combatMode === 'bug_hunt' ? '60s' : `${Math.round(engine.timeLimit / 60)}m`
  }`;

  return (
    <div className="relative z-10 min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:px-8 overflow-hidden pointer-events-none">
      {/* FULL-SCREEN INTERACTIVE 3D RUNWAY & GANKER MECH (Sleeps when modal overlays open) */}
      <div className="pointer-events-auto">
        <Arena3DHangarWorld
          avatarId={engine.selectedAvatarId}
          algoLanguage={engine.algoLanguage}
          paused={showMatchPortal || showIdentityModal || needsFirstSetup}
        />
      </div>

      {/* TOP HUD BAR */}
      <header className="relative z-20 w-full max-w-[1520px] mx-auto grid grid-cols-12 items-center gap-3 pointer-events-auto">
        {/* Top-Left: Gamer Profile Card */}
        <div className="col-span-8 sm:col-span-4 flex justify-start">
          <button
            type="button"
            onClick={() => setShowIdentityModal(true)}
            className="group flex items-center gap-3 pr-4 pl-1.5 py-1.5 rounded-2xl bg-[#0B0D14]/90 hover:bg-[#141824] border border-white/12 hover:border-zinc-300/60 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] transition-all cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl border border-zinc-300/35 bg-gradient-to-b from-[#171A23] to-[#080A0F] flex items-center justify-center shrink-0">
              <ColoredMechBadge
                armorHex={activeMeta.armorHex}
                armorDarkHex={activeMeta.armorDarkHex}
                jointHex={activeMeta.jointHex}
                uid={`hud-${engine.selectedAvatarId}`}
                size="sm"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-black text-white truncate max-w-[125px] group-hover:text-amber-200">
                  {engine.playerName}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/35 text-[9px] font-mono font-bold text-amber-200">
                  {engine.stats.tier}
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                <span>{engine.playerCollege}</span>
                <span>&bull;</span>
                <span className="text-amber-300 font-bold">{engine.stats.elo.toLocaleString()} ELO</span>
              </p>
            </div>
            <Pencil className="w-3 h-3 text-zinc-400 group-hover:text-amber-200 ml-1 shrink-0" />
          </button>
        </div>

        {/* Top-Center: Larger Prominent THE PROVING GROUNDS Dark Smoke + Brushed Silver Crest */}
        <div className="hidden sm:flex col-span-4 flex-col items-center justify-center text-center select-none">
          <div className="relative inline-flex items-center gap-3.5 px-8 md:px-11 py-3 md:py-3.5 rounded-full bg-gradient-to-b from-[#20242E]/95 via-[#10131A]/95 to-[#07090D]/95 border border-zinc-300/30 border-t-zinc-100/50 backdrop-blur-2xl shadow-[0_14px_45px_rgba(0,0,0,0.9),0_0_28px_rgba(226,232,240,0.12),inset_0_1px_0_rgba(255,255,255,0.24)] overflow-hidden">
            <span className="w-2 h-2 rotate-45 bg-gradient-to-br from-white to-zinc-400 shadow-[0_0_10px_rgba(226,232,240,0.8)] shrink-0" />
            <h1 className="font-heading font-black text-sm md:text-base lg:text-lg tracking-[0.26em] uppercase bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent whitespace-nowrap drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
              THE PROVING GROUNDS
            </h1>
            <span className="w-2 h-2 rotate-45 bg-gradient-to-br from-white to-zinc-400 shadow-[0_0_10px_rgba(226,232,240,0.8)] shrink-0" />
          </div>
        </div>

        {/* Top-Right: Sign In (for Guest) + Exit Arena */}
        <div className="col-span-4 flex items-center justify-end gap-2">
          {engine.isGuest && (
            <button
              type="button"
              onClick={engine.openAuthForArena}
              className="hidden md:inline-flex px-3.5 py-2 rounded-full bg-zinc-100 hover:bg-white text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_16px_rgba(255,255,255,0.2)]"
            >
              Sign In to Save
            </button>
          )}
          <button
            type="button"
            onClick={engine.onClose}
            className="px-4 py-2 rounded-full bg-[#0B0D14]/85 hover:bg-white/[0.1] border border-white/12 text-[11px] font-mono text-zinc-200 hover:text-white transition-all cursor-pointer backdrop-blur-xl"
          >
            Exit Arena
          </button>
        </div>
      </header>

      {/* Mobile Crest */}
      <div className="sm:hidden flex justify-center pt-1.5 relative z-20">
        <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-b from-[#20242E]/95 via-[#10131A]/95 to-[#07090D]/95 border border-zinc-300/30 border-t-zinc-100/45 shadow-[0_10px_30px_rgba(0,0,0,0.85)]">
          <span className="w-1.5 h-1.5 rotate-45 bg-zinc-200" />
          <span className="font-heading font-black text-sm tracking-[0.22em] uppercase bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            THE PROVING GROUNDS
          </span>
          <span className="w-1.5 h-1.5 rotate-45 bg-zinc-200" />
        </div>
      </div>

      {/* OUTER HUD WINGS (Kollabrix Dark Luxury Styling) */}
      <main className="relative z-20 w-full max-w-[1520px] mx-auto flex-1 flex items-center justify-between gap-4 my-auto py-2">
        <ArenaLeftWing engine={engine} onOpenIdentity={() => setShowIdentityModal(true)} />
        <div className="flex-1" />
        <ArenaRightWing engine={engine} />
      </main>

      {/* BOTTOM DOCK: Clean Uncluttered CREATE MATCH / START THE MATCH + Join Room */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center gap-2.5 pb-1 pointer-events-auto">
        {engine.lobbyNotice && (
          <div className="px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-xs font-mono text-amber-200 backdrop-blur-xl">
            {engine.lobbyNotice}
          </div>
        )}

        {matchConfigured && (
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0B0D14]/90 border border-amber-400/35 text-[11px] font-mono text-amber-100 backdrop-blur-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{configuredSummary}</span>
            <button
              type="button"
              onClick={() => setShowMatchPortal(true)}
              className="text-amber-300 hover:text-white inline-flex items-center gap-1 ml-1 underline underline-offset-4 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {!matchConfigured ? (
            <button
              id="create-match-btn"
              type="button"
              disabled={engine.usernameStatus === 'taken'}
              onClick={() => setShowMatchPortal(true)}
              className="relative px-10 py-3.5 rounded-2xl bg-gradient-to-b from-[#232732] via-[#13161D] to-[#090B0F] text-white border border-zinc-300/50 hover:border-white/85 font-mono text-sm sm:text-base font-black uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(226,232,240,0.22),0_4px_0_#040507,inset_0_1px_0_rgba(255,255,255,0.28)] hover:shadow-[0_0_40px_rgba(226,232,240,0.38)] active:translate-y-[2px] hover:scale-[1.03] transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-zinc-200" />
              <span>Create Match</span>
              <ArrowRight className="w-4 h-4 text-zinc-200" />
            </button>
          ) : (
            <button
              id="start-match-btn"
              type="button"
              disabled={engine.usernameStatus === 'taken'}
              onClick={() =>
                isCustomMode ? engine.createCustomRoom() : engine.launchInstantMatch(false)
              }
              className="relative px-10 py-3.5 rounded-2xl bg-gradient-to-b from-[#232732] via-[#13161D] to-[#090B0F] text-white border border-zinc-300/50 hover:border-white/85 font-mono text-sm sm:text-base font-black uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(226,232,240,0.25),0_4px_0_#040507,inset_0_1px_0_rgba(255,255,255,0.28)] hover:shadow-[0_0_42px_rgba(226,232,240,0.42)] active:translate-y-[2px] hover:scale-[1.03] transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-zinc-200" />
              <span>Start The Match</span>
              <ArrowRight className="w-4 h-4 text-zinc-200" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenJoinModal}
            className="px-5 py-3.5 rounded-2xl bg-[#0B0D14]/90 hover:bg-white/[0.12] border border-white/15 text-xs font-mono font-bold text-zinc-200 hover:text-white flex items-center gap-2 backdrop-blur-xl cursor-pointer transition-all"
          >
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>Join Room</span>
          </button>
        </div>

        {engine.isGuest && (
          <p className="text-[10px] font-mono text-zinc-400/90 text-center">
            Guest Preview &bull; Random ID &amp; ELO reset on tab switch or exit.{' '}
            <button
              type="button"
              onClick={engine.openAuthForArena}
              className="text-zinc-200 underline underline-offset-2 hover:text-white cursor-pointer"
            >
              Sign in to save everything
            </button>
          </p>
        )}
      </div>

      {/* Theme-Matched Radial Card Match Selector */}
      {showMatchPortal && (
        <div className="pointer-events-auto">
          <ArenaMatchPortalModal
            engine={engine}
            onEnterMatch={() => {
              setMatchConfigured(true);
              setShowMatchPortal(false);
            }}
            onOpenJoinModal={onOpenJoinModal}
            onClose={() => setShowMatchPortal(false)}
          />
        </div>
      )}

      {/* First-Time Onboarding Gate OR Manual Profile Editor */}
      {(needsFirstSetup || showIdentityModal) && (
        <div className="pointer-events-auto">
          <ArenaIdentitySetupModal
            initialCallsign={engine.playerName}
            initialAvatarId={engine.selectedAvatarId}
            initialCustomUrl={engine.customAvatarUrl}
            isFirstEntry={needsFirstSetup && !showIdentityModal}
            isGuest={engine.isGuest}
            userId={engine.userId}
            onOpenAuth={engine.openAuthForArena}
            onConfirm={async (name, avId, custom) => {
              const res = await engine.saveGamerIdentity(name, avId, custom);
              if (!res || res.ok) {
                setShowIdentityModal(false);
              }
              return res;
            }}
            onCancel={() => setShowIdentityModal(false)}
          />
        </div>
      )}
    </div>
  );
}
