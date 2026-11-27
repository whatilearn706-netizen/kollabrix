'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  Check,
  Globe,
  SlidersHorizontal,
  Swords,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { CombatModeId, StackLanguage } from './arenaTypes';
import { useArenaEngine } from './useArenaEngine';

type Engine = ReturnType<typeof useArenaEngine>;

interface ArenaMatchPortalModalProps {
  engine: Engine;
  onEnterMatch: () => void;
  onOpenJoinModal: () => void;
  onClose: () => void;
}

interface RadialModeItem {
  id: CombatModeId;
  title: string;
  tag: string;
  subtitle: string;
  cardBg: string;
  borderClass: string;
  arcAngle: number;
  arcOffsetY: number;
  variant: 'amber-wave' | 'obsidian-editorial' | 'titanium-gold' | 'platinum-star';
  icon: React.ComponentType<{ className?: string }>;
}

const RADIAL_MODES: RadialModeItem[] = [
  {
    id: 'blitz',
    title: '1V1 BLITZ',
    tag: 'RANKED · +24 ELO',
    subtitle: 'HEAD-TO-HEAD ALGORITHMIC SPEED DUEL — REAL TESTCASES',
    cardBg: 'bg-gradient-to-br from-[#1C120B] via-[#120D0A] to-[#090B10]',
    borderClass: 'border border-amber-500/45 shadow-[0_24px_70px_rgba(234,88,12,0.22)]',
    arcAngle: -16,
    arcOffsetY: 36,
    variant: 'amber-wave',
    icon: Zap,
  },
  {
    id: 'bug_hunt',
    title: 'BUG HUNT',
    tag: '60S SPRINT',
    subtitle: 'RAPID CODE & WEB UI PATCH — FIXED 60 SECOND BLITZ',
    cardBg: 'bg-gradient-to-br from-[#EA580C] via-[#C2410C] to-[#7C2D12]',
    borderClass: 'border border-amber-300/40 shadow-[0_24px_70px_rgba(234,88,12,0.3)]',
    arcAngle: -5,
    arcOffsetY: 0,
    variant: 'obsidian-editorial',
    icon: Bug,
  },
  {
    id: 'web_clash',
    title: 'Web Pixel',
    tag: 'WEB PIXEL CLASH',
    subtitle: 'LIVE HTML, CSS & JS SPEEDRUN TARGET BUILD',
    cardBg: 'bg-gradient-to-br from-[#181B26] via-[#10131C] to-[#08090F]',
    borderClass: 'border border-amber-400/35 shadow-[0_24px_70px_rgba(0,0,0,0.8)]',
    arcAngle: 6,
    arcOffsetY: 0,
    variant: 'titanium-gold',
    icon: Globe,
  },
  {
    id: 'custom',
    title: 'CUSTOM ROOM',
    tag: 'KBX PRIVATE',
    subtitle: 'INVITE-ONLY 1V1 OR 2V2 CAMPUS SQUAD MATCH',
    cardBg: 'bg-gradient-to-br from-[#141720] via-[#0D1017] to-[#07090E]',
    borderClass: 'border border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.85)]',
    arcAngle: 17,
    arcOffsetY: 36,
    variant: 'platinum-star',
    icon: Swords,
  },
];

function ModeTileGraphic({ item, large = false }: { item: RadialModeItem; large?: boolean }) {
  const Icon = item.icon;
  if (item.variant === 'amber-wave') {
    return (
      <div className="w-full h-full flex flex-col justify-between relative overflow-hidden p-5">
        {/* Top metallic sheen */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/75 to-transparent" />
        {/* Warm Kollabrix Amber Architectural Waves */}
        <svg viewBox="0 0 220 220" className="absolute inset-0 w-full h-full opacity-35 pointer-events-none">
          <path d="M-20 40 Q 40 0 100 45 T 230 40" fill="none" stroke="#F59E0B" strokeWidth="14" strokeLinecap="round" />
          <path d="M-20 105 Q 45 65 110 110 T 235 100" fill="none" stroke="#EA580C" strokeWidth="14" strokeLinecap="round" />
          <path d="M-20 170 Q 50 130 120 175 T 240 165" fill="none" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round" />
        </svg>
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/35 text-amber-200">
            {item.tag}
          </span>
          <Icon className="w-5 h-5 text-amber-300" />
        </div>
        <div className="relative z-10">
          <div className={`${large ? 'text-3xl' : 'text-2xl'} font-black tracking-tight text-white uppercase leading-none`}>
            {item.title}
          </div>
          <p className="text-[10px] font-mono font-semibold text-zinc-300 mt-2 leading-snug">
            {item.subtitle}
          </p>
        </div>
      </div>
    );
  }

  if (item.variant === 'obsidian-editorial') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="space-y-2 relative z-10">
          <p className={`${large ? 'text-xs' : 'text-[10px]'} font-mono font-extrabold uppercase tracking-tight leading-tight text-[#0B0908]`}>
            {item.subtitle}
          </p>
          <div className="w-full h-[1.5px] bg-[#0B0908]/75" />
        </div>
        <div className="flex items-end justify-between gap-2 relative z-10">
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-[#0B0908] mb-1.5" />
            <div className={`${large ? 'text-3xl' : 'text-2xl'} font-black tracking-tight text-[#0B0908] uppercase leading-none`}>
              {item.title}
            </div>
          </div>
          <span className="text-[10px] font-mono font-black uppercase text-[#0B0908]">
            {item.tag}
          </span>
        </div>
      </div>
    );
  }

  if (item.variant === 'titanium-gold') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/75 to-transparent" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300/90">
            {item.tag}
          </span>
          <Icon className="w-5 h-5 text-amber-300" />
        </div>
        <div className="my-auto relative z-10">
          <div className={`${large ? 'text-4xl' : 'text-[30px]'} font-black tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent leading-none`}>
            Web Pixel
          </div>
          <p className="text-[11px] font-mono font-black uppercase text-amber-300 mt-1.5">
            UI CLASH
          </p>
        </div>
        <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase relative z-10">
          {item.subtitle}
        </p>
      </div>
    );
  }

  // Obsidian & Platinum Star Card
  return (
    <div className="w-full h-full flex flex-col justify-between p-5 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
          {item.tag}
        </span>
        <Icon className="w-4 h-4 text-amber-300" />
      </div>
      <div className="my-auto flex justify-center relative z-10">
        <svg viewBox="0 0 80 80" className={large ? 'w-20 h-20' : 'w-16 h-16'}>
          <path
            d="M40 4 C45 28 52 35 76 40 C52 45 45 52 40 76 C35 52 28 45 4 40 C28 35 35 28 40 4 Z"
            fill="#FAF8F5"
          />
        </svg>
      </div>
      <div className="relative z-10">
        <div className="text-lg font-black tracking-tight text-white uppercase leading-none">
          {item.title}
        </div>
        <p className="text-[9px] font-mono font-semibold text-zinc-400 mt-1">{item.subtitle}</p>
      </div>
    </div>
  );
}

/**
 * Kollabrix Dark-Luxury Radial Arc Match Selector (adapted from pin.it/4Kiz5XgnE):
 * - Initial View: Radial curved arc of obsidian/amber/titanium cards on #07090E dark backdrop.
 * - On Choose 1 Card: All other cards disappear smoothly, the chosen card glides to the Left,
 *   and the 3-Row Configuration Box (1. Language, 2. Difficulty, 3. Duration + Enter Match) appears on the Right.
 */
export function ArenaMatchPortalModal({
  engine,
  onEnterMatch,
  onOpenJoinModal,
  onClose,
}: ArenaMatchPortalModalProps) {
  const [selectedId, setSelectedId] = useState<CombatModeId | null>(null);

  const selectedModeItem = selectedId
    ? RADIAL_MODES.find((m) => m.id === selectedId) || null
    : null;

  const handleChooseCard = (modeId: CombatModeId) => {
    engine.selectCombatMode(modeId);
    setSelectedId(modeId);
  };

  const isCustomMode = engine.combatMode === 'custom';
  const isBugHunt = engine.combatMode === 'bug_hunt';
  const stackChoices: StackLanguage[] =
    isBugHunt || isCustomMode ? ['python', 'cpp', 'java', 'web'] : ['python', 'cpp', 'java'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9994] bg-[#07090E] text-white overflow-y-auto overflow-x-hidden flex flex-col justify-between p-5 sm:p-8"
    >
      {/* Subtle Kollabrix Obsidian + Warm Burnt Amber Ambient Glow */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% 62%, rgba(234, 88, 12, 0.14) 0%, rgba(17, 20, 30, 0.7) 52%, #07090E 100%)',
        }}
      />

      {/* Minimal Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-amber-300/90">
          {selectedId ? 'LOADOUT LOCKED · CONFIGURE PARAMETERS' : 'CHOOSE YOUR ARENA CARD'}
        </span>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenJoinModal();
            }}
            className="px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/12 text-xs font-mono text-zinc-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>Join Room</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close selector"
            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/12 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto my-auto py-6">
        {!selectedModeItem ? (
          /* STATE 1: Radial Arc of Theme-Matched Obsidian/Amber Cards */
          <div className="relative flex flex-col items-center justify-center min-h-[420px]">
            {/* Partially visible obsidian edge cards suggesting continuous loop */}
            <div className="hidden xl:block pointer-events-none fixed left-[-110px] top-1/2 -translate-y-1/2 w-[180px] h-[195px] rounded-2xl bg-[#11141E] border border-amber-500/20 opacity-45 -rotate-[28deg]" />
            <div className="hidden xl:block pointer-events-none fixed right-[-110px] top-1/2 -translate-y-1/2 w-[180px] h-[195px] rounded-2xl bg-[#1C120B] border border-amber-500/25 opacity-45 rotate-[28deg]" />

            <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-5 sm:gap-7 py-6">
              {RADIAL_MODES.map((item) => (
                <motion.button
                  key={item.id}
                  layoutId={`arena-card-${item.id}`}
                  type="button"
                  onClick={() => handleChooseCard(item.id)}
                  initial={{ rotate: item.arcAngle, y: item.arcOffsetY }}
                  animate={{ rotate: item.arcAngle, y: item.arcOffsetY }}
                  whileHover={{
                    y: item.arcOffsetY - 18,
                    scale: 1.07,
                    rotate: item.arcAngle * 0.4,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className={`w-[205px] h-[225px] sm:w-[225px] sm:h-[245px] rounded-2xl ${item.cardBg} ${item.borderClass} cursor-pointer text-left shrink-0 overflow-hidden`}
                >
                  <ModeTileGraphic item={item} />
                </motion.button>
              ))}
            </div>

            <p className="mt-8 font-mono text-xs uppercase tracking-[0.35em] text-zinc-400">
              TAP A MODE TO ENTER
            </p>
          </div>
        ) : (
          /* STATE 2: Selected Card Slides Left cleanly, all others vanish, Right shows 3-Row Box */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
            <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedModeItem.id}
                  layoutId={`arena-card-${selectedModeItem.id}`}
                  initial={{ scale: 0.9, rotate: selectedModeItem.arcAngle }}
                  animate={{ scale: 1, rotate: -3 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                  className={`w-[265px] h-[290px] sm:w-[295px] sm:h-[320px] rounded-3xl ${selectedModeItem.cardBg} ${selectedModeItem.borderClass} overflow-hidden`}
                >
                  <ModeTileGraphic item={selectedModeItem} large />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose Different Mode</span>
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 42 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 rounded-3xl bg-[#0F121A] border border-white/12 shadow-[0_32px_90px_rgba(0,0,0,0.8)] p-6 sm:p-8 space-y-6 relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

              <div className="border-b border-white/[0.08] pb-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>MATCH SETTINGS</span>
                  </p>
                  <div className="text-xl font-black text-white mt-0.5 uppercase">
                    {selectedModeItem.title}
                  </div>
                </div>

                {isCustomMode && (
                  <div className="inline-flex gap-1 p-1 rounded-xl bg-black/50 border border-white/10">
                    {(['1v1', '2v2'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => engine.setTeamSize(sz)}
                        className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                          engine.teamSize === sz
                            ? 'bg-gradient-to-r from-[#FBBF24] to-[#EA580C] text-[#07090E]'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ROW 1: LANGUAGE */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 block">
                  1. Language / Stack
                </label>
                {engine.combatMode === 'web_clash' ? (
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['html', 'css', 'javascript'] as const).map((t) => {
                      const on = t === 'html' || engine.webTags.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            if (t === 'html') return;
                            engine.setWebTags((prev) =>
                              prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                            );
                          }}
                          className={`py-3 rounded-xl font-mono text-xs font-bold uppercase border cursor-pointer transition-all ${
                            on
                              ? 'bg-[#FAF8F5] text-[#07090E] border-white'
                              : 'bg-black/45 text-zinc-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {t === 'javascript' ? 'JS' : t}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`grid gap-2.5 ${stackChoices.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    {stackChoices.map((lang) => {
                      const active = engine.algoLanguage === lang;
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => engine.selectStackLanguage(lang)}
                          className={`py-3 rounded-xl font-mono text-xs font-bold border cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                            active
                              ? 'bg-[#FAF8F5] text-[#07090E] border-white shadow'
                              : 'bg-black/45 text-zinc-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>
                            {lang === 'cpp' ? 'C++' : lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'Web'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ROW 2: DIFFICULTY */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 block">
                  2. Difficulty
                </label>
                {isBugHunt && engine.algoLanguage === 'web' ? (
                  <div className="px-4 py-3 rounded-xl bg-black/45 border border-white/10 font-mono text-xs text-zinc-300 flex items-center justify-between">
                    <span>Random Web Challenge Pool</span>
                    <span className="text-amber-300 font-bold">HTML / CSS / JS</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['easy', 'medium', 'hard'] as const).map((d) => {
                      const active = engine.difficulty === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => engine.selectDifficulty(d)}
                          className={`py-3 rounded-xl font-mono text-xs font-bold capitalize border cursor-pointer transition-all ${
                            active
                              ? 'bg-[#FAF8F5] text-[#07090E] border-white shadow'
                              : 'bg-black/45 text-zinc-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ROW 3: DURATION */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 block">
                  3. Duration
                </label>
                {isBugHunt ? (
                  <div className="px-4 py-3 rounded-xl bg-amber-950/35 border border-amber-500/35 font-mono text-xs font-bold text-amber-200 flex items-center justify-between">
                    <span>Fixed Blitz Sprint</span>
                    <span>60 Seconds</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { secs: 180, label: '3 Minutes' },
                      { secs: 300, label: '5 Minutes' },
                      { secs: 600, label: '10 Minutes' },
                    ].map((dur) => {
                      const active = engine.timeLimit === dur.secs;
                      return (
                        <button
                          key={dur.secs}
                          type="button"
                          onClick={() => engine.setTimeLimit(dur.secs)}
                          className={`py-3 rounded-xl font-mono text-xs font-bold border cursor-pointer transition-all ${
                            active
                              ? 'bg-[#FAF8F5] text-[#07090E] border-white shadow'
                              : 'bg-black/45 text-zinc-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {dur.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onEnterMatch}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-b from-[#232732] via-[#13161D] to-[#090B0F] text-white border border-zinc-300/50 hover:border-white/85 font-mono text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_26px_rgba(226,232,240,0.22),inset_0_1px_0_rgba(255,255,255,0.28)] hover:shadow-[0_0_34px_rgba(226,232,240,0.36)] cursor-pointer transition-all"
              >
                <span>Enter Match</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom Micro Label */}
      <footer className="relative z-10 w-full text-center pb-1">
        <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
          KOLLΛBRIX PROVING GROUNDS
        </span>
      </footer>
    </motion.div>
  );
}
