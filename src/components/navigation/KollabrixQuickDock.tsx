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
  Terminal,
  BookOpen,
  ArrowRight,
  X,
  Search,
} from 'lucide-react';

interface DockItem {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: React.ElementType;
  tone: 'amber' | 'violet' | 'emerald' | 'cyan' | 'brand';
  openInNewTab?: boolean;
}

const DOCK_ITEMS: DockItem[] = [
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
    sub: 'Curated Roadmaps & Tools',
    href: '/resources',
    icon: BookOpen,
    tone: 'brand',
    openInNewTab: true,
  },
];

const TONE_STYLES = {
  amber: {
    bg: 'bg-amber-500/10 hover:bg-amber-500',
    border: 'border-amber-500/35 hover:border-amber-400',
    text: 'text-amber-500 hover:text-white',
    ring: 'focus:ring-amber-400',
    tooltipBg: 'bg-gradient-to-r from-amber-600 to-orange-600',
  },
  violet: {
    bg: 'bg-violet-500/10 hover:bg-violet-500',
    border: 'border-violet-500/35 hover:border-violet-400',
    text: 'text-violet-500 hover:text-white',
    ring: 'focus:ring-violet-400',
    tooltipBg: 'bg-gradient-to-r from-violet-600 to-purple-600',
  },
  emerald: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500',
    border: 'border-emerald-500/35 hover:border-emerald-400',
    text: 'text-emerald-500 hover:text-white',
    ring: 'focus:ring-emerald-400',
    tooltipBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
  },
  cyan: {
    bg: 'bg-cyan-500/10 hover:bg-cyan-500',
    border: 'border-cyan-500/35 hover:border-cyan-400',
    text: 'text-cyan-500 hover:text-white',
    ring: 'focus:ring-cyan-400',
    tooltipBg: 'bg-gradient-to-r from-cyan-600 to-blue-600',
  },
  brand: {
    bg: 'bg-indigo-500/10 hover:bg-indigo-500',
    border: 'border-indigo-500/35 hover:border-indigo-400',
    text: 'text-indigo-500 hover:text-white',
    ring: 'focus:ring-indigo-400',
    tooltipBg: 'bg-gradient-to-r from-indigo-600 to-violet-600',
  },
};

export function KollabrixQuickDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<DockItem | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExamMode, setIsExamMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdK) {
        const target = e.target as HTMLElement;
        if (target && target.closest('input, textarea, [contenteditable="true"]')) {
          return;
        }
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isCommandOpen) {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen]);

  // Focus input when command ring opens
  useEffect(() => {
    if (isCommandOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery('');
    }
  }, [isCommandOpen]);

  // Hide in admin, control-center, or during active proctored exam
  if (
    pathname?.startsWith('/control-center-7x9') ||
    pathname?.startsWith('/admin') ||
    isExamMode
  ) {
    return null;
  }

  const filteredItems = DOCK_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sub.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* =========================================================================
          SIGNATURE VERTICAL FLOATING QUICK DOCK (Exact match to user's Image 3)
         ========================================================================= */}
      <aside
        aria-label="Kollabrix Quick Portals"
        className="fixed right-3.5 top-1/2 -translate-y-1/2 z-40 select-none hidden md:flex flex-col items-center animate-fade-in pointer-events-auto"
      >
        <div className="relative rounded-full py-3 px-1.5 bg-white/92 dark:bg-stone-900/90 border border-slate-200/90 dark:border-stone-800 shadow-[0_16px_50px_rgba(0,0,0,0.16)] backdrop-blur-2xl flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(245,158,11,0.22)]">
          {/* Main Quick Portal Buttons */}
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const style = TONE_STYLES[item.tone];
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <div
                key={item.id}
                className="relative"
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

                  {/* Active dot */}
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

          {/* Visual Nudge / Chevron */}
          <div className="w-5 h-[1px] bg-slate-200 dark:bg-stone-800 my-0.5" />
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 animate-bounce" />

          {/* Bottom ⌘ (Command) Spotlight Trigger Button */}
          <div
            className="relative"
            onMouseEnter={() =>
              setHoveredItem({
                id: 'cmd',
                label: 'All Portals (⌘K)',
                sub: 'Quick Search & Launch',
                href: '#',
                icon: Command,
                tone: 'violet',
              })
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              aria-label="Open Portals Command Center"
              className="relative flex items-center justify-center w-10 h-10 rounded-full border border-violet-400/40 bg-violet-500/15 text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white transition-all duration-300 active:scale-90 group focus:outline-none shadow-sm cursor-pointer"
            >
              <Command className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </button>

            {hoveredItem?.id === 'cmd' && (
              <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 pointer-events-none z-50 animate-in fade-in slide-in-from-right-2 duration-150">
                <div className="flex flex-col px-3 py-1.5 rounded-xl bg-stone-900/95 dark:bg-black/95 border border-stone-700/80 shadow-2xl text-white backdrop-blur-xl whitespace-nowrap">
                  <span className="text-[11px] font-bold tracking-tight text-white flex items-center gap-1.5">
                    <Command className="w-3 h-3 text-violet-400" />
                    All Portals (⌘K)
                  </span>
                  <span className="text-[9px] font-medium text-stone-400">Search & Fast Jump</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          ⌘K SPOTLIGHT COMMAND MODAL (Clean, Fast & Accessible)
         ========================================================================= */}
      {isCommandOpen && (
        <div
          onClick={() => setIsCommandOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-stone-800">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to hackathons, ICPC arena, faculty briefs..."
                className="w-full bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsCommandOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Links List */}
            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const style = TONE_STYLES[item.tone];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsCommandOpen(false);
                      if (item.openInNewTab) {
                        window.open(item.href, '_blank', 'noopener,noreferrer');
                      } else {
                        router.push(item.href);
                      }
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${style.bg} ${style.border} ${style.text}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {item.label}
                        </h4>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">{item.sub}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-2 bg-stone-50 dark:bg-stone-950 border-t border-slate-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
              <span>Press <kbd className="font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px]">ESC</kbd> to close</span>
              <span className="font-mono">Kollabrix Quick Navigator</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
