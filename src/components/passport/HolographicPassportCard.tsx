'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Award,
  ShieldCheck,
  RotateCw,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Flame,
  Zap,
  Terminal,
  Clock,
  HeartHandshake,
  QrCode,
  Lock,
} from 'lucide-react';
import { DeveloperPassport, SAMPLE_MAYANK_PASSPORT } from '@/types/flightRecorder';

interface HolographicPassportCardProps {
  passport?: DeveloperPassport;
  interactive?: boolean;
  compact?: boolean;
  onShare?: () => void;
}

export function HolographicPassportCard({
  passport = SAMPLE_MAYANK_PASSPORT,
  interactive = true,
  compact = false,
}: HolographicPassportCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [copiedLink, setCopiedLink] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Parallax tilt calculations
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -14;
    const rY = ((x - centerX) / centerX) * 14;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setRotateX(0);
    setRotateY(0);
    setGlarePosition({ x: 50, y: 50 });
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = passport.verificationUrl || `https://kollabrix.in/p/${passport.username}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const effectiveRotateY = isFlipped ? 180 + rotateY : rotateY;

  return (
    <div className="flex flex-col items-center select-none" style={{ perspective: 1200 }}>
      {/* 3D Transform Wrapper */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={toggleFlip}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${effectiveRotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: isFlipped
            ? 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)'
            : 'transform 0.15s ease-out',
        }}
        className={`relative cursor-pointer transition-shadow duration-300 ${
          compact ? 'w-[320px] h-[490px]' : 'w-[340px] sm:w-[380px] h-[560px] sm:h-[590px]'
        }`}
      >
        {/* ================= FRONT OF CARD ================= */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 w-full h-full rounded-[30px] p-[2.5px] bg-gradient-to-tr from-rose-500 via-purple-500 via-cyan-400 to-amber-400 shadow-2xl shadow-rose-950/40"
        >
          <div className="relative w-full h-full rounded-[28px] bg-gradient-to-b from-slate-900 via-charcoal-950 to-charcoal-900 p-6 flex flex-col justify-between overflow-hidden border border-white/10">
            {/* Holographic Iridescent Glare Layer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.7) 0%, rgba(244,63,94,0.3) 30%, rgba(56,189,248,0.2) 60%, transparent 80%)`,
              }}
            />

            {/* Subtle Diagonal Hologram Prism Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Header: Brand & Clutch Pill */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-xs text-white shadow-md">
                  K
                </div>
                <div>
                  <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white">
                    KOLLABRIX
                  </span>
                  <div className="text-[9px] font-mono font-bold text-rose-400 tracking-tight flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    FLIGHT RECORDER 2026
                  </div>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Award className="w-3 h-3 text-amber-400" />
                <span>{passport.tierBadge}</span>
              </div>
            </div>

            {/* Avatar & Identity Hero */}
            <div className="relative z-10 text-center space-y-2.5 mt-2">
              <div className="relative inline-block">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 shadow-xl shadow-purple-950/50 mx-auto">
                  <img
                    src={passport.avatarUrl}
                    alt={passport.displayName}
                    className="w-full h-full rounded-full object-cover border-2 border-charcoal-950"
                  />
                </div>
                <div className="absolute -bottom-1 right-1 bg-emerald-500 text-charcoal-950 p-1 rounded-full text-[10px] font-black border-2 border-charcoal-950 shadow-md">
                  <Check className="w-2.5 h-2.5 stroke-[4]" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {passport.displayName}
                </h3>
                <p className="text-xs font-semibold text-rose-400 font-mono mt-0.5">
                  {passport.roleTitle}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[280px] mx-auto">
                  {passport.college}
                </p>
              </div>
            </div>

            {/* 4-Metric Telemetry Quadrant */}
            <div className="relative z-10 grid grid-cols-2 gap-2 my-1">
              {/* Clutch Factor */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div className="text-[9px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Clutch Rating
                </div>
                <div className="text-lg sm:text-xl font-black text-rose-400 font-mono mt-0.5 flex items-baseline gap-0.5">
                  {passport.clutchFactor}
                  <span className="text-[10px] text-slate-500">/100</span>
                </div>
                <div className="text-[8.5px] text-slate-400 font-sans mt-0.5 leading-tight">
                  {passport.telemetry.lateNightCommits} late-night commits (1-5 AM)
                </div>
              </div>

              {/* Zero-Ghost Score */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div className="text-[9px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-emerald-400" />
                  Zero-Ghost
                </div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5 flex items-baseline gap-0.5">
                  {passport.peerReliability}%
                </div>
                <div className="text-[8.5px] text-slate-400 font-sans mt-0.5 leading-tight">
                  {passport.attestations.length} Peer Attestations
                </div>
              </div>

              {/* Code Craft */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div className="text-[9px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  Code Craft
                </div>
                <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono mt-0.5 flex items-baseline gap-0.5">
                  {passport.codeCraft}
                  <span className="text-[10px] text-slate-500">/100</span>
                </div>
                <div className="text-[8.5px] text-slate-400 font-sans mt-0.5 leading-tight">
                  {passport.telemetry.mergeConflictsCount} merge conflicts
                </div>
              </div>

              {/* ICPC Proctored */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div className="text-[9px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  ICPC Testbench
                </div>
                <div className="text-lg sm:text-xl font-black text-amber-400 font-mono mt-0.5 flex items-baseline gap-0.5">
                  {passport.icpcAccuracy}%
                </div>
                <div className="text-[8.5px] text-slate-400 font-sans mt-0.5 leading-tight">
                  Proctored algorithmic solve
                </div>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="relative z-10 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>ID #{passport.id}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-300 font-mono truncate max-w-[170px]">
                  kollabrix.in/p/{passport.username}
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[9px] font-bold flex items-center gap-1 hover:bg-rose-500/20 transition-colors">
                <RotateCw className="w-2.5 h-2.5 animate-spin-slow" />
                <span>FLIP CARD ↻</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BACK OF CARD ================= */}
        <div
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 w-full h-full rounded-[30px] p-[2.5px] bg-gradient-to-tr from-cyan-500 via-purple-500 to-rose-500 shadow-2xl shadow-cyan-950/40"
        >
          <div className="relative w-full h-full rounded-[28px] bg-gradient-to-b from-slate-900 via-charcoal-950 to-charcoal-900 p-6 flex flex-col justify-between overflow-hidden border border-white/10">
            {/* Glare effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30 mix-blend-color-dodge"
              style={{
                background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.6) 0%, rgba(6,182,212,0.3) 40%, transparent 80%)`,
              }}
            />

            {/* Back Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                FLIGHT TELEMETRY LOG
              </div>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                AUTONOMOUS AUDIT
              </span>
            </div>

            {/* Architecture Contribution Footprint */}
            <div className="relative z-10 space-y-2 py-1">
              <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                <span>Codebase Architecture</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {passport.telemetry.totalCommits} Total Commits
                </span>
              </div>

              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-0.5">
                    <span className="text-slate-300">Backend & WebSockets</span>
                    <span className="text-rose-400 font-bold">
                      {passport.telemetry.backendPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                      style={{ width: `${passport.telemetry.backendPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-0.5">
                    <span className="text-slate-300">Realtime & Sandbox</span>
                    <span className="text-cyan-400 font-bold">
                      {passport.telemetry.realtimeOrTelemetryPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${passport.telemetry.realtimeOrTelemetryPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-0.5">
                    <span className="text-slate-300">Front-End Interface</span>
                    <span className="text-purple-400 font-bold">
                      {passport.telemetry.frontendPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${passport.telemetry.frontendPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Teammate Blind Attestations */}
            <div className="relative z-10 space-y-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Teammate Blind Attestations</span>
                <span className="text-emerald-400">100% Verified</span>
              </div>

              {passport.attestations.map((att) => (
                <div key={att.userId} className="flex items-start justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-bold text-slate-200 truncate">{att.name}:</span>
                  </div>
                  <span className="font-mono text-emerald-400 text-[10px] font-bold shrink-0 text-right">
                    "{att.feedbackSnippet.length > 30 ? att.feedbackSnippet.slice(0, 30) + '...' : att.feedbackSnippet}"
                  </span>
                </div>
              ))}
            </div>

            {/* Cryptographic SHA-256 Signature */}
            <div className="relative z-10 pt-2.5 border-t border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-cyan-400" />
                  <span>SHA-256 PROOF-OF-WORK HASH</span>
                </div>
                <div className="text-[9.5px] font-mono text-slate-400 truncate max-w-[190px]">
                  {passport.verificationHash}
                </div>
              </div>

              <div className="px-2 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[9px] font-bold flex items-center gap-1 hover:bg-cyan-500/20 transition-colors">
                <span>FLIP FRONT ↻</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Controls */}
      <div className="mt-6 flex flex-wrap gap-2.5 justify-center z-20">
        <button
          onClick={toggleFlip}
          className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
        >
          <RotateCw className="w-3.5 h-3.5 text-rose-400" />
          <span>{isFlipped ? 'View Card Front' : 'View Telemetry Log'}</span>
        </button>

        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 flex items-center gap-1.5 transition-all"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Passport</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
