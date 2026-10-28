'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  X,
  User,
  Mail,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

declare global {
  interface Window {
    openLinkoraFeedback?: () => void;
  }
}

type FeedbackCategory = 'feature' | 'bug' | 'ui_ux' | 'faculty' | 'icpc' | 'general';

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'feature', label: 'Feature Idea', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'bug', label: 'Bug / Glitch', icon: Bug, color: 'text-rose-500' },
  { id: 'ui_ux', label: 'UI / Design', icon: Palette, color: 'text-violet-500' },
  { id: 'faculty', label: 'Faculty & Mentors', icon: GraduationCap, color: 'text-emerald-500' },
  { id: 'icpc', label: 'ICPC & Streak', icon: Terminal, color: 'text-cyan-500' },
  { id: 'general', label: 'General Thoughts', icon: HelpCircle, color: 'text-blue-500' },
];

const RATING_LABELS = [
  '',
  'Needs Improvement 🙁',
  'Fair / Acceptable 😐',
  'Good Experience 🙂',
  'Great Platform! 😃',
  'Outstanding & Essential! 🚀',
];

export function FeedbackModal() {
  const { user, profile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-linkora-feedback', handleOpen);
    window.addEventListener('linkora-feedback', handleOpen);
    window.openLinkoraFeedback = handleOpen;

    const checkHash = () => {
      if (typeof window !== 'undefined' && (window.location.hash === '#feedback' || window.location.hash === '#feedback-section')) {
        setIsOpen(true);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);

    return () => {
      window.removeEventListener('open-linkora-feedback', handleOpen);
      window.removeEventListener('linkora-feedback', handleOpen);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  // Sync user profile info
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

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

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

  if (!mounted || !isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={modalRef}
      onClick={(e) => {
        if (e.target === modalRef.current) {
          setIsOpen(false);
        }
      }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 backdrop-blur-2xl bg-slate-950/75 animate-fadeIn cursor-pointer overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Write Your Feedback"
    >
      {/* Subtle ambient blur */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-600/25 via-indigo-600/20 to-pink-500/15 blur-[120px] pointer-events-none" />

      {/* Main Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl my-auto z-10 bg-slate-950/95 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-white cursor-default animate-in zoom-in-95 duration-200 space-y-6"
      >
        {/* Header with Title and Close (X) button */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/15 border border-violet-500/30 text-violet-300">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>COMMUNITY VOICE & FEEDBACK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Write Your Feedback
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have an idea or bug report? Send directly to{' '}
              <a
                href="mailto:whatilearn706@gmail.com?subject=Kollabrix%20Community%20Feedback"
                className="text-cyan-300 underline font-mono font-bold hover:text-cyan-200"
              >
                whatilearn706@gmail.com
              </a>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
            aria-label="Close feedback modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Form or Success Screen */}
        {isSubmitted ? (
          <div className="py-8 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white">
                Feedback Received!
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Thank you for helping us improve Kollabrix! Your message has been delivered directly into the Admin Control Center.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
              >
                Write Another
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Pills */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                1. Select Category
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
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 text-white shadow-sm ring-1 ring-violet-500/50'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                      <span className="text-xs font-bold truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5-Star Rating */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                2. Experience Rating
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                      title={`${star} Star`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-300">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Feedback Message */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                3. Your Feedback / Bug / Idea
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you want added, any bug you noticed, or how Kollabrix can be better for your college..."
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Student Details (Optional / Pre-filled) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mayank Goyal"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  College / Campus
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    placeholder="e.g. IIT Bombay / VIT"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
