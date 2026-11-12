'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Linkedin,
  Globe,
  BookOpen,
  ArrowRight,
  Info,
  Sparkles,
  Award,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { FacultyVerificationModal } from '@/components/auth/FacultyVerificationModal';

interface FacultyStep4VerificationProps {
  facultyPasscode: string;
  setFacultyPasscode: (val: string) => void;
  isVerified: boolean;
  setIsVerified: (val: boolean) => void;
  linkedinUrl: string;
  setLinkedinUrl: (val: string) => void;
  portfolioUrl: string;
  setPortfolioUrl: (val: string) => void;
  googleScholarUrl: string;
  setGoogleScholarUrl: (val: string) => void;
}

export function FacultyStep4Verification({
  facultyPasscode,
  setFacultyPasscode,
  isVerified,
  setIsVerified,
  linkedinUrl,
  setLinkedinUrl,
  portfolioUrl,
  setPortfolioUrl,
  googleScholarUrl,
  setGoogleScholarUrl,
}: FacultyStep4VerificationProps) {
  const { user, refreshProfile } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);

  const handleVerifyPasscode = async () => {
    const code = facultyPasscode.trim();
    if (!code) {
      setVerifyError('Please enter a faculty access passcode.');
      return;
    }

    try {
      setIsVerifying(true);
      setVerifyError(null);
      setVerifyMessage(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/faculty/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: code,
          passcode: code,
          facultyPasscode: code,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerified(true);
        if (user?.id) {
          localStorage.setItem(`linkora_faculty_verified_${user.id}`, 'true');
        }
        await refreshProfile?.();
        setVerifyMessage(data.message || 'Faculty status verified successfully! Academic privileges unlocked.');
      } else {
        setVerifyError(data.error || 'Invalid faculty access passcode. Please check with your campus coordinator.');
      }
    } catch (err: any) {
      setVerifyError(err?.message || 'Error validating faculty passcode.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-h-[55vh] overflow-y-auto pr-1 select-none">
      {/* 1. Campus Faculty Passcode Verification */}
      <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>Campus Faculty Passcode <span className="text-slate-400 text-[10px] normal-case">(Instant Verification)</span></span>
          </label>
          {isVerified && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified Faculty</span>
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-400">
          Have an institutional faculty passcode issued by your campus coordinator? Enter it below to unlock faculty powers immediately.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={facultyPasscode}
            onChange={(e) => {
              setFacultyPasscode(e.target.value.toUpperCase());
              setVerifyError(null);
            }}
            placeholder="e.g. FAC-2026-CAMPUS"
            disabled={isVerified}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono tracking-wider uppercase disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleVerifyPasscode}
            disabled={isVerifying || !facultyPasscode.trim() || isVerified}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isVerified
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white shadow-md shadow-purple-600/20'
            }`}
          >
            {isVerifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isVerified ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Code</span>
              </>
            )}
          </button>
        </div>

        {/* 2. DigiLocker National Gateway Alternative */}
        <div className="pt-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-purple-500/20"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-purple-300 uppercase tracking-wider">
              Or Verify with National DigiLocker
            </span>
            <div className="flex-grow border-t border-purple-500/20"></div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/25 border border-indigo-500/30 space-y-2 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Don't have a code? Verify via DigiLocker</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                MeriPehchan Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Directly authenticate through the official Government of India DigiLocker gateway with your e-Aadhaar or Class 12th document. No passcode required.
            </p>

            <button
              type="button"
              onClick={() => setIsDigiLockerOpen(true)}
              disabled={isVerified}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isVerified
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-default'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-lg shadow-indigo-950/40'
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>DigiLocker Identity Verified &amp; Connected</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>🇮🇳 Verify with DigiLocker (Aadhaar / Class 12th Marksheet)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {verifyMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{verifyMessage}</span>
          </div>
        )}

        {verifyError && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{verifyError}</span>
          </div>
        )}

        {!isVerified && (
          <div className="flex items-start gap-1.5 text-[11px] text-slate-400 pt-1">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span>You can complete your profile now and verify anytime later from your Teacher &amp; Mentor Dashboard.</span>
          </div>
        )}
      </div>

      {/* 3. Academic & Professional Links */}
      <div className="space-y-4 pt-2 border-t border-white/5">
        <label className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span>Academic Presence &amp; Profiles</span>
        </label>

        {/* LinkedIn */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Linkedin className="w-3 h-3 text-sky-400" />
            <span>LinkedIn Profile URL</span>
          </span>
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* Google Scholar / ORCID / Research Profile */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-purple-400" />
            <span>Google Scholar / ORCID / Research Link</span>
          </span>
          <input
            type="url"
            value={googleScholarUrl}
            onChange={(e) => setGoogleScholarUrl(e.target.value)}
            placeholder="https://scholar.google.com/citations?user=..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* Lab / University Faculty Page */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>University Faculty Webpage / Lab Portfolio</span>
          </span>
          <input
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://university.edu/faculty/profile"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>
      </div>

      {/* DigiLocker Official Modal */}
      <FacultyVerificationModal
        isOpen={isDigiLockerOpen}
        onClose={() => setIsDigiLockerOpen(false)}
        onSuccess={async () => {
          setIsVerified(true);
          if (user?.id) {
            localStorage.setItem(`linkora_faculty_verified_${user.id}`, 'true');
          }
          await refreshProfile?.();
          setVerifyMessage('🇮🇳 DigiLocker Identity verified successfully! Faculty privileges unlocked.');
          setVerifyError(null);
          setIsDigiLockerOpen(false);
        }}
        title="Faculty Institutional Verification via DigiLocker"
        description="Authenticate directly through the National DigiLocker / MeriPehchan portal. Upload your e-Aadhaar or Class 12th Marksheet for instant educator authorization."
      />
    </div>
  );
}
