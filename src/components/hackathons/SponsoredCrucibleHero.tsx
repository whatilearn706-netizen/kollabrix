'use client';

import React, { useState, useEffect } from 'react';
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
  Cpu,
  Database,
  Globe,
  Radio,
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
  const backgroundColor = sponsoredMeta.customConfig?.backgroundColor || '#08080C';
  const heroAssetType = (sponsoredMeta.customConfig?.heroAssetType || '3d_cloud') as string;
  const heroAssetUrl = sponsoredMeta.customConfig?.heroAssetUrl || '';

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

  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
  const isImageUrl = (url: string) => /\.(jpg|jpeg|png|webp|svg|gif)(\?.*)?$/i.test(url);

  return (
    <div
      className="w-full relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] mb-10 transition-colors duration-500"
      style={{ backgroundColor }}
    >
      {/* Dynamic Volumetric Ambient Glow Spheres (Bleeds seamlessly across hero) */}
      <div
        className="absolute -top-24 left-1/4 w-[750px] h-[450px] rounded-full blur-[170px] pointer-events-none opacity-25"
        style={{ background: primaryColor }}
      />
      <div
        className="absolute top-1/3 -right-20 w-[650px] h-[400px] rounded-full blur-[160px] pointer-events-none opacity-20"
        style={{ background: secondaryColor }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* ========================================================================= */}
      {/* 1. TOP CO-BRANDING & LIVE HIRING TELEMETRY BAR                            */}
      {/* ========================================================================= */}
      <div className="relative z-10 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl px-6 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Kollabrix Nexus Mark */}
          <div className="flex items-center gap-2.5 pr-4 border-r border-white/10">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shadow-md"
              style={{
                backgroundColor: `${primaryColor}25`,
                borderColor: `${primaryColor}60`,
                borderWidth: 1,
                color: primaryColor,
              }}
            >
              K
            </div>
            <span className="text-xs font-mono font-extrabold tracking-widest text-slate-200">
              KOLLABRIX
            </span>
          </div>

          {/* Primary Sponsor Brand */}
          <div className="flex items-center gap-2.5">
            {primaryLogo ? (
              <img
                src={primaryLogo}
                alt={companyName}
                className="h-6 w-auto max-w-[120px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : null}
            <span className="text-sm font-black text-white font-mono tracking-tight">{companyName}</span>
          </div>

          {/* Optional Secondary Sponsor Brand */}
          {partnerName2 ? (
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
              <span className="text-xs text-slate-500 font-mono">×</span>
              {secondaryLogo ? (
                <img
                  src={secondaryLogo}
                  alt={partnerName2}
                  className="h-6 w-auto max-w-[120px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : null}
              <span className="text-sm font-black text-white font-mono tracking-tight">{partnerName2}</span>
            </div>
          ) : null}
        </div>

        {/* Live Hiring Telemetry Pill */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 shadow-inner backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
          <span className="text-xs font-mono text-slate-300">
            Live Hiring Telemetry:{' '}
            <strong className="text-amber-400 font-bold">{shortlistedCount} Candidates Shortlisted</strong> &bull;{' '}
            <span className="text-cyan-300 font-bold">{activeSquadsCount} Active Squads in Sandbox</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRAND HERO STAGE: UNBOXED 3D ARCHITECTURE + CANDIDATE VIP PASS         */}
      {/* ========================================================================= */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* LEFT 7-8 COLS: Unboxed Visual Engine + Grand Typography */}
        <div className="lg:col-span-8 space-y-7">
          
          {/* Luminous Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="px-3.5 py-1.5 rounded-full text-[11px] font-mono font-black tracking-widest uppercase border flex items-center gap-1.5 shadow-sm"
              style={{
                color: primaryColor,
                borderColor: `${primaryColor}60`,
                backgroundColor: `${primaryColor}15`,
              }}
            >
              <Flame className="w-3.5 h-3.5" />
              Architecture Sprint
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase border border-cyan-400/40 bg-cyan-950/40 text-cyan-300 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Verified Corporate Partner
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase border border-white/10 bg-white/5 text-slate-300">
              Priority Spotlight #{sponsoredMeta.priorityRank || 1}
            </span>
          </div>

          {/* ===================================================================== */}
          {/* UNBOXED 3D ARCHITECTURE VISUAL ENGINE CANVAS (NO NESTED GRAY BOXES!)    */}
          {/* ===================================================================== */}
          <div className="relative w-full min-h-[300px] sm:min-h-[360px] rounded-3xl overflow-hidden flex items-center justify-center">
            
            {/* Ambient Backlight Spill */}
            <div
              className="absolute inset-0 rounded-3xl opacity-30 blur-2xl pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${primaryColor}40 0%, ${secondaryColor}20 50%, transparent 80%)`,
              }}
            />

            {/* ENGINE 1: 3D HOLOGRAPHIC CLOUD & VOLUMETRIC MICROSERVICES CRUCIBLE */}
            {(heroAssetType === '3d_cloud' || (!heroAssetType && !heroAssetUrl)) && (
              <div className="relative w-full h-full min-h-[320px] sm:min-h-[380px] flex items-center justify-center p-4">
                {/* 3D Perspective Grid Floor */}
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf815_1px,transparent_1px),linear-gradient(to_bottom,#38bdf815_1px,transparent_1px)] bg-[size:48px_48px] [transform:perspective(600px)_rotateX(65deg)] origin-bottom pointer-events-none opacity-40"
                />

                {/* Animated Volumetric Cloud SVG Core */}
                <svg
                  className="w-full h-full max-h-[340px] drop-shadow-[0_0_40px_rgba(245,158,11,0.3)]"
                  viewBox="0 0 760 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="cloudVolumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={primaryColor} stopOpacity="0.9" />
                      <stop offset="45%" stopColor={secondaryColor} stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#0B132B" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="beamGradFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={primaryColor} />
                      <stop offset="100%" stopColor={secondaryColor} />
                    </linearGradient>
                    <filter id="intenseGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="8" result="blur1" />
                      <feGaussianBlur stdDeviation="3" result="blur2" />
                      <feMerge>
                        <feMergeNode in="blur1" />
                        <feMergeNode in="blur2" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Flowing Laser Fiber Conduits */}
                  <path d="M 140 180 C 220 180, 260 140, 340 140" stroke={primaryColor} strokeWidth="3" strokeDasharray="8 6" opacity="0.8" />
                  <path d="M 180 80 C 250 80, 270 120, 340 120" stroke={secondaryColor} strokeWidth="2.5" strokeDasharray="6 6" opacity="0.7" />
                  <path d="M 420 130 C 490 130, 520 80, 600 80" stroke={primaryColor} strokeWidth="3" opacity="0.85" />
                  <path d="M 420 160 C 500 160, 530 220, 620 220" stroke={secondaryColor} strokeWidth="3" strokeDasharray="8 6" opacity="0.8" />

                  {/* Node 1: Left Microservice Stack (API Gateway) */}
                  <g transform="translate(80, 140)">
                    <rect width="84" height="64" rx="14" fill="#0A0F1D" stroke={primaryColor} strokeWidth="2" />
                    <rect x="10" y="14" width="64" height="8" rx="3" fill={primaryColor} opacity="0.85" />
                    <rect x="10" y="28" width="48" height="8" rx="3" fill={primaryColor} opacity="0.5" />
                    <circle cx="16" cy="48" r="4" fill="#10B981" />
                    <text x="26" y="52" fill="#E2E8F0" fontSize="10" fontFamily="monospace" fontWeight="bold">API GW</text>
                  </g>

                  {/* Node 2: Top-Left Edge Runtime */}
                  <g transform="translate(130, 45)">
                    <polygon points="36,0 72,22 72,58 36,80 0,58 0,22" fill="#07152B" stroke={secondaryColor} strokeWidth="2" />
                    <text x="18" y="46" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">EDGE</text>
                  </g>

                  {/* Centerpiece: Volumetric 3D Holographic Cloud Core */}
                  <g transform="translate(300, 50)" filter="url(#intenseGlow)">
                    {/* Concentric Orbital Aura */}
                    <circle cx="80" cy="80" r="95" stroke={primaryColor} strokeWidth="1" strokeDasharray="12 8" opacity="0.3" />
                    <circle cx="80" cy="80" r="115" stroke={secondaryColor} strokeWidth="1" strokeDasharray="16 10" opacity="0.2" />

                    {/* Volumetric Cloud Body */}
                    <path
                      d="M 50 125 A 40 40 0 0 1 30 60 A 55 55 0 0 1 115 30 A 60 60 0 0 1 185 65 A 45 45 0 0 1 165 125 Z"
                      fill="url(#cloudVolumeGrad)"
                      stroke={primaryColor}
                      strokeWidth="3"
                    />

                    {/* Inner Holographic Core Reactor */}
                    <circle cx="110" cy="85" r="22" fill="#030712" stroke={primaryColor} strokeWidth="2.5" />
                    <path d="M 110 65 L 110 105 M 90 85 L 130 85" stroke={primaryColor} strokeWidth="2.5" />
                    <circle cx="110" cy="85" r="8" fill="#FDE047" />
                  </g>

                  {/* Node 3: Top-Right AI/ML Worker Swarm */}
                  <g transform="translate(560, 45)">
                    <polygon points="34,0 68,20 68,54 34,74 0,54 0,20" fill="#0B132B" stroke={primaryColor} strokeWidth="2" />
                    <text x="14" y="43" fill="#FDE047" fontSize="11" fontFamily="monospace" fontWeight="bold">AI CORE</text>
                  </g>

                  {/* Node 4: Bottom-Right Sharded Distributed Ledger */}
                  <g transform="translate(580, 180)">
                    <rect width="90" height="70" rx="14" fill="#081026" stroke={secondaryColor} strokeWidth="2" />
                    <ellipse cx="45" cy="18" rx="30" ry="8" fill="#0284C7" opacity="0.8" />
                    <path d="M 15 18 v 26 c 0 4.5 13.5 8 30 8 s 30 -3.5 30 -8 v -26" fill="none" stroke={secondaryColor} strokeWidth="2" />
                    <text x="18" y="60" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="bold">POSTGRES</text>
                  </g>
                </svg>

                {/* Floating Telemetry Pill */}
                <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-black/60 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold">Volumetric Cloud Engine Active (99.98% Latency SLA)</span>
                  </span>
                  <span className="text-slate-400 hidden sm:inline">Cluster: v3.2-enterprise-crucible</span>
                </div>
              </div>
            )}

            {/* ENGINE 2: INTERACTIVE 3D SPLINE / GLTF WEBGL SCENE */}
            {heroAssetType === '3d_spline' && (
              <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden bg-black/40">
                {heroAssetUrl ? (
                  <iframe
                    src={heroAssetUrl}
                    className="w-full h-full border-0 pointer-events-auto rounded-3xl"
                    allow="fullscreen; xr-spatial-tracking"
                    title="Interactive 3D Spline Scene"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Cpu className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-white font-mono">Live 3D Spline Canvas Engine</p>
                    <p className="text-xs text-slate-400 max-w-md">
                      Configure your Spline URL in the Admin Tab to stream real-time interactive 3D WebGL scenes.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ENGINE 3: CYBERNETIC PERSPECTIVE DATA GRID */}
            {heroAssetType === 'cyber_grid' && (
              <div className="relative w-full h-[340px] sm:h-[400px] rounded-3xl overflow-hidden bg-black/50 flex items-center justify-center">
                {/* 3D Wireframe Cyber Grid Floor */}
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d430_1px,transparent_1px),linear-gradient(to_bottom,#06b6d430_1px,transparent_1px)] bg-[size:36px_36px] [transform:perspective(500px)_rotateX(70deg)] origin-bottom pointer-events-none"
                />
                <div className="relative z-10 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Cyber Matrix Stream &bull; Low Latency Mesh</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    HIGH-VELOCITY CYBER GRID
                  </h3>
                  <div className="flex items-center justify-center gap-6 text-xs font-mono text-slate-400">
                    <span>Packets: <strong>48.2k/s</strong></span>
                    <span>Throughput: <strong>1.4 GB/s</strong></span>
                    <span>Consensus: <strong className="text-emerald-400">100%</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* ENGINE 4: HIGH-DEFINITION LOOPING VIDEO BACKGROUND */}
            {heroAssetType === 'video' && (
              <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden bg-black/60">
                {heroAssetUrl ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    src={heroAssetUrl}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Globe className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-white font-mono">Cinematic 4K Video Background Engine</p>
                    <p className="text-xs text-slate-400 max-w-md">
                      Provide a direct MP4/WebM URL in the Admin Tab to stream full cinematic looping backgrounds.
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            {/* ENGINE 5: UNIVERSAL CUSTOM 3D CANVAS / EMBED URL (100% Total Creative Freedom) */}
            {heroAssetType === 'custom_embed' && (
              <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden bg-black/50">
                {heroAssetUrl ? (
                  isVideoUrl(heroAssetUrl) ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      src={heroAssetUrl}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : isImageUrl(heroAssetUrl) ? (
                    <img
                      src={heroAssetUrl}
                      alt={hackathon.title}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <iframe
                      src={heroAssetUrl}
                      className="w-full h-full border-0 pointer-events-auto rounded-3xl"
                      allow="fullscreen; xr-spatial-tracking"
                      title="Universal Bespoke 3D Embed"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Database className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-white font-mono">Universal Custom 3D &amp; Embed Engine</p>
                    <p className="text-xs text-slate-400 max-w-md">
                      Paste ANY Spline 3D URL, Three.js web app, custom WebGL simulator, or interactive iframe in the Admin Tab.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grand Corporate Headline & Executive Mission */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-mono drop-shadow-2xl leading-none">
              {hackathon.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-3xl">
              {sponsoredMeta.tagline ||
                (hackathon.description ? hackathon.description.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim() : '')}
            </p>
          </div>

          {/* High-Stake Rewards & Compensation Ribbon */}
          <div className="flex items-center gap-4 flex-wrap p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2.5 pr-5 border-r border-white/10">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                  Builder Grants Pool
                </span>
                <span className="text-base font-black text-white font-mono">
                  {hackathon.prize_pool || '$25,000 USD Grants'}
                </span>
              </div>
            </div>

            {sponsoredMeta.hiringPackage ? (
              <div className="flex items-center gap-2.5 pr-5 border-r border-white/10">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                    Hiring Package &amp; PPIs
                  </span>
                  <span className="text-base font-black text-emerald-300 font-mono">
                    {sponsoredMeta.hiringPackage}
                  </span>
                </div>
              </div>
            ) : null}

            {sponsoredMeta.hiringRoles ? (
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                    Target Roles
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {sponsoredMeta.hiringRoles}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT 4-5 COLS: Brushed-Titanium "VERIFIED CANDIDATE ACCESS PASS" */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="w-full max-w-[360px] rounded-[2rem] p-6 border border-white/20 bg-gradient-to-b from-[#2A303C]/90 via-[#191D26]/95 to-[#0F1218] shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden backdrop-blur-xl group">
            
            {/* Luminous Brushed Metal Edge Lighting */}
            <div
              className="absolute inset-x-0 top-0 h-1.5 opacity-90"
              style={{
                background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
              }}
            />
            <div
              className="absolute -top-14 -right-14 w-36 h-36 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Top Lanyard Notch Slot */}
            <div className="w-20 h-2.5 rounded-full bg-black/80 mx-auto mb-5 border border-white/10" />

            {/* Header Badge */}
            <div className="text-center space-y-1.5 mb-5">
              <span className="text-[11px] font-mono font-black tracking-widest uppercase text-slate-300 block">
                {passTitle}
              </span>
              <span
                className="text-xs font-mono font-bold px-3 py-1 rounded-full border inline-block shadow-sm"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}60`,
                  backgroundColor: `${primaryColor}20`,
                }}
              >
                {passRank}
              </span>
            </div>

            {/* Candidate Identity / QR Code Module */}
            <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center shadow-2xl relative group-hover:scale-[1.02] transition-transform duration-300">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Candidate Pass QR" className="w-[150px] h-[150px] object-contain" />
              ) : (
                <div className="w-[150px] h-[150px] bg-slate-100 rounded-lg flex items-center justify-center font-mono text-[10px] text-slate-500">
                  Generating QR...
                </div>
              )}
              <span className="text-[10px] font-mono font-black text-slate-800 mt-2 tracking-wider">
                SCAN FOR RECRUITER VERIFICATION
              </span>
            </div>

            {/* Candidate Details */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Candidate:</span>
              <span className="font-bold text-white truncate max-w-[190px]">
                {currentUser?.email?.split('@')[0] || 'Verified Builder'}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">PPI Track:</span>
              <span className="font-bold text-amber-300">Active Fast-Track</span>
            </div>

            {/* Primary Enlist Button */}
            <button
              onClick={onRegisterClick}
              disabled={isRegistering || registrationClosed || isRegistered}
              className="mt-6 w-full py-4 px-5 rounded-2xl font-mono font-black text-xs uppercase tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 hover:brightness-110"
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
      <div className="relative z-10 border-t border-white/[0.08] bg-black/40 p-6 sm:p-10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Executive Fast-Track Hiring Ladder
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Level 1: Qualifier &bull; Level 2: Finalist Hangar &bull; Level 3: Grand Laureate
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full shadow-sm">
            Direct ATS Bypass Guarantee
          </span>
        </div>

        {/* 3-Level Connected Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {hiringLadder.map((step, idx) => {
            const isLast = idx === hiringLadder.length - 1;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isLast
                    ? 'border-amber-400/60 bg-amber-950/30 shadow-[0_0_25px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/40'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md ${
                      isLast
                        ? 'bg-amber-400 text-black'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    LEVEL {idx + 1}
                  </span>
                  {isLast && (
                    <span className="text-[11px] font-mono font-bold text-amber-300 uppercase flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> ₹18-32 LPA Fast-Track
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white font-mono">{step.title}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{step.perks}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE DEVELOPER TERMINAL PLAYGROUND DOCK                          */}
      {/* ========================================================================= */}
      <div className="relative z-10 border-t border-white/[0.08] bg-black/60 p-6 sm:p-10 backdrop-blur-md">
        <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
          {/* Terminal Window Header */}
          <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-300 pl-3 border-l border-white/10 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Developer Terminal Playground
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyEndpoint}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-colors"
              >
                {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEndpoint ? 'Copied cURL' : 'Copy cURL'}</span>
              </button>
              {sandbox.starterRepoUrl && (
                <a
                  href={sandbox.starterRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 text-xs font-mono flex items-center gap-1.5 border border-cyan-500/40 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Clone Starter Repo</span>
                </a>
              )}
            </div>
          </div>

          {/* Terminal Body with Live Metrics */}
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center font-mono text-xs">
            {/* Left 8 Cols: API Payload Preview */}
            <div className="lg:col-span-8 bg-black/60 p-4 rounded-xl border border-white/10 text-slate-300 overflow-x-auto space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-[10px]">
                  POST
                </span>
                <span>{sandbox.endpoint?.split(' ')[1] || '/v2/fintech/sprint/sandbox'}</span>
              </div>
              <pre className="text-xs text-slate-400 leading-relaxed font-mono pt-1">
                {sandbox.samplePayload}
              </pre>
            </div>

            {/* Right 4 Cols: Real-Time Telemetry Metrics */}
            <div className="lg:col-span-4 space-y-2.5 bg-white/[0.02] p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Real-Time Telemetry:</span>
                <span className="text-emerald-400 font-bold">ACTIVE 200 OK</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Latency:</span>
                <span className="text-cyan-300 font-bold">{sandbox.latencyMs || 130}ms +3.98ms</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Packet Throughput:</span>
                <span className="text-slate-200">192 req/sec</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Sandbox Isolation:</span>
                <span className="text-amber-400 font-semibold">Enterprise VPC Air-Gapped</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
