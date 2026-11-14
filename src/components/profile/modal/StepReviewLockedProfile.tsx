'use client';

import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Code2,
  GraduationCap,
  ArrowRight,
  Globe,
} from 'lucide-react';

interface StepReviewLockedProfileProps {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  skills: string[];
  interests: string[];
  preferredRoles: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  isPortfolioPublic: boolean;
  isVerified: boolean;
  college: string;
  studentRollNo: string;
  course: string;
  academicYear: string;
  onGoToVerification: () => void;
}

export function StepReviewLockedProfile({
  displayName,
  username,
  avatarUrl,
  bio,
  skills,
  interests,
  preferredRoles,
  githubUrl,
  linkedinUrl,
  portfolioUrl,
  isPortfolioPublic,
  isVerified,
  college,
  studentRollNo,
  course,
  academicYear,
  onGoToVerification,
}: StepReviewLockedProfileProps) {
  return (
    <div className="space-y-5 animate-fade-in text-white">
      {/* Verification Status Banner */}
      {isVerified ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 flex items-start gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wide uppercase">
                Collegiate Verification: Active &amp; Locked
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Your college affiliation, roll number, and academic year have been biometrically verified with Apple Face ID and your physical student ID card. All collegiate fields are cryptographically locked.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 tracking-wide uppercase">
                  Collegiate Verification: Skipped / Pending
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed max-w-md">
                You skipped biometric verification. Unverified profiles remain blurred to external viewers, hidden from the Teammates feed, and restricted from faculty hackathons.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToVerification}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>Verify (30s)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Profile Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Identity & Bio */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-900 border border-white/20 shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-black text-amber-400 uppercase">
                  {(displayName || username || 'K').slice(0, 1)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-bold text-white truncate">{displayName}</h4>
                {isVerified && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Name Locked to ID Card
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 truncate">@{username}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 italic">
            "{bio || 'College builder excited to collaborate on Kollabrix projects.'}"
          </p>

          <div className="pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap">
            {preferredRoles.map((role) => (
              <span
                key={role}
                className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Card 2: Collegiate Affiliation (Locked) */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Collegiate Credentials</span>
            </span>
            {isVerified && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            {isVerified && (
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">VERIFIED STUDENT NAME</span>
                <span className="font-semibold text-emerald-300 truncate block flex items-center gap-1.5">
                  <span>{displayName}</span>
                  <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                </span>
              </div>
            )}
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">COLLEGE</span>
              <span className="font-semibold text-white truncate block">
                {college || 'Not Affiliated Yet'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">ROLL NUMBER</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {studentRollNo || (isVerified ? '2392608124' : 'Unverified')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">ACADEMIC YEAR</span>
                <span className="text-slate-200">{academicYear || '1st Year (Freshman)'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 block">PROGRAM / DEGREE</span>
              <span className="text-slate-300 truncate block">
                {course || 'Engineering / Technology'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Skills & Connected Showcase */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Technical Skills &amp; Online Accounts</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {isPortfolioPublic ? '● Public Showcase' : '● Private Showcase'}
          </span>
        </div>

        {/* Skills Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {skills.length > 0 ? (
            skills.map((s) => (
              <span
                key={s}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">No skills specified yet.</span>
          )}
        </div>

        {/* Links Preview */}
        <div className="pt-2 border-t border-white/5 flex items-center gap-4 text-xs font-mono text-slate-400">
          {githubUrl && (
            <span className="text-emerald-400 flex items-center gap-1">
              ✓ GitHub Connected
            </span>
          )}
          {linkedinUrl && (
            <span className="text-blue-400 flex items-center gap-1">
              ✓ LinkedIn Connected
            </span>
          )}
          {portfolioUrl && (
            <span className="text-purple-400 flex items-center gap-1">
              ✓ Portfolio Linked
            </span>
          )}
          {!githubUrl && !linkedinUrl && !portfolioUrl && (
            <span className="text-slate-500">No social links attached</span>
          )}
        </div>
      </div>
    </div>
  );
}
