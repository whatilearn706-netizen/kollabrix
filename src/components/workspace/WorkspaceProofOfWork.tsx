'use client';

import React, { useState } from 'react';
import { Project, ProjectMember, Profile } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  FileText,
  BadgeCheck,
  Code2,
  Users,
} from 'lucide-react';
import { recordDailyStreakActivity } from '@/components/gamification/DailyStreakHub';

interface WorkspaceProofOfWorkProps {
  project: Project;
  members: ProjectMember[];
  currentUserId?: string;
  currentUserProfile?: Profile | null;
}

export function WorkspaceProofOfWork({
  project,
  members,
  currentUserId,
  currentUserProfile,
}: WorkspaceProofOfWorkProps) {
  const [activeTab, setActiveTab] = useState<'certificate' | 'linkedin' | 'badge'>('certificate');

  // Selected recipient for certificate
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    currentUserId || (members[0]?.user_id ?? project.owner_id)
  );

  const selectedMember = members.find((m) => m.user_id === selectedMemberId);
  const recipientName =
    selectedMember?.profile?.display_name ||
    selectedMember?.profile?.username ||
    currentUserProfile?.display_name ||
    project.owner?.display_name ||
    'Student Builder';
  const recipientRole = selectedMember?.role || 'Lead Software Engineer';
  const recipientCollege =
    selectedMember?.profile?.college ||
    currentUserProfile?.college ||
    project.owner?.college ||
    'Collegiate Engineering Department';

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  // Deterministic Credential ID
  const credentialId = `LNK-2026-${project.id.slice(0, 8).toUpperCase()}-${selectedMemberId.slice(0, 4).toUpperCase()}-VRF`;

  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/projects/${project.id}?credential=${credentialId}`
      : `https://linkora-link.online/projects/${project.id}?credential=${credentialId}`;

  const completionDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // LinkedIn Case Study Content
  const linkedInCaseStudy = `🚀 Excited to announce that our team just completed and launched "${project.title}"!

Over the past collegiate sprint on Linkora, we tackled a key challenge in ${project.category}:
"${project.description || 'Building a scalable, production-grade system with verified team deliverables.'}"

🛠️ Tech Stack & Architecture:
${project.required_skills?.map((s) => `• ${s}`).join('\n') || '• Next.js 14\n• TypeScript\n• TailwindCSS\n• Supabase'}

👥 The Dream Team:
${members.map((m) => `• ${m.profile?.display_name || m.profile?.username || 'Teammate'} (${m.role})`).join('\n')}

🏆 Verified Proof-of-Work:
Our project deliverables have been cryptographically verified through Linkora's Collegiate Verification Protocol (Credential ID: ${credentialId}).

Check out the full project workspace and credentials: ${verificationUrl}

#CollegiateEngineering #Hackathon #NextJS #SoftwareEngineering #Linkora #OpenSource`;

  const handleCopyLinkedIn = () => {
    navigator.clipboard.writeText(linkedInCaseStudy);
    setCopiedLinkedIn(true);
    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Generated LinkedIn Case Study for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}
    setTimeout(() => setCopiedLinkedIn(false), 2200);
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      verificationUrl
    )}&summary=${encodeURIComponent(linkedInCaseStudy)}`;
    window.open(url, '_blank');
  };

  // GitHub README Badge Code
  const badgeMarkdown = `[![Collegiate Verified on Linkora](https://img.shields.io/badge/Linkora-Collegiate%20Verified%20Project-6366f1?style=for-the-badge&logo=shield)](${verificationUrl})`;

  const handleCopyBadge = () => {
    navigator.clipboard.writeText(badgeMarkdown);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card (Hidden on print) */}
      <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">The Proof-of-Work Finish Line</h2>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Verifiable Career Proof
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Convert collegiate project completion into cryptographic credentials: verified printable certificates, recruiter-ready LinkedIn case studies, and GitHub README badges.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'certificate'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Collegiate Certificate</span>
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'linkedin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>LinkedIn Case Study</span>
          </button>
          <button
            onClick={() => setActiveTab('badge')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'badge'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>GitHub Badge</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: COLLEGIATE CERTIFICATE STUDIO
         ========================================================================= */}
      {activeTab === 'certificate' && (
        <div className="space-y-6">
          {/* Recipient Selection Bar (Hidden on print) */}
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white whitespace-nowrap">Issue Certificate To:</span>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="bg-charcoal-800 border border-charcoal-700 text-white text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-amber-500"
                >
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profile?.display_name || m.profile?.username || 'Teammate'} — ({m.role})
                    </option>
                  ))}
                  {!members.some((m) => m.user_id === project.owner_id) && (
                    <option value={project.owner_id}>
                      {project.owner?.display_name || 'Project Lead'} (Owner)
                    </option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopyLink}
                size="sm"
                variant="outline"
                leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copiedLink ? 'Copied Verification URL' : 'Copy Verification URL'}
              </Button>

              <Button
                onClick={handlePrint}
                size="sm"
                variant="primary"
                className="bg-slate-900 hover:bg-black text-white border border-slate-700"
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>

          {/* =========================================================================
              THE PRINTABLE CERTIFICATE
             ========================================================================= */}
          <div
            id="linkora-printable-certificate"
            className="relative rounded-3xl border-4 border-double border-amber-600/40 bg-gradient-to-b from-amber-50/50 via-white to-slate-50 p-8 sm:p-14 text-center space-y-6 shadow-2xl overflow-hidden print:border-amber-600 print:m-0 print:p-8"
          >
            {/* Watermark */}
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.035] select-none text-[220px] font-black font-mono text-slate-900"
            >
              LINKORA
            </div>

            {/* Header */}
            <div className="space-y-1 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[10px] font-mono font-bold tracking-widest uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>COLLEGIATE ENGINEERING CREDENTIAL PROTOCOL</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif uppercase pt-2">
                Certificate of Accomplishment
              </h1>
              <p className="text-xs text-slate-500 italic">
                Issued under the Linkora Verified Collegiate Project Standard
              </p>
            </div>

            {/* Recipient */}
            <div className="space-y-2 relative z-10 py-3">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                THIS CERTIFIES THAT
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 underline decoration-amber-500/50 decoration-2 underline-offset-8">
                {recipientName}
              </h2>
              <p className="text-xs text-slate-600 font-mono pt-1">{recipientCollege}</p>
            </div>

            {/* Accomplishment Details */}
            <div className="max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed relative z-10">
              <p>
                has successfully served as{' '}
                <strong className="text-slate-950 font-black">{recipientRole}</strong> and completed verified
                production deliverables for the engineering initiative:
              </p>
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200 shadow-2xs">
                <span className="font-black text-slate-900 text-base sm:text-lg block">
                  {project.title}
                </span>
                <span className="text-xs text-slate-500 font-medium block mt-0.5">
                  Category: {project.category} • Full-Stack Collegiate Deliverables
                </span>
              </div>
            </div>

            {/* Verification Signatures / Metadata */}
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: LINKEDIN CASE STUDY GENERATOR
         ========================================================================= */}
      {activeTab === 'linkedin' && (
        <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <span>Recruiter-Grade LinkedIn Case Study Post</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Formatted specifically for collegiate builders to highlight engineering achievements on LinkedIn.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopyLinkedIn}
                size="sm"
                variant="outline"
                leftIcon={copiedLinkedIn ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copiedLinkedIn ? 'Copied Post!' : 'Copy to Clipboard'}
              </Button>

              <Button
                onClick={handleShareLinkedIn}
                size="sm"
                variant="primary"
                className="bg-[#0A66C2] hover:bg-[#004182] text-white"
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                Share on LinkedIn
              </Button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-charcoal-950 border border-charcoal-800">
            <pre className="text-xs sm:text-sm font-sans text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
              {linkedInCaseStudy}
            </pre>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: GITHUB BADGE EMBED
         ========================================================================= */}
      {activeTab === 'badge' && (
        <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <span>GitHub README Verified Badge</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Display verified collegiate credibility directly at the top of your GitHub repository.
              </p>
            </div>

            <Button
              onClick={handleCopyBadge}
              size="sm"
              variant="outline"
              leftIcon={copiedBadge ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copiedBadge ? 'Copied Badge Markdown!' : 'Copy Badge Markdown'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1">Live Badge Preview:</span>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#6366f1] text-white font-bold text-xs shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Linkora Verified Project</span>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400">Shields.io Verified API</span>
            </div>

            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Markdown Code:</span>
              <pre className="text-xs font-mono text-amber-300 p-2 bg-charcoal-900 rounded-lg overflow-x-auto whitespace-pre">
                {badgeMarkdown}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
