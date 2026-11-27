'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Swords, Trophy, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  badgeText: string;
  stats: { label: string; value: string }[];
  primaryLink: { text: string; href: string };
}

const showcaseItems: ShowcaseItem[] = [
  {
    id: 'hackathon-passes',
    tag: 'COLLEGIATE CREDENTIALS',
    tagColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/40',
    title: '3D Holographic Hackathon Passes',
    subtitle: 'Physical PVC Credentials for Top Engineering Summits',
    description:
      'Official campus lanyards and passcards integrated with Smart India Hackathon (SIH 2026), Physical AI Hack, Lighthouse, and IIT collegiate sprints. Instant proof-of-talent and verified attendance for student builders.',
    imageSrc: '/showcase/kollabrix-hackathon-passes-3d.png',
    imageAlt: 'Kollabrix 3D Collegiate Hackathon ID Passes and Lanyards',
    badgeText: 'SIH 2026 & CAMPUS SPRINTS',
    stats: [
      { label: 'Host Campuses', value: '140+' },
      { label: 'Prize Pools', value: '₹50L+' },
      { label: 'Active Teams', value: '1,200+' },
    ],
    primaryLink: { text: 'Claim Hackathon Pass', href: '/hackathons' },
  },
  {
    id: 'arena-lobby',
    tag: 'THE PROVING GROUNDS',
    tagColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40',
    title: 'KΛ ARENA Matchmaking',
    subtitle: 'High-Stakes Esports Coding Duels & Ranked Queues',
    description:
      'Enter the live esports arena with cyber avatar callsigns, college tags (DTU, IIT, BITS), and real-time matchmaking. Queue for 3-minute Quick Blitz, 60s Bug Hunt, or high-stakes Campus Wars with live ELO rankings.',
    imageSrc: '/showcase/kollabrix-arena-lobby.png',
    imageAlt: 'Kollabrix Arena Lobby - The Proving Grounds Matchmaking Hub',
    badgeText: 'LIVE MATCHMAKING QUEUES',
    stats: [
      { label: 'Duel Length', value: '3 Mins' },
      { label: 'Ranking Tiers', value: 'Iron → Grandmaster' },
      { label: 'Avg Queue', value: '< 4 Secs' },
    ],
    primaryLink: { text: 'Enter Proving Grounds', href: '/arena' },
  },
  {
    id: 'victory-card',
    tag: 'KNOCKOUT PROOF',
    tagColor: 'border-purple-500/30 text-purple-400 bg-purple-950/40',
    title: 'Victory Knockout Fight Cards',
    subtitle: 'Side-by-Side Code Diffs, ELO Rewards & Instant Proof',
    description:
      'Celebrate match victories with verifiable knockout cards. Complete side-by-side code diffs against rivals, instant ELO point progression (+30 ELO), and automated pass validation on runtime and memory limits.',
    imageSrc: '/showcase/kollabrix-victory-fight-card.png',
    imageAlt: 'Kollabrix Victory Knockout Fight Card and Code Diff',
    badgeText: 'VERIFIABLE ELO RATINGS',
    stats: [
      { label: 'ELO Gains', value: '+30 per win' },
      { label: 'Execution Engine', value: 'Isolated Sandbox' },
      { label: 'Anti-Cheat', value: '100% Proctored' },
    ],
    primaryLink: { text: 'View Arena Leaderboards', href: '/leaderboard' },
  },
];

export function PlatformShowcaseSection() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const activeItem = showcaseItems[activeTab];

  return (
    <section className="relative py-20 sm:py-28 bg-[#030712] border-t border-white/[0.08] overflow-hidden">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.07),transparent_70%)] blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.06),transparent_70%)] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-white/[0.06] text-slate-200 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Built For Elite Collegiate Coders</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-heading leading-tight">
            The Infrastructure of Modern{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Campus Tech.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            From physical 3D hackathon passes to esports coding duels and verifiable fight cards, inspect how Kollabrix transforms collegiate development.
          </p>

          {/* Interactive Showcase Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] max-w-2xl mx-auto backdrop-blur-xl">
            {showcaseItems.map((item, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-white/15 to-white/5 text-white border border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  {idx === 0 && <ShieldCheck className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />}
                  {idx === 1 && <Swords className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />}
                  {idx === 2 && <Trophy className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />}
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Heroic Showcase Card Display */}
        <motion.div
          key={activeItem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0b0f19]/90 to-[#050811]/95 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.85)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual Frame (16:9 Showcase Screenshot) */}
            <div className="lg:col-span-7 relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-purple-500/20 opacity-50 blur-xl group-hover:opacity-80 transition duration-500" />
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/80 shadow-2xl">
                {/* Browser/HUD chrome bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1322] border-b border-white/10 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-medium text-slate-300">kollabrix.in/{activeItem.id}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold tracking-wider">
                    <Zap className="w-3 h-3" /> VERIFIED 4K CAPTURE
                  </span>
                </div>

                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <Image
                    src={activeItem.imageSrc}
                    alt={activeItem.imageAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                </div>
              </div>
            </div>

            {/* Content & Metrics Panel */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border mb-3.5 ${activeItem.tagColor}`}>
                  {activeItem.tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {activeItem.title}
                </h3>
                <p className="text-sm font-semibold text-slate-300 mt-1">
                  {activeItem.subtitle}
                </p>
                <p className="text-sm text-slate-400 leading-relaxed mt-4">
                  {activeItem.description}
                </p>
              </div>

              {/* Stat Chips */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.08]">
                {activeItem.stats.map((stat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href={activeItem.primaryLink.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-200 text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{activeItem.primaryLink.text}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08] text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all"
                >
                  <span>View All Gallery Captures</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
