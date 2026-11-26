'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  ChevronDown,
  Swords,
  Flame,
  Trophy,
  Clock,
  Terminal,
  Sparkles,
  Bot,
  Lightbulb,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export interface CapabilityItem {
  id: string;
  label: string;
  group: 'compete' | 'build';
  href: string;
  badge: string;
  live?: boolean;
  dotColor: string;
  badgeClass: string;
  description: string;
  ctaLabel: string;
  openInNewTab?: boolean;
  icon: React.ElementType;
}

export const CAPABILITY_ITEMS: CapabilityItem[] = [
  // Group 1: COMPETE & RANK
  {
    id: 'arena',
    label: '1v1 Battle Arena',
    group: 'compete',
    href: '/arena',
    badge: 'LIVE DUELS',
    live: true,
    dotColor: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    description: 'Race coders head-to-head in real-time 3-minute ELO speed duels.',
    ctaLabel: 'Enter Arena',
    icon: Swords,
  },
  {
    id: 'war',
    label: 'Campus War',
    group: 'compete',
    href: '/war',
    badge: 'INTER-COLLEGE',
    live: true,
    dotColor: 'bg-rose-400 shadow-[0_0_8px_#fb7185]',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    description: 'Represent your university in live squad-vs-squad coding clashes.',
    ctaLabel: 'Join Campus War',
    icon: Flame,
  },
  {
    id: 'leaderboard',
    label: 'Campus Leaderboard',
    group: 'compete',
    href: '/leaderboard',
    badge: 'RANKINGS',
    dotColor: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
    description: 'Track top verified coders, hackathon squads, and campus standings.',
    ctaLabel: 'View Rankings',
    icon: Trophy,
  },
  {
    id: 'deadlines',
    label: 'Deadlines Radar',
    group: 'compete',
    href: '/deadlines',
    badge: 'COUNTDOWNS',
    live: true,
    dotColor: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    description: 'Never miss closing hackathon registrations or submission locks.',
    ctaLabel: 'Track Deadlines',
    icon: Clock,
  },

  // Group 2: BUILD & PRACTICE
  {
    id: 'icpc',
    label: 'Practice IDE',
    group: 'build',
    href: '/icpc',
    badge: 'OA & ICPC',
    dotColor: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/35',
    description: 'Timed placement OA simulations & proctored DSA lab rounds.',
    ctaLabel: 'Launch IDE',
    icon: Terminal,
  },
  {
    id: 'spark',
    label: 'KΛ ΛI',
    group: 'build',
    href: '/spark',
    badge: 'KΛ-1 · KΛ-PRO',
    dotColor: 'bg-violet-400 shadow-[0_0_8px_#a78bfa]',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/35',
    description: 'Brainstorm winning hackathon concepts, specs & architecture stacks.',
    ctaLabel: 'Open KΛ ΛI',
    icon: Sparkles,
  },
  {
    id: 'planner',
    label: 'AI Project Planner',
    group: 'build',
    href: '/planner',
    badge: 'ROADMAP',
    dotColor: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/35',
    description: 'Turn a project idea into sprint milestones, roles & task lists.',
    ctaLabel: 'Plan Project',
    icon: Bot,
  },
  {
    id: 'problems',
    label: 'Faculty Problems',
    group: 'build',
    href: '/problems',
    badge: 'CAMPUS BRIEFS',
    dotColor: 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/35',
    description: 'Tackle verified faculty & industry challenge statements for credit.',
    ctaLabel: 'Browse Problems',
    icon: Lightbulb,
  },
  {
    id: 'resources',
    label: 'Starter Kits & Resources',
    group: 'build',
    href: '/resources',
    badge: 'TEMPLATES',
    dotColor: 'bg-slate-300',
    badgeClass: 'bg-white/10 text-slate-200 border-white/20',
    description: 'Curated tech boilerplates, learning roadmaps & interactive tracks.',
    ctaLabel: 'Open Resources',
    openInNewTab: true,
    icon: BookOpen,
  },
];

function PreviewVisual({ item }: { item: CapabilityItem }) {
  if (item.id === 'arena') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-white/10 p-3 space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-white/[0.06] pb-1.5">
          <span className="text-emerald-300 font-bold">PY</span>
          <span className="text-slate-200 font-semibold">Py vs C++ &bull; 3-min ELO</span>
          <span className="text-purple-300 font-bold">C++</span>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[9px] leading-relaxed">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-cyan-500/20 text-cyan-200/90 space-y-0.5">
            <div className="text-pink-400">def solve(v, t):</div>
            <div className="pl-2 text-slate-300">seen = &#123;&#125;</div>
            <div className="pl-2 text-emerald-400">return &#91;i, j&#93;</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-purple-500/20 text-purple-200/90 space-y-0.5">
            <div className="text-pink-400">int main() &#123;</div>
            <div className="pl-2 text-slate-300">unordered_map m;</div>
            <div className="pl-2 text-emerald-400">return 0; &#125;</div>
          </div>
        </div>
      </div>
    );
  }

  if (item.id === 'war') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-white/10 p-3 space-y-2.5 shadow-inner font-mono">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-rose-300 font-bold">IIT DELHI</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[9px]">VS</span>
          <span className="text-cyan-300 font-bold">S-VYASA</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
          <div className="w-[56%] bg-gradient-to-r from-rose-500 to-amber-400" />
          <div className="w-[44%] bg-gradient-to-r from-cyan-400 to-emerald-400" />
        </div>
        <div className="flex items-center justify-between text-[9px] text-slate-400">
          <span>2,840 pts</span>
          <span className="text-emerald-400">● Clash Active</span>
          <span>2,690 pts</span>
        </div>
      </div>
    );
  }

  if (item.id === 'leaderboard') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-white/10 p-2.5 space-y-1.5 font-mono text-[10px]">
        {[
          { rank: '#1', name: 'IIT Delhi', elo: '2,140 ELO', color: 'text-amber-300' },
          { rank: '#2', name: 'BITS Pilani', elo: '1,985 ELO', color: 'text-slate-200' },
          { rank: '#3', name: 'DTU Delhi', elo: '1,910 ELO', color: 'text-cyan-300' },
        ].map((row) => (
          <div
            key={row.rank}
            className="flex items-center justify-between px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]"
          >
            <span className={`font-bold ${row.color}`}>{row.rank} {row.name}</span>
            <span className="text-emerald-400">{row.elo}</span>
          </div>
        ))}
      </div>
    );
  }

  if (item.id === 'deadlines') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-white/10 p-2.5 space-y-1.5 font-mono text-[10px]">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-rose-500/10 border border-rose-500/25">
          <span className="text-white font-semibold truncate">SIH Campus Sprint</span>
          <span className="text-rose-300 font-bold shrink-0">04h 18m left</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="text-slate-300 truncate">ETH Campus Track</span>
          <span className="text-emerald-300 font-bold shrink-0">2d 11h left</span>
        </div>
      </div>
    );
  }

  if (item.id === 'icpc') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-white/10 p-3 space-y-2 font-mono text-[10px]">
        <div className="flex items-center justify-between text-slate-400">
          <span>Round: Placement OA #4</span>
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" /> 3/3 Passed
          </span>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-slate-300 text-[9px]">
          Runtime: <span className="text-cyan-300 font-bold">0.03s</span> &bull; Memory: <span className="text-slate-200">14.2 MB</span>
        </div>
      </div>
    );
  }

  if (item.id === 'spark' || item.id === 'planner') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-white/10 p-3 space-y-2 font-mono text-[9.5px]">
        <div className="text-violet-300 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          <span>{item.id === 'spark' ? 'Prompt: Campus EV Router' : 'Sprint Plan Generated'}</span>
        </div>
        <div className="space-y-1 text-slate-300">
          <div className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05]">
            &bull; Next.js + FastAPI + Postgres
          </div>
          <div className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05]">
            &bull; 4 Milestones &bull; 3 Team Roles Ready
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#05070c] border border-white/10 p-3 space-y-2 font-mono text-[9.5px]">
      <div className="text-cyan-300 font-bold">
        {item.id === 'problems' ? 'VERIFIED CAMPUS BRIEF' : 'STARTER KITS READY'}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(item.id === 'problems'
          ? ['AI Health Triage', 'Zero-Trust Auth', 'Campus Transit']
          : ['Next.js 14', 'FastAPI', 'PyTorch', 'Solidity']
        ).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CapabilitiesMegaMenu({ isNavbarDark }: { isNavbarDark: boolean }) {
  const pathname = usePathname() || '';
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 72, left: 0 });
  const [hoveredItem, setHoveredItem] = useState<CapabilityItem>(CAPABILITY_ITEMS[0]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByHoverAtRef = useRef<number>(0);

  const isRouteActive = CAPABILITY_ITEMS.some((item) => pathname.startsWith(item.href));

  const syncMenuPos = () => {
    if (containerRef.current) {
      const navEl = containerRef.current.closest('nav');
      const anchorRect = (navEl || containerRef.current).getBoundingClientRect();
      const centerX = anchorRect.left + anchorRect.width / 2;
      const panelWidth = Math.min(740, window.innerWidth - 32);
      const clampedLeft = Math.max(16, Math.min(centerX - panelWidth / 2, window.innerWidth - panelWidth - 16));
      setMenuPos({
        top: Math.round(anchorRect.bottom + 8),
        left: Math.round(clampedLeft),
      });
    }
  };

  // Close automatically on route transition
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape key or click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!panelRef.current || !panelRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!isOpen) {
      openedByHoverAtRef.current = Date.now();
    }
    syncMenuPos();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleTriggerClick = () => {
    syncMenuPos();
    if (isOpen && Date.now() - openedByHoverAtRef.current < 400) {
      // Hover just opened the menu right before click landed; keep it open cleanly
      openedByHoverAtRef.current = 0;
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const competeItems = CAPABILITY_ITEMS.filter((i) => i.group === 'compete');
  const buildItems = CAPABILITY_ITEMS.filter((i) => i.group === 'build');

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      {/* Center Capsule Pill Trigger */}
      <button
        type="button"
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={clsx(
          'px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold tracking-[-0.01em] transition-all duration-200 inline-flex items-center justify-center gap-1 select-none active:scale-[0.97] cursor-pointer whitespace-nowrap',
          isOpen || isRouteActive
            ? isNavbarDark
              ? 'bg-gradient-to-b from-zinc-800/90 via-zinc-900/95 to-black/95 text-white ring-1 ring-white/20 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.65)]'
              : 'bg-white text-stone-950 ring-1 ring-stone-200 shadow-sm'
            : isNavbarDark
            ? 'bg-transparent text-zinc-200 hover:text-white hover:bg-white/[0.04]'
            : 'bg-transparent text-stone-700 hover:text-stone-950 hover:bg-stone-100/60'
        )}
      >
        <span>Capabilities</span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180',
            isOpen || isRouteActive
              ? isNavbarDark
                ? 'text-white'
                : 'text-slate-950'
              : isNavbarDark
              ? 'text-zinc-300'
              : 'text-stone-600'
          )}
        />
      </button>

      {/* Split "Live Preview" Frosted-Glass Mega Menu (Portaled to document.body to escape nav backdrop-filter) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Platform Capabilities Menu"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
            className="fixed z-[9999] w-[740px] max-w-[calc(100vw-2rem)] pt-3 -mt-2 select-none"
          >
            <div className="relative rounded-2xl bg-[#090b10]/95 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 shadow-[0_32px_90px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
            {/* Subtle top hairline glow */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

            <div className="grid grid-cols-12 gap-0">
              {/* LEFT PANE (~54% -> col-span-6): Grouped Navigation */}
              <div className="col-span-6 p-4 space-y-3.5 border-r border-white/[0.07]">
                {/* Group 1: COMPETE & RANK */}
                <div className="space-y-1">
                  <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Compete &amp; Rank
                  </div>
                  {competeItems.map((item) => {
                    const isHovered = hoveredItem.id === item.id;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onMouseEnter={() => setHoveredItem(item)}
                        onFocus={() => setHoveredItem(item)}
                        onClick={() => setIsOpen(false)}
                        className={clsx(
                          'flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-[13px] transition-all border',
                          isHovered
                            ? 'bg-white/[0.08] border-white/15 text-white font-semibold shadow-sm'
                            : 'bg-transparent border-transparent text-zinc-300 hover:text-white font-medium'
                        )}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={clsx(
                              'w-1.5 h-1.5 rounded-full shrink-0 transition-opacity',
                              isHovered ? item.dotColor : 'bg-white/25'
                            )}
                          />
                          <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.live && (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shrink-0">
                            Live
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Group 2: BUILD & PRACTICE */}
                <div className="space-y-1 pt-1 border-t border-white/[0.06]">
                  <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Build &amp; Practice
                  </div>
                  {buildItems.map((item) => {
                    const isHovered = hoveredItem.id === item.id;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        target={item.openInNewTab ? '_blank' : undefined}
                        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                        onMouseEnter={() => setHoveredItem(item)}
                        onFocus={() => setHoveredItem(item)}
                        onClick={() => setIsOpen(false)}
                        className={clsx(
                          'flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl text-[13px] transition-all border',
                          isHovered
                            ? 'bg-white/[0.08] border-white/15 text-white font-semibold shadow-sm'
                            : 'bg-transparent border-transparent text-zinc-300 hover:text-white font-medium'
                        )}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={clsx(
                              'w-1.5 h-1.5 rounded-full shrink-0 transition-opacity',
                              isHovered ? item.dotColor : 'bg-white/20'
                            )}
                          />
                          <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT PANE (~46% -> col-span-6): Dynamic Live Preview Card */}
              <div className="col-span-6 p-4 flex">
                <div className="relative w-full rounded-xl bg-black/55 border border-white/10 p-5 flex flex-col justify-between overflow-hidden">
                  {/* Dot-matrix texture */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                    }}
                  />

                  {/* Top Preview Header */}
                  <div className="relative z-10 flex flex-col items-center text-center space-y-2.5">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border',
                        hoveredItem.badgeClass
                      )}
                    >
                      {hoveredItem.live && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span>{hoveredItem.badge}</span>
                    </span>

                    <h3 className="text-lg font-bold text-white tracking-tight font-heading">
                      {hoveredItem.label}
                    </h3>
                  </div>

                  {/* Interactive Mini Preview Stage */}
                  <div className="relative z-10 my-3">
                    <PreviewVisual item={hoveredItem} />
                  </div>

                  {/* Description & Platinum Pill CTA */}
                  <div className="relative z-10 space-y-3 text-center">
                    <p className="text-xs text-zinc-400 leading-relaxed min-h-[34px]">
                      {hoveredItem.description}
                    </p>

                    <Link
                      href={hoveredItem.href}
                      target={hoveredItem.openInNewTab ? '_blank' : undefined}
                      rel={hoveredItem.openInNewTab ? 'noopener noreferrer' : undefined}
                      onClick={() => setIsOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-200 hover:from-white hover:to-white text-slate-950 font-extrabold text-xs tracking-wide shadow-[0_0_22px_rgba(255,255,255,0.28)] border border-white/70 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>{hoveredItem.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
