'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Users, ArrowRight, Sparkles, Code2, Flame, ExternalLink } from 'lucide-react';

interface FloatingCardItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: 'emerald' | 'violet' | 'amber' | 'cyan';
  college: string;
  category: string;
  description: string;
  tags: string[];
  teamMembers: number;
  maxTeamMembers: number;
  avatars: string[];
  href: string;
}

const ACTIVE_CAMPUS_PROJECTS: FloatingCardItem[] = [
  {
    id: 'proj_devsync_ide',
    title: 'DevSync IDE',
    badge: 'Recruiting • 1 Dev',
    badgeColor: 'emerald',
    college: 'Bosscoder School of Tech',
    category: 'Developer Tools',
    description: 'Real-time collaborative web IDE with shared cursors, live terminal execution & AI pair coding.',
    tags: ['Next.js', 'Go', 'Docker'],
    teamMembers: 2,
    maxTeamMembers: 4,
    avatars: ['/avatars/mayank-goyal.svg', '/avatars/arjun-sharma.svg'],
    href: '/explore',
  },
  {
    id: 'proj_aerovision_uav',
    title: 'AeroVision UAV',
    badge: 'Recruiting • 2 Devs',
    badgeColor: 'emerald',
    college: 'IIT Delhi',
    category: 'Robotics & AI',
    description: 'Autonomous campus drone tracking with edge-quantized YOLOv8 on Jetson Orin Nano.',
    tags: ['Python', 'PyTorch', 'ROS2'],
    teamMembers: 2,
    maxTeamMembers: 4,
    avatars: ['/avatars/arjun-sharma.svg', '/avatars/rohan-gupta.svg'],
    href: '/explore',
  },
  {
    id: 'proj_ecoroute_transit',
    title: 'EcoRoute Transit',
    badge: 'In Progress',
    badgeColor: 'violet',
    college: 'BITS Pilani',
    category: 'Smart Mobility',
    description: 'Graph-optimized micro-mobility scheduler reducing student shuttle wait times by 40%.',
    tags: ['FastAPI', 'Rust', 'Leaflet'],
    teamMembers: 3,
    maxTeamMembers: 4,
    avatars: ['/avatars/rohan-gupta.svg', '/avatars/mayank-goyal.svg', '/avatars/priya-patel.svg'],
    href: '/explore',
  },
  {
    id: 'proj_finsafe_web3',
    title: 'FinSafe Web3',
    badge: 'Recruiting • 1 Dev',
    badgeColor: 'emerald',
    college: 'PES Bengaluru',
    category: 'FinTech / ZK',
    description: 'Zero-knowledge fraud prevention and micro-grant protocol for collegiate hackers.',
    tags: ['Solidity', 'Next.js', 'ZK-Rollup'],
    teamMembers: 2,
    maxTeamMembers: 3,
    avatars: ['/avatars/priya-patel.svg', '/avatars/ananya-sharma.svg'],
    href: '/explore',
  },
  {
    id: 'proj_neuroscan_ai',
    title: 'NeuroScan AI',
    badge: 'SIH Finalist',
    badgeColor: 'amber',
    college: 'KIET Ghaziabad',
    category: 'HealthTech AI',
    description: 'Explainable deep learning pipeline for fast MRI brain lesion classification & triage.',
    tags: ['PyTorch', 'FastAPI', 'React'],
    teamMembers: 4,
    maxTeamMembers: 4,
    avatars: ['/avatars/ananya-sharma.svg', '/avatars/mayank-goyal.svg', '/avatars/arjun-sharma.svg', '/avatars/priya-patel.svg'],
    href: '/explore',
  },
];

export function FloatingProjectRibbon() {
  const getBadgeStyles = (color: FloatingCardItem['badgeColor']) => {
    switch (color) {
      case 'emerald':
        return {
          container: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
        };
      case 'violet':
        return {
          container: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
          dot: 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]',
        };
      case 'amber':
        return {
          container: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
        };
      case 'cyan':
      default:
        return {
          container: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
          dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
        };
    }
  };

  return (
    <section className="relative z-20 py-10 sm:py-14 border-t border-b border-white/[0.06] bg-[#07090E]/90 overflow-hidden">
      {/* Subtle backdrop ambient glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>Live Campus Squads</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Active Projects Building Right Now
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join active collegiate teams or recruit teammates for upcoming hackathons.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group cursor-pointer self-start sm:self-auto"
          >
            <span>Explore All 40+ Projects</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Floating Cards Ribbon — 5 columns on desktop, horizontal snap scroll on mobile */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {ACTIVE_CAMPUS_PROJECTS.map((project, index) => {
            const badgeStyle = getBadgeStyles(project.badgeColor);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="snap-center flex-shrink-0 w-[275px] sm:w-[290px] md:w-auto"
              >
                <Link
                  href={project.href}
                  className="group block h-full p-4 sm:p-5 rounded-2xl bg-[#0D111A]/85 hover:bg-[#121824] border border-white/[0.08] hover:border-amber-500/40 shadow-lg hover:shadow-[0_16px_36px_rgba(0,0,0,0.7)] transition-all duration-300 transform hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Glowing hover accent line */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Top: Status Badge & College */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${badgeStyle.container}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                        {project.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        {project.category}
                      </span>
                    </div>

                    {/* Title & College */}
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1 line-clamp-1">
                      <span>🏛️</span> {project.college}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-300/80 mt-2.5 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] text-slate-400 group-hover:text-slate-300 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Squad Count & View CTA */}
                  <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {project.avatars.map((av, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full bg-slate-800 border border-slate-900 overflow-hidden flex items-center justify-center text-[9px] font-bold text-slate-300"
                          >
                            {i === 0 ? 'M' : i === 1 ? 'A' : 'R'}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {project.teamMembers}/{project.maxTeamMembers} Joined
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-amber-400/90 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
