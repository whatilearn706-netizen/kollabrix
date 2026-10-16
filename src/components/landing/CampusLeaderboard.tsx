'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Flame, 
  ArrowUpRight, 
  ThumbsUp, 
  Award, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  ChevronRight 
} from 'lucide-react';

interface Builder {
  rank: number;
  name: string;
  college: string;
  role: string;
  xp: number;
  shippedSquads: number;
  avatar: string;
  badge: string;
}

const TOP_BUILDERS: Builder[] = [
  {
    rank: 1,
    name: 'Aarav Sharma',
    college: 'IIT Bombay',
    role: 'Fullstack Lead & Distributed Systems',
    xp: 2840,
    shippedSquads: 6,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'Legendary Builder',
  },
  {
    rank: 2,
    name: 'Meera Nambiar',
    college: 'BITS Pilani',
    role: 'AI/ML & Edge Inference Specialist',
    xp: 2610,
    shippedSquads: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    badge: 'AI Master',
  },
  {
    rank: 3,
    name: 'Rohan Patel',
    college: 'IIIT Hyderabad',
    role: 'Rust, WebRTC & Backend Architecture',
    xp: 2390,
    shippedSquads: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badge: 'Speed Demon',
  },
  {
    rank: 4,
    name: 'Ananya Gupta',
    college: 'Delhi Technological University',
    role: 'UI/UX & Design Systems Lead',
    xp: 2150,
    shippedSquads: 4,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    badge: 'Design Prodigy',
  },
  {
    rank: 5,
    name: 'Siddharth Verma',
    college: 'NIT Trichy',
    role: 'Solidity & Protocol Security',
    xp: 1980,
    shippedSquads: 3,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    badge: 'Smart Contract Auditor',
  },
];

export function CampusLeaderboard() {
  const [upvotes, setUpvotes] = useState(384);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [cheeredMap, setCheeredMap] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'iit' | 'bits' | 'iiit'>('all');

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes((v) => v - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes((v) => v + 1);
      setHasUpvoted(true);
    }
  };

  const handleCheer = (rank: number) => {
    setCheeredMap((prev) => ({
      ...prev,
      [rank]: !prev[rank],
    }));
  };

  const filteredBuilders = TOP_BUILDERS.filter((b) => {
    if (activeTab === 'iit') return b.college.includes('IIT');
    if (activeTab === 'bits') return b.college.includes('BITS');
    if (activeTab === 'iiit') return b.college.includes('IIIT');
    return true;
  });

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-white via-zinc-50/50 to-white border-y border-zinc-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold tracking-wide uppercase mb-3">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              Campus Hall of Fame
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Top Collegiate Builders & Project of the Week
            </h2>
            <p className="mt-2 text-base text-zinc-600 max-w-2xl">
              Recognizing high-commitment student squads turning late-night coffee into deployed products across 180+ partner universities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-sm"
            >
              Explore All Projects <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Spotlight: Project of the Week (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-zinc-200/90 shadow-xl shadow-zinc-200/40 relative overflow-hidden group">
            {/* Top Accent Gradient Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
            
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  Project of the Week
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  Week 42 · Spring 2026
                </span>
              </div>

              <button
                onClick={handleUpvote}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  hasUpvoted
                    ? 'bg-amber-500 text-white shadow-amber-500/20 scale-105'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-amber-50 hover:text-amber-800 border border-zinc-200'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-white' : ''}`} />
                {hasUpvoted ? 'Upvoted' : 'Upvote Squad'} · {upvotes}
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                AuraMed — Real-Time Collegiate Triage Assistant
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Shipped & Verified
                </span>
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                An on-device, latency-optimized triage assistant tailored for college campus health clinics. Transcribes patient symptoms in 14 Indian languages and computes instant severity routing before the physician exam.
              </p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 my-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div>
                <p className="text-xs text-zinc-500 font-medium">Triage Queries</p>
                <p className="text-lg font-bold text-zinc-900 mt-0.5">1,420+</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Active campus pilot</p>
              </div>
              <div className="border-x border-zinc-200 px-3">
                <p className="text-xs text-zinc-500 font-medium">Avg Latency</p>
                <p className="text-lg font-bold text-zinc-900 mt-0.5">240ms</p>
                <p className="text-[10px] text-zinc-500">Local WebGPU</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Hackathon Rank</p>
                <p className="text-lg font-bold text-amber-600 mt-0.5">1st Place</p>
                <p className="text-[10px] text-zinc-500">ETHIndia Collegiate</p>
              </div>
            </div>

            {/* Squad Members */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                The 4-Person Squad
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl border border-zinc-200 bg-white">
                  <p className="text-xs font-bold text-zinc-800">Tanvi Sen</p>
                  <p className="text-[11px] text-zinc-500">ML Lead · IIT Bombay</p>
                </div>
                <div className="p-2.5 rounded-xl border border-zinc-200 bg-white">
                  <p className="text-xs font-bold text-zinc-800">Devansh K.</p>
                  <p className="text-[11px] text-zinc-500">Next.js · BITS Pilani</p>
                </div>
                <div className="p-2.5 rounded-xl border border-zinc-200 bg-white">
                  <p className="text-xs font-bold text-zinc-800">Pooja Nair</p>
                  <p className="text-[11px] text-zinc-500">Product UX · NID</p>
                </div>
                <div className="p-2.5 rounded-xl border border-zinc-200 bg-white">
                  <p className="text-xs font-bold text-zinc-800">Harsh Rao</p>
                  <p className="text-[11px] text-zinc-500">Clinical Data · AIIMS</p>
                </div>
              </div>
            </div>

            {/* Tech Tags & CTAs */}
            <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {['Next.js 15', 'FastAPI', 'Llama 3 8B', 'WebRTC', 'Tailwind'].map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-sm"
                >
                  View Blueprint <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Leaderboard Table (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/90 shadow-xl shadow-zinc-200/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Top Collegiate Builders
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">Ranked by verified commits & shipped squad milestones</p>
              </div>
            </div>

            {/* Campus filter tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl mb-4 text-xs font-medium">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'all'
                    ? 'bg-white text-zinc-900 shadow-sm font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('iit')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'iit'
                    ? 'bg-white text-zinc-900 shadow-sm font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                IITs
              </button>
              <button
                onClick={() => setActiveTab('bits')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'bits'
                    ? 'bg-white text-zinc-900 shadow-sm font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                BITS
              </button>
              <button
                onClick={() => setActiveTab('iiit')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'iiit'
                    ? 'bg-white text-zinc-900 shadow-sm font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                IIITs
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredBuilders.map((builder) => {
                const isCheered = cheeredMap[builder.rank];
                return (
                  <div
                    key={builder.name}
                    className="flex items-center justify-between p-3 rounded-2xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50/70 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank badge */}
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-extrabold shrink-0 ${
                          builder.rank === 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : builder.rank === 2
                            ? 'bg-zinc-200 text-zinc-800'
                            : builder.rank === 3
                            ? 'bg-amber-900/10 text-amber-900'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {builder.rank}
                      </span>

                      {/* Avatar */}
                      <img
                        src={builder.avatar}
                        alt={builder.name}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
                      />

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-zinc-900 truncate">{builder.name}</p>
                          <CheckCircle2 className="w-3 h-3 text-sky-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-zinc-400" />
                          {builder.college} · {builder.shippedSquads} squads
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 pl-2">
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-zinc-900">{builder.xp.toLocaleString()}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">XP</p>
                      </div>

                      <button
                        onClick={() => handleCheer(builder.rank)}
                        title="Cheer builder"
                        className={`p-2 rounded-xl border text-xs transition-all ${
                          isCheered
                            ? 'bg-rose-50 border-rose-200 text-rose-600 scale-105'
                            : 'border-zinc-200 text-zinc-400 hover:text-rose-500 hover:border-zinc-300 bg-white'
                        }`}
                      >
                        👏
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Want to enter the Hall of Fame?
              </span>
              <Link href="/projects" className="text-indigo-600 font-bold hover:underline">
                Ship a project →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
