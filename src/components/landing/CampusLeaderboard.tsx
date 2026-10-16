'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  ArrowUpRight, 
  Award, 
  Sparkles, 
  CheckCircle2, 
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
  const [cheeredMap, setCheeredMap] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'iit' | 'bits' | 'iiit'>('all');

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold tracking-wide uppercase mb-3">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              Campus Hall of Fame
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Top Collegiate Builders
            </h2>
            <p className="mt-2 text-base text-zinc-600 max-w-2xl">
              Recognizing high-commitment student squads and top coders turning late-night coffee into deployed products across 180+ partner universities.
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

        {/* Leaderboard Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/90 shadow-xl shadow-zinc-200/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                University Builder Rankings
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">Ranked by verified commits & shipped squad milestones</p>
            </div>

            {/* Campus filter tabs */}
            <div className="inline-flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'all'
                    ? 'bg-white text-zinc-900 shadow-sm font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                All Campuses
              </button>
              <button
                onClick={() => setActiveTab('iit')}
                className={`px-3 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'iit'
                    ? 'bg-white text-zinc-900 shadow-sm font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                IITs
              </button>
              <button
                onClick={() => setActiveTab('bits')}
                className={`px-3 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'bits'
                    ? 'bg-white text-zinc-900 shadow-sm font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                BITS
              </button>
              <button
                onClick={() => setActiveTab('iiit')}
                className={`px-3 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'iiit'
                    ? 'bg-white text-zinc-900 shadow-sm font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                IIITs
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredBuilders.map((builder) => {
              const isCheered = cheeredMap[builder.rank];
              return (
                <div
                  key={builder.name}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50/70 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank badge */}
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-extrabold shrink-0 ${
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
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 shrink-0"
                    />

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-zinc-900 truncate">{builder.name}</p>
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="hidden sm:inline-block text-[10px] font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
                          {builder.role}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                        {builder.college} · <span className="font-semibold text-zinc-700">{builder.shippedSquads} squads shipped</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pl-2">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-zinc-900">{builder.xp.toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Builder XP</p>
                    </div>

                    <button
                      onClick={() => handleCheer(builder.rank)}
                      title="Cheer builder"
                      className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                        isCheered
                          ? 'bg-rose-50 border-rose-200 text-rose-600 scale-105'
                          : 'border-zinc-200 text-zinc-500 hover:text-rose-500 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <span>👏</span>
                      <span className="hidden sm:inline">{isCheered ? 'Cheered' : 'Cheer'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Want to enter the Campus Hall of Fame? Form a team and ship verified milestones.
            </span>
            <Link href="/projects" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
              Browse Open Squad Slots <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
