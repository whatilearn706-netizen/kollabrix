'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

/**
 * Choreographed KA CODEX 3D Book Hero:
 * 0: Book falls from top onto the stage
 * 1: Book cover & pages flip open
 * 2: Stops at KOLLABRIX inside the open book
 * 3: OLL & BRIX disappear -> KA
 * 4: CODEX falls from above and shifts right after KA -> KA CODEX
 */
export function KaCodexHeroAnimation() {
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    setStage(0);
    const t1 = setTimeout(() => setStage(1), 850);
    const t2 = setTimeout(() => setStage(2), 1650);
    const t3 = setTimeout(() => setStage(3), 2650);
    const t4 = setTimeout(() => setStage(4), 3450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [runKey]);

  const letters = [
    { ch: 'K', keep: true },
    { ch: 'O', keep: false },
    { ch: 'L', keep: false },
    { ch: 'L', keep: false },
    { ch: 'A', keep: true },
    { ch: 'B', keep: false },
    { ch: 'R', keep: false },
    { ch: 'I', keep: false },
    { ch: 'X', keep: false },
  ];

  const isBookOpen = stage >= 1;

  return (
    <div className="relative flex flex-col items-center justify-center py-4 select-none">
      {/* Ground pedestal shadow */}
      <motion.div
        key={`shadow-${runKey}`}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: isBookOpen ? 1.15 : 1, opacity: 0.7 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute bottom-12 w-72 sm:w-96 h-8 rounded-full bg-black/90 blur-xl pointer-events-none"
      />

      {/* Falling 3D Obsidian & Silver Book */}
      <motion.div
        key={runKey}
        initial={{ y: -240, opacity: 0, rotateX: 28, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, rotateX: 10, scale: 1 }}
        transition={{ type: 'spring', stiffness: 130, damping: 14, mass: 1.1 }}
        style={{ perspective: 1400 }}
        className="relative flex items-center justify-center my-4"
      >
        <div
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-[300px] sm:w-[440px] h-[175px] sm:h-[220px]"
        >
          {/* Open Two-Page Spread Base */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#171A24] via-[#0D1017] to-[#07090D] border border-zinc-300/30 shadow-[0_28px_70px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.2)] flex overflow-hidden">
            {/* Left Page */}
            <div className="flex-1 border-r border-white/10 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.05),transparent_70%)] p-4 flex flex-col justify-between">
              <div className="space-y-1.5 opacity-35">
                <div className="h-1.5 w-3/4 rounded bg-zinc-400/50" />
                <div className="h-1.5 w-1/2 rounded bg-zinc-500/40" />
                <div className="h-1.5 w-2/3 rounded bg-zinc-500/30" />
              </div>
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-zinc-500">
                VOL. 01 // ARCHIVE
              </span>
            </div>

            {/* Center Book Spine Crease */}
            <div className="w-3 bg-gradient-to-r from-black/70 via-zinc-700/30 to-black/70 shrink-0" />

            {/* Right Page */}
            <div className="flex-1 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.05),transparent_70%)] p-4 flex flex-col justify-between items-end">
              <div className="space-y-1.5 opacity-35 w-full flex flex-col items-end">
                <div className="h-1.5 w-2/3 rounded bg-zinc-400/50" />
                <div className="h-1.5 w-4/5 rounded bg-zinc-500/40" />
                <div className="h-1.5 w-1/2 rounded bg-zinc-500/30" />
              </div>
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-amber-300/70">
                KOLLABRIX EDITION
              </span>
            </div>

            {/* Animated Title Across the Open Book */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={stage >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 flex items-center justify-center px-3 z-10 pointer-events-none"
            >
              <div className="inline-flex items-center justify-center flex-wrap">
                {/* KOLLABRIX -> KA */}
                <div className="inline-flex items-center font-heading font-black text-3xl sm:text-5xl tracking-tight">
                  {letters.map((item, idx) => {
                    const isHidden = !item.keep && stage >= 3;
                    return (
                      <motion.span
                        key={`${item.ch}-${idx}`}
                        initial={{ opacity: 1, y: 0, width: 'auto' }}
                        animate={{
                          opacity: isHidden ? 0 : 1,
                          y: item.keep && stage === 3 ? -6 : 0,
                          width: isHidden ? 0 : 'auto',
                        }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className={`inline-block overflow-hidden whitespace-nowrap ${
                          item.keep
                            ? 'bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,255,255,0.28)]'
                            : 'text-zinc-400'
                        }`}
                      >
                        {item.ch}
                      </motion.span>
                    );
                  })}
                </div>

                {/* CODEX falls from above and shifts right after KA */}
                <motion.span
                  initial={{ y: -110, x: -24, opacity: 0, width: 0 }}
                  animate={
                    stage >= 4
                      ? { y: 0, x: 0, opacity: 1, width: 'auto', marginLeft: '0.28em' }
                      : { y: -110, x: -24, opacity: 0, width: 0, marginLeft: '0em' }
                  }
                  transition={{
                    y: { type: 'spring', stiffness: 170, damping: 16 },
                    x: { duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.35 },
                  }}
                  className="inline-block overflow-hidden whitespace-nowrap font-heading font-black text-3xl sm:text-5xl tracking-tight bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(251,191,36,0.35)]"
                >
                  CODEX
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* Flipping Page #1 */}
          <motion.div
            initial={{ rotateY: 0, opacity: 0.9 }}
            animate={isBookOpen ? { rotateY: -165, opacity: 0 } : { rotateY: 0, opacity: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
            className="absolute inset-y-1 right-1 left-1/2 rounded-r-xl bg-gradient-to-r from-zinc-200/20 to-zinc-100/10 border border-white/15 pointer-events-none"
          />

          {/* Front Hardcover (swings open left like a real book) */}
          <motion.div
            initial={{ rotateY: 0 }}
            animate={isBookOpen ? { rotateY: -175 } : { rotateY: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#232734] via-[#10131B] to-[#07090D] border border-zinc-300/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.28)] flex flex-col items-center justify-center p-6 pointer-events-none z-20"
          >
            <div className="w-12 h-12 rounded-xl border border-zinc-300/35 bg-white/[0.04] flex items-center justify-center mb-2">
              <span className="font-heading font-black text-lg bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                KΛ
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-zinc-400">
              ENGINEERING CODEX
            </span>
          </motion.div>
        </div>
      </motion.div>

      <button
        type="button"
        onClick={() => setRunKey((k) => k + 1)}
        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-all cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Replay Book Intro</span>
      </button>
    </div>
  );
}
