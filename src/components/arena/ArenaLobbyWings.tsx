'use client';

import React, { useEffect, useState } from 'react';
import { Award, Flame, Shield, Trophy } from 'lucide-react';
import { useArenaEngine } from './useArenaEngine';
import type { TopDuelistEntry } from '@/app/api/arena/top-duelists/route';
import { AVATAR_CLASS_META } from './ArenaIdentitySetupModal';

type Engine = ReturnType<typeof useArenaEngine>;

interface WingProps {
  engine: Engine;
  onOpenIdentity?: () => void;
}

function getNextRankTarget(elo: number): { nextTier: string; targetElo: number; glowColor: string } {
  if (elo < 1050) return { nextTier: 'SILVER I', targetElo: 1050, glowColor: 'from-cyan-400 to-sky-500' };
  if (elo < 1300) return { nextTier: 'GOLD II', targetElo: 1300, glowColor: 'from-sky-400 to-amber-400' };
  if (elo < 1500) return { nextTier: 'DIAMOND', targetElo: 1500, glowColor: 'from-amber-500 to-yellow-300' };
  if (elo < 1800) return { nextTier: 'OBSIDIAN', targetElo: 1800, glowColor: 'from-fuchsia-500 to-amber-300' };
  if (elo < 2000) return { nextTier: 'APEX', targetElo: 2000, glowColor: 'from-rose-500 to-purple-400' };
  return { nextTier: 'APEX LEGEND', targetElo: 2500, glowColor: 'from-rose-500 to-amber-300' };
}

/**
 * Left Kollabrix Command Wing: Season 01 Rank Telemetry + 3D Tablet Skin Armory.
 */
export function ArenaLeftWing({ engine }: WingProps) {
  const { nextTier, targetElo, glowColor } = getNextRankTarget(engine.stats.elo);
  const progressPct = Math.min(100, Math.max(10, Math.round((engine.stats.elo / targetElo) * 100)));
  const totalMatches = engine.stats.wins + engine.stats.losses;
  const winRate = totalMatches > 0 ? Math.round((engine.stats.wins / totalMatches) * 100) : 0;

  return (
    <aside className="hidden lg:flex flex-col gap-3.5 w-[264px] shrink-0 relative z-20 pointer-events-auto">
      {/* Season Rank Progression Panel */}
      <div className="relative rounded-3xl bg-[#070A12]/90 border border-white/12 backdrop-blur-2xl p-4 space-y-3 shadow-[0_24px_60px_rgba(0,0,0,0.88)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5 font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>SEASON 01</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-[9px] font-mono font-bold text-amber-200">
            {engine.stats.tier}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-black font-mono text-white tracking-tight">
            {engine.stats.elo.toLocaleString()}{' '}
            <span className="text-[10px] text-zinc-400 font-semibold">ELO</span>
          </p>
          <span className="text-[10px] font-mono text-amber-300/80">Next: {nextTier}</span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden p-[1px]">
          <div
            style={{ width: `${progressPct}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${glowColor}`}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
          <div className="rounded-xl bg-[#04060B]/95 border border-white/[0.07] py-2">
            <p className="text-[8px] font-mono text-zinc-400">WINS</p>
            <p className="text-xs font-black font-mono text-emerald-300">{engine.stats.wins}</p>
          </div>
          <div className="rounded-xl bg-[#04060B]/95 border border-white/[0.07] py-2">
            <p className="text-[8px] font-mono text-zinc-400">WIN %</p>
            <p className="text-xs font-black font-mono text-white">{winRate}%</p>
          </div>
          <div className="rounded-xl bg-[#04060B]/95 border border-white/[0.07] py-2">
            <p className="text-[8px] font-mono text-zinc-400">STREAK</p>
            <p className="text-xs font-black font-mono text-amber-300 flex items-center justify-center gap-0.5">
              {engine.stats.winStreak || 0}
              <Flame className="w-3 h-3 text-amber-400" />
            </p>
          </div>
        </div>
      </div>

      {/* 3D Tablet Skin Armory */}
      <div className="relative rounded-3xl bg-[#070A12]/90 border border-white/12 backdrop-blur-2xl p-4 space-y-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-sky-300 font-bold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>SLATE THEME</span>
          </span>
          <span className="text-[9px] font-mono text-zinc-400">3D FINISH</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(AVATAR_CLASS_META).map(([id, meta]) => {
            const active = engine.selectedAvatarId === id;
            return (
              <button
                key={id}
                type="button"
                title={meta.title}
                onClick={() => engine.setSelectedAvatarId(id)}
                className={`h-9 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  active
                    ? 'border-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.28)]'
                    : 'border-white/15 opacity-65 hover:opacity-100'
                }`}
                style={{ backgroundColor: meta.armorHex }}
              >
                <span
                  className="w-3 h-1 rounded-full"
                  style={{ backgroundColor: meta.jointHex }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

/**
 * Right Kollabrix Command Wing: Live Top 5 Real Campus Duelists.
 */
export function ArenaRightWing(_props: Partial<WingProps>) {
  const [duelists, setDuelists] = useState<TopDuelistEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchTopDuelists = () => {
      fetch(`/api/arena/top-duelists?_t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active) return;
          if (data?.success && Array.isArray(data.duelists)) {
            setDuelists(data.duelists.slice(0, 5));
          }
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoaded(true);
        });
    };

    fetchTopDuelists();
    window.addEventListener('kollabrix:arena-elo-updated', fetchTopDuelists);

    return () => {
      active = false;
      window.removeEventListener('kollabrix:arena-elo-updated', fetchTopDuelists);
    };
  }, []);

  return (
    <aside className="hidden lg:flex flex-col gap-3.5 w-[268px] shrink-0 relative z-20 pointer-events-auto">
      {/* Top 5 Live Duelists Leaderboard */}
      <div className="relative rounded-3xl bg-[#070A12]/90 border border-white/12 backdrop-blur-2xl p-4 space-y-3 shadow-[0_24px_60px_rgba(0,0,0,0.88)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>TOP 5 DUELISTS</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </span>
        </div>

        <div className="space-y-1.5">
          {!loaded ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-11 rounded-xl bg-[#04060B]/90 border border-white/[0.05] animate-pulse"
              />
            ))
          ) : duelists.length === 0 ? (
            <p className="text-[11px] font-mono text-zinc-400 py-3 text-center">
              No ranked duelists yet.
            </p>
          ) : (
            duelists.map((b, i) => (
              <div
                key={b.userId}
                className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-[#04060B]/95 border border-white/[0.06] hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${
                      i === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/35'
                        : i === 1
                          ? 'bg-white/10 text-zinc-200 border border-white/15'
                          : 'bg-orange-950/60 text-amber-500/90 border border-amber-500/20'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{b.name}</p>
                    <p className="text-[9px] font-mono text-zinc-400 truncate">{b.college}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-300 shrink-0">
                  {b.elo}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
