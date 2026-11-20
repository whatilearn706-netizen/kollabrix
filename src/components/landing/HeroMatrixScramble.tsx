'use client';

import { useState, useEffect } from 'react';
import { motion, MotionValue } from 'motion/react';

interface HeroMatrixScrambleProps {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}

const MATRIX_GLYPHS = '0110100100101110101011001000101101010110011100101101001101100111';

export function HeroMatrixScramble({ opacity, scale }: HeroMatrixScrambleProps) {
  const [scrambleA, setScrambleA] = useState('10011100 01001000 01100101 01100011');
  const [scrambleB, setScrambleB] = useState('01001011 01001111 01001100 01001100');
  const [scrambleC, setScrambleC] = useState('01000001 01000010 01010010 01001001');

  useEffect(() => {
    const interval = setInterval(() => {
      const generateChunk = () => {
        let chunk = '';
        for (let i = 0; i < 32; i++) {
          if (i > 0 && i % 8 === 0) chunk += ' ';
          chunk += MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)];
        }
        return chunk;
      };

      setScrambleA(generateChunk());
      setScrambleB(generateChunk());
      setScrambleC(generateChunk());
    }, 70);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 z-15 pointer-events-none flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="max-w-2xl w-full p-6 sm:p-8 rounded-2xl border border-sky-500/25 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_rgba(56,189,248,0.2)] text-center">
        {/* Matrix Header */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-sky-400/80 pb-3 border-b border-sky-500/20 mb-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            DECRYPTING_PROTOCOL
          </span>
          <span className="text-slate-400">STREAM // 256-BIT SHA</span>
        </div>

        {/* Dynamic Binary Matrix Stream */}
        <div className="font-mono text-xs sm:text-sm md:text-base text-cyan-300 font-bold tracking-widest space-y-1.5 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
          <div className="text-white/95">{scrambleA}</div>
          <div className="text-sky-300/90">{scrambleB}</div>
          <div className="text-cyan-400/80">{scrambleC}</div>
        </div>

        {/* Decoded Target Teaser */}
        <div className="mt-4 pt-3 border-t border-sky-500/20 flex items-center justify-between text-[10px] sm:text-xs font-mono">
          <span className="text-slate-400">INITIALIZING 1V1 ARENA & SQUAD GRAPH</span>
          <span className="text-emerald-400 font-semibold animate-pulse">STATUS: DECODED</span>
        </div>
      </div>
    </motion.div>
  );
}
