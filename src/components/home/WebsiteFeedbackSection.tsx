'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  Sparkles,
  Bug,
  Lightbulb,
  Palette,
  GraduationCap,
  Terminal,
  HelpCircle,
  ShieldCheck,
  User,
  Mail,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

type FeedbackCategory = 'feature' | 'bug' | 'ui_ux' | 'faculty' | 'icpc' | 'general';

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'feature', label: 'Feature Idea', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'bug', label: 'Bug / Glitch', icon: Bug, color: 'text-rose-500' },
  { id: 'ui_ux', label: 'UI / Design', icon: Palette, color: 'text-amber-500' },
  { id: 'faculty', label: 'Faculty & Mentors', icon: GraduationCap, color: 'text-emerald-500' },
  { id: 'icpc', label: 'ICPC & Streak', icon: Terminal, color: 'text-cyan-500' },
  { id: 'general', label: 'General Thoughts', icon: HelpCircle, color: 'text-blue-500' },
];

export function WebsiteFeedbackSection() {
  const { user, profile } = useAuth();

  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [campus, setCampus] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (user) {
      const displayName =
        profile?.display_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        (user.email ? user.email.split('@')[0] : '');
      if (displayName && !name) setName(displayName);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!message || message.trim().length < 3) {
      setErrorMsg('Please write at least a few words describing your feedback.');
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
          role: profile?.role === 'teacher' ? 'faculty' : 'student',
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
    <section id="feedback-section" className="py-20 scroll-mt-16 bg-slate-900 border-t border-slate-800 text-white relative overflow-hidden">
      {/* Subtle warm ambient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>COMMUNITY VOICE & FEEDBACK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Write Your Feedback
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Have an idea to improve Linkora, found a glitch, or want a tool for your college? Write your feedback below and it goes directly to Mayank in the Admin Control Center.
          </p>
        </div>

        {/* Feedback Form / Card */}
        {isSubmitted ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-950/80 border border-emerald-500/30 text-center space-y-5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                Feedback Sent Successfully!
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Thank you for helping us improve Linkora! Your submission has been delivered directly to the platform Admin Control Center.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setMessage('');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
            >
              Write Another Feedback
            </button>
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-950/90 border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Pills */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Select Category:
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
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600/20 border-amber-500 text-white font-bold shadow-sm'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                        <span className="text-xs truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center justify-between py-1 border-y border-slate-850">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Rate Your Experience:
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverRating || rating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starVal)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-slate-700'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Box */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Write Your Feedback: <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you like, what is glitchy, or what features you would like to see added next..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-y"
                />
              </div>

              {/* Author Details (Name, Email, Campus) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Student or Anonymous"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Email (for reply)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    College / Campus
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      placeholder="e.g. IIT Delhi, BITS Pilani"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Delivering to Admin Desk...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Feedback to Admin Control Center</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Submissions are delivered instantly to Mayank in the Admin Control Center</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
