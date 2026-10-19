'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Bug,
  Lightbulb,
  Palette,
  GraduationCap,
  Terminal,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';

type FeedbackCategory = 'bug' | 'feature' | 'ui_ux' | 'faculty' | 'icpc' | 'general';
type UserRole = 'student' | 'faculty' | 'organizer' | 'visitor' | 'other';

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'bug', label: 'Bug / Glitch', icon: Bug, color: 'text-rose-500' },
  { id: 'ui_ux', label: 'UI / Design', icon: Palette, color: 'text-violet-500' },
  { id: 'faculty', label: 'Faculty & Mentorship', icon: GraduationCap, color: 'text-emerald-500' },
  { id: 'icpc', label: 'ICPC & Coding Streak', icon: Terminal, color: 'text-cyan-500' },
  { id: 'general', label: 'General Experience', icon: HelpCircle, color: 'text-blue-500' },
];

const RATING_LABELS = [
  '',
  'Needs Improvement 🙁',
  'Fair / Acceptable 😐',
  'Good Experience 🙂',
  'Great Platform! 😃',
  'Outstanding & Essential! 🚀',
];

export default function FeedbackPage() {
  const { user, profile } = useAuth();
  const { theme, isDark } = useSiteTheme();

  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [campus, setCampus] = useState<string>('');
  const [role, setRole] = useState<UserRole>('student');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (user) {
      const displayName =
        profile?.display_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        (user.email ? user.email.split('@')[0] : '');
      if (displayName && !name) setName(displayName);
      if (user.email && !email) setEmail(user.email);
      if (profile?.role === 'teacher') setRole('faculty');
      if (profile?.bio && profile.bio.includes('IIT') && !campus) setCampus('IIT');
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!message || message.trim().length < 3) {
      setErrorMsg('Please write at least a few words describing your feedback or suggestion.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Anonymous Student',
          email: email.trim() || user?.email || 'student@linkora.in',
          campus: campus.trim() || undefined,
          role,
          category,
          rating,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header Breadcrumb & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>COMMUNITY FEEDBACK & SUGGESTIONS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Help Shape Linkora
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Your voice directly influences our roadmap. Found a bug, have an idea for campus hackathons, or want a new tool? Tell Mayank and the core team.
          </p>
        </div>

        {/* Success Card */}
        {isSubmitted ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-charcoal-900 border border-emerald-500/30 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Feedback Successfully Received!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Thank you for contributing to the Linkora collegiate network. Your feedback has been forwarded directly to the Linkora Admin desk.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage('');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white transition-all"
              >
                Submit Another Feedback
              </button>
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm inline-flex items-center gap-1.5 transition-all"
              >
                <span>Explore Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/deadlines"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm inline-flex items-center gap-1.5 transition-all"
              >
                <span>View Deadlines Radar</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: The Feedback Form */}
            <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Category Selector */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    What are you sharing feedback on?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300 shadow-2xs scale-[1.02]'
                              : 'bg-slate-50 dark:bg-charcoal-800/60 border-slate-200 dark:border-charcoal-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-charcoal-600'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                          <span className="text-xs font-bold truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Star Rating */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Overall Experience Rating
                    </label>
                    <span className="text-xs font-bold text-amber-500">
                      {RATING_LABELS[hoverRating || rating]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = (hoverRating || rating) >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starVal)}
                          className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none"
                          aria-label={`Rate ${starVal} out of 5 stars`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                : 'text-slate-300 dark:text-charcoal-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Feedback Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="feedback-message"
                      className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Your Feedback / Idea / Issue <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {message.length} characters
                    </span>
                  </div>
                  <textarea
                    id="feedback-message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's working well, what feels glitchy, or what features you'd like to see next on Linkora..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-y"
                    required
                  />
                </div>

                {/* 4. User Details (Name, Email, Campus, Role) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Mayank or Anonymous"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Email Address (for follow-up)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@college.edu"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      College / University
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        placeholder="e.g. IIT Delhi, BITS Pilani"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Your Primary Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    >
                      <option value="student">Student Maker / Builder</option>
                      <option value="faculty">Faculty Mentor / Educator</option>
                      <option value="organizer">Hackathon Organizer</option>
                      <option value="visitor">Campus Ambassador / Visitor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Submitting Feedback...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send to Linkora Admin Desk</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    Verified submissions are reviewed daily by platform maintainers.
                  </p>
                </div>
              </form>
            </div>

            {/* Right 1 Col: Community Impact & Quick Links */}
            <div className="space-y-6">
              <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-500 uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Direct Admin Attention</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Why Your Feedback Matters
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Linkora is built specifically for Indian engineering campuses. From real-time team builders to ICPC competitive arenas, every feature came directly from student requests.
                </p>
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Bug reports are verified and hot-patched within 24 hours.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>High-vote feature suggestions are scheduled in sprint cycles.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Faculty mentors receive direct communication for problem setups.</span>
                  </div>
                </div>
              </div>

              {/* Quick Feature Navigation */}
              <div className="rounded-3xl bg-gradient-to-br from-violet-500/10 via-charcoal-900 to-indigo-500/10 border border-violet-500/20 p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-400 uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Other Features</span>
                </div>
                <h4 className="text-sm font-bold text-white">Looking for something else?</h4>
                <div className="space-y-2 pt-1">
                  <Link
                    href="/spark"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-colors"
                  >
                    <span>✨ AI Spark Project Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-colors"
                  >
                    <span>🏆 Inter-College Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                  <Link
                    href="/deadlines"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-colors"
                  >
                    <span>⏳ Collegiate Deadline Radar</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
