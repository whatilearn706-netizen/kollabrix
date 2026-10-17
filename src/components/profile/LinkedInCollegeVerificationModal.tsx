'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  Linkedin,
  GraduationCap,
  XCircle,
  ArrowRight,
  UserX,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface LinkedInCollegeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeName: string;
  onCollegeNameChange?: (name: string) => void;
  onVerified?: (verifiedCollege: string, linkedinUrl: string) => void;
  userId?: string;
}

export function LinkedInCollegeVerificationModal({
  isOpen,
  onClose,
  collegeName,
  onCollegeNameChange,
  onVerified,
  userId,
}: LinkedInCollegeVerificationModalProps) {
  const [enteredCollege, setEnteredCollege] = useState(collegeName || '');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [claimedLinkedinCollege, setClaimedLinkedinCollege] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States: 'input' | 'verifying' | 'success' | 'mismatch_popup'
  const [modalState, setModalState] = useState<'input' | 'verifying' | 'success' | 'mismatch_popup'>('input');
  const [mismatchData, setMismatchData] = useState<{
    type: 'invalid_college' | 'identity_mismatch';
    title: string;
    entered: string;
    linkedin: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    setErrorMsg(null);
    const cleanCollege = enteredCollege.trim();
    const cleanLinkedin = linkedinUrl.trim();
    const cleanClaimed = claimedLinkedinCollege.trim();

    if (!cleanCollege) {
      setErrorMsg('Please enter your college name.');
      return;
    }

    if (!cleanLinkedin) {
      setErrorMsg('Please enter your personal LinkedIn profile link (e.g. https://www.linkedin.com/in/your-handle).');
      return;
    }

    if (!cleanLinkedin.toLowerCase().includes('linkedin.com/in/') && !/^[a-zA-Z0-9_-]{3,}$/.test(cleanLinkedin)) {
      setErrorMsg('Please enter a valid LinkedIn URL (e.g. https://www.linkedin.com/in/your-username).');
      return;
    }

    setIsVerifying(true);
    setModalState('verifying');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/verify/linkedin-college', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          collegeName: cleanCollege,
          linkedinUrl: cleanLinkedin,
          claimedLinkedinCollege: cleanClaimed,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error === 'identity_mismatch') {
          // USER IMPERSONATION / SOMEONE ELSE'S LINKEDIN DETECTED
          setMismatchData({
            type: 'identity_mismatch',
            title: 'Identity Mismatch: Not Your Profile',
            entered: data.userDisplayName || 'Your Account',
            linkedin: data.linkedInName || 'Other Person Profile',
            message: data.message || 'This LinkedIn profile belongs to someone else. You must link your own authentic profile.',
          });
          setModalState('mismatch_popup');
          return;
        }

        if (data.error === 'invalid_college' || data.isMatch === false) {
          // USER REQUIREMENT: Show popup for invalid college name!
          setMismatchData({
            type: 'invalid_college',
            title: 'Invalid College Name',
            entered: cleanCollege,
            linkedin: data.linkedinEducation || cleanClaimed || 'Unknown',
            message: data.message || 'College name does not match your LinkedIn education profile.',
          });
          setModalState('mismatch_popup');
          return;
        }

        throw new Error(data.error || 'Verification failed. Please try again.');
      }

      // SUCCESS!
      try {
        localStorage.setItem('linkora_college_verified', 'true');
        localStorage.setItem('linkora_verified_college_name', cleanCollege);
        localStorage.setItem('linkora_verified_linkedin_url', data.linkedinUrl || cleanLinkedin);
        window.dispatchEvent(new Event('linkora_college_updated'));
      } catch (e) {}

      if (onCollegeNameChange) {
        onCollegeNameChange(cleanCollege);
      }
      if (onVerified) {
        onVerified(cleanCollege, data.linkedinUrl || cleanLinkedin);
      }

      setModalState('success');
    } catch (err: unknown) {
      setModalState('input');
      setErrorMsg(err instanceof Error ? err.message : 'Error verifying college with LinkedIn.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        {/* Top LinkedIn Blue Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0A66C2] via-[#0077B5] to-[#70B5F9]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0A66C2]/20 border border-[#0A66C2]/30 flex items-center justify-center text-[#70B5F9] shrink-0">
              <Linkedin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0A66C2]/15 text-[#70B5F9] border border-[#0A66C2]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#70B5F9]" />
                  LinkedIn Verification
                </span>
                <span className="text-[10px] text-slate-400">Trust &amp; Anti-Fraud</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Verify College Affiliation
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {errorMsg && modalState === 'input' && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* =========================================================================
              STATE 1: INPUT FORM
             ========================================================================= */}
          {modalState === 'input' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                To build project trust across colleges, connect your personal LinkedIn profile. Linkora cross-checks your account identity and real LinkedIn education history. Once verified, a verified checkmark appears next to your college name for everyone across Linkora.
              </p>

              {/* College Name Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>College / University Name on Linkora</span>
                </label>
                <input
                  type="text"
                  value={enteredCollege}
                  onChange={(e) => setEnteredCollege(e.target.value)}
                  placeholder="e.g. Indian Institute of Technology Bombay or DTU"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#0A66C2] font-medium"
                />
              </div>

              {/* LinkedIn URL Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4 text-[#70B5F9]" />
                  <span>Your Personal LinkedIn Profile URL</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/your-personal-handle"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#0A66C2] font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Must be your own authentic LinkedIn profile. Impersonation of other accounts is automatically rejected.
                </p>
              </div>

              {/* Optional: Institution name as listed on LinkedIn */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center justify-between">
                  <span>Exact Institution Name on LinkedIn</span>
                  <span className="text-[10px] text-slate-500">Optional alias check</span>
                </label>
                <input
                  type="text"
                  value={claimedLinkedinCollege}
                  onChange={(e) => setClaimedLinkedinCollege(e.target.value)}
                  placeholder="e.g. IIT Bombay, DTU, BITS Pilani"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-slate-600"
                />
              </div>

              {/* Info notice */}
              <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-blue-300 block">🔒 Trust &amp; Anti-Fraud Policy:</span>
                <p className="text-slate-400 leading-relaxed">
                  Linkora cross-checks your identity and educational history. If the entered college name does not match your authentic LinkedIn profile, verification will be rejected.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <Button
                  onClick={handleVerify}
                  className="bg-[#0A66C2] hover:bg-[#004182] text-white font-bold px-6 py-2.5 text-xs shadow-lg shadow-[#0A66C2]/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Verify College
                </Button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STATE 2: VERIFYING IN PROGRESS
             ========================================================================= */}
          {modalState === 'verifying' && (
            <div className="py-8 text-center space-y-5">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-[#0A66C2]/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-4 border-t-[#0A66C2] border-[#0A66C2]/20 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-7 h-7 text-[#70B5F9]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">Cross-Checking LinkedIn Credentials...</h3>
                <p className="text-xs text-slate-400">
                  Verifying account identity and educational affiliation between &ldquo;{enteredCollege}&rdquo; and LinkedIn profile.
                </p>
              </div>
            </div>
          )}

          {/* =========================================================================
              STATE 3: USER REQUESTED POPUP -> MISMATCH POPUP!
             ========================================================================= */}
          {modalState === 'mismatch_popup' && mismatchData && (
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  {mismatchData.type === 'identity_mismatch' ? (
                    <UserX className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                    {mismatchData.type === 'identity_mismatch' ? 'Impersonation Blocked' : 'Verification Mismatch'}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {mismatchData.title}
                  </h3>
                </div>

                <p className="text-xs text-red-300/90 leading-relaxed max-w-sm mx-auto">
                  {mismatchData.message}
                </p>

                {/* Comparison Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-red-500/20 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">
                      {mismatchData.type === 'identity_mismatch' ? 'Linkora Account:' : 'Entered on Linkora:'}
                    </span>
                    <strong className="text-white font-mono">{mismatchData.entered}</strong>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                    <span className="text-slate-400 text-[11px]">
                      {mismatchData.type === 'identity_mismatch' ? 'LinkedIn Profile Owner:' : 'LinkedIn Education:'}
                    </span>
                    <strong className="text-amber-400 font-mono">{mismatchData.linkedin || 'Unknown'}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  To protect project credibility, the college name must match your authentic LinkedIn education history.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>

                <Button
                  onClick={() => setModalState('input')}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 text-xs"
                >
                  {mismatchData.type === 'identity_mismatch'
                    ? 'Use Your Own LinkedIn URL'
                    : 'Correct College Name & Try Again'}
                </Button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STATE 4: SUCCESS!
             ========================================================================= */}
          {modalState === 'success' && (
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              <div className="p-6 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Officially Verified
                  </span>
                  <h3 className="text-lg font-black text-white">
                    College Name Verified!
                  </h3>
                </div>

                <p className="text-xs text-emerald-300/90 leading-relaxed max-w-sm mx-auto">
                  Your affiliation with &ldquo;{enteredCollege}&rdquo; has been authenticated via your LinkedIn profile.
                </p>

                {/* Badge Preview */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-400">Live Preview:</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{enteredCollege}</span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A66C2]/20 text-[#70B5F9] border border-[#0A66C2]/40 shadow-xs">
                      <CheckCircle2 className="w-3 h-3 text-[#70B5F9]" />
                      Verified
                    </span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  This blue verified badge is now visible to everyone across all your projects, teammate cards, and profile.
                </p>
              </div>

              <div className="pt-2 flex justify-end border-t border-slate-800">
                <Button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 text-xs shadow-lg shadow-emerald-600/20"
                >
                  Done &amp; Save Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
