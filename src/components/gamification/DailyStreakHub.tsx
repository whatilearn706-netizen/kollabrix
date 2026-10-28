'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  PlusCircle,
  Users,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';

export interface StreakHistoryEntry {
  date: string;
  category: string;
  note: string;
  xp: number;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  totalCheckIns: number;
  history: StreakHistoryEntry[];
}

export interface StreakActionResult {
  success: boolean;
  type: 'UNLOCKED_DAY_1' | 'INCREMENTED' | 'ALREADY_COMPLETED_TODAY' | 'RESTARTED';
  currentStreak: number;
  message: string;
}

const STORAGE_KEY = 'linkora_daily_streak_v2';

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function dispatchStreakEvent(detail: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('linkora_streak_event', { detail }));
  }
}

/**
 * Global function to record streak actions from anywhere in the app:
 * - Project published (Unlocks Day 1 if streak is 0)
 * - Workspace activity (Accepting applicants, adding teammates, updating tasks - unlocks next day)
 * - Manual sprint check-in
 *
 * Rule: Only increments ONCE per calendar day ("BUT OTHER DAY NOT ON THAT DAY SO IT DEPEND ON DAY")
 */
export async function recordDailyStreakActivity(options: {
  type: 'PROJECT_PUBLISHED' | 'WORKSPACE_ACTIVITY' | 'SPRINT_LOG';
  note: string;
  title?: string;
  userId?: string;
}): Promise<StreakActionResult> {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Load current state
  let state: StreakState = {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: null,
    totalCheckIns: 0,
    history: [],
  };

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        state = JSON.parse(cached);
      }
    } catch {}
  }

  let resultType: StreakActionResult['type'] = 'INCREMENTED';
  let newStreak = state.currentStreak;
  let message = '';

  if (state.currentStreak === 0) {
    // -----------------------------------------------------------------
    // DAY 0 -> DAY 1: User publishes their first project or sprint
    // -----------------------------------------------------------------
    newStreak = 1;
    resultType = 'UNLOCKED_DAY_1';
    message = '🔥 Daily Streak Ignited! Day 1 Unlocked! Return tomorrow to do workspace activity and reach Day 2.';
  } else if (state.lastCheckInDate === today) {
    // -----------------------------------------------------------------
    // SAME CALENDAR DAY: Do not increment again today!
    // ("BUT OTHER DAY NOT ON THAT DAY SO IT DEPEND ON DAY")
    // -----------------------------------------------------------------
    resultType = 'ALREADY_COMPLETED_TODAY';
    message = `⚡ Today's streak (Day ${state.currentStreak}) is already secured! Return tomorrow for Day ${state.currentStreak + 1}.`;

    dispatchStreakEvent({
      resultType,
      currentStreak: state.currentStreak,
      message,
      action: options,
    });

    return {
      success: true,
      type: resultType,
      currentStreak: state.currentStreak,
      message,
    };
  } else if (state.lastCheckInDate === yesterday) {
    // -----------------------------------------------------------------
    // NEXT CONSECUTIVE DAY: Increment by 1!
    // -----------------------------------------------------------------
    newStreak = state.currentStreak + 1;
    resultType = 'INCREMENTED';
    message = `🔥 Streak Extended to Day ${newStreak}! Great job working in your workspace today.`;
  } else {
    // -----------------------------------------------------------------
    // MISSED A DAY (Broken Streak): Restarts at 1 today
    // -----------------------------------------------------------------
    newStreak = 1;
    resultType = 'RESTARTED';
    message = `🔥 Fresh Streak Started! Day 1 secured today.`;
  }

  const newLongest = Math.max(newStreak, state.longestStreak || 0);
  const newEntry: StreakHistoryEntry = {
    date: today,
    category:
      options.type === 'PROJECT_PUBLISHED'
        ? 'Project Published'
        : options.type === 'WORKSPACE_ACTIVITY'
        ? 'Workspace Activity'
        : 'Sprint Check-In',
    note: options.note.trim() || options.title?.trim() || 'Logged daily engineering activity',
    xp: 50,
  };

  const updatedState: StreakState = {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastCheckInDate: today,
    totalCheckIns: (state.totalCheckIns || 0) + 1,
    history: [newEntry, ...(state.history || []).slice(0, 14)],
  };

  // Persist locally
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch {}
  }

  // Persist to Supabase if session exists
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = options.userId || sessionData?.session?.user?.id;
    if (uid) {
      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_check_in_date: today,
          total_check_ins: updatedState.totalCheckIns,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('user_id', uid);
    }
  } catch (err) {
    console.warn('Could not sync streak to Supabase:', err);
  }

  // Broadcast event across components
  dispatchStreakEvent({
    resultType,
    currentStreak: newStreak,
    message,
    action: options,
  });

  return {
    success: true,
    type: resultType,
    currentStreak: newStreak,
    message,
  };
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
    // Default for brand new account: starts at 0!
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
      totalCheckIns: 0,
      history: [],
    };
  });

  const today = getTodayString();
  const isCheckedInToday = Boolean(streakState.lastCheckInDate === today);

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
          longestStreak: Math.max(pLongest || pStreak, prev.longestStreak || 0),
          lastCheckInDate: pLast || prev.lastCheckInDate,
        }));
      }
    }
  }, [profile]);

  // Listen to cross-component streak updates
  useEffect(() => {
    const handleStreakEvent = (e: any) => {
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            setStreakState(JSON.parse(cached));
          }
        } catch {}
      }
    };

    window.addEventListener('linkora_streak_event', handleStreakEvent);
    return () => window.removeEventListener('linkora_streak_event', handleStreakEvent);
  }, []);

  const performCheckIn = async (category: string, note: string) => {
    const res = await recordDailyStreakActivity({
      type: 'SPRINT_LOG',
      note: `${category}: ${note}`,
      userId: user?.id,
    });
    return res;
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
  const isDayZero = streakState.currentStreak === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all border shadow-2xs select-none shrink-0 ${
        isDayZero
          ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-orange-500/50 hover:text-white'
          : isCheckedInToday
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-500 hover:bg-amber-500/25'
          : 'bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30'
      }`}
      title={
        isDayZero
          ? '🔥 Streak: 0 Days. Click to check in or start building!'
          : isCheckedInToday
          ? `🔥 Day ${streakState.currentStreak} Streak Preserved Today!`
          : `🔥 Day ${streakState.currentStreak} Streak pending! Click to log today's build.`
      }
      aria-label="Daily Build Streak"
    >
      <Flame
        className={`w-3.5 h-3.5 ${
          isDayZero
            ? 'text-slate-400'
            : isCheckedInToday
            ? 'text-amber-500 fill-amber-500'
            : 'text-orange-500 fill-orange-500'
        }`}
      />
      <span className="font-mono text-xs font-black leading-none">{streakState.currentStreak}</span>
    </button>
  );
}

// -------------------------------------------------------------
// 2. HOMEPAGE & WORKSPACE STREAK BANNER
// -------------------------------------------------------------
export function DailyStreakBanner({ onOpenCheckIn }: { onOpenCheckIn: () => void }) {
  const { streakState, isCheckedInToday } = useDailyStreak();
  const isDayZero = streakState.currentStreak === 0;

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
            isDayZero
              ? 'bg-slate-800 border-slate-700 text-slate-400'
              : isCheckedInToday
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-orange-600/30 border-orange-500/60 text-orange-400 animate-pulse'
          }`}
        >
          <Flame className={`w-6 h-6 ${isDayZero ? 'text-slate-400' : 'fill-current'}`} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
              <span>{isDayZero ? 'Daily Build Streak: 0 Days' : `${streakState.currentStreak}-Day Daily Build Streak`}</span>
              {isDayZero ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  🚀 Not Started
                </span>
              ) : isCheckedInToday ? (
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
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            {isDayZero
              ? 'Start and publish your first project proposal to unlock Day 1 of your streak! Tomorrow, do any workspace activity to reach Day 2.'
              : isCheckedInToday
              ? 'Great work shipping today! Your streak is secured. Return tomorrow to do workspace activity and climb the campus leaderboard.'
              : 'Keep the momentum going! Log a build sprint or work in your project workspace today to keep your streak alive.'}
          </p>
        </div>
      </div>

      {/* Middle: 7-Day Calendar Dots */}
      <div className="flex items-center gap-1.5 sm:gap-2 self-start md:self-center relative z-10">
        {daysOfWeek.map((day, idx) => {
          const isToday = idx === currentDayIndex;
          const isPast = idx < currentDayIndex;
          const isCompleted = !isDayZero && (isPast || (isToday && isCheckedInToday));

          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-400">{day}</span>
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                  isCompleted
                    ? 'bg-amber-500/25 border-amber-500/50 text-amber-400 shadow-xs'
                    : isToday
                    ? 'border-orange-500/80 bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/30'
                    : 'border-slate-800 bg-slate-950/60 text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="text-[10px] opacity-70">&bull;</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Action CTA */}
      <div className="flex items-center gap-2 self-start md:self-center shrink-0 relative z-10">
        {isDayZero ? (
          <Link
            href="/projects/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Project for Day 1</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onOpenCheckIn}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center gap-2 ${
              isCheckedInToday
                ? 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700'
                : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 shadow-orange-500/20'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isCheckedInToday ? 'text-amber-400' : 'fill-current'}`} />
            <span>{isCheckedInToday ? 'View Streak Card' : 'Log Today\'s Build Sprint'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. DAILY CHECK-IN & ONBOARDING MODAL
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
  const router = useRouter();
  const { streakState, isCheckedInToday, performCheckIn } = useDailyStreak();
  const isDayZero = streakState.currentStreak === 0;

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
    const text = `🔥 Day ${streakState.currentStreak} on my Kollabrix Daily Build Streak!\n\nToday I worked on: ${
      note || selectedCategory
    }\n\nJoin the collegiate builder movement: https://linkora-link.online`;
    navigator.clipboard?.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-white my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDayZero
                  ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                  : 'bg-orange-500/20 border border-orange-500/40 text-orange-400'
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isDayZero ? 'Unlock Your Daily Build Streak' : 'Daily Builder Sprint Check-In'}
              </h3>
              <p className="text-xs text-slate-400">
                {isDayZero
                  ? 'Start a project to ignite your flame and reach Streak 1.'
                  : 'Log 1 action every day to maintain your collegiate streak.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* DAY 0 ONBOARDING VIEW */}
        {/* ============================================================== */}
        {isDayZero ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/30 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 text-base font-black">
                  🔥 0
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Your Streak Starts at 0</h4>
                  <p className="text-xs text-slate-300">
                    Streaks on Kollabrix represent real proof-of-work, not empty clicks.
                  </p>
                </div>
              </div>

              {/* 3 Steps */}
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white block">Day 1: Start & Publish a Project</span>
                    <span className="text-slate-400">
                      Publish your project proposal to ignite your flame and reach <strong>Streak 1</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white block">Day 2: Work in Your Workspace</span>
                    <span className="text-slate-400">
                      Tomorrow, add teammates, review applicants, or update tasks to increase streak to <strong>Streak 2</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-white block">1 Increment Per Day</span>
                    <span className="text-slate-400">
                      Doing multiple actions on the same day secures today, but streak only increases on consecutive days.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/projects/new');
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-violet-950/50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>🚀 Start a Project for Daily Streak</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : justCheckedIn || isCheckedInToday ? (
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

// -------------------------------------------------------------
// 4. FLOATING STREAK CELEBRATION TOAST
// -------------------------------------------------------------
export function StreakCelebrationToast() {
  const [toast, setToast] = useState<{
    visible: boolean;
    currentStreak: number;
    message: string;
    resultType: string;
  } | null>(null);

  useEffect(() => {
    const handleEvent = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      setToast({
        visible: true,
        currentStreak: detail.currentStreak,
        message: detail.message,
        resultType: detail.resultType,
      });

      const timer = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false } : null));
      }, 5000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('linkora_streak_event', handleEvent);
    return () => window.removeEventListener('linkora_streak_event', handleEvent);
  }, []);

  if (!toast || !toast.visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] animate-bounce duration-300 max-w-sm">
      <div className="p-4 rounded-2xl bg-slate-950 border-2 border-amber-500/80 shadow-2xl text-white flex items-start gap-3 backdrop-blur-lg">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shrink-0">
          <Flame className="w-5 h-5 fill-current animate-pulse" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono">
              🔥 Streak Updated &bull; Day {toast.currentStreak}
            </span>
            <button
              onClick={() => setToast((prev) => (prev ? { ...prev, visible: false } : null))}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. FIRST-TIME LOGIN DAY 0 PROMPT
// -------------------------------------------------------------
export function DailyStreakAutoPrompt() {
  const { user } = useAuth();
  const { streakState } = useDailyStreak();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && user && streakState.currentStreak === 0) {
      const hasSeen = sessionStorage.getItem('linkora_day0_prompt_shown');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem('linkora_day0_prompt_shown', 'true');
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user, streakState.currentStreak]);

  if (!isOpen) return null;

  return <DailyStreakModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
