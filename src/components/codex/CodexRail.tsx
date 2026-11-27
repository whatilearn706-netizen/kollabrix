'use client';

import React from 'react';
import Link from 'next/link';
import { Home, BookOpen, Zap, Bookmark, Gift } from 'lucide-react';
import { CodexSection } from '@/data/codexCatalog';
import { KaBrandEmblem } from '@/components/brands/KaBrandSuite';
import { getKaFolioHomePath } from '@/lib/kaBrandDomains';

interface CodexRailProps {
  activeSection: CodexSection;
  onSelectSection: (s: CodexSection) => void;
  savedCount: number;
}

const RAIL_ITEMS: Array<{
  id: CodexSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Home · Language Tracks', icon: Home },
  { id: 'books', label: 'Books · 3D Shelf', icon: BookOpen },
  { id: 'solving', label: 'Problem Solving Playbooks', icon: Zap },
  { id: 'saved', label: 'Saved Folio', icon: Bookmark },
 { id: 'vault', label: 'Perks & Major Projects', icon: Gift },
];

export function CodexRail({ activeSection, onSelectSection, savedCount }: CodexRailProps) {
  return (
    <>
      {/* Desktop Left Vertical Editorial Rail */}
      <aside
        aria-label="KΛ Folio Navigation"
        className="hidden md:flex flex-col items-center justify-between w-[74px] shrink-0 py-6 border-r border-white/[0.07] bg-[#06080D]/90 backdrop-blur-xl select-none z-20"
      >
        <Link
          href={getKaFolioHomePath()}
          title="Open KΛ FOLIO Website"
          className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 flex items-center justify-center transition-all group"
        >
          <KaBrandEmblem className="w-6 h-3.5" />
        </Link>

        <nav className="flex flex-col items-center gap-3.5">
          {RAIL_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer group ${
                  active
                    ? 'bg-gradient-to-b from-white via-slate-200 to-slate-300 text-slate-950 shadow-[0_0_24px_rgba(226,232,240,0.38)] ring-4 ring-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.07] border border-transparent hover:border-white/10'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.id === 'saved' && savedCount > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-mono font-black flex items-center justify-center ${
                      active ? 'bg-zinc-950 text-amber-300' : 'bg-amber-400 text-zinc-950'
                    }`}
                  >
                    {savedCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="text-[9px] font-mono tracking-widest uppercase text-zinc-600 [writing-mode:vertical-rl] rotate-180">
          FOLIO
        </div>
      </aside>

      {/* Mobile Compact Icon Pill Strip */}
      <div className="md:hidden flex items-center justify-around gap-1 px-3 py-2 border-b border-white/[0.08] bg-[#06080D]/95">
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              title={item.label}
              className={`relative px-3 py-2 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-white/[0.03]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.id === 'saved' && savedCount > 0 && (
                <span className="text-[10px] font-mono font-bold">({savedCount})</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
