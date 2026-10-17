'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Zap,
  Share2,
  Check,
  ArrowRight,
  Clock,
  ShieldCheck,
  Code2,
  Palette,
  BookOpen,
  Send,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  totalCheckIns: number;
  history: Array<{
    date: string;
    category: string;
    note: string;
    xp: number;
  }>;
}

const STORAGE_KEY = 'linkora_daily_streak_v1';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function useDailyStreak() {
  const { user, profile } = useAuth();
  const [streakState, setStreakState] = useState<StreakState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return {
      currentStreak: 3,
      longestStreak: 5,
      lastCheckInDate: getYesterdayString(),
      totalCheckIns: 12,
      history: [
        {
          date: getYesterdayString(),
          category: 'Shipped Code',
          note: 'Wired up Supabase authentication and session middleware',
          xp: 50,
        },
      ],
    };
  });

  const today = getTodayString();
  const isCheckedInToday = streakState.lastCheckInDate === today;

  // Sync with profile if available
  useEffect(() => {
    if (profile) {
      const pStreak = (profile as any).current_streak;
      const pLongest = (profile as any).longest_streak;
      const pLast = (profile as any).last_check_in_date;
      if (typeof pStreak === 'number' && pStreak >= 0) {
        setStreakState((prev) => ({
          ...prev,
          currentStreak: pStreak,
          longestStreak: Math.max(pLongest || pStreak, prev.longestStreak),
          lastCheckInDate: pLast || prev.lastCheckInDate,
        }));
      }
    }
  }, [profile]);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(streakState));
    } catch (e) {}
  }, [streakState]);

  const performCheckIn = async (category: string, note: string) => {
    if (isCheckedInToday) return streakState;

    const yesterday = getYesterdayString();
    let newStreak = 1;

    if (streakState.lastCheckInDate === yesterday) {
      newStreak = streakState.currentStreak + 1;
    } else if (streakState.lastCheckInDate === today) {
      newStreak = streakState.currentStreak;
    } else {
      // Streak broken, restart at 1
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, streakState.longestStreak);
    const newEntry = {
      date: today,
      category,
      note: note.trim() || 'Logged daily engineering build sprint',
      xp: 50,
    };

    const updated: StreakState = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCheckInDate: today,
      totalCheckIns: streakState.totalCheckIns + 1,
      history: [newEntry, ...streakState.history.slice(0, 14)],
    };

    setStreakState(updated);

    // Save to Supabase if logged in
    if (user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_check_in_date: today,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('Could not sync streak to Supabase:', err);
      }
    }

    return updated;
  };

  return {
    streakState,
    isCheckedInToday,
    performCheckIn,
  };
}

// -------------------------------------------------------------
// 1. NAVBAR FLAME BUTTON
// -------------------------------------------------------------
export function StreakNavbarButton({ onClick }: { onClick: () => void }) {
  const { streakState, isCheckedInToday } = useDailyStreak();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs select-none ${
        isCheckedInToday
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-500 hover:bg-amber-500/25'
          : 'bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30 animate-pulse'
      }`}
      title={
        isCheckedInToday
          ? `🔥 ${streakState.currentStreak}-Day Streak Preserved Today!`
          : `🔥 ${streakState.currentStreak}-Day Streak pending! Click to log today's build.`
      }
      aria-label="Daily Build Streak"
    >
      <Flame
        className={`w-4 h-4 ${
          isCheckedInToday ? 'text-amber-500 fill-amber-500' : 'text-orange-500 fill-orange-500 animate-bounce'
        }`}
      />
      <span className="font-mono text-xs font-black">{streakState.currentStreak}</span>
      {!isCheckedInToday && (
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
      )}
    </button>
  );
}

// -------------------------------------------------------------
// 2. HOMEPAGE & WORKSPACE STREAK BANNER
// -------------------------------------------------------------
export function DailyStreakBanner({ onOpenCheckIn }: { onOpenCheckIn: () => void }) {
  const { streakState, isCheckedInToday } = useDailyStreak();

  // Weekly pills (Last 7 days)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-charcoal-900 to-slate-950 border border-amber-500/30 shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left: Streak Status & Headline */}
      <div className="flex items-center gap-4 relative z-10">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 ${
            isCheckedInToday
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-orange-600/30 border-orange-500/60 text-orange-400 animate-pulse'
          }`}
        >
          <Flame className="w-6 h-6 fill-current" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
              <span>{streakState.currentStreak}-Day Daily Build Streak</span>
              {isCheckedInToday ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ✓ Preserved Today
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse">
                  ⚡ Check-In Pending
                </span>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isCheckedInToday
              ? 'Great work shipping today! Your streak is secured. Return tomorrow to climb the campus leaderboard.'
              : 'Keep the momentum going! Log what you built or learned today to keep your streak alive.'}
          </p>
        </div>
      </div>

      {/* Middle: 7-Day Calendar Dots */}
      <div className="flex items-center gap-1.5 sm:gap-2 self-start md:self-center relative z-10">
        {daysOfWeek.map((day, idx) => {
          const isToday = idx === currentDayIndex;
          const isPast = idx < currentDayIndex;
          const isCompleted = isPast || (isToday && isCheckedInToday);

          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-400">{day}</span>
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                  isCompleted
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                    : isToday
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300 animate-pulse'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-500'
                }`}
              >
                {isCompleted ? '✓' : isToday ? '🔥' : '·'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Action Button */}
      <div className="relative z-10 shrink-0">
        <button
          type="button"
          onClick={onOpenCheckIn}
          className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            isCheckedInToday
              ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black shadow-lg shadow-orange-950/40'
          }`}
        >
          {isCheckedInToday ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Streak Milestones</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
              <span>🔥 Log Today's Build Sprint</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. DAILY CHECK-IN MODAL (INTERACTIVE LOGGING & CONFETTI)
// -------------------------------------------------------------
interface DailyStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHECK_IN_CATEGORIES = [
  { id: 'code', label: 'Shipped Code / Merged PR', icon: Code2, color: 'text-emerald-400' },
  { id: 'project', label: 'Built Project / Hackathon Task', icon: Zap, color: 'text-amber-400' },
  { id: 'design', label: 'UI/UX Design / Figma System', icon: Palette, color: 'text-purple-400' },
  { id: 'learning', label: 'Learned Tech / Read Documentation', icon: BookOpen, color: 'text-cyan-400' },
];

export function DailyStreakModal({ isOpen, onClose }: DailyStreakModalProps) {
  const { streakState, isCheckedInToday, performCheckIn } = useDailyStreak();
  const [selectedCategory, setSelectedCategory] = useState(CHECK_IN_CATEGORIES[0].label);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await performCheckIn(selectedCategory, note);
    setIsSubmitting(false);
    setJustCheckedIn(true);
  };

  const handleCopyShare = () => {
    const text = `🔥 Day ${streakState.currentStreak} on my Linkora Daily Build Streak!\n\nToday I worked on: ${
      note || selectedCategory
    }\n\nJoin the collegiate builder movement: https://linkora-link.online`;
    navigator.clipboard?.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-white my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Daily Builder Sprint Check-In</h3>
              <p className="text-xs text-slate-400">Log 1 action every day to maintain your collegiate streak.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {justCheckedIn || isCheckedInToday ? (
          // ==========================================
          // SUCCESS STATE / STREAK PRESERVED VIEW
          // ==========================================
          <div className="space-y-6 text-center py-2 animate-fadeIn">
            {/* Flame Milestone Hero */}
            <div className="relative inline-block mx-auto">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-orange-500/30 animate-bounce">
                <Flame className="w-12 h-12 fill-current" />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-slate-950 text-amber-400 border border-amber-400 shadow-md">
                +50 XP
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-white">
                🔥 {streakState.currentStreak}-Day Streak Secured!
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Awesome work shipping today. Your streak is active and your campus ranking points have increased.
              </p>
            </div>

            {/* Streak Milestone Track */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-slate-400 font-medium">Current</div>
                <div className="text-lg font-black text-amber-400 font-mono">
                  {streakState.currentStreak} Days
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Personal Best</div>
                <div className="text-lg font-black text-white font-mono">
                  {streakState.longestStreak} Days
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Total Check-Ins</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {streakState.totalCheckIns}
                </div>
              </div>
            </div>

            {/* Share to Social Action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyShare}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md"
              >
                {copiedShare ? <Check className="w-4 h-4 text-slate-950" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedShare ? 'Copied Streak Proof!' : 'Share Streak on LinkedIn / X'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          // ==========================================
          // CHECK-IN FORM VIEW
          // ==========================================
          <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
            {/* Step 1: Category Chips */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                1. What did you work on today?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHECK_IN_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.label;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.label)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition text-xs font-medium ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-xs'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${cat.color} shrink-0`} />
                      <span className="line-clamp-1">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Optional Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                2. Quick note (Optional, what did you ship?)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Fixed responsive layout for hackathon project, pushed 3 commits..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Streak Preservation Guarantee Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
                <span>
                  Check-in preserves your streak until <strong className="text-white">midnight tomorrow</strong>.
                </span>
              </div>
              <span className="font-mono text-amber-400 font-bold shrink-0">+50 XP</span>
            </div>

            {/* Submit Action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 disabled:opacity-60"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>{isSubmitting ? 'Securing Streak...' : '🔥 Secure Today\'s Streak (+1 Day)'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-750 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
