'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowUpRight, Sparkles, Users } from 'lucide-react';

interface FloatingCardItem {
  id: string;
  number: string;
  title: string;
  category: string;
  recruitingBadge: string;
  badgeTone: 'emerald' | 'cyan' | 'violet' | 'amber';
  college: string;
  description: string;
  tags: string[];
  teamJoined: string;
  artImage: string;
  glowColor: string;
  href: string;
}

const ACTIVE_CAMPUS_PROJECTS: FloatingCardItem[] = [
  {
    id: 'proj_devsync_ide',
    number: '01',
    title: 'DevSync IDE',
    category: 'DEV TOOLS',
    recruitingBadge: 'Recruiting • 1 Dev',
    badgeTone: 'emerald',
    college: 'Bosscoder School of Tech',
    description: 'Real-time collaborative web IDE with shared cursors, live terminal execution & AI pair coding.',
    tags: ['Next.js', 'Go', 'Docker'],
    teamJoined: '2/4 Joined',
    artImage: '/brand/card-art-1.webp',
    glowColor: 'rgba(168, 85, 247, 0.45)', // Violet/Magenta glow
    href: '/explore',
  },
  {
    id: 'proj_aerovision_uav',
    number: '02',
    title: 'AeroVision UAV',
    category: 'ROBOTICS & AI',
    recruitingBadge: 'Recruiting • 2 Devs',
    badgeTone: 'cyan',
    college: 'IIT Delhi',
    description: 'Autonomous campus drone tracking with edge-quantized YOLOv8 on Jetson Orin Nano.',
    tags: ['Python', 'PyTorch', 'ROS2'],
    teamJoined: '2/4 Joined',
    artImage: '/brand/card-art-2.webp',
    glowColor: 'rgba(148, 163, 184, 0.4)', // Silver/Chrome glow
    href: '/explore',
  },
  {
    id: 'proj_ecoroute_transit',
    number: '03',
    title: 'EcoRoute Transit',
    category: 'SMART MOBILITY',
    recruitingBadge: 'In Progress',
    badgeTone: 'violet',
    college: 'BITS Pilani',
    description: 'Graph-optimized micro-mobility scheduler reducing student shuttle wait times by 40%.',
    tags: ['FastAPI', 'Rust', 'Leaflet'],
    teamJoined: '3/4 Joined',
    artImage: '/brand/card-art-3.webp',
    glowColor: 'rgba(56, 189, 248, 0.45)', // Opal/Aurora Sky glow
    href: '/explore',
  },
  {
    id: 'proj_finsafe_web3',
    number: '04',
    title: 'FinSafe Web3',
    category: 'FINTECH / ZK',
    recruitingBadge: 'Recruiting • 1 Dev',
    badgeTone: 'cyan',
    college: 'PES Bengaluru',
    description: 'Zero-knowledge fraud prevention and micro-grant protocol for collegiate hackers.',
    tags: ['Solidity', 'Next.js', 'ZK-Rollup'],
    teamJoined: '2/3 Joined',
    artImage: '/brand/card-art-4.webp',
    glowColor: 'rgba(6, 182, 212, 0.45)', // Cyan/Magma glow
    href: '/explore',
  },
  {
    id: 'proj_neuroscan_ai',
    number: '05',
    title: 'NeuroScan AI',
    category: 'HEALTH AI',
    recruitingBadge: 'SIH Finalist',
    badgeTone: 'amber',
    college: 'KIET Ghaziabad',
    description: 'Explainable deep learning pipeline for fast MRI brain lesion classification & triage.',
    tags: ['PyTorch', 'FastAPI', 'React'],
    teamJoined: '4/4 Joined',
    artImage: '/brand/card-art-5.webp',
    glowColor: 'rgba(245, 158, 11, 0.45)', // Amber/Gold glow
    href: '/explore',
  },
];

// Fanned arc geometry for the 5-card deck
const CARD_GEOMETRY = [
  { rotation: -9, translateY: 26, translateX: -20, zIndex: 10, floatDelay: 0 },
  { rotation: -4.5, translateY: 10, translateX: -10, zIndex: 12, floatDelay: 0.8 },
  { rotation: 0, translateY: 0, translateX: 0, zIndex: 14, floatDelay: 1.6 },
  { rotation: 4.5, translateY: 10, translateX: 10, zIndex: 12, floatDelay: 2.4 },
  { rotation: 9, translateY: 26, translateX: 20, zIndex: 10, floatDelay: 3.2 },
];

export function FloatingProjectRibbon() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getBadgeDotColor = (tone: FloatingCardItem['badgeTone']) => {
    switch (tone) {
      case 'emerald':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]';
      case 'amber':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]';
      case 'violet':
        return 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]';
      case 'cyan':
      default:
        return 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]';
    }
  };

  return (
    <section className="relative z-20 pt-14 pb-20 sm:pt-16 sm:pb-24 border-t border-b border-white/[0.06] bg-[#05070B] overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[550px] h-[350px] bg-sky-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>Live Campus Squads</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-heading">
              Active Projects Building Right Now
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
              Join active collegiate teams or recruit teammates for upcoming hackathons.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-xs sm:text-sm font-semibold text-white transition-all group self-start sm:self-auto cursor-pointer"
          >
            <span>Explore All 40+ Projects</span>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ============================================================== */}
        {/* DESKTOP: 3D Fanned Arc Floating Deck (Matches 3rd Image) */}
        {/* ============================================================== */}
        <div className="hidden lg:flex justify-center items-end relative py-12 px-4 [perspective:1400px]">
          <div className="flex items-center justify-center -space-x-8 xl:-space-x-10">
            {ACTIVE_CAMPUS_PROJECTS.map((card, index) => {
              const geom = CARD_GEOMETRY[index];
              const isHovered = hoveredIndex === index;
              const hasAnyHover = hoveredIndex !== null;

              // Transform states
              const currentRotate = isHovered ? 0 : geom.rotation;
              const currentY = isHovered ? -34 : geom.translateY;
              const currentX = isHovered ? 0 : geom.translateX;
              const currentScale = isHovered ? 1.08 : hasAnyHover ? 0.98 : 1.0;
              const currentZ = isHovered ? 40 : geom.zIndex;
              const currentOpacity = hasAnyHover && !isHovered ? 0.65 : 1.0;

              return (
                <motion.div
                  key={card.id}
                  style={{ zIndex: currentZ }}
                  animate={{
                    rotate: currentRotate,
                    y: currentY,
                    x: currentX,
                    scale: currentScale,
                    opacity: currentOpacity,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 26,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative flex-shrink-0 cursor-pointer origin-bottom will-change-transform"
                >
                  <Link
                    href={card.href}
                    className="group block w-[270px] xl:w-[295px] h-[420px] rounded-[28px] bg-[#0B0E15]/95 border border-white/[0.12] hover:border-white/40 overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col justify-between"
                    style={{
                      boxShadow: isHovered
                        ? `0 35px 70px -15px rgba(0, 0, 0, 0.95), 0 0 40px ${card.glowColor}`
                        : undefined,
                    }}
                  >
                    {/* Top Artwork Banner (Header 44%) */}
                    <div className="relative h-44 xl:h-48 w-full overflow-hidden rounded-t-[26px] bg-slate-900">
                      <img
                        src={card.artImage}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      {/* Top Glass Gloss Accent */}
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E15] via-transparent to-transparent opacity-80" />
                    </div>

                    {/* Bottom Card Body (56%) */}
                    <div className="relative p-5 pt-3 flex flex-col justify-between flex-1 overflow-hidden">
                      {/* Subtle Giant Watermark Number (Image 3 Feature) */}
                      <span className="absolute right-3.5 top-0 text-7xl font-black font-heading text-white/[0.04] group-hover:text-white/[0.08] select-none pointer-events-none tracking-tighter transition-colors">
                        {card.number}
                      </span>

                      {/* Top Meta: Category Pill + Recruiting Status */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-white/[0.07] border border-white/10 text-slate-300">
                            {card.category}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${getBadgeDotColor(card.badgeTone)}`} />
                            {card.recruitingBadge}
                          </span>
                        </div>

                        {/* Title & College */}
                        <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors tracking-tight line-clamp-1">
                          {card.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-1">
                          🏛️ {card.college}
                        </p>

                        {/* Narrative Description */}
                        <p className="text-xs text-slate-300/80 mt-2 line-clamp-2 leading-relaxed">
                          {card.description}
                        </p>
                      </div>

                      {/* Bottom Footer: Squad status & Interactive CTA Button */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">
                          {card.teamJoined}
                        </span>

                        <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 group-hover:bg-white text-white group-hover:text-slate-950 border border-white/15 group-hover:border-white transition-all duration-300 shadow-sm">
                          <span>Explore</span>
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* MOBILE / TABLET: Responsive Horizontal Snap Stream */}
        {/* ============================================================== */}
        <div className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-none -mx-6 px-6">
          {ACTIVE_CAMPUS_PROJECTS.map((card) => (
            <div key={card.id} className="snap-center flex-shrink-0 w-[280px]">
              <Link
                href={card.href}
                className="group block h-[410px] rounded-[26px] bg-[#0B0E15] border border-white/[0.12] hover:border-white/30 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Artwork Banner */}
                <div className="relative h-44 w-full overflow-hidden rounded-t-[24px] bg-slate-900">
                  <img
                    src={card.artImage}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E15] via-transparent to-transparent opacity-80" />
                </div>

                {/* Card Body */}
                <div className="relative p-5 pt-3 flex flex-col justify-between flex-1 overflow-hidden">
                  <span className="absolute right-3.5 top-0 text-7xl font-black font-heading text-white/[0.04] select-none pointer-events-none tracking-tighter">
                    {card.number}
                  </span>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-white/[0.07] border border-white/10 text-slate-300">
                        {card.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${getBadgeDotColor(card.badgeTone)}`} />
                        {card.recruitingBadge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-1">
                      🏛️ {card.college}
                    </p>
                    <p className="text-xs text-slate-300/80 mt-2 line-clamp-2 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      {card.teamJoined}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
                      <span>Explore</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
