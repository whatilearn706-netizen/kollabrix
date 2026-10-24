'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Users,
  Flame,
  Plus,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { VisualTemplatesConfig, DEFAULT_VISUAL_TEMPLATES_CONFIG } from '@/types/masterControl';

export function FloatingQuickDock() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Check if active in master control config
  useEffect(() => {
    const checkConfig = () => {
      try {
        const stored = localStorage.getItem('linkora_master_control_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          const vt: VisualTemplatesConfig = parsed?.visualTemplates || DEFAULT_VISUAL_TEMPLATES_CONFIG;
          setIsVisible(Boolean(vt.allEnabled && vt.floatingDock));
          return;
        }
      } catch (e) {}

      // Fallback: check cookie
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/linkora_master_control_config=([^;]+)/);
        if (match) {
          try {
            const parsed = JSON.parse(decodeURIComponent(match[1]));
            const vt: VisualTemplatesConfig = parsed?.visualTemplates || DEFAULT_VISUAL_TEMPLATES_CONFIG;
            setIsVisible(Boolean(vt.allEnabled && vt.floatingDock));
            return;
          } catch (e) {}
        }
      }

      setIsVisible(true);
    };

    checkConfig();
    window.addEventListener('linkora_master_control_updated', checkConfig);
    return () => window.removeEventListener('linkora_master_control_updated', checkConfig);
  }, []);

  // Hide in Admin Control Center to avoid overlapping admin controls
  if (pathname?.startsWith('/control-center-7x9') || pathname?.startsWith('/admin')) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const dockItems = [
    { label: 'Home', href: '/', icon: Home, isActive: pathname === '/' },
    { label: 'Explore', href: '/explore', icon: Compass, isActive: pathname?.startsWith('/explore') },
    { label: 'Teammates', href: '/teammates', icon: Users, isActive: pathname?.startsWith('/teammates') },
  ];

  return (
    <aside aria-label="Quick Actions Dock" className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 select-none animate-fade-in pointer-events-auto">
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-black/75 border border-stone-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        
        {/* Main Navigation Icons */}
        {dockItems.map((item, index) => {
          const Icon = item.icon;
          const isHovered = hoveredIdx === index;
          return (
            <Link
              key={item.label}
              href={item.href}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2.5 sm:p-3 rounded-xl transition-all duration-200 relative group flex items-center justify-center ${
                item.isActive
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'bg-white/5 border border-white/5 text-stone-300 hover:text-white hover:bg-orange-500/15 hover:border-orange-500/30'
              } ${isHovered ? 'scale-110 -translate-y-1' : ''}`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              {item.isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
              )}
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1C1916] text-stone-200 text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-stone-700/80 shadow-md">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Subtle Separator */}
        <div className="w-px h-5 bg-stone-700/60 mx-0.5 sm:mx-1" />

        {/* Resources Pill (Liquid Chrome Skeuomorphic Style) */}
        <Link
          href="/resources"
          onMouseEnter={() => setHoveredIdx(98)}
          onMouseLeave={() => setHoveredIdx(null)}
          className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-stone-850 via-stone-750 to-stone-850 border border-stone-600/80 text-stone-100 font-mono text-xs font-bold flex items-center gap-1.5 shadow-md hover:border-amber-400/80 transition-all group relative ${
            pathname?.startsWith('/resources') ? 'border-amber-400 text-amber-300' : ''
          } ${hoveredIdx === 98 ? 'scale-105 -translate-y-1' : ''}`}
        >
          <span className="tracking-wide">RESOURCES</span>
          <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-[8px] text-white font-black shadow-inner">
            ✏️
          </span>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1C1916] text-stone-200 text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-stone-700/80 shadow-md">
            Hub ↗
          </span>
        </Link>

        {/* Daily Streak Indicator */}
        <Link
          href="/resources"
          onMouseEnter={() => setHoveredIdx(99)}
          onMouseLeave={() => setHoveredIdx(null)}
          className={`p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 text-amber-400 hover:text-white hover:bg-orange-500/20 hover:border-orange-500/40 transition-all relative group flex items-center justify-center ${
            hoveredIdx === 99 ? 'scale-110 -translate-y-1' : ''
          }`}
        >
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-orange-500" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1C1916] text-stone-200 text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-stone-700/80 shadow-md">
            Streak: 24 🔥
          </span>
        </Link>

        {/* + Build CTA */}
        <Link
          href="/projects/new"
          onMouseEnter={() => setHoveredIdx(100)}
          onMouseLeave={() => setHoveredIdx(null)}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F59E0B] text-white font-bold text-xs flex items-center gap-1 shadow-lg shadow-orange-500/30 hover:opacity-95 transition-all group relative active:scale-95 ${
            hoveredIdx === 100 ? 'scale-105 -translate-y-1' : ''
          }`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Build</span>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1C1916] text-stone-200 text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-stone-700/80 shadow-md">
            Start Project
          </span>
        </Link>

      </div>
    </aside>
  );
}
