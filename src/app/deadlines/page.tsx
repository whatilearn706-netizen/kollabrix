'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Trophy,
  Lightbulb,
  Terminal,
  Zap,
  ArrowRight,
  ExternalLink,
  Search,
  Share2,
  Check,
  AlertTriangle,
  Sparkles,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { CampusDeadlineItem } from '@/types/communityFeatures';

function formatCountdown(targetDateStr: string) {
  const diff = new Date(targetDateStr).getTime() - Date.now();
  if (diff <= 0) return { expired: true, text: 'Deadline Passed', days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { expired: false, days, hours, minutes, seconds };
}

export default function CollegiateDeadlinesPage() {
  const [deadlines, setDeadlines] = useState<CampusDeadlineItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1-second interval to keep live countdowns ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch deadlines with no-store to prevent stale cache
  useEffect(() => {
    async function loadDeadlines() {
      try {
        const res = await fetch('/api/deadlines', { cache: 'no-store' });
        const data = await res.json();
        if (data.deadlines && Array.isArray(data.deadlines)) {
          setDeadlines(data.deadlines);
        } else {
          setDeadlines([]);
        }
      } catch (err) {
        console.warn('Deadlines fetch note:', err);
        setDeadlines([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadDeadlines();
  }, []);

  const handleCopyLink = (id: string, link: string) => {
    const fullUrl = window.location.origin + link;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDeadlines = deadlines.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => {
    if (a.is_sponsored && !b.is_sponsored) return -1;
    if (!a.is_sponsored && b.is_sponsored) return 1;
    return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-7">
        {/* Header Hero */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#090C12] border border-white/15 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>COLLEGIATE DEADLINE RADAR</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Upcoming Campus Opportunities &amp; Cutoffs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Scan live competition cutoffs, faculty submission deadlines, and practice rounds — tap View &amp; Apply for full details.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#090C12] border border-white/10 shadow-sm">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Cutoffs' },
              { id: 'hackathon', label: 'Hackathons' },
              { id: 'problem', label: 'Faculty Problems' },
              { id: 'icpc', label: 'ICPC Contests' },
              { id: 'grant', label: 'Grants & Sprints' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-gradient-to-b from-white to-zinc-200 text-zinc-950 border border-white/60 shadow-xs'
                    : 'bg-black/45 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunity..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-white/12 bg-black/60 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/35 transition-colors"
            />
          </div>
        </div>

        {/* Compact Deadlines List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[#090C12] border border-white/10 animate-pulse flex items-center justify-between gap-4"
                >
                  <div className="space-y-2 w-full max-w-md">
                    <div className="h-3.5 bg-white/10 rounded w-1/3" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </div>
                  <div className="h-9 w-36 bg-white/10 rounded-xl shrink-0" />
                </div>
              ))}
            </div>
          ) : sortedDeadlines.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-[#090C12] border border-white/10 space-y-2.5">
              <Clock className="w-8 h-8 text-zinc-400 mx-auto opacity-70" />
              <h3 className="text-sm font-bold text-white">No Deadlines On Radar</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No active competition cutoffs, problem deadlines, or grant windows found.
              </p>
            </div>
          ) : (
            sortedDeadlines.map((item) => {
              const countdown = formatCountdown(item.deadlineDate);
              const isUrgent =
                !countdown.expired &&
                (countdown.days < 3 || item.urgency === 'urgent');

              return (
                <div
                  key={item.id}
                  className="p-4 sm:px-5 sm:py-4 rounded-2xl bg-[#090C12] border border-white/10 hover:border-white/25 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left: Compact Essential Info (tap View & Apply for full details) */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1 border ${
                          countdown.expired
                            ? 'bg-white/[0.04] border-white/10 text-zinc-400'
                            : isUrgent
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            countdown.expired
                              ? 'bg-zinc-500'
                              : isUrgent
                              ? 'bg-rose-400 animate-pulse'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span>
                          {countdown.expired
                            ? 'Closed'
                            : isUrgent
                            ? 'Closing Soon'
                            : 'Open'}
                        </span>
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/[0.06] text-zinc-300 border border-white/10">
                        {item.category}
                      </span>

                      {item.is_sponsored && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/10 text-zinc-200 border border-white/20">
                          {item.company_name || 'Partner'}
                        </span>
                      )}

                      {item.prize && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/[0.05] text-zinc-200 border border-white/12 truncate max-w-[220px]">
                          {item.prize}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1 truncate shrink-0">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[240px]">{item.organizer}</span>
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Right: Compact Live Timer + Share + View & Apply CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                    {countdown.expired ? (
                      <span className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono font-semibold text-zinc-400">
                        Closed
                      </span>
                    ) : (
                      <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/12 font-mono text-xs font-bold text-white tabular-nums flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>
                          {String(countdown.days).padStart(2, '0')}d :{' '}
                          {String(countdown.hours).padStart(2, '0')}h :{' '}
                          {String(countdown.minutes).padStart(2, '0')}m :{' '}
                          <span className={isUrgent ? 'text-rose-400' : 'text-zinc-200'}>
                            {String(countdown.seconds).padStart(2, '0')}s
                          </span>
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.id, item.link)}
                      className="p-2 rounded-xl border border-white/12 bg-black/55 hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Copy link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <Link
                      href={item.link}
                      className="px-4 py-2 rounded-xl bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white text-zinc-950 border border-white/60 text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all whitespace-nowrap"
                    >
                      <span>View &amp; Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
