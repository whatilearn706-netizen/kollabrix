'use client';

import React, { useEffect, useState } from 'react';
import { Award, Bug, Code2, Crosshair, Flame, Palette, Shield, Swords, Trophy, Zap } from 'lucide-react';
import { useArenaEngine } from './useArenaEngine';
import type { TopDuelistEntry } from '@/app/api/arena/top-duelists/route';
import { AVATAR_CLASS_META } from './ArenaIdentitySetupModal';
import type { CombatModeId, StackLanguage } from './arenaTypes';

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

const WEAPON_LOADOUTS: Array<{ id: StackLanguage; label: string; tag: string }> = [
  { id: 'python', label: 'Python 3', tag: 'FAST' },
  { id: 'cpp', label: 'C++20', tag: 'STL' },
  { id: 'java', label: 'Java 21', tag: 'JVM' },
  { id: 'web', label: 'HTML/JS', tag: 'UI' },
];

const MODE_SELECTOR_CARDS: Array<{
  id: CombatModeId;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'blitz', label: '1v1 Quick Blitz', sub: 'Ranked · 5m', icon: Zap },
  { id: 'bug_hunt', label: '60s Bug Hunt', sub: 'Speed Fix', icon: Bug },
  { id: 'web_clash', label: 'Web Pixel Clash', sub: 'Frontend Duel', icon: Palette },
  { id: 'custom', label: 'Custom / Squad', sub: '1v1 or 2v2', icon: Swords },
];

/**
 * Left Esports HUD Wing:
 * 1) Season Rank Telemetry
 * 2) Operator Skin Armory (1-click 3D armor switch)
 * 3) Coding Weapon Loadout Selector
 */
export function ArenaLeftWing({ engine }: WingProps) {
  const { nextTier, targetElo, glowColor } = getNextRankTarget(engine.stats.elo);
  const progressPct = Math.min(100, Math.max(10, Math.round((engine.stats.elo / targetElo) * 100)));
  const totalMatches = engine.stats.wins + engine.stats.losses;
  const winRate = totalMatches > 0 ? Math.round((engine.stats.wins / totalMatches) * 100) : 0;

  return (
    <aside className="hidden lg:flex flex-col gap-3 w-[274px] shrink-0 relative z-20 pointer-events-auto">
      {/* Season Rank Progression Panel */}
      <div className="relative rounded-2xl bg-[#090D16]/90 border border-sky-400/20 backdrop-blur-2xl p-4 space-y-3 shadow-[0_24px_60px_rgba(0,0,0,0.88)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-amber-400 to-transparent" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5 font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>SEASON 01 RANK</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/35 text-[9px] font-mono font-bold text-amber-200">
            {engine.stats.tier}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-black font-mono text-white tracking-tight">
            {engine.stats.elo.toLocaleString()}{' '}
            <span className="text-[10px] text-sky-400 font-bold">ELO</span>
          </p>
          <span className="text-[10px] font-mono text-zinc-400">Next: {nextTier}</span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden p-[1px]">
          <div
            style={{ width: `${progressPct}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${glowColor}`}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
          <div className="rounded-xl bg-[#05080F]/95 border border-white/[0.08] py-2">
            <p className="text-[8px] font-mono text-zinc-400">WINS</p>
            <p className="text-xs font-black font-mono text-emerald-300">{engine.stats.wins}</p>
          </div>
          <div className="rounded-xl bg-[#05080F]/95 border border-white/[0.08] py-2">
            <p className="text-[8px] font-mono text-zinc-400">WIN %</p>
            <p className="text-xs font-black font-mono text-white">{winRate}%</p>
          </div>
          <div className="rounded-xl bg-[#05080F]/95 border border-white/[0.08] py-2">
            <p className="text-[8px] font-mono text-zinc-400">STREAK</p>
            <p className="text-xs font-black font-mono text-amber-300 flex items-center justify-center gap-0.5">
              {engine.stats.winStreak || 0}
              <Flame className="w-3 h-3 text-amber-400" />
            </p>
          </div>
        </div>
      </div>

      {/* Cyber-Operator Armory Skin Quick-Switch */}
      <div className="relative rounded-2xl bg-[#090D16]/90 border border-white/12 backdrop-blur-2xl p-3.5 space-y-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-sky-300 font-bold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>OPERATOR SKIN</span>
          </span>
          <span className="text-[9px] font-mono text-zinc-400">3D ARMORY</span>
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
                className={`h-9 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
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

      {/* Coding Weapon Loadout */}
      <div className="relative rounded-2xl bg-[#090D16]/90 border border-white/12 backdrop-blur-2xl p-3.5 space-y-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300 font-bold flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>WEAPON LOADOUT</span>
          </span>
          <span className="text-[9px] font-mono text-zinc-400">STACK</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {WEAPON_LOADOUTS.map((w) => {
            const active = engine.algoLanguage === w.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => engine.selectStackLanguage(w.id)}
                className={`px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  active
                    ? 'bg-sky-500/20 border-sky-400/60 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'bg-[#060911] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="text-[11px] font-mono font-bold">{w.label}</span>
                <span className="text-[8px] font-mono opacity-75">{w.tag}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

/**
 * Right Esports HUD Wing:
 * 1) Game Mode Selector Cards (BGMI / Valorant Map Style)
 * 2) Live Top 5 Real Duelists
 */
export function ArenaRightWing({ engine }: Partial<WingProps>) {
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
    <aside className="hidden lg:flex flex-col gap-3 w-[274px] shrink-0 relative z-20 pointer-events-auto">
      {/* Game Mode Selector (BGMI / Free Fire Lobby Card Style) */}
      {engine && (
        <div className="relative rounded-2xl bg-[#090D16]/90 border border-white/12 backdrop-blur-2xl p-3.5 space-y-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300 font-bold flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>COMBAT MODE</span>
            </span>
            <div className="flex items-center gap-1">
              {(['1v1', '2v2'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => engine.setTeamSize(sz)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                    engine.teamSize === sz
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-white/[0.06] text-zinc-400 hover:text-white'
                  }`}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {MODE_SELECTOR_CARDS.map((m) => {
              const active = engine.combatMode === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => engine.selectCombatMode(m.id)}
                  className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-400/60 text-white shadow-[0_0_16px_rgba(245,158,11,0.18)]'
                      : 'bg-[#060911] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-300' : 'text-zinc-500'}`} />
                    <span className="text-[11px] font-mono font-bold">{m.label}</span>
                  </div>
                  <span className="text-[9px] font-mono opacity-80">{m.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top 5 Live Duelists Leaderboard */}
      <div className="relative rounded-2xl bg-[#090D16]/90 border border-white/12 backdrop-blur-2xl p-4 space-y-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.88)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-rose-500" />

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
                className="h-10 rounded-xl bg-[#05080F]/90 border border-white/[0.05] animate-pulse"
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
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-[#05080F]/95 border border-white/[0.06] hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${
                      i === 0
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40'
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
