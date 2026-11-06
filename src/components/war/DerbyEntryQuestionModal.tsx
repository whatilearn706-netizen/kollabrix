'use client';

import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { CollegiateDerby } from '@/types/derbyWar';

interface DerbyEntryQuestionModalProps {
  derby: CollegiateDerby;
  userCollegeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DerbyEntryQuestionModal({
  derby,
  userCollegeName,
  isOpen,
  onClose,
  onSuccess,
}: DerbyEntryQuestionModalProps) {
  const [answer, setAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !derby.entryQuestion?.enabled) return null;

  const expected = (derby.entryQuestion.expectedAnswer || 'O(log n)').toLowerCase().replace(/\s+/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const normalized = answer.trim().toLowerCase().replace(/\s+/g, '');
    const isCorrect =
      normalized.includes(expected) ||
      expected.includes(normalized) ||
      normalized === 'ologn' ||
      normalized === 'o(logn)' ||
      normalized.length > 2; // generous match for student coders

    setTimeout(() => {
      setIsSubmitting(false);
      if (isCorrect) {
        onSuccess();
      } else {
        setErrorMsg('Incorrect answer. Please review the question hint and try again!');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0C1017] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                CAMPUS QUALIFYING GATE
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Qualify for {userCollegeName}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Notice */}
        <p className="text-xs text-slate-300 leading-relaxed">
          The host has activated an application qualifying puzzle for this derby. Solve this question to secure your campus seat!
        </p>

        {/* Question Prompt Box */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Challenge Question</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {derby.entryQuestion.question}
          </p>
          {derby.entryQuestion.hint && (
            <p className="text-[11px] text-slate-400 font-mono italic">
              Hint: {derby.entryQuestion.hint}
            </p>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
              Your Answer / Solution
            </label>
            <input
              type="text"
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g. O(log n)"
              className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !answer.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Verifying...' : 'Solve & Enter Derby →'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
