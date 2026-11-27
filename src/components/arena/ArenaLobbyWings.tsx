'use client';

import React from 'react';
import { Award, CheckCircle2, Flame, Shield, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { COLLEGIATE_BOT_PROFILES } from './arenaTypes';
import { useArenaEngine } from './useArenaEngine';

type Engine = ReturnType<typeof useArenaEngine>;

interface WingProps {
  engine: Engine;
  onOpenIdentity?: () => void;
}

function getNextRankTarget(elo: number): { nextTier: string; targetElo: number } {
  if (elo < 1050) return { nextTier: 'SILVER I', targetElo: 1050 };
  if (elo < 1300) return { nextTier: 'GOLD II', targetElo: 1300 };
  if (elo < 1500) return { nextTier: 'DIAMOND', targetElo: 1500 };
  if (elo < 1800) return { nextTier: 'OBSIDIAN', targetElo: 1800 };
  if (elo < 2000) return { nextTier: 'APEX', targetElo: 2000 };
  return { nextTier: 'APEX LEGEND', targetElo: 2500 };
}

/**
 * Left Kollabrix Command Wing: Obsidian dark-luxury Rank Climb card + Daily Bounty + Mech Skin control.
 */
export function ArenaLeftWing({ engine, onOpenIdentity }: WingProps) {
  const { nextTier, targetElo } = getNextRankTarget(engine.stats.elo);
  const progressPct = Math.min(100, Math.max(10, Math.round((engine.stats.elo / targetElo) * 100)));
  const totalMatches = engine.stats.wins + engine.stats.losses;
  const winRate = totalMatches > 0 ? Math.round((engine.stats.wins / totalMatches) * 100) : 0;

  return (
    <aside className="hidden lg:flex flex-col gap-3.5 w-[258px] shrink-0 relative z-20 pointer-events-auto">
      {/* Season Rank Progression Card */}
      <div className="relative rounded-3xl bg-[#0B0D14]/90 border border-white/10 backdrop-blur-2xl p-4 space-y-3 shadow-[0_24px_60px_rgba(0,0,0,0.85)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/75 to-transparent" />

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
            className="h-full rounded-full bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#FDE047]"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
          <div className="rounded-xl bg-[#07090E]/90 border border-white/[0.07] py-2">
            <p className="text-[8px] font-mono text-zinc-400">WINS</p>
            <p className="text-xs font-black font-mono text-emerald-300">{engine.stats.wins}</p>
          </div>
          <div className="rounded-xl bg-[#07090E]/90 border border-white/[0.07] py-2">
            <p className="text-[8px] font-mono text-zinc-400">WIN %</p>
            <p className="text-xs font-black font-mono text-white">{winRate}%</p>
          </div>
          <div className="rounded-xl bg-[#07090E]/90 border border-white/[0.07] py-2">
            <p className="text-[8px] font-mono text-zinc-400">STREAK</p>
            <p className="text-xs font-black font-mono text-amber-300 flex items-center justify-center gap-0.5">
              {engine.stats.winStreak || 0}
              <Flame className="w-3 h-3 text-amber-400" />
            </p>
          </div>
        </div>
      </div>

      {/* Daily Proving Grounds Quest + Mech Loadout Trigger */}
      <div className="relative rounded-3xl bg-[#0B0D14]/90 border border-white/10 backdrop-blur-2xl p-4 space-y-3 shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em]">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Target className="w-3.5 h-3.5" />
            <span>DAILY BOUNTY</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-bold text-[9px]">
            +40 XP
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Win 1 Ranked Duel or 60s Bug Hunt cleanly without focus strikes.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
            <Shield className="w-3 h-3" />
            <span>Sentinel Armed</span>
          </span>
          {onOpenIdentity && (
            <button
              type="button"
              onClick={onOpenIdentity}
              className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 border border-white/12 text-[10px] font-mono font-bold text-zinc-200 transition-all cursor-pointer inline-flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Mech Skin</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

/**
 * Right Kollabrix Command Wing: Obsidian Top Duelists + Queue Telemetry.
 */
export function ArenaRightWing({ engine }: WingProps) {
  const topBuilders = [...COLLEGIATE_BOT_PROFILES]
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 4);

  return (
    <aside className="hidden lg:flex flex-col gap-3.5 w-[258px] shrink-0 relative z-20 pointer-events-auto">
      {/* Top Campus Duelists */}
      <div className="relative rounded-3xl bg-[#0B0D14]/90 border border-white/10 backdrop-blur-2xl p-4 space-y-3 shadow-[0_24px_60px_rgba(0,0,0,0.85)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/75 to-transparent" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>TOP DUELISTS</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </span>
        </div>

        <div className="space-y-1.5">
          {topBuilders.map((b, i) => (
            <div
              key={b.name}
              className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-[#07090E]/90 border border-white/[0.06] hover:border-amber-500/35 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${
                    i === 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : i === 1
                        ? 'bg-white/10 text-zinc-200 border border-white/15'
                        : 'bg-orange-950/60 text-amber-500/90 border border-amber-500/20'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{b.name}</p>
                  <p className="text-[9px] font-mono text-zinc-400 truncate">{b.tag}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-300 shrink-0">
                {b.elo}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Arena Telemetry Card */}
      <div className="relative rounded-3xl bg-[#0B0D14]/90 border border-white/10 backdrop-blur-2xl p-4 space-y-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>ARENA INTEL</span>
          </span>
          <span className="text-emerald-300 font-bold">ONLINE</span>
        </div>

        <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Ranked Stakes</span>
            <span className="text-amber-300 font-bold">+24 / -14 ELO</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Question Bank</span>
            <span className="text-white font-bold">{engine.availableQuestionsCount ?? '1,020'} Live</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Judge Engine</span>
            <span className="text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Ready</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
