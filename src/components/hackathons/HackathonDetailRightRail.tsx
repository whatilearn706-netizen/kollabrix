'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ArrowRight,
  Lock,
  Users,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Share2,
  Headphones,
  Mail,
  QrCode,
  ShieldCheck,
  Briefcase,
  Award,
  Check,
} from 'lucide-react';
import { Hackathon } from '@/types/database';
import { openProfileEditModal } from '@/components/profile/modal/ProfileEditModal';
import { SponsoredMeta } from '@/lib/hackathons/sponsoredMeta';

interface CountdownState {
  isClosed: boolean;
  formatted: string;
}

interface EligibilityState {
  isEligible: boolean;
  reason: string | null;
}

interface HackathonDetailRightRailProps {
  hackathon: Hackathon;
  heroBanner?: string | null;
  sponsoredMeta: SponsoredMeta;
  countdown: CountdownState;
  eligibilityEvaluation: EligibilityState;
  isEnrolled: boolean;
  isStarted: boolean;
  isRegistering: boolean;
  isExternalRegistration: boolean;
  externalRegistrationUrl: string | null;
  displayRegisteredCount: number;
  passcode: string;
  setPasscode: (val: string) => void;
  passcodeError: string | null;
  setPasscodeError: (val: string | null) => void;
  copiedLink: boolean;
  qrCodeUrl?: string | null;
  onRegister: () => void;
  onCopyLink: () => void;
  formatEventDateTime: (dateStr?: string | null) => string;
  formatShortDate: (dateStr?: string | null) => string;
}

/**
 * Sticky right cinema & registration dock for the Hackathon Details page
 * matching KOLLΛBRIX's #000000 / #090C12 Obsidian & Brushed Titanium system.
 */
export function HackathonDetailRightRail({
  hackathon,
  heroBanner,
  sponsoredMeta,
  countdown,
  eligibilityEvaluation,
  isEnrolled,
  isStarted,
  isRegistering,
  isExternalRegistration,
  externalRegistrationUrl,
  displayRegisteredCount,
  passcode,
  setPasscode,
  passcodeError,
  setPasscodeError,
  copiedLink,
  qrCodeUrl,
  onRegister,
  onCopyLink,
  formatEventDateTime,
  formatShortDate,
}: HackathonDetailRightRailProps) {
  const guidelinesHref = sponsoredMeta.guidelinesUrl
    ? /^https?:\/\//i.test(sponsoredMeta.guidelinesUrl.trim())
      ? sponsoredMeta.guidelinesUrl.trim()
      : `https://${sponsoredMeta.guidelinesUrl.trim()}`
    : hackathon.website_url && !hackathon.website_url.includes('/h/')
    ? /^https?:\/\//i.test(hackathon.website_url.trim())
      ? hackathon.website_url.trim()
      : `https://${hackathon.website_url.trim()}`
    : null;

  const submissionLabel =
    sponsoredMeta.submissionCutoff ||
    formatEventDateTime(
      hackathon.submission_deadline ||
        (hackathon as any).submissionDeadline ||
        hackathon.end_date
    );

  const resultLabel =
    sponsoredMeta.resultAnnouncement ||
    formatEventDateTime(
      hackathon.results_date ||
        (hackathon as any).resultsDate ||
        hackathon.end_date
    );

  return (
    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
      {/* Uncropped 16:9 Framed Event Poster (never chopped vertically) */}
      <div className="rounded-3xl bg-[#090C12] border border-white/12 p-2.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
          {heroBanner ? (
            <>
              <img
                src={heroBanner}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
              />
              <img
                src={heroBanner}
                alt={hackathon.title}
                className="relative z-10 w-full h-full object-contain object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/[0.03] pointer-events-none z-10" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0e131d] via-[#090C12] to-black flex flex-col items-center justify-center p-5 text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
                {hackathon.mode} Competition
              </span>
              <div className="text-lg font-black tracking-tight text-white line-clamp-2 max-w-[90%]">
                {hackathon.title}
              </div>
              <span className="text-[11px] font-mono text-zinc-400 mt-1.5 truncate max-w-[85%]">
                {hackathon.organizer}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Unified Registration & Milestone Progress Dock */}
      <div className="rounded-3xl bg-[#090C12] border border-white/12 p-5 sm:p-6 space-y-5 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]">
        {/* Top Deadline & Eligibility Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>
              {countdown.isClosed
                ? 'Closed'
                : `Closes ${formatShortDate(hackathon.registration_deadline)}`}
            </span>
          </div>

          {isEnrolled ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confirmed</span>
            </span>
          ) : eligibilityEvaluation.isEligible ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Eligible · {countdown.isClosed ? 'Closed' : countdown.formatted}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-mono font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Not Eligible</span>
            </span>
          )}
        </div>

        {/* Restricted Eligibility Callout (only shown if ineligible) */}
        {!isEnrolled && !eligibilityEvaluation.isEligible && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs space-y-2">
            <p className="text-rose-200/90 leading-relaxed">
              {eligibilityEvaluation.reason}
            </p>
            {eligibilityEvaluation.reason?.includes('verified') && (
              <button
                type="button"
                onClick={() => openProfileEditModal(4)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-white to-zinc-200 text-zinc-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verify with Face ID (30s)</span>
              </button>
            )}
          </div>
        )}

        {/* Private Event Passcode Portal */}
        {hackathon.access_type === 'private' &&
          !isEnrolled &&
          eligibilityEvaluation.isEligible && (
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Private Event Passcode</span>
                </span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                  Required
                </span>
              </div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError(null);
                }}
                placeholder="Enter event passcode"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090C12] border border-white/15 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-white/40 transition-colors"
              />
              {passcodeError && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {passcodeError}
                </p>
              )}
            </div>
          )}

        {/* Primary & Secondary Action Stack */}
        <div className="space-y-2.5">
          {externalRegistrationUrl ? (
            <a
              id="enrollment-primary-action-btn"
              href={
                /^https?:\/\//i.test(externalRegistrationUrl.trim())
                  ? externalRegistrationUrl.trim()
                  : `https://${externalRegistrationUrl.trim()}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-3.5 px-5 rounded-xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                countdown.isClosed
                  ? 'bg-white/[0.06] text-zinc-500 border border-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white text-zinc-950 border border-white/70 shadow-[0_0_25px_rgba(255,255,255,0.12)]'
              }`}
            >
              {countdown.isClosed ? (
                <span>Registration Closed</span>
              ) : (
                <>
                  <span>
                    {sponsoredMeta.customCtaText || 'Register on Official Site'}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </a>
          ) : isEnrolled ? (
            isStarted ? (
              <Link href={`/hackathons/${hackathon.id}/workspace`} className="block">
                <button
                  type="button"
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white text-zinc-950 border border-white/70 font-black text-sm tracking-wide shadow-[0_0_25px_rgba(255,255,255,0.12)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Enter Hackathon Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <div className="space-y-2">
                <div className="w-full py-3.5 px-5 rounded-xl bg-white/[0.06] border border-white/15 text-zinc-200 font-bold text-xs tracking-wide flex items-center justify-center gap-2 select-none">
                  <Lock className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Registered · Workspace Opens at Kickoff</span>
                </div>
                <p className="text-[11px] text-center text-zinc-400">
                  Begins {formatEventDateTime(hackathon.start_date)}
                </p>
              </div>
            )
          ) : (
            <button
              id="enrollment-primary-action-btn"
              type="button"
              onClick={onRegister}
              disabled={
                isRegistering ||
                countdown.isClosed ||
                !eligibilityEvaluation.isEligible
              }
              className={`w-full py-3.5 px-5 rounded-xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                countdown.isClosed || !eligibilityEvaluation.isEligible
                  ? 'bg-white/[0.06] text-zinc-500 border border-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white text-zinc-950 border border-white/70 shadow-[0_0_25px_rgba(255,255,255,0.12)] cursor-pointer active:scale-[0.99]'
              }`}
            >
              {isRegistering ? (
                <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
              ) : countdown.isClosed ? (
                <span>Registration Closed</span>
              ) : !eligibilityEvaluation.isEligible ? (
                <span>Not Eligible to Register</span>
              ) : hackathon.access_type === 'private' ? (
                <span>Enter Passcode &amp; Register</span>
              ) : (
                <>
                  <span>
                    {sponsoredMeta.customCtaText || 'Register Now'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* Secondary Smoked-Glass CTA: Team Matchmaking on Kollabrix */}
          <Link
            href={`/teammates?hackathon=${encodeURIComponent(hackathon.title)}`}
            className="w-full py-3 px-4 rounded-xl border border-white/15 bg-black/50 hover:bg-white/[0.07] hover:border-white/25 text-zinc-100 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-3.5 h-3.5 text-zinc-300" />
            <span>Form a Squad on Kollabrix</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-0.5 font-mono">
            {isExternalRegistration ? (
              <span>Direct official portal link · opens in new tab</span>
            ) : (
              <span>{displayRegisteredCount} builders registered on Kollabrix</span>
            )}
          </div>
        </div>

        {/* Visual 3-Step Timeline Progress Rail */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="relative pl-6 space-y-3.5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/15">
            <div className="relative flex items-start justify-between gap-2 text-xs">
              <span
                className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  !countdown.isClosed
                    ? 'bg-white/20 ring-1 ring-white/50'
                    : 'bg-zinc-800 border border-white/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    !countdown.isClosed ? 'bg-white' : 'bg-zinc-500'
                  }`}
                />
              </span>
              <div className="min-w-0">
                <div className="text-white font-semibold leading-tight">
                  Registration Closes
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                  {formatEventDateTime(hackathon.registration_deadline)}
                </div>
              </div>
            </div>

            <div className="relative flex items-start justify-between gap-2 text-xs">
              <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#090C12] border border-white/25 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              </span>
              <div className="min-w-0">
                <div className="text-zinc-200 font-medium leading-tight">
                  Submission Cut-off
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                  {submissionLabel}
                </div>
              </div>
            </div>

            <div className="relative flex items-start justify-between gap-2 text-xs">
              <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#090C12] border border-white/20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              </span>
              <div className="min-w-0">
                <div className="text-zinc-300 font-medium leading-tight">
                  Grand Finale &amp; Results
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">
                  {resultLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links: Official Guidelines + Copy Invite */}
        <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
          {guidelinesHref ? (
            <a
              href={guidelinesHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <span>Official Guidelines</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Collegiate</span>
            </span>
          )}

          <button
            type="button"
            onClick={onCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-semibold text-zinc-200 transition-all cursor-pointer shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3 text-zinc-300" />
                <span>Invite Squad</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optional Recruiter VIP Candidate Pass (preserved when enabled) */}
      {sponsoredMeta.isSponsored &&
        Boolean(sponsoredMeta.enableRecruiterQrPass) && (
          <div className="p-5 rounded-3xl bg-[#090C12] border border-white/15 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-100 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Award className="w-3 h-3" />
                <span>VIP Fast-Track</span>
              </div>
              <QrCode className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Partner</span>
                <span className="font-semibold text-white">
                  {sponsoredMeta.companyName || hackathon.organizer}
                </span>
              </div>
              {sponsoredMeta.hiringPackage && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Package</span>
                  <span className="font-mono font-bold text-white">
                    {sponsoredMeta.hiringPackage}
                  </span>
                </div>
              )}
              {sponsoredMeta.hiringRoles && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="text-[11px] text-zinc-300 truncate">
                    {Array.isArray(sponsoredMeta.hiringRoles)
                      ? sponsoredMeta.hiringRoles.join(' · ')
                      : sponsoredMeta.hiringRoles}
                  </span>
                </div>
              )}
              {qrCodeUrl && (
                <div className="pt-2 flex justify-center">
                  <div className="w-28 h-28 rounded-xl bg-white p-1.5 shadow-md">
                    <img
                      src={qrCodeUrl}
                      alt="Candidate Recruiter Verification QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Compact Faculty / Coordinator Help Desk */}
      {hackathon.contact_info && (
        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Headphones className="w-3.5 h-3.5 text-zinc-300" />
              <span>Coordinator Desk</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase">
              Support
            </span>
          </div>
          <a
            href={
              hackathon.contact_info.includes('@')
                ? `mailto:${hackathon.contact_info}`
                : `tel:${hackathon.contact_info}`
            }
            className="flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-white bg-black/50 px-3 py-2 rounded-xl border border-white/10 break-all transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{hackathon.contact_info}</span>
          </a>
        </div>
      )}
    </div>
  );
}
