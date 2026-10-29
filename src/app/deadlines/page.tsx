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
import { CampusDeadlineItem, DEFAULT_CAMPUS_DEADLINES } from '@/types/communityFeatures';

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
  const [deadlines, setDeadlines] = useState<CampusDeadlineItem[]>(DEFAULT_CAMPUS_DEADLINES);
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

  // Fetch deadlines
  useEffect(() => {
    async function loadDeadlines() {
      try {
        const res = await fetch('/api/deadlines');
        const data = await res.json();
        if (data.deadlines && Array.isArray(data.deadlines)) {
          setDeadlines(data.deadlines);
        }
      } catch (err) {
        console.warn('Deadlines fetch note:', err);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>COLLEGIATE DEADLINE RADAR</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Upcoming Campus Opportunities & Cutoffs
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Never miss a hackathon team registration cutoff, faculty problem submission deadline, or ICPC arena round. Synchronized with live timers.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Cutoffs' },
              { id: 'hackathon', label: '🏆 Hackathons' },
              { id: 'problem', label: '💡 Faculty Problems' },
              { id: 'icpc', label: '⚡ ICPC Contests' },
              { id: 'grant', label: '💰 Grants & Sprints' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunity..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Deadlines Radar Grid */}
        <div className="space-y-4">
          {filteredDeadlines.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-3">
              <Clock className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Deadlines On Radar</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active competition cutoffs, problem deadlines, or grant application windows found. Check back soon!
              </p>
            </div>
          ) : (
            filteredDeadlines.map((item) => {
            const countdown = formatCountdown(item.deadlineDate);
            const isUrgent =
              !countdown.expired &&
              (countdown.days < 3 || item.urgency === 'urgent');

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl bg-white dark:bg-charcoal-900 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm hover:shadow-md ${
                  isUrgent
                    ? 'border-rose-500/40 dark:border-rose-500/30'
                    : 'border-slate-200 dark:border-charcoal-800'
                }`}
              >
                {/* Left: Info */}
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
                        isUrgent
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse'
                          : 'bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {countdown.expired
                        ? 'Expired'
                        : isUrgent
                        ? 'Closing Soon'
                        : 'Open Now'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                      {item.category}
                    </span>

                    {item.prize && (
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {item.prize}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.organizer}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-slate-600 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Live Countdown Clock & Register CTA */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-charcoal-800">
                  {/* Countdown Digital Readout */}
                  <div className="space-y-1 text-left sm:text-right lg:text-right">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Time Remaining
                    </div>
                    {countdown.expired ? (
                      <div className="text-sm font-bold text-rose-500">
                        Applications Closed
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 font-mono">
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-center">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {String(countdown.days).padStart(2, '0')}
                          </span>
                          <span className="block text-[8px] uppercase text-slate-400">Days</span>
                        </div>
                        <span className="text-slate-400 font-bold">:</span>
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-center">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {String(countdown.hours).padStart(2, '0')}
                          </span>
                          <span className="block text-[8px] uppercase text-slate-400">Hrs</span>
                        </div>
                        <span className="text-slate-400 font-bold">:</span>
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-center">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {String(countdown.minutes).padStart(2, '0')}
                          </span>
                          <span className="block text-[8px] uppercase text-slate-400">Min</span>
                        </div>
                        <span className="text-slate-400 font-bold">:</span>
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-center">
                          <span className="text-base font-black text-rose-500">
                            {String(countdown.seconds).padStart(2, '0')}
                          </span>
                          <span className="block text-[8px] uppercase text-slate-400">Sec</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action CTAs */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.id, item.link)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 hover:bg-slate-100 dark:hover:bg-charcoal-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Share link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                    <Link
                      href={item.link}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-all"
                    >
                      <span>View & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}
