'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import {
  Users, Trophy, Brain, UserPlus, Code2, Rocket, ArrowUpRight, Sparkles
} from 'lucide-react';

const features = [
  {
    title: 'Real-time Workspace',
    priority: 'PRIORITY 01',
    priorityBadge: 'CORE COLLABORATION',
    priorityTheme: 'border-orange-500/50 bg-orange-500/15 text-orange-300 shadow-orange-500/20',
    glowColor: 'rgba(234, 88, 12, 0.35)',
    description:
      'Huddle with your team, track milestones, manage tasks, and ship code — all in one seamless collaborative environment with voice rooms, GitHub sync, and live discussions.',
    icon: Users,
    iconBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/25',
    span: 'md:col-span-2',
    href: '/my-projects',
  },
  {
    title: 'Hackathon Engine',
    priority: 'PRIORITY 02',
    priorityBadge: 'ARENA & MATCHES',
    priorityTheme: 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-amber-500/20',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    description:
      'Host or join hackathons with built-in team formation, submission tracking, and judging workflows.',
    icon: Trophy,
    iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    span: '',
    href: '/hackathons',
  },
  {
    title: 'Smart Matching',
    priority: 'PRIORITY 03',
    priorityBadge: 'TALENT FINDER',
    priorityTheme: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-emerald-500/20',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    description:
      'Find collaborators who complement your skills. Our algorithm surfaces the perfect teammates for your project.',
    icon: UserPlus,
    iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    span: '',
    href: '/teammates',
  },
  {
    title: 'ICPC Arena',
    priority: 'PRIORITY 04',
    priorityBadge: 'DSA & RANKINGS',
    priorityTheme: 'border-blue-500/50 bg-blue-500/15 text-blue-300 shadow-blue-500/20',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    description:
      'Compete in proctored competitive programming contests with real-time leaderboards and verified results.',
    icon: Code2,
    iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    span: '',
    href: '/icpc',
  },
  {
    title: 'Spark AI',
    priority: 'PRIORITY 05',
    priorityBadge: 'IDEATION COPILOT',
    priorityTheme: 'border-violet-500/50 bg-violet-500/15 text-violet-300 shadow-violet-500/20',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    description:
      'AI-powered brainstorming, code generation, and project assistance at your fingertips.',
    icon: Brain,
    iconBg: 'bg-violet-500/10 text-violet-400 border border-violet-500/25',
    span: '',
    href: '/spark',
  },
  {
    title: 'Starter Kits & Resources',
    priority: 'PRIORITY 06',
    priorityBadge: 'CURATED TEMPLATES',
    priorityTheme: 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-cyan-500/20',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    description:
      'Launch projects instantly with curated templates, learning paths, and boilerplate code from the community.',
    icon: Rocket,
    iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25',
    span: 'md:col-span-2',
    href: '/resources',
  },
];

function FeatureCard({
  feature,
  index,
  hoveredIndex,
  onHover,
}: {
  feature: (typeof features)[0];
  index: number;
  hoveredIndex: number | null;
  onHover: (idx: number | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isCurrentHovered = hoveredIndex === index;
  const isOtherHovered = hoveredIndex !== null && !isCurrentHovered;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: isOtherHovered ? 0.45 : 1, y: 0 } : {}}
      transition={{
        delay: index * 0.07,
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={`relative ${feature.span}`}
      style={{ zIndex: isCurrentHovered ? 30 : 1 }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onMouseMove={handleMouseMove}
    >
      <Link href={feature.href} className="block h-full group focus-visible:outline-none">
        <motion.div
          animate={{
            scale: isCurrentHovered ? 1.04 : 1,
            y: isCurrentHovered ? -6 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 24,
          }}
          style={{
            boxShadow: isCurrentHovered
              ? `0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 35px ${feature.glowColor}`
              : '0 4px 20px -4px rgba(0, 0, 0, 0.4)',
          }}
          className={`h-full rounded-2xl p-6 md:p-8 border transition-colors duration-200 backdrop-blur-md relative overflow-hidden flex flex-col justify-between ${
            isCurrentHovered
              ? 'border-white/35 bg-[#12151F]'
              : 'border-white/[0.07] bg-white/[0.02]'
          }`}
        >
          {/* Mouse Following Spotlight Glow */}
          {isCurrentHovered && (
            <div
              className="absolute pointer-events-none -inset-px transition-opacity duration-300 opacity-100"
              style={{
                background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${feature.glowColor}, transparent 65%)`,
              }}
            />
          )}

          {/* Top Row: Icon & Dynamic Priority Spotlight Pop */}
          <div className="relative z-10 flex items-start justify-between gap-4 mb-5">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110 shadow-sm`}
            >
              <feature.icon className="w-6 h-6" />
            </div>

            {/* Big Priority Pop Badge */}
            <motion.div
              animate={{
                scale: isCurrentHovered ? 1.08 : 0.95,
                opacity: isCurrentHovered ? 1 : 0.85,
              }}
              transition={{ duration: 0.2 }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider border shadow-md ${feature.priorityTheme}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
              <span>{feature.priority}</span>
              <span className="opacity-70 text-[10px] font-normal hidden sm:inline">• {feature.priorityBadge}</span>
            </motion.div>
          </div>

          {/* Middle: Title & Description */}
          <div className="relative z-10">
            <h3 className="font-heading text-xl font-bold text-white mb-2.5 flex items-center gap-2 group-hover:text-amber-300 transition-colors">
              <span>{feature.title}</span>
              <ArrowUpRight className={`w-4 h-4 text-slate-400 transition-all duration-200 ${isCurrentHovered ? 'opacity-100 translate-x-0.5 -translate-y-0.5 text-amber-400' : 'opacity-0'}`} />
            </h3>
            <p className="text-slate-400 text-[14px] sm:text-[15px] leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* Bottom Pop Action Drawer: Appears when mouse focuses on card */}
          <motion.div
            initial={false}
            animate={{
              height: isCurrentHovered ? 'auto' : 0,
              opacity: isCurrentHovered ? 1 : 0,
              marginTop: isCurrentHovered ? 16 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden relative z-10 border-t border-white/10 pt-3 flex items-center justify-between text-xs font-semibold text-slate-200"
          >
            <span className="flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Priority Module</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Click to open &rarr;</span>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function LandingFeatures() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400 mb-4 block flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            Platform Capabilities
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Everything you need to ship something{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
              extraordinary.
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Hover over any core capability to inspect its priority and interactive toolset.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
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