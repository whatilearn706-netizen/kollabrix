'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Gift, Zap } from 'lucide-react';

export function ResourcesSubNav() {
  const pathname = usePathname() || '';

  const navItems = [
    {
      href: '/resources',
      label: 'Learning Roadmaps',
      icon: BookOpen,
      badge: 'ROADMAPS',
      badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
      isActive: pathname === '/resources',
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
      badgeColor: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
      isActive: pathname === '/starter-kits',
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-white/80 dark:bg-charcoal-900/80 border border-slate-200/90 dark:border-white/10 backdrop-blur-xl shadow-xs scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              item.isActive
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-extrabold border ${item.badgeColor}`}
            >
              {item.badge}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
