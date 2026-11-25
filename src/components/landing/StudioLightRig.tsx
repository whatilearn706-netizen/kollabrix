'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StudioLightRigProps {
  /** If true, triggers the dramatic power-on flicker sequence */
  triggerPowerOn?: boolean;
  /** Optional callback when light power-on finishes */
  onPowerOnComplete?: () => void;
  /** Whether to show the floating mascot emblem tile right under the light bar (matches Pinterest ref) */
  showEmblemTile?: boolean;
}

/**
 * StudioOverheadLight / StudioLightRig
 * Recreates the exact minimal overhead fluorescent/neon light fixture from the Triopixels reference (pin.it/7psDal0Aw):
 * 1. Ultra-clean horizontal linear light tube (━) with pure white core and soft bloom
 * 2. Conical downward volumetric light beam (theatrical stage spotlight)
 * 3. Photorealistic power-on flicker animation sequence (pitch black -> electric pulse -> full beam)
 * 4. Soft atmospheric floor bounce above the centered 3D MacBook arena
 */
export function StudioLightRig({
  triggerPowerOn = false,
  onPowerOnComplete,
  showEmblemTile = true,
}: StudioLightRigProps) {
  // Lighting state: 'off' -> 'flicker' -> 'on'
  const [lightState, setLightState] = useState<'off' | 'flicker' | 'on'>('off');

  useEffect(() => {
    // Check if user already saw the intro in this session or if triggered by login
    const hasSeenIntro = typeof window !== 'undefined' ? sessionStorage.getItem('kbx_hero_light_on') : null;

    if (triggerPowerOn || !hasSeenIntro) {
      setLightState('off');
      const timer1 = setTimeout(() => setLightState('flicker'), 60);
      const timer2 = setTimeout(() => {
        setLightState('on');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('kbx_hero_light_on', 'true');
        }
        onPowerOnComplete?.();
      }, 360);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setLightState('on');
    }
  }, [triggerPowerOn, onPowerOnComplete]);

  const isLightActive = lightState === 'on' || lightState === 'flicker';

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-10 flex flex-col items-center overflow-visible select-none">
      {/* =========================================================================
          1. SUSPENSION BRACKET & MOUNT (Subtle physical industrial detailing)
         ========================================================================= */}
      <div className="relative flex flex-col items-center -top-1 opacity-70">
        {/* Top ceiling anchor */}
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-neutral-600 to-transparent rounded-full" />
        {/* Dual ultra-thin hanging wires */}
        <div className="w-[140px] sm:w-[200px] flex justify-between px-4 h-3.5">
          <div className="w-[1px] h-full bg-gradient-to-b from-neutral-600/60 to-white/30" />
          <div className="w-[1px] h-full bg-gradient-to-b from-neutral-600/60 to-white/30" />
        </div>
      </div>

      {/* =========================================================================
          2. THE HORIZONTAL LIGHT BAR / TUBE (━)
          Directly matches the Powerupz / Triopixels reference:
          Crisp white linear light bar with soft outer bloom and liquid platinum core.
         ========================================================================= */}
      <div className="relative flex items-center justify-center">
        {/* Primary Light Bar Container */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{
            opacity: lightState === 'off' ? 0.05 : lightState === 'flicker' ? [0.2, 0.9, 0.4, 1] : 1,
            scaleX: lightState === 'off' ? 0.8 : 1,
          }}
          transition={{
            duration: lightState === 'flicker' ? 0.45 : 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative z-20 w-[240px] xs:w-[280px] sm:w-[340px] md:w-[420px] h-[5px] sm:h-[6px] rounded-full bg-white"
          style={{
            boxShadow: isLightActive
              ? '0 0 8px #ffffff, 0 0 20px rgba(255, 255, 255, 0.9), 0 0 45px rgba(255, 255, 255, 0.6), 0 0 90px rgba(255, 255, 255, 0.3)'
              : 'none',
          }}
        >
          {/* Subtle liquid platinum / white core highlight inside the tube */}
          <div className="absolute inset-y-0 left-1/4 right-1/4 bg-white/95 rounded-full blur-[0.5px]" />
        </motion.div>

        {/* Ambient Halo directly hugging the light bar */}
        <motion.div
          animate={{
            opacity: isLightActive ? (lightState === 'flicker' ? 0.6 : 1) : 0,
          }}
          transition={{ duration: 0.5 }}
          className="absolute -top-3 w-[300px] sm:w-[460px] h-10 bg-radial-gradient from-white/40 via-white/10 to-transparent blur-md rounded-full pointer-events-none"
        />
      </div>

      {/* =========================================================================
          3. VOLUMETRIC CONICAL LIGHT BEAM (Theatrical Stage Spotlight)
          Spreads downwards from the light tube, illuminating:
          - The Mascot / Emblem Tile
          - The Headline ("Where Reputations Are Proven In Seconds.")
          - The 3D MacBook Pro Arena
         ========================================================================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: lightState === 'off' ? 0 : lightState === 'flicker' ? 0.5 : 1,
        }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative w-full max-w-[1400px] h-[580px] sm:h-[700px] md:h-[820px] pointer-events-none -mt-[3px] flex justify-center overflow-visible"
      >
        {/* SVG Volumetric Light Cone with exact angular spread */}
        <svg
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            {/* Smooth linear fade from top to bottom */}
            <linearGradient id="studioBeamGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
              <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.14" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.06" />
              <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Subtle silver/platinum ambient core inside the beam */}
            <linearGradient id="amberCoreGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
              <stop offset="30%" stopColor="#E2E8F0" stopOpacity="0.06" />
              <stop offset="70%" stopColor="#94A3B8" stopOpacity="0.015" />
              <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
            </linearGradient>

            {/* Edge-blur filter for soft realistic atmospheric falloff */}
            <filter id="beamFeather" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>

          {/* Core White Spotlight Cone */}
          <polygon
            points="380,0 620,0 920,700 80,700"
            fill="url(#studioBeamGradient)"
            filter="url(#beamFeather)"
          />

          {/* Secondary Soft Ambient Spill Cone */}
          <polygon
            points="340,0 660,0 1000,700 0,700"
            fill="url(#amberCoreGradient)"
            filter="url(#beamFeather)"
          />
        </svg>

        {/* Soft Radial Center Bloom: Gives body to the light in 3D space */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] sm:w-[600px] h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_50%,transparent_80%)] blur-2xl pointer-events-none" />

        {/* Floor bounce illumination right above the laptop */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[720px] sm:w-[940px] h-[180px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(226,232,240,0.03)_50%,transparent_75%)] blur-3xl pointer-events-none" />
      </motion.div>
    </div>
  );
}
