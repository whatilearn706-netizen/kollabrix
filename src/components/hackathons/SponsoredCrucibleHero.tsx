'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  Flame,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import QRCode from 'qrcode';
import { SponsoredMeta } from '@/lib/hackathons/sponsoredMeta';

interface SponsoredCrucibleHeroProps {
  hackathon: any;
  sponsoredMeta: SponsoredMeta;
  onRegisterClick?: () => void;
  isRegistered?: boolean;
  isRegistering?: boolean;
  registrationClosed?: boolean;
  currentUser?: any;
}

export function SponsoredCrucibleHero({
  hackathon,
  sponsoredMeta,
  onRegisterClick,
  isRegistered = false,
  isRegistering = false,
  registrationClosed = false,
  currentUser,
}: SponsoredCrucibleHeroProps) {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [activeTab, setActiveTab] = useState<'request' | 'headers' | 'response'>('request');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const targetUrl = `https://kollabrix.in/hackathons/${hackathon?.id || 'sprint'}?candidate=${currentUser?.id || 'guest'}`;
    QRCode.toDataURL(targetUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0A0D16',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch(() => {});
  }, [hackathon?.id, currentUser?.id]);

  const primaryColor = sponsoredMeta.customConfig?.primaryColor || '#F59E0B';
  const secondaryColor = sponsoredMeta.customConfig?.secondaryColor || '#06B6D4';
  const companyName = sponsoredMeta.companyName || hackathon.organizer || 'Corporate Sponsor';
  const partnerName2 = sponsoredMeta.partnerName2 || sponsoredMeta.customConfig?.partnerName2 || '';
  const primaryLogo = sponsoredMeta.sponsorLogoUrl;
  const secondaryLogo = sponsoredMeta.partnerLogo2 || sponsoredMeta.customConfig?.partnerLogo2 || '';

  const shortlistedCount = sponsoredMeta.liveShortlistedCount || 18;
  const activeSquadsCount = sponsoredMeta.liveActiveSquadsCount || 340;

  const passTitle = sponsoredMeta.candidatePassTitle || 'VERIFIED CANDIDATE ACCESS PASS';
  const passRank = sponsoredMeta.candidatePassRank || 'TIER-1 ARCHITECT';
  const customCta = sponsoredMeta.customCtaText || 'ENLIST FOR PPI TRIALS';

  const hiringLadder = sponsoredMeta.hiringLadder && sponsoredMeta.hiringLadder.length > 0
    ? sponsoredMeta.hiringLadder
    : [
        { level: 1, title: 'Level 1: Qualifier', perks: '$1,000 Cloud Credits + Sandbox Keys' },
        { level: 2, title: 'Level 2: Finalist Hangar', perks: '1:1 Architecture Review with VP of Engineering' },
        { level: 3, title: 'Level 3: Grand Laureate', perks: 'Direct Technical Interview Bypass + ₹10,00,000 Escrow' },
      ];

  const sandbox = sponsoredMeta.developerSandbox || {
    endpoint: 'POST /v2/fintech/sprint/sandbox',
    samplePayload: '{\n  "amount": 25000,\n  "currency": "INR",\n  "routing": "edge_fast_track",\n  "latency_sla_ms": 150\n}',
    starterRepoUrl: 'https://github.com/kollabrix/enterprise-sprint-starter',
    latencyMs: 130,
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(`curl -X POST https://api.kollabrix.in${sandbox.endpoint?.split(' ')[1] || '/v2/sandbox'} -H "Authorization: Bearer SPRINT_KEY"`);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl border border-charcoal-750 bg-[#07090E] shadow-2xl mb-8">
      {/* Dynamic Ambient Background Glows */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ background: primaryColor }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[500px] h-[300px] rounded-full blur-[130px] pointer-events-none opacity-15"
        style={{ background: secondaryColor }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP CO-BRANDING & LIVE HIRING TELEMETRY BAR                            */}
      {/* ========================================================================= */}
      <div className="relative z-10 border-b border-charcoal-750/80 bg-charcoal-900/60 backdrop-blur-md px-6 py-3.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Kollabrix Nexus mark */}
          <div className="flex items-center gap-2 pr-3 border-r border-charcoal-700">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black text-xs">
              K
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-300">KOLLABRIX</span>
          </div>

          {/* Primary Sponsor Brand */}
          <div className="flex items-center gap-2">
            {primaryLogo ? (
              <img
                src={primaryLogo}
                alt={companyName}
                className="h-6 w-auto max-w-[100px] object-contain drop-shadow"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : null}
            <span className="text-xs font-black text-white font-mono">{companyName}</span>
          </div>

          {/* Optional Secondary Sponsor Brand */}
          {partnerName2 ? (
            <div className="flex items-center gap-2 pl-3 border-l border-charcoal-700">
              <span className="text-[11px] text-slate-400 font-mono">×</span>
              {secondaryLogo ? (
                <img
                  src={secondaryLogo}
                  alt={partnerName2}
                  className="h-6 w-auto max-w-[100px] object-contain drop-shadow"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : null}
              <span className="text-xs font-black text-white font-mono">{partnerName2}</span>
            </div>
          ) : null}
        </div>

        {/* Live Hiring Telemetry Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-charcoal-700 shadow-inner">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
          <span className="text-[11px] font-mono text-slate-300">
            Live Hiring Telemetry: <strong className="text-amber-400">{shortlistedCount} Candidates Shortlisted</strong> &bull; <span className="text-cyan-300">{activeSquadsCount} Active Squads in Sandbox</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRAND HERO STAGE: 3D ARCHITECTURE + CANDIDATE PASS                      */}
      {/* ========================================================================= */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT 7-8 COLS: 3D Holographic Cloud Architecture Scene & Headline */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Luminous Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-mono font-black tracking-widest uppercase border flex items-center gap-1.5 shadow-sm"
              style={{
                color: primaryColor,
                borderColor: `${primaryColor}60`,
                backgroundColor: `${primaryColor}15`,
              }}
            >
              <Flame className="w-3.5 h-3.5" />
              Architecture Sprint
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border border-cyan-400/40 bg-cyan-950/40 text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Verified Corporate Partner
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border border-charcoal-700 bg-charcoal-900 text-slate-400">
              Priority Spotlight #{sponsoredMeta.priorityRank || 1}
            </span>
          </div>

          {/* Dynamic 3D Cloud Architecture SVG Visualization */}
          <div className="relative w-full h-56 sm:h-64 rounded-2xl border border-charcoal-750 bg-gradient-to-b from-[#0A0D16] to-[#04060A] overflow-hidden flex items-center justify-center p-4">
            {/* Perspective Grid Floor */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 [transform:perspective(500px)_rotateX(60deg)] origin-bottom pointer-events-none" />

            {/* Glowing Interactive SVG Architecture */}
            <svg
              className="w-full h-full max-h-52 drop-shadow-[0_0_30px_rgba(245,158,11,0.25)]"
              viewBox="0 0 600 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0B132B" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="beamGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={primaryColor} />
                  <stop offset="100%" stopColor={secondaryColor} />
                </linearGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Connecting Fiber-Optic Lines */}
              <path d="M 120 140 L 260 110" stroke={primaryColor} strokeWidth="2.5" strokeDasharray="6 4" opacity="0.75" />
              <path d="M 170 60 L 260 90" stroke={secondaryColor} strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              <path d="M 340 100 L 460 70" stroke={primaryColor} strokeWidth="2.5" opacity="0.8" />
              <path d="M 340 130 L 480 150" stroke={secondaryColor} strokeWidth="2.5" strokeDasharray="6 4" opacity="0.75" />

              {/* Node 1: Left Microservice Server Stack */}
              <g transform="translate(90, 110)">
                <rect width="60" height="50" rx="8" fill="#111827" stroke={primaryColor} strokeWidth="1.5" />
                <rect x="8" y="10" width="44" height="6" rx="2" fill={primaryColor} opacity="0.8" />
                <rect x="8" y="22" width="44" height="6" rx="2" fill={primaryColor} opacity="0.5" />
                <circle cx="14" cy="38" r="3" fill="#10B981" />
                <circle cx="24" cy="38" r="3" fill={primaryColor} />
                <text x="30" y="41" fill="#94A3B8" fontSize="8" fontFamily="monospace">API GW</text>
              </g>

              {/* Node 2: Top-Left Ingestion Worker */}
              <g transform="translate(140, 30)">
                <polygon points="30,0 60,18 60,45 30,60 0,45 0,18" fill="#0B132B" stroke={secondaryColor} strokeWidth="1.5" />
                <text x="16" y="34" fill="#38BDF8" fontSize="8" fontFamily="monospace" fontWeight="bold">EDGE</text>
              </g>

              {/* Centerpiece: 3D Holographic Cloud Core */}
              <g transform="translate(230, 45)" filter="url(#glowFilter)">
                <path
                  d="M 50 110 A 35 35 0 0 1 35 45 A 45 45 0 0 1 105 25 A 50 50 0 0 1 170 50 A 40 40 0 0 1 160 110 Z"
                  fill="url(#cloudGrad)"
                  stroke={primaryColor}
                  strokeWidth="2.5"
                />
                {/* Internal Circuit Glyph */}
                <circle cx="100" cy="70" r="14" fill="#030712" stroke={primaryColor} strokeWidth="2" />
                <path d="M 100 56 L 100 84 M 86 70 L 114 70" stroke={primaryColor} strokeWidth="2" />
                <circle cx="100" cy="70" r="5" fill="#FDE047" />
              </g>

              {/* Node 3: Top-Right Cryptographic Vault */}
              <g transform="translate(440, 40)">
                <polygon points="25,0 50,15 50,45 25,60 0,45 0,15" fill="#111827" stroke={primaryColor} strokeWidth="1.5" />
                <text x="14" y="34" fill="#FDE047" fontSize="8" fontFamily="monospace" fontWeight="bold">VAULT</text>
              </g>

              {/* Node 4: Bottom-Right Database Cluster */}
              <g transform="translate(460, 120)">
                <rect width="65" height="55" rx="8" fill="#0F172A" stroke={secondaryColor} strokeWidth="1.5" />
                <ellipse cx="32.5" cy="14" rx="22" ry="6" fill="#0284C7" opacity="0.8" />
                <path d="M 10.5 14 v 20 c 0 3.5 10 6 22 6 s 22 -2.5 22 -6 v -20" fill="none" stroke={secondaryColor} strokeWidth="1.5" />
                <text x="18" y="49" fill="#94A3B8" fontSize="8" fontFamily="monospace">POSTGRES</text>
              </g>
            </svg>

            {/* Live Telemetry Ping on bottom of visual */}
            <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-black/60 px-3 py-1 rounded-lg border border-charcoal-700/60 backdrop-blur-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Microservice Swarm Active (99.98% Latency SLA)</span>
              </span>
              <span className="text-slate-500">Node Cluster: v2.4-crucible</span>
            </div>
          </div>

          {/* Grand Corporate Headline & Mission */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-mono drop-shadow-md">
              {hackathon.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              {sponsoredMeta.tagline || hackathon.description?.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim()}
            </p>
          </div>

          {/* High-Stake Rewards & Compensation Ribbon */}
          <div className="flex items-center gap-3 flex-wrap p-3.5 rounded-2xl bg-charcoal-900/80 border border-charcoal-750">
            <div className="flex items-center gap-2 pr-4 border-r border-charcoal-700">
              <Award className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Builder Grants Pool</span>
                <span className="text-sm font-black text-white font-mono">{hackathon.prize_pool || '$25,000 USD Grants'}</span>
              </div>
            </div>

            {sponsoredMeta.hiringPackage ? (
              <div className="flex items-center gap-2 pr-4 border-r border-charcoal-700">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Hiring Package &amp; PPIs</span>
                  <span className="text-sm font-black text-emerald-300 font-mono">{sponsoredMeta.hiringPackage}</span>
                </div>
              </div>
            ) : null}

            {sponsoredMeta.hiringRoles ? (
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Target Roles</span>
                  <span className="text-xs font-bold text-slate-200">{sponsoredMeta.hiringRoles}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT 4-5 COLS: Brushed-Titanium "VERIFIED CANDIDATE ACCESS PASS" */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="w-full max-w-[340px] rounded-3xl p-5 border border-white/20 bg-gradient-to-b from-[#2E3544] via-[#1E232E] to-[#12161F] shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            
            {/* Luminous Brushed Metal Edge Lighting */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />

            {/* Top Lanyard Slot */}
            <div className="w-16 h-2 rounded-full bg-slate-950/80 mx-auto mb-4 border border-white/10" />

            {/* Header Badge */}
            <div className="text-center space-y-1 mb-4">
              <span className="text-[10px] font-mono font-black tracking-widest uppercase text-slate-300 block">
                {passTitle}
              </span>
              <span
                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border inline-block"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}60`,
                  backgroundColor: `${primaryColor}15`,
                }}
              >
                {passRank}
              </span>
            </div>

            {/* Candidate Identity / QR Code Module */}
            <div className="p-4 rounded-2xl bg-white p-3 flex flex-col items-center justify-center shadow-inner relative group-hover:scale-[1.02] transition-transform duration-300">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Candidate Pass QR" className="w-[140px] h-[140px] object-contain" />
              ) : (
                <div className="w-[140px] h-[140px] bg-slate-100 rounded-lg flex items-center justify-center font-mono text-[10px] text-slate-500">
                  Generating QR...
                </div>
              )}
              <span className="text-[9px] font-mono font-bold text-slate-600 mt-2 tracking-wider">
                SCAN FOR RECRUITER VERIFICATION
              </span>
            </div>

            {/* Candidate Details */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Candidate:</span>
              <span className="font-bold text-white truncate max-w-[170px]">
                {currentUser?.email?.split('@')[0] || 'Verified Builder'}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">PPI Track:</span>
              <span className="font-bold text-amber-300">Active Fast-Track</span>
            </div>

            {/* Primary Enlist Button */}
            <button
              onClick={onRegisterClick}
              disabled={isRegistering || registrationClosed || isRegistered}
              className="mt-5 w-full py-3.5 px-4 rounded-xl font-mono font-black text-xs uppercase tracking-wider shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: isRegistered
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : `linear-gradient(135deg, ${primaryColor} 0%, #EA580C 100%)`,
                color: '#000000',
              }}
            >
              {isRegistered ? (
                <>
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>SQUAD ENLISTED &bull; VIEW PASS</span>
                </>
              ) : registrationClosed ? (
                <span>REGISTRATION CLOSED</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>{customCta}</span>
                  <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EXECUTIVE FAST-TRACK HIRING LADDER (LEVELS 1 TO 3)                     */}
      {/* ========================================================================= */}
      <div className="relative z-10 border-t border-charcoal-750 bg-[#090C14] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Executive Fast-Track Hiring Ladder
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Level 1: Qualifier &bull; Level 2: Finalist Hangar &bull; Level 3: Grand Laureate
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            Direct ATS Bypass Guarantee
          </span>
        </div>

        {/* 3-Level Connected Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {hiringLadder.map((step, idx) => {
            const isLast = idx === hiringLadder.length - 1;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isLast
                    ? 'border-amber-400/50 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30'
                    : 'border-charcoal-700 bg-charcoal-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                      isLast
                        ? 'bg-amber-400 text-black'
                        : 'bg-charcoal-750 text-slate-300'
                    }`}
                  >
                    LEVEL {idx + 1}
                  </span>
                  {isLast && (
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" /> ₹18-32 LPA Fast-Track
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white font-mono">{step.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.perks}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE DEVELOPER TERMINAL PLAYGROUND DOCK                          */}
      {/* ========================================================================= */}
      <div className="relative z-10 border-t border-charcoal-750 bg-[#06080F] p-6 sm:p-8">
        <div className="rounded-2xl border border-charcoal-700 bg-slate-950 overflow-hidden shadow-2xl">
          {/* Terminal Window Header */}
          <div className="px-4 py-2.5 bg-charcoal-900 border-b border-charcoal-750 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 pl-2 border-l border-charcoal-700 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Developer Terminal Playground
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyEndpoint}
                className="px-2.5 py-1 rounded-md bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 border border-charcoal-700 transition-colors"
              >
                {copiedEndpoint ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEndpoint ? 'Copied cURL' : 'Copy cURL'}</span>
              </button>
              {sandbox.starterRepoUrl && (
                <a
                  href={sandbox.starterRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-[10px] font-mono flex items-center gap-1 border border-cyan-500/30 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Clone Starter Repo</span>
                </a>
              )}
            </div>
          </div>

          {/* Terminal Body with Live Metrics */}
          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center font-mono text-xs">
            {/* Left 8 Cols: API Payload preview */}
            <div className="lg:col-span-8 bg-[#04060A] p-3.5 rounded-xl border border-charcoal-800 text-slate-300 overflow-x-auto space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px]">
                  POST
                </span>
                <span>{sandbox.endpoint?.split(' ')[1] || '/v2/fintech/sprint/sandbox'}</span>
              </div>
              <pre className="text-[11px] text-slate-400 leading-relaxed font-mono pt-1">
                {sandbox.samplePayload}
              </pre>
            </div>

            {/* Right 4 Cols: Real-Time Telemetry Metrics */}
            <div className="lg:col-span-4 space-y-2 bg-charcoal-900/40 p-3 rounded-xl border border-charcoal-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Real-Time Telemetry:</span>
                <span className="text-emerald-400 font-bold">ACTIVE 200 OK</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Latency:</span>
                <span className="text-cyan-300 font-bold">{sandbox.latencyMs || 130}ms +3.98ms</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Packet Throughput:</span>
                <span className="text-slate-200">192 req/sec</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Sandbox Isolation:</span>
                <span className="text-amber-400">Enterprise VPC Air-Gapped</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
