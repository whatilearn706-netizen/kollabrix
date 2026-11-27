'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

/**
 * Choreographed KA AI Hero Morph:
 * 0: KOLLABRIX
 * 1: K and A rise upward
 * 2: OLL and BRIX disappear, A glides close to K -> KA
 * 3: AI slowly glides in from the left -> KA AI
 */
export function KaAiHeroAnimation() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 550);
    const t2 = setTimeout(() => setPhase(2), 1450);
    const t3 = setTimeout(() => setPhase(3), 2350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
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

  const replay = () => setRunKey((k) => k + 1);

  return (
    <div className="relative flex flex-col items-center justify-center py-6 select-none">
      {/* Ambient brushed-silver halo */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-[340px] sm:w-[520px] h-36 rounded-full bg-gradient-to-r from-zinc-400/10 via-white/15 to-violet-400/15 blur-3xl pointer-events-none"
      />

      <div
        key={runKey}
        className="relative flex items-center justify-center min-h-[110px] sm:min-h-[140px]"
      >
        {/* Morphing KOLLABRIX -> KA */}
        <div className="inline-flex items-center font-heading font-black text-5xl sm:text-7xl md:text-8xl tracking-tight">
          {letters.map((item, idx) => {
            const isElevated = item.keep && phase === 1;
            const isHidden = !item.keep && phase >= 2;
            const isSettled = item.keep && phase >= 2;

            return (
              <motion.span
                key={`${item.ch}-${idx}`}
                initial={{ opacity: 1, y: 0, width: 'auto' }}
                animate={{
                  opacity: isHidden ? 0 : 1,
                  y: isElevated ? -18 : 0,
                  scale: isElevated ? 1.08 : 1,
                  width: isHidden ? 0 : 'auto',
                  marginRight: isHidden ? 0 : isSettled && item.ch === 'K' ? '0.02em' : '0em',
                }}
                transition={{
                  duration: isHidden ? 0.65 : 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`inline-block overflow-hidden whitespace-nowrap ${
                  item.keep
                    ? 'bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(255,255,255,0.28)]'
                    : 'text-zinc-500'
                }`}
              >
                {item.ch}
              </motion.span>
            );
          })}
        </div>

        {/* AI slowly enters from the left and locks beside KA */}
        <motion.span
          initial={{ x: -110, opacity: 0, width: 0 }}
          animate={
            phase >= 3
              ? { x: 0, opacity: 1, width: 'auto', marginLeft: '0.32em' }
              : { x: -110, opacity: 0, width: 0, marginLeft: '0em' }
          }
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block overflow-hidden whitespace-nowrap font-heading font-black text-5xl sm:text-7xl md:text-8xl tracking-tight bg-gradient-to-b from-white via-slate-200 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(167,139,250,0.4)]"
        >
          AI
        </motion.span>
      </div>

      <button
        type="button"
        onClick={replay}
        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-all cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Replay Intro</span>
      </button>
    </div>
  );
}
