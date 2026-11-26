'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  Check,
  Dices,
  Flame,
  Globe,
  Pencil,
  Plus,
  Swords,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  CombatModeId,
  PROVING_GROUNDS_AVATARS,
  StackLanguage,
  sanitizeCallsign,
} from './arenaTypes';
import { useArenaEngine } from './useArenaEngine';

type Engine = ReturnType<typeof useArenaEngine>;

interface ArenaLobbyProps {
  engine: Engine;
  onOpenJoinModal: () => void;
}

const MODE_CARDS: Array<{
  id: CombatModeId;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'blitz',
    title: '1v1 Quick Blitz',
    subtitle: 'Ranked 3m Speed Duel · +24 / -14 ELO',
    icon: Zap,
  },
  {
    id: 'bug_hunt',
    title: '60s Bug Hunt',
    subtitle: 'Fixed 60s sprint · Code or Web UI bugs',
    icon: Bug,
  },
  {
    id: 'web_clash',
    title: 'Web Pixel Clash',
    subtitle: 'Live HTML/CSS layout speedrun',
    icon: Globe,
  },
  {
    id: 'custom',
    title: 'Custom',
    subtitle: 'Private KBX room · 1v1/2v2 · Code or Web',
    icon: Swords,
  },
];

/**
 * Stage 1: Combat Command Deck Lobby.
 * Features zero-error verified identity dossier and unlocked mode selector.
 */
export function ArenaLobby({ engine, onOpenJoinModal }: ArenaLobbyProps) {
  const [editingIdentity, setEditingIdentity] = useState(false);

  const isCustomMode = engine.combatMode === 'custom';
  const isBugHunt = engine.combatMode === 'bug_hunt';
  const stackChoices: StackLanguage[] =
    isBugHunt || isCustomMode ? ['python', 'cpp', 'java', 'web'] : ['python', 'cpp', 'java'];

  return (
    <div className="relative z-10 min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar: Back, Live Queue Pulse Strip, Audio Toggle */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={engine.onClose}
          className="px-4 py-2 rounded-full bg-[#0A0E17]/90 hover:bg-white/[0.08] border border-white/15 hover:border-white/30 text-slate-200 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0A0E17]/90 border border-white/15 text-[11px] font-mono text-slate-300 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>18 Builders in Arena</span>
          <span className="text-slate-600">&bull;</span>
          <span>Avg Queue: 4s</span>
          <span className="text-slate-600">&bull;</span>
          <span>Top Campus: <strong className="text-white">IIT Delhi</strong></span>
        </div>

        <button
          type="button"
          onClick={() => engine.setAudioEnabled(!engine.audioEnabled)}
          aria-label="Toggle arena sound"
          title={engine.audioEnabled ? 'Mute Arena SFX' : 'Enable Arena SFX'}
          className="w-9 h-9 rounded-full bg-[#0A0E17]/90 hover:bg-white/[0.08] border border-white/15 hover:border-white/30 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
        >
          {engine.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </header>

      {/* Center Floating Obsidian Titanium Deck */}
      <main className="w-full max-w-5xl mx-auto my-auto py-4">
        <div className="relative rounded-3xl bg-[#0A0E17]/92 border border-white/15 border-t-white/25 shadow-[0_28px_80px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT RAIL (32%): Verified Fighter Dossier Card */}
            <aside className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between gap-5 bg-[#060910]/70">
              <div className="flex flex-col items-center text-center space-y-3.5">
                {/* Verified Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/25 bg-slate-900 shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                    <img
                      src={engine.activeAvatarUrl}
                      alt={engine.playerName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/arena-cyber-entity.png';
                      }}
                    />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </div>

                {/* Auto-Sanitized Verified Callsign Pill */}
                <div
                  className={`w-full px-3 py-2 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 ${
                    engine.usernameStatus === 'taken'
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                      : 'bg-emerald-950/35 border-emerald-500/45 text-emerald-200'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="truncate">{engine.playerName}</span>
                </div>

                {/* Telemetry Pills: College, Tier, ELO, Win Streak */}
                <div className="space-y-2 w-full flex flex-col items-center">
                  <div className="px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/15 font-mono text-[11px] font-bold text-slate-200 tracking-wide">
                    {engine.playerCollege} &bull; {engine.stats.tier} &bull; {engine.stats.elo.toLocaleString()} ELO
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/50 border border-red-500/35 font-mono text-[11px] font-bold text-red-200">
                    <span>{engine.stats.winStreak || 0} Win Streak</span>
                    <Flame className="w-3 h-3 text-amber-400" />
                  </div>
                </div>

                {/* Compact Customize Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setEditingIdentity((v) => !v)}
                  className="text-[11px] font-mono text-slate-400 hover:text-white underline underline-offset-4 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>{editingIdentity ? 'Done Editing' : 'Edit Avatar / Callsign'}</span>
                </button>

                {editingIdentity && (
                  <div className="w-full p-3 rounded-2xl bg-black/60 border border-white/10 space-y-3 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Callsign</span>
                      <button
                        type="button"
                        onClick={engine.rollCallsign}
                        className="text-[10px] font-mono text-slate-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Dices className="w-3 h-3" />
                        <span>Randomize</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={engine.playerName}
                      maxLength={25}
                      onChange={(e) => engine.setPlayerName(sanitizeCallsign(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0A0E17] border border-white/15 text-xs font-mono text-white outline-none focus:border-white/40"
                    />
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                      {PROVING_GROUNDS_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => {
                            engine.setCustomAvatarUrl('');
                            engine.setSelectedAvatarId(av.id);
                          }}
                          title={av.name}
                          className={`w-8 h-8 rounded-lg overflow-hidden border shrink-0 cursor-pointer ${
                            engine.selectedAvatarId === av.id ? 'border-white ring-1 ring-white/50' : 'border-white/15 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={av.image} alt={av.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <label
                        title="Upload custom avatar"
                        className="w-8 h-8 rounded-lg border border-dashed border-white/30 hover:border-white/60 flex items-center justify-center text-slate-300 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = () => typeof reader.result === 'string' && engine.setCustomAvatarUrl(reader.result);
                            reader.readAsDataURL(f);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenJoinModal}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 hover:border-white/30 text-slate-200 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Join with Room Code</span>
              </button>
            </aside>

            {/* RIGHT DECK (68%): Unlocked Combat Mode Selector */}
            <section className="lg:col-span-8 p-6 sm:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-white/[0.06] border border-white/15 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">
                    THE PROVING GROUNDS &bull; CHOOSE COMBAT MODE
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Enter the Arena</h1>
                </div>

                {/* 2x2 Mode Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODE_CARDS.map((card) => {
                    const active = engine.combatMode === card.id;
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => engine.selectCombatMode(card.id)}
                        className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-white/[0.08] border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)]'
                            : 'bg-[#060910]/80 border-white/10 hover:border-white/25'
                        }`}
                      >
                        {active && (
                          <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                          <span className="font-sans font-bold text-sm text-white">{card.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug pr-5">
                          {card.id === 'blitz' && engine.combatMode === 'blitz'
                            ? `Ranked ${Math.round(engine.timeLimit / 60)}m Speed Duel · +24 / -14 ELO`
                            : card.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Inline Configuration Pills: Language/Web, Difficulty, Duration (hidden on 60s Bug Hunt), Squad Size (Custom only) */}
                <div
                  className={`grid grid-cols-1 gap-2.5 pt-1 ${
                    isBugHunt ? 'sm:grid-cols-2' : isCustomMode ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
                  }`}
                >
                  {/* Language / Web Stack */}
                  <div>
                    <span className="block text-[11px] font-mono text-slate-400 mb-1.5">
                      {engine.combatMode === 'web_clash' ? 'Web Stack' : isBugHunt || isCustomMode ? 'Language / Web' : 'Language'}
                    </span>
                    {engine.combatMode === 'web_clash' ? (
                      <div className="inline-flex gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10 w-full">
                        {(['html', 'css', 'javascript'] as const).map((t) => {
                          const on = t === 'html' || engine.webTags.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                if (t === 'html') return;
                                engine.setWebTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
                              }}
                              className={`flex-1 py-1 px-1.5 rounded-lg font-mono text-[10px] font-bold uppercase cursor-pointer ${
                                on ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {t === 'javascript' ? 'JS' : t}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="inline-flex gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10 w-full">
                        {stackChoices.map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => engine.selectStackLanguage(lang)}
                            className={`flex-1 py-1 px-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                              engine.algoLanguage === lang ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {lang === 'cpp' ? 'C++' : lang === 'python' ? 'Py' : lang === 'java' ? 'Java' : 'Web'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Difficulty (or 100% Random Pool in 60s Bug Hunt Web) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-slate-400">
                        {isBugHunt && engine.algoLanguage === 'web' ? 'Stack & Level' : 'Difficulty'}
                      </span>
                      {isBugHunt && (
                        <span className="text-[10px] font-mono font-bold text-red-400">⏱ 60s</span>
                      )}
                    </div>
                    {isBugHunt && engine.algoLanguage === 'web' ? (
                      <div className="px-2.5 py-1.5 rounded-xl bg-[#05080F] border border-white/10 font-mono text-[10px] font-bold text-slate-200 flex items-center justify-between">
                        <span>100% Random</span>
                        <span className="text-slate-400">HTML/CSS/JS</span>
                      </div>
                    ) : (
                      <div className="inline-flex gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10 w-full">
                        {(['easy', 'medium', 'hard'] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => engine.selectDifficulty(d)}
                            className={`flex-1 py-1 px-1.5 rounded-lg font-mono text-[10px] font-bold capitalize cursor-pointer ${
                              engine.difficulty === d ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Duration (3m / 5m / 10m) — hidden in 60s Bug Hunt */}
                  {!isBugHunt && (
                    <div>
                      <span className="block text-[11px] font-mono text-slate-400 mb-1.5">Duration</span>
                      <div className="inline-flex gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10 w-full">
                        {[
                          { secs: 180, label: '3m' },
                          { secs: 300, label: '5m' },
                          { secs: 600, label: '10m' },
                        ].map((dur) => (
                          <button
                            key={dur.secs}
                            type="button"
                            onClick={() => engine.setTimeLimit(dur.secs)}
                            className={`flex-1 py-1 px-1.5 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                              engine.timeLimit === dur.secs ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {dur.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Squad Size (1v1 / 2v2) — Custom Mode Only */}
                  {isCustomMode && (
                    <div>
                      <span className="block text-[11px] font-mono text-slate-400 mb-1.5">Squad Size</span>
                      <div className="inline-flex gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10 w-full">
                        {(['1v1', '2v2'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => engine.setTeamSize(sz)}
                            className={`flex-1 py-1 px-1.5 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                              engine.teamSize === sz ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-options when Custom -> Web is selected */}
                {isCustomMode && engine.algoLanguage === 'web' && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[11px] font-mono text-slate-400">Web Stack:</span>
                    <div className="inline-flex gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10">
                      {(['html', 'css', 'javascript'] as const).map((t) => {
                        const on = t === 'html' || engine.webTags.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              if (t === 'html') return;
                              engine.setWebTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
                            }}
                            className={`py-0.5 px-2.5 rounded-lg font-mono text-[10px] font-bold uppercase cursor-pointer ${
                              on ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {t === 'javascript' ? 'JS' : t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons & Empty Bank Notice */}
              {engine.lobbyNotice && (
                <div className="px-4 py-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs font-mono text-amber-200">
                  {engine.lobbyNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <button
                  type="button"
                  disabled={engine.usernameStatus === 'taken'}
                  onClick={() => (isCustomMode ? engine.createCustomRoom() : engine.launchInstantMatch(false))}
                  className="sm:col-span-7 py-3.5 px-5 rounded-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 hover:brightness-105 text-slate-950 font-mono text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,255,255,0.16)] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isCustomMode ? 'Create Custom Room' : 'Find Opponent'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={engine.usernameStatus === 'taken'}
                  onClick={() => engine.launchInstantMatch(true)}
                  className="sm:col-span-5 py-3.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 hover:border-white/30 text-slate-200 hover:text-white font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                >
                  Warmup vs Ghost Rival
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="h-4" />
    </div>
  );
}
