'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Trophy,
  Terminal,
  Lightbulb,
  Swords,
  Clock,
  Gift,
  Users,
  Compass,
  ArrowRight,
  X,
  ExternalLink,
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
  // 🏆 Hackathons & Competitions
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
    id: 'h-all',
    title: 'All Active College Hackathons',
    category: 'hackathon',
    categoryLabel: 'Directory',
    snippet: 'Explore live, upcoming & open collegiate hackathons across 100+ universities',
    href: '/hackathons',
    tags: ['hackathons', 'competitions', 'events', 'prizes', 'cash', 'teams'],
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
    tags: ['oa', 'placement', 'interview', 'speedrun', 'timed', 'google', 'amazon'],
    tone: 'cyan',
  },

  // 💡 Faculty Problems
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
    title: 'AI Spark Studio',
    category: 'tool',
    categoryLabel: 'AI Engine',
    snippet: 'Generate production-ready hackathon architecture and code blueprints in 0.04s',
    href: '/spark',
    tags: ['spark', 'ai', 'ai spark', 'generator', 'blueprint', 'idea', 'prompt'],
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

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  hackathon: Trophy,
  icpc: Terminal,
  problem: Lightbulb,
  war: Swords,
  tool: Sparkles,
  community: Users,
};

export function GlowingSearchSparkBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicCatalog, setDynamicCatalog] = useState<SearchItem[]>(STATIC_PLATFORM_CATALOG);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load live public hackathons from /api/hackathons on mount
  useEffect(() => {
    let isMounted = true;
    async function loadPublicHackathons() {
      try {
        const res = await fetch('/api/hackathons');
        if (!res.ok) return;
        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : data.hackathons || [];
        if (!isMounted || !Array.isArray(list) || list.length === 0) return;

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
          // Deduplicate by ID
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
    }
    loadPublicHackathons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter search results in real time
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
      .slice(0, 8);
  }, [query, dynamicCatalog]);

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
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length > 0 ? (prev + 1) % filteredResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredResults.length > 0 ? (prev - 1 + filteredResults.length) % filteredResults.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
        router.push(filteredResults[selectedIndex].href);
        setIsOpen(false);
      } else if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (q.includes('hackathon')) {
          router.push(`/hackathons?q=${encodeURIComponent(query.trim())}`);
        } else if (q.includes('icpc') || q.includes('oa') || q.includes('code')) {
          router.push(`/icpc?q=${encodeURIComponent(query.trim())}`);
        } else if (q.includes('problem')) {
          router.push(`/problems?q=${encodeURIComponent(query.trim())}`);
        } else {
          router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
        }
        setIsOpen(false);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredResults.length > 0 && selectedIndex < filteredResults.length) {
      router.push(filteredResults[selectedIndex].href);
      setIsOpen(false);
    } else if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    } else {
      router.push('/explore');
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative group max-w-2xl w-full mx-auto select-none">
      {/* 1. Outer Ambient Glow Layer - Continuous Specular Bloom */}
      <div className="absolute -inset-1 rounded-full overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none">
        <div
          className="absolute -inset-[150%] aspect-square animate-border-lightning"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #8B5CF6 290deg, #EC4899 320deg, #FFFFFF 345deg, transparent 360deg)',
          }}
        />
      </div>

      {/* 2. Secondary soft ambient glow for high-contrast neon halo */}
      <div className="absolute -inset-0.5 rounded-full overflow-hidden opacity-80 blur-md pointer-events-none">
        <div
          className="absolute -inset-[150%] aspect-square animate-border-lightning"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #6366F1 295deg, #EC4899 325deg, #06B6D4 345deg, #FFFFFF 355deg, transparent 360deg)',
          }}
        />
      </div>

      {/* 3. Razor-Sharp Outer Pill Container with Rotating Specular Light Beam (studio.baseline inspired) */}
      <div className="relative rounded-full p-[1.5px] overflow-hidden bg-slate-800/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:shadow-[0_15px_45px_rgba(139,92,246,0.3)]">
        {/* Continuous Lightning Beam */}
        <div
          className="absolute -inset-[150%] aspect-square animate-border-lightning pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #8B5CF6 295deg, #EC4899 325deg, #FFFFFF 350deg, transparent 360deg)',
          }}
        />

        {/* 4. Deep Pitch-Black Obsidian Pill Body (Inner Core) */}
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
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search hackathons, teammates, campus bounties, problems..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400/80 focus:outline-none focus:placeholder-slate-500 font-sans tracking-wide truncate"
              aria-label="Omnisearch across Kollabrix"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Middle: Crisp Translucent Vertical Divider Line */}
          <div className="h-6 w-[1.5px] bg-gradient-to-b from-white/5 via-white/25 to-white/5 mx-2 sm:mx-3 shrink-0" />

          {/* Right: Dedicated AI Spark Action Button with ⌘K Badge */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              router.push('/spark');
            }}
            className="group/spark inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-violet-600/35 via-fuchsia-600/35 to-cyan-500/35 hover:from-violet-500/50 hover:via-fuchsia-500/50 hover:to-cyan-400/50 border border-white/20 hover:border-cyan-400/60 text-white transition-all duration-300 shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_24px_rgba(6,182,212,0.6)] active:scale-95 cursor-pointer"
            title="Launch AI Spark Studio (⌘K)"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 group-hover/spark:rotate-12 transition-transform duration-300" />
            <span className="font-heading font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-transparent">
              AI Spark
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-black/60 border border-white/20 text-[10px] font-mono font-semibold text-slate-300 group-hover/spark:text-white group-hover/spark:border-cyan-400/50 transition-colors">
              ⌘K
            </kbd>
          </button>
        </form>
      </div>

      {/* 5. LIVE OMNISEARCH DROPDOWN RESULTS */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 p-3 rounded-3xl bg-[#090B12]/95 backdrop-blur-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.95)] z-50 text-left animate-in fade-in zoom-in-95 duration-150">
          {/* STATE A: User is typing and results match */}
          {query.trim() && filteredResults.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-charcoal-800 pb-2 mb-1">
                <span>Matching Platform Content ({filteredResults.length})</span>
                <span>Use ↑↓ to navigate • Enter to view</span>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredResults.map((item, idx) => {
                  const Icon = CATEGORY_ICONS[item.category] || Compass;
                  const isSelected = idx === selectedIndex;
                  const badgeStyle = TONE_CLASSES[item.tone];

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-start gap-3 p-2.5 rounded-2xl transition-all ${
                        isSelected
                          ? 'bg-white/10 border border-white/20 shadow-md translate-x-0.5'
                          : 'bg-transparent hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          item.tone === 'amber'
                            ? 'bg-amber-500/20 text-amber-300'
                            : item.tone === 'cyan'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : item.tone === 'violet'
                            ? 'bg-violet-500/20 text-violet-300'
                            : item.tone === 'brand'
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                            {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider shrink-0 ${badgeStyle}`}
                          >
                            {item.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.snippet}</p>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 self-center opacity-60" />
                    </Link>
                  );
                })}
              </div>

              {/* View all in explore footer */}
              <div className="pt-2 border-t border-charcoal-800 mt-2 px-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Looking for more? Press <kbd className="px-1 py-0.5 rounded bg-black/60 border border-white/15 text-[10px] font-mono text-white">Enter</kbd>
                </span>
                <Link
                  href={`/explore?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setIsOpen(false)}
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-xs flex items-center gap-1"
                >
                  <span>Explore all results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* STATE B: User typed something that yielded no exact match */}
          {query.trim() && filteredResults.length === 0 && (
            <div className="p-6 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <div>
                <p className="text-sm font-bold text-white">No direct matches for &quot;{query}&quot;</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Search across all collegiate repositories, hackathon squads, and campus projects in the Explore hub.
                </p>
              </div>
              <Link
                href={`/explore?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
              >
                <span>Search in Explore Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* STATE C: Input is focused but empty — Instant Quick Jump Chips */}
          {!query.trim() && (
            <div className="p-2 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
                <span>Quick Jump Across Kollabrix</span>
                <span className="text-cyan-400 font-bold">1-Click Launch</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'College Hackathons', icon: Trophy, href: '/hackathons', tone: 'amber' },
                  { label: 'Competitive Practice', icon: Terminal, href: '/icpc', tone: 'cyan' },
                  { label: 'Campus War Clash', icon: Swords, href: '/war', tone: 'brand' },
                  { label: 'Faculty Problems', icon: Lightbulb, href: '/problems', tone: 'violet' },
                  { label: 'AI Spark Studio', icon: Sparkles, href: '/spark', tone: 'cyan' },
                  { label: 'Deadlines Radar', icon: Clock, href: '/deadlines', tone: 'rose' },
                  { label: 'Student Perks Vault', icon: Gift, href: '/perks', tone: 'emerald' },
                  { label: 'Campus Teammates', icon: Users, href: '/teammates', tone: 'emerald' },
                  { label: 'Explore Projects', icon: Compass, href: '/explore', tone: 'amber' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-charcoal-900 hover:bg-white/10 border border-charcoal-750 hover:border-white/20 transition-all text-left group/item"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-cyan-300 transition-colors shrink-0" />
                      <span className="text-xs font-semibold text-slate-200 group-hover/item:text-white truncate">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
