'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Trophy,
  Lightbulb,
  GraduationCap,
  Sparkles,
  Command,
  ChevronDown,
  ChevronUp,
  Terminal,
  BookOpen,
  Clock,
  MessageSquare,
  Compass,
  Users,
  Briefcase,
  X,
  Search,
} from 'lucide-react';

interface DockItem {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: React.ElementType;
  tone: 'amber' | 'violet' | 'emerald' | 'cyan' | 'brand' | 'rose';
  openInNewTab?: boolean;
}

const DOCK_ITEMS: DockItem[] = [
  // The 4 initially visible items (without scrolling)
  {
    id: 'hackathons',
    label: 'College Hackathons',
    sub: 'Arena & Squad Matchmaking',
    href: '/hackathons',
    icon: Trophy,
    tone: 'amber',
  },
  {
    id: 'problems',
    label: 'Faculty Problems',
    sub: 'Professor Engineering Briefs',
    href: '/problems',
    icon: Lightbulb,
    tone: 'violet',
  },
  {
    id: 'faculty',
    label: 'Faculty Portal',
    sub: 'Educator Desk & Review',
    href: '/teacher/dashboard',
    icon: GraduationCap,
    tone: 'emerald',
  },
  {
    id: 'icpc',
    label: 'ICPC Arena',
    sub: 'Live Speedrun & Testbench',
    href: '/icpc',
    icon: Terminal,
    tone: 'cyan',
  },
  // Items revealed upon scrolling:
  {
    id: 'spark',
    label: 'AI Spark Studio',
    sub: 'Architect Ideas in 0.04s',
    href: '/spark',
    icon: Sparkles,
    tone: 'amber',
  },
  {
    id: 'resources',
    label: 'Resources Hub',
    sub: 'Curated Roadmaps & Compilers',
    href: '/resources',
    icon: BookOpen,
    tone: 'brand',
    openInNewTab: true,
  },
  {
    id: 'deadlines',
    label: 'Deadlines Radar',
    sub: 'Live Hackathon Countdowns',
    href: '/deadlines',
    icon: Clock,
    tone: 'rose',
  },
  {
    id: 'feedback',
    label: 'Community Feedback',
    sub: 'Direct Suggestions & Ideas',
    href: 'mailto:whatilearn706@gmail.com?subject=Kollabrix%20Community%20Feedback',
    icon: MessageSquare,
    tone: 'violet',
    openInNewTab: true,
  },
];

const TONE_STYLES = {
  amber: {
    bg: 'bg-amber-500/10 hover:bg-amber-500',
    border: 'border-amber-500/35 hover:border-amber-400',
    text: 'text-amber-500 hover:text-white',
    ring: 'focus:ring-amber-400',
    appGrad: 'from-amber-500 to-orange-600',
  },
  violet: {
    bg: 'bg-violet-500/10 hover:bg-violet-500',
    border: 'border-violet-500/35 hover:border-violet-400',
    text: 'text-violet-500 hover:text-white',
    ring: 'focus:ring-violet-400',
    appGrad: 'from-violet-500 to-purple-600',
  },
  emerald: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500',
    border: 'border-emerald-500/35 hover:border-emerald-400',
    text: 'text-emerald-500 hover:text-white',
    ring: 'focus:ring-emerald-400',
    appGrad: 'from-emerald-500 to-teal-600',
  },
  cyan: {
    bg: 'bg-cyan-500/10 hover:bg-cyan-500',
    border: 'border-cyan-500/35 hover:border-cyan-400',
    text: 'text-cyan-500 hover:text-white',
    ring: 'focus:ring-cyan-400',
    appGrad: 'from-cyan-500 to-blue-600',
  },
  brand: {
    bg: 'bg-indigo-500/10 hover:bg-indigo-500',
    border: 'border-indigo-500/35 hover:border-indigo-400',
    text: 'text-indigo-500 hover:text-white',
    ring: 'focus:ring-indigo-400',
    appGrad: 'from-indigo-500 to-violet-600',
  },
  rose: {
    bg: 'bg-rose-500/10 hover:bg-rose-500',
    border: 'border-rose-500/35 hover:border-rose-400',
    text: 'text-rose-500 hover:text-white',
    ring: 'focus:ring-rose-400',
    appGrad: 'from-rose-500 to-pink-600',
  },
};

// macOS Launchpad Applications List
interface AppItem {
  id: string;
  name: string;
  category: 'all' | 'competitions' | 'academics' | 'tools' | 'community';
  href: string;
  icon: React.ElementType;
  gradient: string;
  openInNewTab?: boolean;
}

const APPS_LIST: AppItem[] = [
  {
    id: 'hackathons',
    name: 'Hackathons',
    category: 'competitions',
    href: '/hackathons',
    icon: Trophy,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'problems',
    name: 'Problems',
    category: 'academics',
    href: '/problems',
    icon: Lightbulb,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'faculty',
    name: 'Faculty Desk',
    category: 'academics',
    href: '/teacher/dashboard',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'icpc',
    name: 'ICPC Arena',
    category: 'competitions',
    href: '/icpc',
    icon: Terminal,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'spark',
    name: 'AI Spark',
    category: 'tools',
    href: '/spark',
    icon: Sparkles,
    gradient: 'from-amber-400 to-rose-500',
  },
  {
    id: 'resources',
    name: 'Resources',
    category: 'tools',
    href: '/resources',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-purple-600',
    openInNewTab: true,
  },
  {
    id: 'deadlines',
    name: 'Deadlines',
    category: 'competitions',
    href: '/deadlines',
    icon: Clock,
    gradient: 'from-rose-500 to-red-600',
  },
  {
    id: 'explore',
    name: 'Explore',
    category: 'community',
    href: '/explore',
    icon: Compass,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'teammates',
    name: 'Teammates',
    category: 'community',
    href: '/teammates',
    icon: Users,
    gradient: 'from-teal-500 to-emerald-600',
  },
  {
    id: 'workspace',
    name: 'Workspace',
    category: 'tools',
    href: '/my-projects',
    icon: Briefcase,
    gradient: 'from-stone-700 to-stone-900',
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    category: 'competitions',
    href: '/leaderboard',
    icon: Trophy,
    gradient: 'from-yellow-400 to-amber-600',
  },
  {
    id: 'feedback',
    name: 'Feedback',
    category: 'community',
    href: 'mailto:whatilearn706@gmail.com?subject=Kollabrix%20Community%20Feedback',
    icon: MessageSquare,
    gradient: 'from-purple-500 to-pink-600',
    openInNewTab: true,
  },
];

export function KollabrixQuickDock() {
  const pathname = usePathname();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [hoveredItem, setHoveredItem] = useState<DockItem | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  // macOS Applications launch modal
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'competitions' | 'academics' | 'tools' | 'community'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExamMode, setIsExamMode] = useState(false);

  // Check if exam arena or proctored exam is active
  useEffect(() => {
    const checkExam = () => {
      if (typeof document !== 'undefined') {
        setIsExamMode(
          document.body.classList.contains('icpc-exam-mode') ||
          window.location.pathname.startsWith('/icpc/arena')
        );
      }
    };
    checkExam();
    const handleExam = (e: any) => {
      setIsExamMode(Boolean(e.detail?.active));
    };
    window.addEventListener('linkora_exam_mode', handleExam);
    return () => window.removeEventListener('linkora_exam_mode', handleExam);
  }, [pathname]);

  // Monitor scroll position inside dock to toggle blur-fade animations and nudge arrows
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setCanScrollUp(scrollTop > 4);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 4);
  };

  useEffect(() => {
    updateScrollState();
  }, []);

  const handleScrollNudge = (direction: 'up' | 'down') => {
    if (!scrollContainerRef.current) return;
    const delta = direction === 'up' ? -52 : 52;
    scrollContainerRef.current.scrollBy({ top: delta, behavior: 'smooth' });
  };

  // Global ⌘K / Ctrl+K keyboard shortcut opens macOS App Launcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdK) {
        const target = e.target as HTMLElement;
        if (target && target.closest('input, textarea, [contenteditable="true"]')) {
          return;
        }
        e.preventDefault();
        setIsAppsModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isAppsModalOpen) {
        setIsAppsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAppsModalOpen]);

  // Hide in admin, control-center, or during active proctored exam
  if (
    pathname?.startsWith('/control-center-7x9') ||
    pathname?.startsWith('/admin') ||
    isExamMode
  ) {
    return null;
  }

  const filteredApps = APPS_LIST.filter((app) => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* =========================================================================
          SIGNATURE SCROLLABLE VERTICAL QUICK DOCK (Exact match to user's Image 1 & 3)
          - 4 items visible without scrolling
          - Smooth scroll reveals AI Spark, Resources, Deadlines, Feedback
          - Top & bottom blur fade gradients while scrolling
         ========================================================================= */}
      <aside
        aria-label="Kollabrix Quick Portals"
        className="fixed right-3.5 top-1/2 -translate-y-1/2 z-40 select-none hidden md:flex flex-col items-center animate-fade-in pointer-events-auto"
      >
        <div className="relative rounded-full py-2.5 px-1.5 bg-white/92 dark:bg-stone-900/90 border border-slate-200/90 dark:border-stone-800 shadow-[0_16px_50px_rgba(0,0,0,0.16)] backdrop-blur-2xl flex flex-col items-center transition-all duration-300 hover:shadow-[0_20px_60px_rgba(245,158,11,0.22)]">

          {/* Up Nudge Arrow (Appears when scrolled down) */}
          <button
            type="button"
            onClick={() => handleScrollNudge('up')}
            aria-label="Scroll up"
            className={`w-7 h-4 flex items-center justify-center text-amber-500 transition-opacity duration-200 cursor-pointer ${
              canScrollUp ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Viewport: Exactly 4 Items Visible (~216px height) */}
          <div className="relative w-[52px] h-[216px] overflow-hidden my-0.5">

            {/* Top Blur Fade Gradient Overlay */}
            <div
              className={`absolute top-0 left-0 right-0 h-8 pointer-events-none z-10 transition-opacity duration-300 backdrop-blur-[3px] bg-gradient-to-b from-white/95 dark:from-stone-900/95 to-transparent ${
                canScrollUp ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              onScroll={updateScrollState}
              className="h-full overflow-y-auto overflow-x-hidden flex flex-col items-center gap-2.5 py-1 px-1 scroll-smooth"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {DOCK_ITEMS.map((item) => {
                const Icon = item.icon;
                const style = TONE_STYLES[item.tone];
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

                return (
                  <div
                    key={item.id}
                    className="relative shrink-0"
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      href={item.href}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      aria-label={item.label}
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 active:scale-90 group focus:outline-none ${style.bg} ${style.border} ${style.text} ${
                        isActive ? 'ring-2 ring-amber-400 shadow-md scale-105' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />

                      {isActive && (
                        <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                      )}
                    </Link>

                    {/* Left-Popping Tooltip Bubble */}
                    {hoveredItem?.id === item.id && (
                      <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 pointer-events-none z-50 animate-in fade-in slide-in-from-right-2 duration-150">
                        <div className="flex flex-col px-3 py-1.5 rounded-xl bg-stone-900/95 dark:bg-black/95 border border-stone-700/80 shadow-2xl text-white backdrop-blur-xl whitespace-nowrap min-w-[130px]">
                          <span className="text-[11px] font-bold tracking-tight text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {item.label}
                          </span>
                          <span className="text-[9px] font-medium text-stone-400">{item.sub}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Blur Fade Gradient Overlay */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-10 transition-opacity duration-300 backdrop-blur-[3px] bg-gradient-to-t from-white/95 dark:from-stone-900/95 to-transparent ${
                canScrollDown ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>

          {/* Down Nudge Arrow (Appears when more items below, with gentle bob) */}
          <button
            type="button"
            onClick={() => handleScrollNudge('down')}
            aria-label="Scroll down"
            className={`w-7 h-4 flex items-center justify-center text-amber-500 transition-opacity duration-200 cursor-pointer ${
              canScrollDown ? 'opacity-100 pointer-events-auto animate-pulse' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Divider Line */}
          <div className="w-5 h-[1px] bg-slate-200 dark:bg-stone-800 my-1" />

          {/* Bottom ⌘ (Command) Applications Trigger Button */}
          <div
            className="relative"
            onMouseEnter={() =>
              setHoveredItem({
                id: 'cmd',
                label: 'Applications (⌘K)',
                sub: 'Launchpad Grid',
                href: '#',
                icon: Command,
                tone: 'violet',
              })
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              type="button"
              onClick={() => setIsAppsModalOpen(true)}
              aria-label="Open Applications Launchpad"
              className="relative flex items-center justify-center w-10 h-10 rounded-full border border-violet-400/40 bg-violet-500/15 text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white transition-all duration-300 active:scale-90 group focus:outline-none shadow-sm cursor-pointer"
            >
              <Command className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </button>

            {hoveredItem?.id === 'cmd' && (
              <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 pointer-events-none z-50 animate-in fade-in slide-in-from-right-2 duration-150">
                <div className="flex flex-col px-3 py-1.5 rounded-xl bg-stone-900/95 dark:bg-black/95 border border-stone-700/80 shadow-2xl text-white backdrop-blur-xl whitespace-nowrap">
                  <span className="text-[11px] font-bold tracking-tight text-white flex items-center gap-1.5">
                    <Command className="w-3 h-3 text-violet-400" />
                    Applications (⌘K)
                  </span>
                  <span className="text-[9px] font-medium text-stone-400">macOS Launchpad Grid</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          macOS APPLICATIONS LAUNCHPAD MODAL (Exact match to user's Image 4)
          - Dark frosted glass squircle container
          - Top category pills (All, Competitions, Academics, Tools, Community)
          - Gorgeous squircle app icons with title underneath
         ========================================================================= */}
      {isAppsModalOpen && (
        <div
          onClick={() => setIsAppsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xl animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[580px] rounded-3xl bg-[#181614]/95 border border-white/12 shadow-[0_30px_100px_rgba(0,0,0,0.85)] p-6 backdrop-blur-3xl animate-in zoom-in-95 duration-200 text-white select-none"
          >
            {/* Window Top Bar: macOS Traffic Lights + Title */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={() => setIsAppsModalOpen(false)}
                    className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                </div>
                <h3 className="text-sm font-black tracking-tight text-white/95 flex items-center gap-1.5 ml-2">
                  <span>⚡ Applications</span>
                </h3>
              </div>

              {/* Search Mini-Bar */}
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter apps..."
                  className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-white/8 border border-white/10 text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400/50"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Filter Pills (macOS Tab Strip) */}
            <div className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-none border-b border-white/8 text-[11px] font-bold">
              {[
                { id: 'all', label: 'All Portals' },
                { id: 'competitions', label: 'Competitions' },
                { id: 'academics', label: 'Academics' },
                { id: 'tools', label: 'Tools & AI' },
                { id: 'community', label: 'Community' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === tab.id
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-white/8'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* App Icon Grid (macOS Squircle Icons with Labels) */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 py-5 max-h-[380px] overflow-y-auto">
              {filteredApps.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setIsAppsModalOpen(false);
                      if (app.openInNewTab) {
                        window.open(app.href, '_blank', 'noopener,noreferrer');
                      } else {
                        router.push(app.href);
                      }
                    }}
                    className="group flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/6 transition-all duration-200 cursor-pointer text-center"
                  >
                    {/* App Squircle Icon */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${app.gradient} border border-white/20 shadow-xl flex items-center justify-center group-hover:scale-110 active:scale-95 transition-all duration-200 group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]`}
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md" />
                    </div>

                    {/* App Name */}
                    <span className="text-xs font-semibold text-white/90 group-hover:text-amber-300 mt-2 tracking-tight transition-colors truncate max-w-full">
                      {app.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Window Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
              <span className="font-mono">Press <kbd className="bg-white/10 px-1 py-0.5 rounded text-[10px] text-white">ESC</kbd> to dismiss</span>
              <span className="text-stone-400">Kollabrix Platform Hub</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
