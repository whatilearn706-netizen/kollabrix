'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Trophy,
  Lightbulb,
  Sparkles,
  Terminal,
  MessageSquare,
  Compass,
  Users,
  Briefcase,
  X,
  Search,
  Swords,
  GraduationCap,
  Clock,
  BookOpen,
  LayoutGrid,
  ArrowUpRight,
} from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  sub: string;
  category: 'compete' | 'build' | 'academics';
  href: string;
  icon: React.ElementType;
  featured?: boolean;
  live?: boolean;
  openInNewTab?: boolean;
}

const APPS_LIST: AppItem[] = [
  {
    id: 'arena',
    name: 'Battle Arena',
    sub: '1v1 ELO Duels',
    category: 'compete',
    href: '/arena',
    icon: Swords,
    featured: true,
    live: true,
  },
  {
    id: 'hackathons',
    name: 'Hackathons',
    sub: 'Campus Sprints',
    category: 'compete',
    href: '/hackathons',
    icon: Trophy,
    featured: true,
    live: true,
  },
  {
    id: 'icpc',
    name: 'Practice IDE',
    sub: 'Timed OA & ICPC',
    category: 'compete',
    href: '/icpc',
    icon: Terminal,
  },
  {
    id: 'war',
    name: 'Campus War',
    sub: 'Inter-College Clash',
    category: 'compete',
    href: '/war',
    icon: Swords,
    live: true,
  },
  {
    id: 'teammates',
    name: 'Teammates',
    sub: 'Squad Matching',
    category: 'build',
    href: '/teammates',
    icon: Users,
  },
  {
    id: 'explore',
    name: 'Explore',
    sub: 'Active Projects',
    category: 'build',
    href: '/explore',
    icon: Compass,
  },
  {
    id: 'workspace',
    name: 'My Projects',
    sub: 'Team Workspaces',
    category: 'build',
    href: '/my-projects',
    icon: Briefcase,
  },
  {
    id: 'spark',
    name: 'KΛ ΛI',
    sub: 'KΛ-1 & KΛ-Pro',
    category: 'build',
    href: '/spark',
    icon: Sparkles,
  },
  {
    id: 'problems',
    name: 'Problems',
    sub: 'Faculty Briefs',
    category: 'academics',
    href: '/problems',
    icon: Lightbulb,
  },
  {
    id: 'teacher',
    name: 'Faculty Desk',
    sub: 'Mentor Portal',
    category: 'academics',
    href: '/teacher/dashboard',
    icon: GraduationCap,
  },
  {
    id: 'deadlines',
    name: 'Deadlines',
    sub: 'Live Countdowns',
    category: 'compete',
    href: '/deadlines',
    icon: Clock,
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    sub: 'Campus Ranks',
    category: 'compete',
    href: '/leaderboard',
    icon: Trophy,
  },
  {
    id: 'resources',
    name: 'Resources',
    sub: 'Docs & Kits',
    category: 'academics',
    href: '/resources',
    icon: BookOpen,
    openInNewTab: true,
  },
  {
    id: 'feedback',
    name: 'Feedback',
    sub: 'Share Ideas',
    category: 'build',
    href: '/feedback',
    icon: MessageSquare,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'compete', label: 'Compete' },
  { id: 'build', label: 'Build' },
  { id: 'academics', label: 'Academics' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

/**
 * Anchored translucent frosted-glass command dropdown attached directly
 * below the top-right navbar trigger button (zero full-screen backdrop).
 */
export function KollabrixQuickDock({ hideTrigger = false }: { hideTrigger?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isExamMode, setIsExamMode] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
    const handleExam = (e: CustomEvent<{ active?: boolean }>) => {
      setIsExamMode(Boolean(e.detail?.active));
    };
    window.addEventListener('linkora_exam_mode', handleExam as EventListener);
    return () =>
      window.removeEventListener('linkora_exam_mode', handleExam as EventListener);
  }, [pathname]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close when clicking outside popover
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const showFeaturedRow =
    activeCategory === 'all' && searchQuery.trim() === '';

  const featuredApps = useMemo(
    () => APPS_LIST.filter((app) => app.featured),
    []
  );

  const listApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return APPS_LIST.filter((app) => {
      if (showFeaturedRow && app.featured) return false;
      const matchesCat =
        activeCategory === 'all' || app.category === activeCategory;
      const matchesQuery =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.sub.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [activeCategory, searchQuery, showFeaturedRow]);

  const visibleApps = useMemo(
    () => (showFeaturedRow ? [...featuredApps, ...listApps] : listApps),
    [showFeaturedRow, featuredApps, listApps]
  );

  useEffect(() => {
    setFocusedIndex(0);
  }, [activeCategory, searchQuery, isOpen]);

  const launchApp = useCallback(
    (app: AppItem) => {
      setIsOpen(false);
      setSearchQuery('');
      if (app.openInNewTab) {
        window.open(app.href, '_blank', 'noopener,noreferrer');
      } else {
        router.push(app.href);
      }
    },
    [router]
  );

  // Global ⌘K shortcut + keyboard navigation while open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdK) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          target.closest('input, textarea, [contenteditable="true"]') &&
          !isOpen
        ) {
          return;
        }
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((prev) =>
          visibleApps.length ? (prev + 1) % visibleApps.length : 0
        );
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((prev) =>
          visibleApps.length
            ? (prev - 1 + visibleApps.length) % visibleApps.length
            : 0
        );
      } else if (e.key === 'Enter' && visibleApps[focusedIndex]) {
        e.preventDefault();
        launchApp(visibleApps[focusedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, visibleApps, focusedIndex, launchApp]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  if (
    pathname?.startsWith('/control-center-7x9') ||
    pathname?.startsWith('/arena') ||
    pathname?.startsWith('/admin') ||
    isExamMode
  ) {
    return null;
  }

  return (
    <div ref={containerRef} className={hideTrigger && !isOpen ? 'hidden' : 'relative inline-flex items-center'}>
      {/* Top-Right Navbar Trigger Button */}
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Open Kollabrix Apps Menu (⌘K)"
          title="Platform Apps (⌘K)"
          className={`inline-flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border transition-all active:scale-95 cursor-pointer shadow-sm focus:outline-none focus-visible:outline-none ${
            isOpen
              ? 'bg-white/15 border-white/35 text-white'
              : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/15 hover:border-white/30 text-zinc-300 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-zinc-200" />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold text-zinc-400 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded-md leading-none">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Anchored Translucent Frosted-Glass Dropdown (directly below button) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Kollabrix Platform Menu"
          className="absolute right-0 top-full mt-3 z-[9999] w-[calc(100vw-2rem)] sm:w-[392px] origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 select-none"
        >
          <div className="relative rounded-2xl bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-[0_28px_70px_rgba(0,0,0,0.7),_inset_0_1px_0_rgba(255,255,255,0.22)] overflow-hidden">
            {/* Subtle specular top-left glass reflection */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.09] via-transparent to-white/[0.02]" />

            <div className="relative z-10 p-3 space-y-2.5">
              {/* Compact Translucent Search Input (explicitly strips Safari accent outline) */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/12 focus-within:border-white/35 transition-colors">
                <Search className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Jump to portal or tool..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 !outline-none focus:!outline-none focus-visible:!outline-none ring-0 focus:ring-0 text-xs text-white placeholder-zinc-400/80 min-w-0"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[9px] font-mono text-zinc-400 bg-white/[0.06] border border-white/12 px-1.5 py-0.5 rounded-md">
                    ESC
                  </span>
                )}
              </div>

              {/* Minimal Frosted Filter Capsules */}
              <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {CATEGORIES.map((cat) => {
                  const isCatActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
                        isCatActive
                          ? 'bg-white/15 text-white border border-white/25 shadow-xs font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] border border-transparent'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Pinned Top 2 Featured Cards (Battle Arena & Hackathons) */}
              {showFeaturedRow && featuredApps.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {featuredApps.map((app, idx) => {
                    const Icon = app.icon;
                    const isActive = focusedIndex === idx;
                    const isRouteActive =
                      pathname === app.href ||
                      Boolean(app.href !== '/' && pathname?.startsWith(app.href));
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => launchApp(app)}
                        onMouseEnter={() => setFocusedIndex(idx)}
                        className={`group flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all cursor-pointer focus:outline-none ${
                          isActive || isRouteActive
                            ? 'bg-white/[0.14] border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                            : 'bg-white/[0.06] hover:bg-white/[0.11] border-white/12 hover:border-white/25'
                        }`}
                      >
                        <div className="relative w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-zinc-100" />
                          {app.live && (
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white truncate leading-tight">
                            {app.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {app.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Compact 2-Column Translucent Glass Menu */}
              {visibleApps.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No portals match &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1 max-h-[270px] overflow-y-auto overscroll-contain pt-1 border-t border-white/10">
                  {listApps.map((app, idx) => {
                    const globalIdx = showFeaturedRow
                      ? featuredApps.length + idx
                      : idx;
                    const Icon = app.icon;
                    const isActive = focusedIndex === globalIdx;
                    const isRouteActive =
                      pathname === app.href ||
                      Boolean(app.href !== '/' && pathname?.startsWith(app.href));
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => launchApp(app)}
                        onMouseEnter={() => setFocusedIndex(globalIdx)}
                        className={`group flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer focus:outline-none ${
                          isActive || isRouteActive
                            ? 'bg-white/[0.12] border-white/25'
                            : 'bg-transparent hover:bg-white/[0.08] border-transparent hover:border-white/15'
                        }`}
                      >
                        <div className="relative w-7 h-7 rounded-lg bg-white/[0.07] border border-white/12 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-zinc-200 group-hover:text-white transition-colors" />
                          {app.live && (
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-zinc-100 group-hover:text-white truncate leading-tight flex items-center justify-between gap-1">
                            <span className="truncate">{app.name}</span>
                            <ArrowUpRight className="w-2.5 h-2.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate">
                            {app.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
