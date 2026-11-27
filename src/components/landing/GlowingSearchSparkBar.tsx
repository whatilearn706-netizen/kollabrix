'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
  Trophy,
  Terminal,
  Lightbulb,
  Swords,
  Clock,
  Compass,
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  category: 'hackathon' | 'icpc' | 'problem' | 'war' | 'tool' | 'community';
  categoryLabel: string;
  snippet: string;
  href: string;
  tags?: string[];
  tone: 'amber' | 'cyan' | 'violet' | 'brand' | 'rose' | 'emerald';
}

const STATIC_PLATFORM_CATALOG: SearchItem[] = [
  // 🏆 Curated Hackathons & Live Competitions
  {
    id: 'h-sih',
    title: 'Smart India Hackathon (SIH 2026)',
    category: 'hackathon',
    categoryLabel: 'Hackathon',
    snippet: '₹1,00,000 per problem statement • Ministry of Education & AICTE nationwide challenge',
    href: '/hackathons',
    tags: ['smart', 'india', 'sih', '2026', 'hackathon', 'aicte', 'ministry', 'national'],
    tone: 'amber',
  },
  {
    id: 'h-google',
    title: 'Google Solution Challenge 2026',
    category: 'hackathon',
    categoryLabel: 'Global Hackathon',
    snippet: '$3,000 USD prizes + Google Engineering 1:1 tech mentorship & Cloud credits',
    href: '/hackathons',
    tags: ['google', 'solution', 'challenge', 'gdsc', 'ai', 'cloud', 'global'],
    tone: 'cyan',
  },
  {
    id: 'h-ethindia',
    title: 'ETHIndia 2026',
    category: 'hackathon',
    categoryLabel: 'Web3 Hackathon',
    snippet: '$100,000+ USD in bounties • Devfolio & Ethereum Foundation collegiate builder track',
    href: '/hackathons',
    tags: ['ethindia', 'ethereum', 'devfolio', 'web3', 'bounties', 'crypto', 'bangalore'],
    tone: 'violet',
  },
  {
    id: 'h-svyasa',
    title: 'S-VYASA Collegiate Hackathon 2026',
    category: 'hackathon',
    categoryLabel: 'Hackathon',
    snippet: 'Campus Turing Lab • ₹50,000 Prize Pool • 2-4 Builders Squad',
    href: '/hackathons',
    tags: ['hackathon', 'svyasa', 's-vyasa', 'college', 'offline', 'bounty', 'turing'],
    tone: 'amber',
  },
  {
    id: 'h-hackmit',
    title: 'HackMIT 2026 Collegiate Hackathon',
    category: 'hackathon',
    categoryLabel: 'Collegiate Hackathon',
    snippet: '$30,000+ USD in hardware kits, computing credits & rapid prototyping tracks',
    href: '/hackathons',
    tags: ['hackmit', 'mit', 'collegiate', 'hardware', 'ai', 'prototyping'],
    tone: 'cyan',
  },
  {
    id: 'h-all',
    title: 'All Active College Hackathons',
    category: 'hackathon',
    categoryLabel: 'Directory',
    snippet: 'Explore live, upcoming & open collegiate hackathons across 100+ universities',
    href: '/hackathons',
    tags: ['hackathons', 'competitions', 'events', 'prizes', 'cash', 'teams', 'all'],
    tone: 'amber',
  },
  {
    id: 'h-create',
    title: 'Host / Publish a College Hackathon',
    category: 'hackathon',
    categoryLabel: 'Creator',
    snippet: 'Faculty & organizers: launch your official college hackathon with automated judging',
    href: '/hackathons/new',
    tags: ['create', 'host', 'organize', 'new hackathon', 'faculty'],
    tone: 'amber',
  },

  // 💻 Competitive Practice & ICPC
  {
    id: 'icpc-arena',
    title: 'Competitive Practice & ICPC Arena',
    category: 'icpc',
    categoryLabel: 'ICPC Arena',
    snippet: 'Placement OAs & ICPC Speedruns with AI Proctoring & Dual-Stream Security',
    href: '/icpc',
    tags: ['icpc', 'oa', 'competitive', 'coding', 'practice', 'algorithms', 'proctor', 'leetcode', 'codeforces'],
    tone: 'cyan',
  },
  {
    id: 'icpc-speedrun',
    title: 'Online Assessment (OA) Speedrun Mode',
    category: 'icpc',
    categoryLabel: 'Placement OA',
    snippet: 'Timed OA challenges modelled after Google, Amazon, and Microsoft hiring tests',
    href: '/icpc',
    tags: ['oa', 'placement', 'interview', 'speedrun', 'timed', 'google', 'amazon', 'faang'],
    tone: 'cyan',
  },
  {
    id: 'icpc-dsa',
    title: 'Data Structures & Algorithms Problem Bank',
    category: 'icpc',
    categoryLabel: 'Practice Bank',
    snippet: 'Arrays, Strings, Dynamic Programming, Graphs & Trees with live browser code execution',
    href: '/icpc',
    tags: ['dsa', 'algorithms', 'data structures', 'arrays', 'graphs', 'dynamic programming', 'trees'],
    tone: 'cyan',
  },

  // 💡 Faculty Problems & Academics
  {
    id: 'faculty-problems',
    title: 'Faculty Problems & Engineering Briefs',
    category: 'problem',
    categoryLabel: 'Faculty Brief',
    snippet: 'Solve verified professor challenges with peer code reviews and faculty grading',
    href: '/problems',
    tags: ['problems', 'faculty', 'professor', 'briefs', 'engineering', 'academics', 'grading'],
    tone: 'violet',
  },
  {
    id: 'faculty-portal',
    title: 'Faculty Educator Desk & Watchdog',
    category: 'problem',
    categoryLabel: 'Portal',
    snippet: 'Live anti-cheat watchdog, contest monitor, problem creator, and student scoring',
    href: '/teacher/dashboard',
    tags: ['faculty', 'teacher', 'desk', 'portal', 'watchdog', 'grading', 'proctor'],
    tone: 'violet',
  },

  // ⚔️ Campus War
  {
    id: 'war-arena',
    title: 'Campus War ⚔️ Inter-College Clash',
    category: 'war',
    categoryLabel: 'Campus War',
    snippet: 'Rival universities compete for bounty pools, campus glory, and territory rankings',
    href: '/war',
    tags: ['war', 'campus', 'clash', 'inter-college', 'bounty', 'rivalry', 'battle'],
    tone: 'brand',
  },

  // ⚡ Tools & Platform Hubs
  {
    id: 'tool-spark',
    title: 'KΛ ΛI',
    category: 'tool',
    categoryLabel: 'KΛ-1 · KΛ-Pro',
    snippet: 'Ask live platform intelligence, debug code, or generate hackathon blueprints in 0.04s',
    href: '/spark',
    tags: ['spark', 'ka', 'kλ', 'ai', 'ai spark', 'generator', 'blueprint', 'idea', 'prompt', 'architecture'],
    tone: 'cyan',
  },
  {
    id: 'tool-deadlines',
    title: 'Deadlines Radar & Hackathon Clock',
    category: 'tool',
    categoryLabel: 'Radar',
    snippet: 'Real-time countdowns for registration closes, project submission windows & demo days',
    href: '/deadlines',
    tags: ['deadlines', 'radar', 'countdown', 'dates', 'time', 'reminders'],
    tone: 'rose',
  },
  {
    id: 'tool-perks',
    title: 'Student Developer Perks Vault',
    category: 'tool',
    categoryLabel: 'Perks',
    snippet: 'Free cloud credits, GitHub tools, domain vouchers, and API allowances for builders',
    href: '/perks',
    tags: ['perks', 'credits', 'free', 'tools', 'cloud', 'aws', 'github', 'voucher'],
    tone: 'emerald',
  },
  {
    id: 'tool-starter-kits',
    title: 'Hackathon Starter Kits & Boilerplates',
    category: 'tool',
    categoryLabel: 'Templates',
    snippet: 'Battle-tested Next.js, FastAPI, AI agent, and Web3 starter templates with auth ready',
    href: '/starter-kits',
    tags: ['starter', 'kits', 'templates', 'boilerplate', 'nextjs', 'fastapi', 'code'],
    tone: 'brand',
  },
  {
    id: 'tool-resources',
    title: 'Resources Hub & Compilers',
    category: 'tool',
    categoryLabel: 'Resources',
    snippet: 'Curated developer roadmaps, interactive online compilers, and API design handbooks',
    href: '/resources',
    tags: ['resources', 'compilers', 'roadmaps', 'docs', 'guides', 'handbook'],
    tone: 'cyan',
  },

  // 👥 Teammates & Community
  {
    id: 'team-match',
    title: 'Campus Teammates Matchmaker',
    category: 'community',
    categoryLabel: 'Squads',
    snippet: 'Find frontend, backend, AI, and design teammates matching your college & tech stack',
    href: '/teammates',
    tags: ['teammates', 'team', 'squad', 'matchmaker', 'partners', 'collaborators', 'designer', 'developer'],
    tone: 'emerald',
  },
  {
    id: 'community-explore',
    title: 'Explore Projects & Open Repositories',
    category: 'community',
    categoryLabel: 'Showcase',
    snippet: 'Discover verified student projects with live demos, pitch decks, and GitHub commit logs',
    href: '/explore',
    tags: ['explore', 'projects', 'github', 'demos', 'portfolio', 'showcase'],
    tone: 'amber',
  },
  {
    id: 'community-leaderboard',
    title: 'Collegiate Leaderboard & Rankings',
    category: 'community',
    categoryLabel: 'Leaderboard',
    snippet: 'Top campus rankings based on shipped projects, hackathon victories & verified code',
    href: '/leaderboard',
    tags: ['leaderboard', 'rankings', 'top', 'colleges', 'students', 'score'],
    tone: 'amber',
  },
];

const TONE_CLASSES = {
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  brand: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

// Autocomplete match highlighter helper (Google-style)
function renderHighlightedText(text: string, q: string) {
  const trimmed = q.trim();
  if (!trimmed) return <span className="text-white font-medium">{text}</span>;

  const lower = text.toLowerCase();
  const queryLower = trimmed.toLowerCase();
  const idx = lower.indexOf(queryLower);
  if (idx === -1) return <span className="text-white font-medium">{text}</span>;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + trimmed.length);
  const after = text.slice(idx + trimmed.length);

  return (
    <span className="text-slate-200">
      {before}
      <span className="font-bold text-white bg-cyan-500/25 text-cyan-200 px-1 py-0.5 rounded">
        {match}
      </span>
      {after}
    </span>
  );
}

export function GlowingSearchSparkBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicCatalog, setDynamicCatalog] = useState<SearchItem[]>(STATIC_PLATFORM_CATALOG);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasLoadedApi = useRef(false);

  // Lazy load live public hackathons when user interacts or after idle delay
  const loadPublicHackathons = async () => {
    if (hasLoadedApi.current) return;
    hasLoadedApi.current = true;
    try {
      const res = await fetch('/api/hackathons');
      if (!res.ok) return;
      const data = await res.json();
      const list: any[] = Array.isArray(data) ? data : data.hackathons || [];
      if (!Array.isArray(list) || list.length === 0) return;

      const liveHackathons: SearchItem[] = list.slice(0, 15).map((h: any) => ({
        id: `h-dyn-${h.id}`,
        title: h.title || 'Collegiate Hackathon',
        category: 'hackathon',
        categoryLabel: h.college ? `${h.college} • Hackathon` : 'College Hackathon',
        snippet: `${h.location || 'Online'} • ${h.prizes || 'Faculty Mentorship & Awards'} • ${h.theme || 'Open Innovation'}`,
        href: `/hackathons/${h.id}`,
        tags: [
          'hackathon',
          h.title?.toLowerCase() || '',
          h.college?.toLowerCase() || '',
          h.theme?.toLowerCase() || '',
          h.location?.toLowerCase() || '',
        ],
        tone: 'amber',
      }));

      setDynamicCatalog((prev) => {
        const combined = [...liveHackathons, ...prev];
        const seen = new Set();
        return combined.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      });
    } catch (err) {
      // Fallback to static catalog seamlessly
    }
  };

  useEffect(() => {
    // Defer network request until browser is completely idle
    const timer = setTimeout(() => {
      loadPublicHackathons();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Filter search results in real time with priority sorting
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return dynamicCatalog
      .filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const snippetMatch = item.snippet.toLowerCase().includes(q);
        const categoryMatch = item.categoryLabel.toLowerCase().includes(q);
        const tagMatch = item.tags ? item.tags.some((t) => t.includes(q)) : false;
        return titleMatch || snippetMatch || categoryMatch || tagMatch;
      })
      .sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(q);
        const bTitle = b.title.toLowerCase().includes(q);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      })
      .slice(0, 7);
  }, [query, dynamicCatalog]);

  // Active list is strictly the filtered results for what the student types
  const activeList = filteredResults;

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation inside search dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && query.trim().length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (activeList.length > 0 ? (prev + 1) % activeList.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        activeList.length > 0 ? (prev - 1 + activeList.length) % activeList.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeList.length > 0 && activeList[selectedIndex]) {
        router.push(activeList[selectedIndex].href);
        setIsOpen(false);
      } else if (query.trim()) {
        executeGlobalSearch(query.trim());
      }
    }
  };

  const executeGlobalSearch = (searchQuery: string) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    if (q.includes('hackathon')) {
      router.push(`/hackathons?q=${encodeURIComponent(searchQuery.trim())}`);
    } else if (q.includes('icpc') || q.includes('oa') || q.includes('practice')) {
      router.push(`/icpc?q=${encodeURIComponent(searchQuery.trim())}`);
    } else if (q.includes('problem') || q.includes('faculty')) {
      router.push(`/problems?q=${encodeURIComponent(searchQuery.trim())}`);
    } else if (q.includes('war') || q.includes('clash')) {
      router.push(`/war`);
    } else if (q.includes('spark') || q.includes('ai')) {
      router.push(`/spark`);
    } else {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    setIsOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeList.length > 0 && selectedIndex < activeList.length) {
      router.push(activeList[selectedIndex].href);
      setIsOpen(false);
    } else if (query.trim()) {
      executeGlobalSearch(query.trim());
    }
  };

  return (
    <div ref={containerRef} className="relative group max-w-2xl w-full mx-auto select-none">
      {/* 1. Hardware-Accelerated Ambient Glow Ring */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600/25 via-fuchsia-600/25 to-cyan-500/25 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* 2. Razor-Sharp Outer Pill Container with Rotating Specular Light Beam */}
      <div className="relative rounded-full p-[1.5px] overflow-hidden bg-slate-800/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:shadow-[0_15px_45px_rgba(139,92,246,0.3)]">
        {/* Continuous Lightning Beam */}
        <div
          className="absolute -inset-[150%] aspect-square animate-border-lightning pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #8B5CF6 295deg, #EC4899 325deg, #FFFFFF 350deg, transparent 360deg)',
          }}
        />

        {/* 3. Deep Pitch-Black Obsidian Pill Body (Inner Core) */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center justify-between h-13 sm:h-14 px-3 sm:px-4 rounded-full bg-[#07080D]/95 backdrop-blur-2xl z-10 transition-colors"
        >
          {/* Left: Search Icon + Input Field */}
          <div className="flex items-center gap-3 flex-1 min-w-0 pl-1.5 sm:pl-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={() => {
                loadPublicHackathons();
                if (query.trim().length > 0) setIsOpen(true);
              }}
              onChange={(e) => {
                loadPublicHackathons();
                const val = e.target.value;
                setQuery(val);
                setIsOpen(val.trim().length > 0);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search hackathons, practice, problems, campus bounties..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400/80 focus:outline-none focus:placeholder-slate-500 font-sans tracking-wide truncate"
              aria-label="Search across Kollabrix"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                  setSelectedIndex(0);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Middle: Crisp Translucent Vertical Divider Line */}
          <div className="h-6 w-[1.5px] bg-gradient-to-b from-white/5 via-white/25 to-white/5 mx-2 sm:mx-3 shrink-0" />

          {/* Right: Dedicated KΛ ΛI Action Button with ⌘K Badge */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              window.open('/spark', '_blank', 'noopener,noreferrer');
            }}
            className="group/spark inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-violet-600/35 via-fuchsia-600/35 to-cyan-500/35 hover:from-violet-500/50 hover:via-fuchsia-500/50 hover:to-cyan-400/50 border border-white/20 hover:border-cyan-400/60 text-white transition-all duration-300 shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_24px_rgba(6,182,212,0.6)] active:scale-95 cursor-pointer"
            title="Launch KΛ ΛI (⌘K)"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 group-hover/spark:rotate-12 transition-transform duration-300" />
            <span className="font-heading font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-transparent">
              KΛ ΛI
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-black/60 border border-white/20 text-[10px] font-mono font-semibold text-slate-300 group-hover/spark:text-white group-hover/spark:border-cyan-400/50 transition-colors">
              ⌘K
            </kbd>
          </button>
        </form>
      </div>

      {/* 5. GOOGLE-STYLE SEARCH AUTOCOMPLETE & LIVE PREDICTIONS DROPDOWN (ONLY SHOWN WHEN STUDENT TYPES) */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2.5 p-2 rounded-2xl bg-[#080A10]/98 backdrop-blur-3xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.95)] z-50 text-left animate-in fade-in zoom-in-95 duration-150">
          {/* Header Row */}
          <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2 mb-1">
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kollabrix Search Results</span>
            </div>
            <span className="text-[9px] text-slate-500 lowercase">
              {filteredResults.length} {filteredResults.length === 1 ? 'match' : 'matches'}
            </span>
          </div>

          {/* Autocomplete Predictions List */}
          {filteredResults.length > 0 && (
            <div className="space-y-0.5 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
              {filteredResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      router.push(item.href);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group flex items-center justify-between gap-3 px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border border-white/15 shadow-sm'
                        : 'bg-transparent hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-white/5 text-slate-400 group-hover:text-cyan-300'
                        }`}
                      >
                        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm truncate">
                          {renderHighlightedText(item.title, query)}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.snippet}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${TONE_CLASSES[item.tone]}`}
                      >
                        {item.categoryLabel}
                      </span>
                      <ArrowRight
                        className={`w-3.5 h-3.5 text-slate-400 transition-all ${
                          isSelected ? 'opacity-100 translate-x-0.5 text-cyan-300' : 'opacity-0 group-hover:opacity-60'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STATE B: No direct matches found */}
          {filteredResults.length === 0 && (
            <div className="px-4 py-4 text-center">
              <Search className="w-6 h-6 text-slate-500 mx-auto mb-2 opacity-75" />
              <p className="text-xs font-semibold text-slate-300">
                No direct match for &quot;{query}&quot;
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Press Enter to search all collegiate repositories, projects, and hackathon teams in the Explore hub.
              </p>
            </div>
          )}

          {/* Dedicated Google Search Action Row */}
          <div
            onClick={() => {
              executeGlobalSearch(query.trim());
            }}
            className="flex items-center justify-between px-3 py-2 mt-1 rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-xs text-slate-300 truncate">
                Search all Kollabrix for <span className="font-bold text-white">&quot;{query}&quot;</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 shrink-0">
              <span className="hidden sm:inline">Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-white font-bold text-[10px]">
                ↵ Enter
              </kbd>
            </div>
          </div>

          {/* Google-Style Footer with Privacy Safety Guarantee */}
          <div className="pt-2 border-t border-white/5 mt-1 px-3 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Public Campus Index • Private Student Data Excluded</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">
              <kbd className="font-mono text-slate-400">↑↓</kbd> navigate • <kbd className="font-mono text-slate-400">esc</kbd> close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
