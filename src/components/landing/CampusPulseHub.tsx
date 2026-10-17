'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Sparkles,
  Activity,
  Users,
  Flame,
  ShieldCheck,
  Share2,
  Search,
  ArrowRight,
  Check,
  Copy,
  Zap,
  Radio,
  School,
  Send,
  UserCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { HomepageSectionToggles } from '@/types/masterControl';
import { Project } from '@/types/database';
import type { User } from '@supabase/supabase-js';

interface CampusPulseHubProps {
  sections: HomepageSectionToggles;
  projects?: Project[];
  user?: User | null;
}

// -------------------------------------------------------------
// Data: Inter-College Leaderboard
// -------------------------------------------------------------
interface CollegeLeaderboardItem {
  rank: number;
  name: string;
  shortCode: string;
  city: string;
  category: 'iit_nit' | 'bits_iiit' | 'state_pvt';
  projectsCount: number;
  hackathonWins: number;
  activeBuilders: number;
  growth: string;
  badge: string;
  color: string;
}

const LEADERBOARD_COLLEGES: CollegeLeaderboardItem[] = [
  {
    rank: 1,
    name: 'Indian Institute of Technology Delhi',
    shortCode: 'IIT Delhi',
    city: 'New Delhi',
    category: 'iit_nit',
    projectsCount: 46,
    hackathonWins: 9,
    activeBuilders: 198,
    growth: '+24% this week',
    badge: '🥇 #1 National Rank',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    rank: 2,
    name: 'BITS Pilani (Pilani & Goa Campuses)',
    shortCode: 'BITS Pilani',
    city: 'Pilani / Goa',
    category: 'bits_iiit',
    projectsCount: 41,
    hackathonWins: 8,
    activeBuilders: 172,
    growth: '+18% this week',
    badge: '🥈 Top Private Innovator',
    color: 'from-slate-300 to-slate-400',
  },
  {
    rank: 3,
    name: 'IIT Bombay',
    shortCode: 'IIT Bombay',
    city: 'Mumbai',
    category: 'iit_nit',
    projectsCount: 38,
    hackathonWins: 7,
    activeBuilders: 164,
    growth: '+15% this week',
    badge: '🥉 Elite Tech Hub',
    color: 'from-amber-700 to-yellow-800',
  },
  {
    rank: 4,
    name: 'International Institute of Information Technology',
    shortCode: 'IIIT Hyderabad',
    city: 'Hyderabad',
    category: 'bits_iiit',
    projectsCount: 34,
    hackathonWins: 8,
    activeBuilders: 145,
    growth: '+28% this week',
    badge: '⚡ Fastest Growing AI Squad',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    rank: 5,
    name: 'Vellore Institute of Technology',
    shortCode: 'VIT Vellore',
    city: 'Vellore',
    category: 'state_pvt',
    projectsCount: 29,
    hackathonWins: 5,
    activeBuilders: 132,
    growth: '+11% this week',
    badge: '🔥 130+ Active Builders',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    rank: 6,
    name: 'Delhi Technological University',
    shortCode: 'DTU Delhi',
    city: 'New Delhi',
    category: 'state_pvt',
    projectsCount: 26,
    hackathonWins: 4,
    activeBuilders: 110,
    growth: '+14% this week',
    badge: '🚀 High Sprint Velocity',
    color: 'from-purple-500 to-violet-600',
  },
];

// -------------------------------------------------------------
// Data: AI Matchmaker Candidate Pool
// -------------------------------------------------------------
interface CandidateMatch {
  id: string;
  name: string;
  role: string;
  college: string;
  skills: string[];
  matchPercent: number;
  reason: string;
  avatar: string;
  availableHours: string;
}

const AI_CANDIDATE_POOL: CandidateMatch[] = [
  {
    id: 'm1',
    name: 'Kavya Nair',
    role: 'Full-Stack & Next.js Lead',
    college: 'IIT Delhi • Computer Science',
    skills: ['Next.js 14', 'TypeScript', 'Tailwind', 'Supabase'],
    matchPercent: 98,
    reason: 'Built 3 production web apps & won HackXcelerate 2025. Highest frontend synergy score.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    availableHours: '20 hrs/week',
  },
  {
    id: 'm2',
    name: 'Tanmay Saxena',
    role: 'AI / PyTorch Specialist',
    college: 'IIIT Hyderabad • Machine Learning Lab',
    skills: ['PyTorch', 'LangChain', 'FastAPI', 'Vector DBs'],
    matchPercent: 96,
    reason: 'Co-authored collegiate ML paper, specialized in low-latency RAG architectures.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    availableHours: '15 hrs/week',
  },
  {
    id: 'm3',
    name: 'Ananya Deshmukh',
    role: 'Product Designer & UI/UX',
    college: 'BITS Pilani • Design Studio',
    skills: ['Figma', 'Prototyping', 'Design Systems', 'User Research'],
    matchPercent: 94,
    reason: 'Designed top-3 hackathon winning submission at Smart India Hackathon. Crisp design ethos.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    availableHours: '18 hrs/week',
  },
  {
    id: 'm4',
    name: 'Dhruv Rao',
    role: 'Backend & Cloud Architect',
    college: 'IIT Bombay • Electrical Eng',
    skills: ['Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis'],
    matchPercent: 91,
    reason: 'High-throughput microservices specialist. Ready for fast hackathon deployment.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    availableHours: '25 hrs/week',
  },
];

// -------------------------------------------------------------
// Data: Live Campus Pulse Activity Stream
// -------------------------------------------------------------
interface PulseEvent {
  id: string;
  avatar: string;
  name: string;
  college: string;
  action: string;
  target: string;
  timeAgo: string;
  tag: string;
}

const INITIAL_PULSE_EVENTS: PulseEvent[] = [
  {
    id: 'e1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    name: 'Aarav S.',
    college: 'IIIT Hyderabad',
    action: 'joined hackathon sprint team',
    target: 'NeuroPulse Vision',
    timeAgo: 'Just now',
    tag: 'Hackathon Squad',
  },
  {
    id: 'e2',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    name: 'Priya P.',
    college: 'BITS Pilani',
    action: 'published project milestone',
    target: 'CampusTransit v2.0 Architecture',
    timeAgo: '3m ago',
    tag: 'Verified Milestone',
  },
  {
    id: 'e3',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    name: 'Rohan V.',
    college: 'IIT Delhi',
    action: 'broadcasted live availability for',
    target: 'AI & Healthcare Sprints',
    timeAgo: '7m ago',
    tag: 'Live Builder',
  },
  {
    id: 'e4',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    name: 'Dr. Sarah Chen',
    college: 'Faculty Mentor • IIT Bombay',
    action: 'endorsed engineering milestone for',
    target: 'AgriVision Robotics',
    timeAgo: '14m ago',
    tag: 'Faculty Endorsed',
  },
];

export function CampusPulseHub({ sections, projects, user }: CampusPulseHubProps) {
  // Check master and feature toggles
  const isMasterEnabled = sections.campusPulse !== false;
  const isFeature1Live = sections.pulseLeaderboard !== false;
  const isFeature2Live = sections.pulseAiMatchmaker !== false;
  const isFeature3Live = sections.pulseLivePresence !== false;

  // Build the list of active live tabs
  const availableTabs: { id: 'leaderboard' | 'matchmaker' | 'presence'; label: string; icon: any; badge?: string }[] = [];
  if (isFeature1Live) {
    availableTabs.push({ id: 'leaderboard', label: '1. Campus Leaderboard', icon: Trophy, badge: 'Inter-College' });
  }
  if (isFeature2Live) {
    availableTabs.push({ id: 'matchmaker', label: '2. AI Dream Team', icon: Sparkles, badge: 'Smart Match' });
  }
  if (isFeature3Live) {
    availableTabs.push({ id: 'presence', label: '3. Live Campus Pulse', icon: Radio, badge: 'Live Realtime' });
  }

  // Active subtab
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'matchmaker' | 'presence'>('leaderboard');

  // Sync activeTab if current tab gets disabled by admin
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  // -------------------------------------------------------------
  // Feature 1 State: Search & Share Card Generator
  // -------------------------------------------------------------
  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState<'all' | 'iit_nit' | 'bits_iiit' | 'state_pvt'>('all');
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardName, setCardName] = useState(user?.user_metadata?.full_name || 'Aryan Sharma');
  const [cardCollege, setCardCollege] = useState('IIT Delhi • B.Tech CSE');
  const [cardRole, setCardRole] = useState('Full-Stack Engineer & Hackathon Builder');

  // -------------------------------------------------------------
  // Feature 2 State: AI Matchmaker
  // -------------------------------------------------------------
  const [projectIdea, setProjectIdea] = useState('Autonomous AI Drone for Precision Crop Health');
  const [targetTimeline, setTargetTimeline] = useState('Hackathon Sprint (48 Hours)');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Frontend (Next.js)', 'AI / PyTorch Specialist']);
  const [isMatching, setIsMatching] = useState(false);
  const [matchStep, setMatchStep] = useState(0);
  const [matchedResults, setMatchedResults] = useState<CandidateMatch[]>(AI_CANDIDATE_POOL.slice(0, 3));
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  const toggleRole = (r: string) => {
    setSelectedRoles((prev) =>
      prev.includes(r) ? prev.filter((item) => item !== r) : [...prev, r]
    );
  };

  const handleRunAiMatch = () => {
    setIsMatching(true);
    setMatchStep(1);
    setTimeout(() => {
      setMatchStep(2);
      setTimeout(() => {
        setMatchStep(3);
        setTimeout(() => {
          setIsMatching(false);
          setMatchStep(0);
          // Shuffle or tailor matches
          const shuffled = [...AI_CANDIDATE_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
          setMatchedResults(shuffled);
        }, 600);
      }, 700);
    }, 700);
  };

  const handleInviteCandidate = (id: string) => {
    setInvitedIds((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(id);
      return nextSet;
    });
  };

  // -------------------------------------------------------------
  // Feature 3 State: Live Presence & Ticker
  // -------------------------------------------------------------
  const [pulseEvents, setPulseEvents] = useState<PulseEvent[]>(INITIAL_PULSE_EVENTS);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [activeSprintRoom, setActiveSprintRoom] = useState<string | null>(null);

  // Auto-simulate new live campus events every 8 seconds
  useEffect(() => {
    if (!isFeature3Live) return;
    const interval = setInterval(() => {
      const colleges = ['IIT Bombay', 'BITS Pilani', 'IIIT Hyderabad', 'DTU Delhi', 'VIT Vellore', 'IIT Kharagpur'];
      const actions = [
        { action: 'joined a hackathon sprint team', target: 'ZeroKnowledge Voting Engine', tag: 'Hackathon Squad' },
        { action: 'opened collaboration for', target: 'Decentralized Identity on EduChain', tag: 'Open Project' },
        { action: 'verified GitHub repository proof for', target: 'AutoDoc AI Summarizer', tag: 'Verified Proof' },
        { action: 'broadcasted active coding sprint in', target: 'Room B: Web3 & Smart Contracts', tag: 'Live Room' },
      ];
      const names = ['Kunal T.', 'Sneha M.', 'Vikas K.', 'Rhea B.', 'Pranav G.'];
      const randomCollege = colleges[Math.floor(Math.random() * colleges.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];

      const newEvt: PulseEvent = {
        id: 'evt-' + Date.now(),
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50)}?w=150&auto=format&fit=crop&q=80`,
        name: randomName,
        college: randomCollege,
        action: randomAction.action,
        target: randomAction.target,
        timeAgo: 'Just now',
        tag: randomAction.tag,
      };

      setPulseEvents((prev) => [newEvt, ...prev.slice(0, 5)]);
    }, 9000);

    return () => clearInterval(interval);
  }, [isFeature3Live]);

  // If the entire section is toggled off in admin or no features are live, do not render
  if (!isMasterEnabled || availableTabs.length === 0) {
    return null;
  }

  // Filtered leaderboard colleges
  const filteredColleges = LEADERBOARD_COLLEGES.filter((c) => {
    const matchesFilter = collegeFilter === 'all' || c.category === collegeFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
      c.shortCode.toLowerCase().includes(collegeSearch.toLowerCase()) ||
      c.city.toLowerCase().includes(collegeSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section className="relative py-16 sm:py-24 bg-slate-900 border-y border-slate-800 text-white overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-500/10 via-[#761329]/15 to-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Unified Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LINKORA PULSE • THE COLLEGIATE NETWORK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {sections.pulseTitle || 'Campus Innovation Hub'}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {sections.pulseSubtitle ||
                'Live university rankings, AI dream team matchmaking, and real-time collegiate sprint presence in one consolidated hub.'}
            </p>
          </div>

          {/* Interactive Feature Switcher Pills (Only shows features that are set to Live by Admin) */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md self-start md:self-auto overflow-x-auto max-w-full">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODULE 1: INTER-COLLEGE LEADERBOARDS & VIRAL CAMPUS SHOWCASE */}
        {/* ========================================================================= */}
        {activeTab === 'leaderboard' && isFeature1Live && (
          <div className="mt-8 space-y-8 animate-fadeIn">
            {/* Top Toolbar: Search, Filters & Share Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={collegeSearch}
                    onChange={(e) => setCollegeSearch(e.target.value)}
                    placeholder="Search campus (e.g. IIT Delhi, BITS, VIT)..."
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all' as const, label: 'All Campuses' },
                  { id: 'iit_nit' as const, label: 'IITs & NITs' },
                  { id: 'bits_iiit' as const, label: 'BITS & IIITs' },
                  { id: 'state_pvt' as const, label: 'Tech Universities' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCollegeFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      collegeFilter === f.id
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}

                <button
                  onClick={() => setShowCardModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-600/30 transition shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Generate My Campus Card</span>
                </button>
              </div>
            </div>

            {/* University Rankings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredColleges.map((col) => (
                <div
                  key={col.shortCode}
                  className="group relative p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col justify-between"
                >
                  <div>
                    {/* Rank Badge & Growth Indicator */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                      <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        {col.badge}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {col.growth}
                      </span>
                    </div>

                    {/* College Title */}
                    <div className="mt-4 space-y-1">
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {col.shortCode}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{col.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">📍 {col.city}</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div>
                        <div className="text-base font-extrabold text-white">{col.projectsCount}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Projects</div>
                      </div>
                      <div>
                        <div className="text-base font-extrabold text-amber-400">{col.hackathonWins}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Hack Wins</div>
                      </div>
                      <div>
                        <div className="text-base font-extrabold text-emerald-400">{col.activeBuilders}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Builders</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-5 pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">Rank #{col.rank} in India</span>
                    <Link
                      href={`/explore?college=${encodeURIComponent(col.shortCode)}`}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Explore Squads</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: Shareable Campus Card */}
            {showCardModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-bold text-white">Your Collegiate Proof-of-Work Card</h3>
                    </div>
                    <button
                      onClick={() => setShowCardModal(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Card Visual Preview */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/60 border border-emerald-500/30 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                          L
                        </span>
                        <span className="font-extrabold text-sm text-white tracking-wider">LINKORA</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        VERIFIED STUDENT BUILDER
                      </span>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-xl font-extrabold text-white">{cardName}</h4>
                      <p className="text-xs text-emerald-400 font-medium">{cardRole}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">🏛️ {cardCollege}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
                      <span>linkora.in/p/{cardName.toLowerCase().replace(/\s+/g, '')}</span>
                      <span className="text-emerald-400 font-bold">Top 5% Collegiate Peer</span>
                    </div>
                  </div>

                  {/* Customization Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">College & Major</label>
                        <input
                          type="text"
                          value={cardCollege}
                          onChange={(e) => setCardCollege(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Primary Role</label>
                        <input
                          type="text"
                          value={cardRole}
                          onChange={(e) => setCardRole(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          `Check out my verified Linkora Student Builder profile from ${cardCollege}: https://linkora-link.online/teammates`
                        );
                        setCopiedShareLink(true);
                        setTimeout(() => setCopiedShareLink(false), 2000);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      {copiedShareLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedShareLink ? 'Link Copied to Clipboard!' : 'Copy Share Link'}</span>
                    </button>
                    <button
                      onClick={() => setShowCardModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: AI "DREAM TEAM" SMART MATCHMAKER */}
        {/* ========================================================================= */}
        {activeTab === 'matchmaker' && isFeature2Live && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Left Column: Project Requirements Input */}
            <div className="lg:col-span-5 space-y-6 p-6 rounded-3xl bg-slate-950/70 border border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  AI SQUAD ENGINE
                </span>
                <h3 className="text-lg font-bold text-white">Assemble Your Ideal Hackathon Squad</h3>
                <p className="text-xs text-slate-400">
                  Tell Linkora AI what you are building. It queries the verified student talent graph to recommend the
                  highest compatibility partners.
                </p>
              </div>

              {/* Project Concept Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">What are you building?</label>
                <textarea
                  rows={3}
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  placeholder="e.g. Decentralized healthcare record system with zero-knowledge verification..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">Suggestions:</span>
                  {[
                    'AI Medical Scanner',
                    'Smart Transit App',
                    'ZeroKnowledge Voting',
                    'Autonomous Drone',
                  ].map((sug) => (
                    <button
                      key={sug}
                      onClick={() => setProjectIdea(sug)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-850 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sprint Timeline */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sprint Timeline</label>
                <select
                  value={targetTimeline}
                  onChange={(e) => setTargetTimeline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option>Hackathon Sprint (48 Hours)</option>
                  <option>1-Month Milestone Project</option>
                  <option>Semester-Long Research Team</option>
                  <option>Startup MVP Launch</option>
                </select>
              </div>

              {/* Roles Needed */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Roles Needed (Select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Frontend (Next.js)',
                    'AI / PyTorch Specialist',
                    'UI/UX Designer',
                    'Backend / Supabase',
                    'Mobile (Flutter / RN)',
                    'Hardware / Robotics',
                  ].map((role) => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Run AI Matchmaker Button */}
              <button
                onClick={handleRunAiMatch}
                disabled={isMatching}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isMatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>
                      {matchStep === 1
                        ? 'Analyzing project scope...'
                        : matchStep === 2
                        ? 'Scoring skill synergy & availability...'
                        : 'Finalizing dream team...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>⚡ Run AI Dream Team Match</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: AI Matched Candidates Cards */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Top Recommended Teammates for Your Squad</h4>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {matchedResults.length} matches • 90%+ compatibility
                </span>
              </div>

              <div className="space-y-3.5">
                {matchedResults.map((cand) => {
                  const isInvited = invitedIds.has(cand.id);
                  return (
                    <div
                      key={cand.id}
                      className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-sm font-bold text-white">{cand.name}</h5>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {cand.matchPercent}% Match
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ⚡ {cand.availableHours}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">{cand.role}</p>
                          <p className="text-[11px] text-slate-400 font-mono">🏛️ {cand.college}</p>
                          <p className="text-xs text-slate-400 pt-1 leading-relaxed">{cand.reason}</p>

                          {/* Skill Tags */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-2">
                            {cand.skills.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Invite Action */}
                      <div className="sm:self-center shrink-0">
                        <button
                          onClick={() => handleInviteCandidate(cand.id)}
                          disabled={isInvited}
                          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            isInvited
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          }`}
                        >
                          {isInvited ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Invite Sent!</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Invite to Squad</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: LIVE CAMPUS ACTIVITY & REAL-TIME PRESENCE */}
        {/* ========================================================================= */}
        {activeTab === 'presence' && isFeature3Live && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Left Column: Live Pulse Stream */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h4 className="text-sm font-bold text-white">Live Activity Stream (Real-Time Campus Feed)</h4>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ● 142 Active Builders Online
                </span>
              </div>

              <div className="space-y-3">
                {pulseEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4 transition hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={evt.avatar}
                        alt={evt.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{evt.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">({evt.college})</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {evt.action}{' '}
                          <span className="font-semibold text-emerald-400">{evt.target}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400">
                        {evt.tag}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">{evt.timeAgo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Live Sprint Rooms & Broadcast My Availability */}
            <div className="lg:col-span-5 space-y-6">
              {/* Broadcast Availability Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 to-emerald-950/40 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Broadcast Your Live Availability</h4>
                  </div>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isBroadcasting ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Signal to team leaders that you are online and ready to join an active hackathon sprint or codebase.
                </p>

                <button
                  onClick={() => setIsBroadcasting(!isBroadcasting)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isBroadcasting
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>
                    {isBroadcasting
                      ? '🟢 You are Broadcasting as "Available for Sprint"'
                      : 'Broadcast "Looking for Team" Status'}
                  </span>
                </button>
              </div>

              {/* Active Collegiate Sprint Rooms */}
              <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Open Collegiate Sprint Rooms</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">Live</span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'r1', name: 'Web3 & Solana Hack Sprint', activeUsers: 14, topic: 'Smart Contracts & Zero-Knowledge' },
                    { id: 'r2', name: 'GenAI & LangChain Workroom', activeUsers: 22, topic: 'Multi-Agent Autonomous RAG' },
                    { id: 'r3', name: 'Open Source Next.js Lab', activeUsers: 19, topic: 'App Router & High-Performance UI' },
                  ].map((room) => (
                    <div
                      key={room.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">{room.name}</div>
                        <div className="text-[11px] text-slate-400">{room.topic}</div>
                      </div>
                      <Link
                        href="/teammates"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs font-semibold transition shrink-0"
                      >
                        Join Room ({room.activeUsers})
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
