'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SquarePen,
  Search,
  PanelLeftClose,
  Code2,
  Brain,
  Trophy,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { SparkChatMessage } from './SparkSuperpowersPanel';

export type SparkMode = 'general' | 'code' | 'dsa' | 'hackathon';

export interface StoredSparkThread {
  id: string;
  title: string;
  mode: SparkMode;
  messages: SparkChatMessage[];
  blueprint?: any;
  updatedAt: string;
  remoteId?: string;
}

interface SparkSidebarProps {
  threads: StoredSparkThread[];
  activeThreadId: string | null;
  activeMode: SparkMode;
  isNewChatState: boolean;
  user: any;
  profile: any;
  deepRemaining: number;
  onNewChat: () => void;
  onSelectMode: (mode: SparkMode) => void;
  onSelectThread: (thread: StoredSparkThread) => void;
  onDeleteThread: (id: string, remoteId?: string) => void;
  onCloseSidebar: () => void;
}

/**
 * Clean, distraction-free ChatGPT-style left sidebar for AI Spark.
 */
export function SparkSidebar({
  threads,
  activeThreadId,
  activeMode,
  isNewChatState,
  user,
  profile,
  deepRemaining,
  onNewChat,
  onSelectMode,
  onSelectThread,
  onDeleteThread,
  onCloseSidebar,
}: SparkSidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = searchQuery.trim()
    ? threads.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : threads;

  const displayName =
    profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Guest Builder';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside className="relative z-30 w-[260px] h-full shrink-0 bg-[#080A0F] border-r border-white/[0.08] flex flex-col justify-between select-none">
      {/* Top Brand + Controls */}
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="flex items-center gap-2 group" title="Back to Kollabrix Home">
            <BrandLogo size="sm" showWordmark={false} />
            <span className="text-[13px] font-black tracking-[0.14em] text-white group-hover:text-zinc-300 transition-colors">
              KOLLΛBRIX
            </span>
          </Link>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setSearchQuery('');
              }}
              title="Search recents"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCloseSidebar}
              title="Close sidebar"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            autoFocus
            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/12 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
          />
        )}

        {/* Primary Clean Modes (Monochrome Minimalist) */}
        <nav className="space-y-0.5 text-[13px]">
          <button
            type="button"
            onClick={onNewChat}
            className={`w-full px-2.5 py-2 rounded-xl font-medium flex items-center justify-between transition-colors cursor-pointer ${
              isNewChatState
                ? 'bg-white/[0.09] text-white'
                : 'text-zinc-200 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <SquarePen className="w-4 h-4 text-zinc-300" />
              <span>New chat</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('code')}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeMode === 'code'
                ? 'bg-white/[0.09] text-white font-medium'
                : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100'
            }`}
          >
            <Code2 className="w-4 h-4 text-zinc-400" />
            <span>Code Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('dsa')}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeMode === 'dsa'
                ? 'bg-white/[0.09] text-white font-medium'
                : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100'
            }`}
          >
            <Brain className="w-4 h-4 text-zinc-400" />
            <span>DSA &amp; Placements</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('hackathon')}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeMode === 'hackathon'
                ? 'bg-white/[0.09] text-white font-medium'
                : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-zinc-400" />
            <span>Hackathon Studio</span>
          </button>
        </nav>
      </div>

      {/* Scrollable Recents Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-2.5 pb-1 text-[11px] font-medium text-zinc-500">Recents</div>
        {filteredThreads.length === 0 ? (
          <p className="px-2.5 py-2 text-xs text-zinc-600">No conversations yet.</p>
        ) : (
          filteredThreads.map((t) => {
            const isActive = activeThreadId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => onSelectThread(t)}
                className={`group px-2.5 py-2 rounded-xl text-[13px] flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-white/[0.1] text-white font-medium'
                    : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span className="truncate flex-1">{t.title}</span>
                <button
                  type="button"
                  aria-label="Delete chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(t.id, t.remoteId);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom User & Quota Footer */}
      <div className="p-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-white/15 border border-white/20 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-zinc-100 truncate">{displayName}</div>
            <div className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>KΛ-Pro: {deepRemaining} left</span>
            </div>
          </div>
        </div>
        {!user && (
          <Link
            href="/login"
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white shrink-0 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
