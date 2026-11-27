'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface KaAiCinematicIntroProps {
  onComplete: () => void;
}

/**
 * Choreographed Cinematic Opener (KOLLΛBRIX -> KΛ -> KΛ ΛI):
 * 0 (0.0s): KOLLΛBRIX appears
 * 1 (0.55s): K and Λ elevate smoothly upward
 * 2 (1.35s): OLL & BRIX slowly drift & fade away
 * 3 (2.35s): Λ whips fast into K -> K shakes on impact + shockwave ring
 * 4 (3.05s): KΛ settles; ΛI glides smoothly in -> KΛ ΛI
 * 5 (4.25s -> 4.85s): Smooth dissolve into the main KΛ ΛI hero
 */
export function KaAiCinematicIntro({ onComplete }: KaAiCinematicIntroProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 550);
    const t2 = setTimeout(() => setPhase(2), 1350);
    const t3 = setTimeout(() => setPhase(3), 2350);
    const t4 = setTimeout(() => setPhase(4), 3050);
    const t5 = setTimeout(() => setPhase(5), 4250);
    const t6 = setTimeout(() => onComplete(), 4850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete]);

  const isElevated = phase >= 1 && phase < 4;
  const isSlowFade = phase >= 2;
  const isSlam = phase >= 3;
  const isFinal = phase >= 4;

  const ollLetters = ['O', 'L', 'L'];
  const brixLetters = ['B', 'R', 'I', 'X'];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={phase === 5 ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 bg-[#01030A] flex flex-col items-center justify-center px-4 overflow-hidden select-none"
    >
      {/* Volumetric cosmic blue-cyan radial aura */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.25, scale: 0.85 }}
        animate={{
          opacity: isFinal ? 0.9 : isSlam ? 0.75 : 0.45,
          scale: isFinal ? 1.25 : 1,
        }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="pointer-events-none absolute w-[540px] h-[540px] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(59,130,246,0.36) 0%, rgba(29,78,216,0.18) 45%, transparent 72%)',
        }}
      />

      {/* Subtle luminous pulse when K and Λ meet smoothly */}
      {phase === 3 && (
        <motion.div
          aria-hidden="true"
          initial={{ scale: 0.4, opacity: 0.7 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pointer-events-none absolute w-32 h-32 rounded-full border border-sky-300/50 shadow-[0_0_32px_rgba(125,211,252,0.45)]"
        />
      )}

      {/* Horizontal cosmic horizon gleam */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: isSlam ? 1 : 0.2,
          opacity: isSlam && phase < 5 ? 0.7 : 0,
        }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute w-[85%] max-w-3xl h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent"
      />

      {/* Morphing Typography Lockup */}
      <div className="relative z-10 flex items-center justify-center min-h-[130px] font-sans font-semibold tracking-tight text-5xl sm:text-7xl md:text-8xl">
        {/* K: rises upward smoothly, stays completely upright and still while Λ meets it */}
        <motion.span
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{
            opacity: 1,
            y: isElevated ? -30 : 0,
            scale: isElevated ? 1.06 : 1,
            filter: 'blur(0px)',
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block bg-gradient-to-b from-white via-sky-100 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(96,165,250,0.5)]"
        >
          K
        </motion.span>

        {/* OLL: slowly fades & drifts away, then smoothly closes the gap so K and Λ meet */}
        <motion.span
          initial={{ width: 'auto', opacity: 1 }}
          animate={{
            width: isSlam ? 0 : 'auto',
            opacity: isSlowFade ? 0 : 1,
          }}
          transition={{
            opacity: { duration: 0.9, ease: 'easeInOut' },
            width: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          className="inline-flex overflow-hidden whitespace-nowrap"
        >
          {ollLetters.map((ch, idx) => (
            <motion.span
              key={`oll-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isSlowFade ? 0 : 1,
                y: isSlowFade ? 22 : 0,
                scale: isSlowFade ? 0.78 : 1,
                filter: isSlowFade ? 'blur(8px)' : 'blur(0px)',
              }}
              transition={{ duration: 0.85, delay: isSlowFade ? idx * 0.08 : 0, ease: 'easeOut' }}
              className="inline-block text-slate-500"
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>

        {/* Λ: rises smoothly upward, then glides cleanly to meet K */}
        <motion.span
          initial={{ opacity: 0, y: 14, x: 0, filter: 'blur(6px)' }}
          animate={{
            opacity: 1,
            y: isElevated ? -30 : 0,
            x: 0,
            scale: isElevated ? 1.06 : 1,
            filter: 'blur(0px)',
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block ml-[0.02em] bg-gradient-to-b from-white via-sky-100 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(96,165,250,0.5)]"
        >
          Λ
        </motion.span>

        {/* BRIX: slowly fades & drifts away */}
        <motion.span
          initial={{ width: 'auto', opacity: 1 }}
          animate={{
            width: isSlam ? 0 : 'auto',
            opacity: isSlowFade ? 0 : 1,
          }}
          transition={{
            opacity: { duration: 0.9, ease: 'easeInOut' },
            width: { duration: 0.2, ease: 'easeOut' },
          }}
          className="inline-flex overflow-hidden whitespace-nowrap"
        >
          {brixLetters.map((ch, idx) => (
            <motion.span
              key={`brix-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isSlowFade ? 0 : 1,
                y: isSlowFade ? 24 : 0,
                scale: isSlowFade ? 0.72 : 1,
                filter: isSlowFade ? 'blur(8px)' : 'blur(0px)',
              }}
              transition={{ duration: 0.85, delay: isSlowFade ? idx * 0.08 : 0, ease: 'easeOut' }}
              className="inline-block text-slate-500"
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>

        {/* ΛI glides in slowly from the left right after KΛ settles */}
        <motion.span
          initial={{ x: -120, opacity: 0, width: 0, filter: 'blur(8px)' }}
          animate={
            isFinal
              ? { x: 0, opacity: 1, width: 'auto', marginLeft: '0.26em', filter: 'blur(0px)' }
              : { x: -120, opacity: 0, width: 0, marginLeft: '0em', filter: 'blur(8px)' }
          }
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block overflow-hidden whitespace-nowrap bg-gradient-to-b from-white via-sky-200 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_34px_rgba(59,130,246,0.65)]"
        >
          ΛI
        </motion.span>
      </div>

      {/* Subtle status / skip control */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.25 }}
        className="mt-8 flex items-center gap-4 text-[11px] font-mono tracking-[0.26em] uppercase text-slate-400"
      >
        <span>INITIALIZING INTELLIGENCE</span>
        <button
          type="button"
          onClick={onComplete}
          className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[10px] tracking-widest text-slate-200 cursor-pointer transition-colors"
        >
          Skip
        </button>
      </motion.div>
    </motion.div>
  );
}
