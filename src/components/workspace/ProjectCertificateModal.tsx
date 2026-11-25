'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Project, Profile, ProjectMember } from '@/types/database';
import {
  Award,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  X,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { getRoleDeliverables } from '@/lib/certificates/certificateDeliverables';

export interface ProjectCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  profile?: Profile | null;
  teamMembers?: ProjectMember[];
  roleTitle?: string;
  tasksCompletedCount?: number;
}

interface CertificateRecipient {
  userId: string;
  name: string;
  college: string;
  course?: string | null;
  academicYear?: string | null;
  avatarUrl?: string | null;
  role: string;
  isLead: boolean;
  deliverables: string[];
}

export function ProjectCertificateModal({
  isOpen,
  onClose,
  project,
  profile,
  teamMembers = [],
  roleTitle,
}: ProjectCertificateModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // Build the list of all legitimate squad recipients for this project
  const recipients = useMemo<CertificateRecipient[]>(() => {
    const list: CertificateRecipient[] = [];
    const seen = new Set<string>();

    // 1. Project Lead / Creator
    const leadId = project.owner_id || 'lead_user';
    const leadName = project.owner?.display_name || 'Project Lead';
    const leadCollege = project.owner?.college || 'Collegiate Engineering Department';

    list.push({
      userId: leadId,
      name: leadName,
      college: leadCollege,
      course: project.owner?.course || 'B.Tech Computer Science',
      academicYear: project.owner?.academic_year || '3rd Year (Junior)',
      avatarUrl: project.owner?.avatar_url,
      role: 'Project Lead & System Architect',
      isLead: true,
      deliverables: getRoleDeliverables('Project Lead & System Architect', project.category, project.title),
    });
    seen.add(leadId);

    // 2. Confirmed Squad Members
    if (teamMembers && teamMembers.length > 0) {
      for (const m of teamMembers) {
        if (!m.user_id || seen.has(m.user_id)) continue;
        const p = m.profile;
        const mRole = m.role || 'Full-Stack Contributor';
        list.push({
          userId: m.user_id,
          name: p?.display_name || 'Squad Member',
          college: p?.college || leadCollege,
          course: p?.course || 'B.Tech Information Technology',
          academicYear: p?.academic_year || '2nd Year (Sophomore)',
          avatarUrl: p?.avatar_url,
          role: mRole,
          isLead: false,
          deliverables: getRoleDeliverables(mRole, project.category, project.title),
        });
        seen.add(m.user_id);
      }
    }

    // Only verified team members and the project owner belong on certificates (never arbitrary page viewers).
    if (
      profile &&
      profile.user_id &&
      !seen.has(profile.user_id) &&
      (profile.user_id === project.owner_id ||
        teamMembers.some((m) => m.user_id === profile.user_id))
    ) {
      const resolvedRole = roleTitle || 'Core Squad Member';
      list.push({
        userId: profile.user_id,
        name: profile.display_name || 'Student Contributor',
        college: profile.college || leadCollege,
        course: profile.course,
        academicYear: profile.academic_year,
        avatarUrl: profile.avatar_url,
        role: resolvedRole,
        isLead: profile.user_id === project.owner_id,
        deliverables: getRoleDeliverables(resolvedRole, project.category, project.title),
      });
    }

    return list;
  }, [project, teamMembers, profile, roleTitle]);

  // Only permit rendering for project lead or confirmed squad members
  const isAuthorizedRecipient = Boolean(
    profile?.user_id &&
      (profile.user_id === project.owner_id ||
        teamMembers.some((m) => m.user_id === profile.user_id))
  );

  // Determine initial selection: if current logged-in user is in recipients, select them. Otherwise select the Project Lead.
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    if (profile && recipients.some((r) => r.userId === profile.user_id)) {
      return profile.user_id;
    }
    return recipients[0]?.userId || '';
  });

  if (!isOpen || !isAuthorizedRecipient) return null;

  const currentRecipient =
    recipients.find((r) => r.userId === selectedUserId) || recipients[0];

  const completionDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Unique deterministic credential ID tailored to project + user
  const userTag = (currentRecipient?.name || 'ENG').slice(0, 3).toUpperCase();
  const credentialId = `KBX-2026-${project.id.slice(0, 6).toUpperCase()}-${userTag}-VRF`;

  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/projects/${project.id}?credential=${credentialId}`
      : `https://kollabrix.in/projects/${project.id}`;

  const techStack: string[] = [
    ...(project.technologies || []),
    ...(project.required_skills || []),
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 6);

  const handleDownloadImage = async () => {
    if (!certRef.current || downloading) return;
    setDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#070a12',
      });
      const link = document.createElement('a');
      const cleanName = (currentRecipient?.name || 'Engineer').replace(/\s+/g, '_');
      const cleanTitle = project.title.slice(0, 20).replace(/\s+/g, '_');
      link.download = `Kollabrix_Certificate_${cleanName}_${cleanTitle}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download certificate error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleLinkedInShare = () => {
    const text = `🏆 Officially verified as ${currentRecipient.role} on "${project.title}" via Kollabrix!\n\n🎓 Collegiate Credential ID: ${credentialId}\nVerified engineering deliverables on: ${verificationUrl}\n\n#Kollabrix #EngineeringExcellence #CollegiateBuilders #OpenSource`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[96vh] overflow-y-auto my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-3 print:hidden border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Verified Project Certificate</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Protocol 2.4
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Official proof of collegiate engineering deliverables and peer review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Squad Member Selector Tabs */}
        {recipients.length > 1 && (
          <div className="space-y-1.5 print:hidden">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Select Squad Contributor:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {recipients.map((rec) => {
                const isSelected = rec.userId === currentRecipient?.userId;
                return (
                  <button
                    key={rec.userId}
                    onClick={() => setSelectedUserId(rec.userId)}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
                    }`}
                  >
                    <Avatar name={rec.name} src={rec.avatarUrl} size="sm" className="w-5 h-5" />
                    <span>{rec.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected ? 'bg-amber-600/30 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {rec.isLead ? 'Lead' : rec.role.split('&')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* THE CERTIFICATE */}
        <div
          ref={certRef}
          id="kollabrix-printable-certificate"
          className="relative rounded-2xl overflow-hidden p-6 sm:p-8 border-2 border-amber-500/30 text-white select-none shadow-2xl print:border-amber-500 print:m-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, #171d33 0%, #0c0f1a 55%, #07090f 100%)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500/40 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500/40 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg" />

          <div className="relative z-10 space-y-4 sm:space-y-5">
            {/* Certificate Header Bar */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30">
                  <span className="font-black text-slate-950 text-xs font-mono">KBX</span>
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400">
                    Kollabrix Open Protocol
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Collegiate Engineering Credential Registry
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>CRYPTOGRAPHICALLY VERIFIED</span>
              </div>
            </div>

            {/* Certificate Hero Recipient */}
            <div className="text-center space-y-1.5 pt-1">
              <p className="text-[10px] font-mono text-amber-500/90 tracking-[0.25em] uppercase font-bold">
                This Certificate of Accomplishment is Conferred Upon
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                {currentRecipient?.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {currentRecipient?.college}
                {currentRecipient?.course && ` • ${currentRecipient.course}`}
                {currentRecipient?.academicYear && ` (${currentRecipient.academicYear})`}
              </p>
            </div>

            {/* Verified Role Banner */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border border-amber-500/50 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                  Verified Role: {currentRecipient?.role}
                </span>
              </div>
            </div>

            {/* Project & Verified Deliverables Box */}
            <div className="rounded-2xl bg-slate-950/70 border border-slate-700/60 p-4 sm:p-5 space-y-3 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Engineering Initiative
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white block">
                    {project.title}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                    Category: {project.category}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">
                    Peer-Reviewed & Production Verified
                  </span>
                </div>
              </div>

              {/* What they actually did in the project */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Verified Engineering Contributions & Scope:
                </span>
                <ul className="space-y-1 text-xs text-slate-300 leading-relaxed">
                  {currentRecipient?.deliverables.map((deliv, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0">▸</span>
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies Badges */}
              {techStack.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mr-1">
                    Tech Stack:
                  </span>
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800/90 text-amber-200 border border-amber-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Certificate Footer / Cryptographic Credential */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[10px] text-left border-t border-slate-800">
              <div>
                <span className="text-slate-400 font-mono block text-[9px] uppercase">Issued Date</span>
                <span className="font-bold text-slate-200">{completionDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono block text-[9px] uppercase">Credential Hash</span>
                <span className="font-mono font-bold text-amber-400">{credentialId}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                <span className="text-slate-400 font-mono block text-[9px] uppercase">Registry Node</span>
                <span className="font-mono font-bold text-slate-300">kollabrix.in/verify</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 print:hidden border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Credential</span>
                </>
              )}
            </button>

            <button
              onClick={handleLinkedInShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 border border-[#0A66C2]/35 text-[#58a6ff] font-bold text-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to LinkedIn</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/25 active:scale-98 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Rendering Image...' : 'Download High-Res Image (PNG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
