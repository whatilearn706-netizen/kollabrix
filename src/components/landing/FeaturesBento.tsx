'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import {
  Users,
  Trophy,
  Brain,
  UserPlus,
  Code2,
  Rocket,
  ArrowRight,
  Swords,
  Clock,
  Lightbulb,
  Bot,
  Flame,
  LayoutGrid,
} from 'lucide-react';

type HubCategory = 'all' | 'compete' | 'build' | 'campus';

interface CampusToolItem {
  title: string;
  badge: string;
  live?: boolean;
  category: Exclude<HubCategory, 'all'>;
  description: string;
  icon: React.ElementType;
  accentText: string;
  accentBorder: string;
  iconStyle: string;
  glowColor: string;
  href: string;
  openInNewTab?: boolean;
}

const CAMPUS_TOOLS: CampusToolItem[] = [
  // Compete (4)
  {
    title: '1v1 Battle Arena',
    badge: 'LIVE DUELS',
    live: true,
    category: 'compete',
    description: 'Race coders head-to-head in 3-minute ELO speed duels.',
    icon: Swords,
    accentText: 'text-emerald-300',
    accentBorder: 'border-emerald-500/35 bg-emerald-500/10',
    iconStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    glowColor: 'rgba(16, 185, 129, 0.22)',
    href: '/arena',
  },
  {
    title: 'Campus War',
    badge: 'INTER-COLLEGE',
    live: true,
    category: 'compete',
    description: 'Represent your university in live squad-vs-squad clashes.',
    icon: Flame,
    accentText: 'text-rose-300',
    accentBorder: 'border-rose-500/35 bg-rose-500/10',
    iconStyle: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    glowColor: 'rgba(244, 63, 94, 0.22)',
    href: '/war',
  },
  {
    title: 'Hackathons',
    badge: 'PRIZE POOLS',
    live: true,
    category: 'compete',
    description: 'Join verified campus sprints, form squads & submit builds.',
    icon: Trophy,
    accentText: 'text-cyan-300',
    accentBorder: 'border-cyan-500/35 bg-cyan-500/10',
    iconStyle: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    glowColor: 'rgba(6, 182, 212, 0.22)',
    href: '/hackathons',
  },
  {
    title: 'Campus Leaderboard',
    badge: 'RANKINGS',
    category: 'compete',
    description: 'See top-ranked student coders, teams & colleges nationwide.',
    icon: Trophy,
    accentText: 'text-violet-300',
    accentBorder: 'border-violet-500/35 bg-violet-500/10',
    iconStyle: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
    glowColor: 'rgba(139, 92, 246, 0.22)',
    href: '/leaderboard',
  },

  // Build & AI (4)
  {
    title: 'AI Spark Studio',
    badge: 'AI CO-PILOT',
    category: 'build',
    description: 'Generate winning hackathon concepts, specs & tech stacks.',
    icon: Brain,
    accentText: 'text-violet-300',
    accentBorder: 'border-violet-500/35 bg-violet-500/10',
    iconStyle: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
    glowColor: 'rgba(139, 92, 246, 0.22)',
    href: '/spark',
  },
  {
    title: 'AI Project Planner',
    badge: 'ROADMAP',
    category: 'build',
    description: 'Split project briefs into sprint milestones & daily tasks.',
    icon: Bot,
    accentText: 'text-sky-300',
    accentBorder: 'border-sky-500/35 bg-sky-500/10',
    iconStyle: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
    glowColor: 'rgba(56, 189, 248, 0.22)',
    href: '/planner',
  },
  {
    title: 'Team Workspace',
    badge: 'HUDDLE & TASKS',
    category: 'build',
    description: 'Collaborate with voice huddles, task boards & GitHub sync.',
    icon: Users,
    accentText: 'text-emerald-300',
    accentBorder: 'border-emerald-500/35 bg-emerald-500/10',
    iconStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    glowColor: 'rgba(16, 185, 129, 0.22)',
    href: '/my-projects',
  },
  {
    title: 'Find Teammates',
    badge: 'SQUAD MATCH',
    category: 'build',
    description: 'Match with verified builders by skills, role & campus.',
    icon: UserPlus,
    accentText: 'text-cyan-300',
    accentBorder: 'border-cyan-500/35 bg-cyan-500/10',
    iconStyle: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    glowColor: 'rgba(6, 182, 212, 0.22)',
    href: '/teammates',
  },

  // Campus & Practice (4)
  {
    title: 'Deadlines Radar',
    badge: 'COUNTDOWNS',
    live: true,
    category: 'campus',
    description: 'Track closing hackathon registrations before slots lock.',
    icon: Clock,
    accentText: 'text-rose-300',
    accentBorder: 'border-rose-500/35 bg-rose-500/10',
    iconStyle: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    glowColor: 'rgba(244, 63, 94, 0.22)',
    href: '/deadlines',
  },
  {
    title: 'Practice IDE',
    badge: 'OA & ICPC',
    category: 'campus',
    description: 'Timed placement OA simulations & proctored DSA rounds.',
    icon: Code2,
    accentText: 'text-blue-300',
    accentBorder: 'border-blue-500/35 bg-blue-500/10',
    iconStyle: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
    glowColor: 'rgba(59, 130, 246, 0.22)',
    href: '/icpc',
  },
  {
    title: 'Faculty Problems',
    badge: 'CAMPUS BRIEFS',
    category: 'campus',
    description: 'Tackle real research & industry problem statements.',
    icon: Lightbulb,
    accentText: 'text-sky-300',
    accentBorder: 'border-sky-500/35 bg-sky-500/10',
    iconStyle: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
    glowColor: 'rgba(56, 189, 248, 0.22)',
    href: '/problems',
  },
  {
    title: 'Starter Kits & Resources',
    badge: 'TEMPLATES',
    category: 'campus',
    description: 'Launch fast with curated boilerplate kits & coding tracks.',
    icon: Rocket,
    accentText: 'text-teal-300',
    accentBorder: 'border-teal-500/35 bg-teal-500/10',
    iconStyle: 'bg-teal-500/10 text-teal-300 border-teal-500/25',
    glowColor: 'rgba(20, 184, 166, 0.22)',
    href: '/resources',
    openInNewTab: true,
  },
];

const HUB_TABS: Array<{ id: HubCategory; label: string; count: number }> = [
  { id: 'all', label: 'All Tools', count: CAMPUS_TOOLS.length },
  { id: 'compete', label: 'Compete', count: CAMPUS_TOOLS.filter((t) => t.category === 'compete').length },
  { id: 'build', label: 'Build & AI', count: CAMPUS_TOOLS.filter((t) => t.category === 'build').length },
  { id: 'campus', label: 'Campus & Practice', count: CAMPUS_TOOLS.filter((t) => t.category === 'campus').length },
];

function ToolLauncherCard({
  tool,
  index,
  hoveredIndex,
  onHover,
}: {
  tool: CampusToolItem;
  index: number;
  hoveredIndex: number | null;
  onHover: (idx: number | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const isCurrentHovered = hoveredIndex === index;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const Icon = tool.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: Math.min(index * 0.04, 0.25),
        duration: 0.4,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onMouseMove={handleMouseMove}
      className="h-full"
    >
      <Link
        href={tool.href}
        target={tool.openInNewTab ? '_blank' : undefined}
        rel={tool.openInNewTab ? 'noopener noreferrer' : undefined}
        className="block h-full group focus-visible:outline-none"
      >
        <div
          ref={cardRef}
          style={{
            boxShadow: isCurrentHovered
              ? `0 20px 45px -12px rgba(0, 0, 0, 0.9), 0 0 28px ${tool.glowColor}`
              : '0 6px 22px -6px rgba(0, 0, 0, 0.55)',
          }}
          className={`h-full rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between bg-[#090C12]/90 backdrop-blur-xl ${
            isCurrentHovered
              ? 'border-white/30 bg-[#0e131d] -translate-y-1'
              : 'border-white/[0.09] hover:border-white/25'
          }`}
        >
          {/* Top hairline highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Cursor-following spotlight glow */}
          {isCurrentHovered && (
            <div
              className="absolute pointer-events-none -inset-px transition-opacity duration-300 opacity-100"
              style={{
                background: `radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), ${tool.glowColor}, transparent 65%)`,
              }}
            />
          )}

          {/* Top Row: Icon & Live/Category Badge */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${tool.iconStyle} transition-transform duration-200 group-hover:scale-105 shadow-inner`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${tool.accentBorder} ${tool.accentText}`}
            >
              {tool.live && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              )}
              <span>{tool.badge}</span>
            </span>
          </div>

          {/* Middle: Title & Short Action Line */}
          <div className="relative z-10 space-y-1.5 mb-4">
            <h3 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-white transition-colors">
              {tool.title}
            </h3>
            <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed line-clamp-2">
              {tool.description}
            </p>
          </div>

          {/* Bottom Action Strip (Always visible on desktop & mobile — tap to launch) */}
          <div className="relative z-10 pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
              Tap to open
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-200 text-slate-200 group-hover:text-slate-950 border border-white/10 group-hover:border-white/50 font-bold transition-all">
              <span>Launch</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function LandingFeatures() {
  const [activeCategory, setActiveCategory] = useState<HubCategory>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const visibleTools =
    activeCategory === 'all'
      ? CAMPUS_TOOLS
      : CAMPUS_TOOLS.filter((tool) => tool.category === activeCategory);

  return (
    <section className="relative py-20 md:py-24 px-5 sm:px-8 lg:px-12 bg-black border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header + Category Filter Pills */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-white/[0.06] text-slate-200 border border-white/15 mb-3">
              <LayoutGrid className="w-3.5 h-3.5 text-cyan-300" />
              <span>Campus Command Hub</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl lg:text-[2.65rem] font-bold text-white leading-tight tracking-tight">
              Every Tool on Campus —{' '}
              <span className="bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Tap to Launch.
              </span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Jump directly into duels, campus wars, hackathons, live deadlines, AI builders, and coding prep in one tap.
            </p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#090C12] border border-white/10 overflow-x-auto self-start lg:self-auto shadow-inner">
            {HUB_TABS.map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setHoveredIndex(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-b from-white to-slate-200 text-slate-950 shadow-sm border border-white/50'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-black/10 text-slate-900' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 12-Tile Balanced Interactive Launcher Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleTools.map((tool, i) => (
            <ToolLauncherCard
              key={tool.title}
              tool={tool}
              index={i}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}