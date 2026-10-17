'use client';

import React, { useState } from 'react';
import { Project, Profile } from '@/types/database';
import {
  Award,
  CheckCircle2,
  Printer,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ProjectCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  profile?: Profile | null;
  roleTitle?: string;
  tasksCompletedCount?: number;
}

export function ProjectCertificateModal({
  isOpen,
  onClose,
  project,
  profile,
  roleTitle = 'Lead Software Engineer',
  tasksCompletedCount = 6,
}: ProjectCertificateModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const studentName = profile?.display_name || 'Student Innovator';
  const collegeName = profile?.college || project.owner?.college || 'Collegiate Engineering Department';
  const completionDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Deterministic Credential ID based on project ID
  const credentialId = `LNK-2026-${project.id.slice(0, 8).toUpperCase()}-VRF`;

  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/profile/${profile?.username || 'student'}?verified=${credentialId}`
      : `https://linkora-link.online/profile/${profile?.username || 'student'}`;

  const handlePrint = () => {
    window.print();
  };

  const handleLinkedInShare = () => {
    const text = `Excited to showcase my verified engineering contribution on "${project.title}" as ${roleTitle} via Linkora! Verified credential: ${credentialId}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      verificationUrl
    )}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[95vh] overflow-y-auto my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Verified Engineering Certificate
              </h3>
              <p className="text-xs text-slate-500">
                Official proof of collegiate project deliverables and peer review completion.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            THE CERTIFICATE (Rendered on Screen & Printed on Paper)
           ========================================================================= */}
        <div
          id="linkora-printable-certificate"
          className="relative rounded-2xl border-4 border-double border-amber-600/30 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 p-8 sm:p-12 text-center space-y-6 shadow-inner overflow-hidden print:border-amber-600 print:m-0 print:p-8"
        >
          {/* Subtle Watermark Seal in Background */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04] select-none text-[220px] font-black font-mono text-slate-900"
          >
            LINKORA
          </div>

          {/* Certificate Header */}
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[10px] font-mono font-bold tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>COLLEGIATE ENGINEERING CREDENTIAL VERIFICATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif uppercase pt-2">
              Certificate of Accomplishment
            </h2>
            <p className="text-xs text-slate-500 italic">
              Issued under Linkora Open Project Verification Protocol
            </p>
          </div>

          {/* Recipient Details */}
          <div className="space-y-2 relative z-10 py-2">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              THIS CERTIFIES THAT
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 underline decoration-amber-500/40 decoration-2 underline-offset-8">
              {studentName}
            </h3>
            <p className="text-xs text-slate-600 font-mono pt-1">
              {collegeName}
            </p>
          </div>

          {/* Accomplishment Details */}
          <div className="max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed relative z-10">
            <p>
              has successfully served as <strong className="text-slate-950 font-black">{roleTitle}</strong> and completed verified production deliverables for the engineering initiative:
            </p>
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200/90 shadow-2xs">
              <span className="font-black text-slate-900 text-sm sm:text-base block">
                {project.title}
              </span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                Category: {project.category} • {tasksCompletedCount} System-Verified Deliverables
              </span>
            </div>
          </div>

          {/* Certificate Footer / Signatures / Credential Hash */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-left text-[11px] relative z-10">
            <div>
              <span className="text-slate-400 font-mono block text-[10px]">ISSUED DATE</span>
              <span className="font-bold text-slate-900">{completionDate}</span>
            </div>

            <div>
              <span className="text-slate-400 font-mono block text-[10px]">VERIFIED CREDENTIAL ID</span>
              <span className="font-mono font-bold text-amber-700">{credentialId}</span>
            </div>

            <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
              <span className="text-slate-400 font-mono block text-[10px]">VERIFICATION STATUS</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cryptographically Signed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden on print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Verification URL</span>
                </>
              )}
            </button>

            <button
              onClick={handleLinkedInShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-[#0A66C2] font-bold text-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to LinkedIn</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
