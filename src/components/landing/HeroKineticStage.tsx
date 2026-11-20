'use client';

import { motion, MotionValue } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface HeroKineticStageProps {
  opacity: MotionValue<number>;
  topY: MotionValue<number>;
  topScale: MotionValue<number>;
  leftX: MotionValue<number>;
  leftScale: MotionValue<number>;
  rightX: MotionValue<number>;
  rightScale: MotionValue<number>;
  hudOpacity: MotionValue<number>;
  onExploreClick: () => void;
}

export function HeroKineticStage({
  opacity,
  topY,
  topScale,
  leftX,
  leftScale,
  rightX,
  rightScale,
  hudOpacity,
  onExploreClick,
}: HeroKineticStageProps) {
  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none overflow-hidden"
    >
      {/* HUD Telemetry Top Bar */}
      <motion.div
        style={{ opacity: hudOpacity }}
        className="w-full flex items-center justify-between text-[11px] sm:text-xs font-mono tracking-widest text-slate-400/80 pt-16 sm:pt-14"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 font-semibold">[ PROTOCOL // V2.6 ]</span>
          <span className="hidden md:inline text-slate-500">• COLLEGIATE NETWORK</span>
        </div>
        <div className="flex items-center gap-4 text-right">
          <span className="hidden sm:inline text-slate-400">LATENCY // &lt;24MS</span>
          <span className="text-sky-300/90 font-semibold">[ SYS // ONLINE ]</span>
        </div>
      </motion.div>

      {/* STR8FIRE-Inspired Kinetic Editorial Typography Array */}
      <div className="relative w-full my-auto flex flex-col items-center justify-center py-6">
        {/* Top Center: KOLLABRIX. */}
        <motion.div
          style={{ y: topY, scale: topScale }}
          className="text-center transform-gpu will-change-transform mb-2 sm:mb-4"
        >
          <span className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[9rem] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_35px_rgba(56,189,248,0.25)]">
            KOLLABRIX<span className="text-sky-400">.</span>
          </span>
        </motion.div>

        {/* Split Kinetic Wings: COLLEGIATE. (Left) & INNOVATION. (Right) */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 px-2 sm:px-6 lg:px-12">
          {/* Left Wing */}
          <motion.div
            style={{ x: leftX, scale: leftScale }}
            className="transform-gpu will-change-transform text-center sm:text-left"
          >
            <span className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-sky-200/90 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              COLLEGIATE<span className="text-sky-400">.</span>
            </span>
          </motion.div>

          {/* Sub Telemetry Pill in Center Gap */}
          <motion.div
            style={{ opacity: hudOpacity }}
            className="hidden lg:flex flex-col items-center gap-1.5 px-4 py-2 rounded-full border border-sky-500/20 bg-sky-950/20 backdrop-blur-md text-[10px] font-mono tracking-wider text-sky-300/80"
          >
            <span>WHERE BUILDERS DUEL & ASSEMBLE</span>
            <span className="text-slate-400 text-[9px]">COORDINATES: 28.6139° N, 77.2090° E</span>
          </motion.div>

          {/* Right Wing */}
          <motion.div
            style={{ x: rightX, scale: rightScale }}
            className="transform-gpu will-change-transform text-center sm:text-right"
          >
            <span className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-white via-slate-200 to-sky-200/90 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              INNOVATION<span className="text-cyan-400">.</span>
            </span>
          </motion.div>
        </div>
      </div>

      {/* HUD Telemetry Bottom Bar + Scroll Indicator */}
      <motion.div
        style={{ opacity: hudOpacity }}
        className="w-full flex items-center justify-between text-[11px] sm:text-xs font-mono tracking-widest text-slate-400/80 pb-2 sm:pb-4"
      >
        <div className="hidden sm:flex items-center gap-2 text-slate-500">
          <span>CAMPUS NODES // 48+</span>
          <span>• VERIFIED REPUTATION</span>
        </div>

        {/* Interactive Scroll Cue (Clickable) */}
        <div className="mx-auto sm:mx-0 pointer-events-auto">
          <button
            onClick={onExploreClick}
            type="button"
            className="group flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/15 bg-black/40 hover:bg-sky-500/15 hover:border-sky-400/50 backdrop-blur-md text-white/90 hover:text-white transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-widest text-sky-200 group-hover:text-white">
              SCROLL TO ENTER
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-sky-400 group-hover:translate-y-0.5 transition-transform duration-200 animate-bounce" />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-500">
          <span>1V1 ARENA // LIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </motion.div>
    </motion.div>
  );
}
