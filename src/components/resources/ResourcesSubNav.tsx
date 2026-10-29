'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Gift, Zap, Sparkles } from 'lucide-react';

export function ResourcesSubNav() {
  const pathname = usePathname() || '';

  const navItems = [
    {
      href: '/resources',
      label: 'Learning Roadmaps',
      icon: BookOpen,
      badge: 'ROADMAPS',
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      isActive: pathname === '/resources',
    },
    {
      href: '/passport',
      label: 'Holographic Passports',
      icon: Sparkles,
      badge: 'FLIGHT RECORDER',
      badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      isActive: pathname === '/passport',
    },
    {
      href: '/perks',
      label: 'Student Perks Vault ($14K+)',
      icon: Gift,
      badge: '100% FREE',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      isActive: pathname === '/perks',
    },
    {
      href: '/starter-kits',
      label: 'Hackathon Starter Kits',
      icon: Zap,
      badge: '1-CLICK MVP',
      badgeColor: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
      isActive: pathname === '/starter-kits',
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-slate-950/80 border border-stone-800/80 backdrop-blur-2xl shadow-xl scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              item.isActive
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-stone-300 hover:text-white hover:bg-stone-900/80 border border-transparent hover:border-stone-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-extrabold border ${
                item.isActive ? 'bg-slate-950/20 text-slate-950 border-slate-950/30' : item.badgeColor
              }`}
            >
              {item.badge}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
