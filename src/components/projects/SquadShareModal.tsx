'use client';

import React, { useState } from 'react';
import { Project } from '@/types/database';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  ExternalLink,
  Sparkles,
  Users,
  X,
  Linkedin,
} from 'lucide-react';

interface SquadShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onOpenLinkedIn?: () => void;
}

export function SquadShareModal({ isOpen, onClose, project, onOpenLinkedIn }: SquadShareModalProps) {
  const [copiedType, setCopiedType] = useState<'link' | 'discord' | 'pitch' | null>(null);

  if (!isOpen) return null;

  // Resolve shareable URL
  const projectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/projects/${project.id}`
      : `https://linkora-edu.online/projects/${project.id}`;

  const rolesText =
    project.desired_roles && project.desired_roles.length > 0
      ? project.desired_roles.join(', ')
      : 'Collaborative Student Builders';

  const techText =
    project.technologies && project.technologies.length > 0
      ? project.technologies.slice(0, 4).join(', ')
      : 'Modern Full-Stack';

  // Pre-formatted messages
  const whatsappPitch = `🚀 *Squad Recruitment on Linkora!*

Hey! We're building *${project.title}* for upcoming college challenges.

🎯 *Roles Needed:* ${rolesText}
💡 *Goal:* ${project.summary}
🛠️ *Stack:* ${techText}

Join our squad and view roadmap here:
${projectUrl}`;

  const discordMarkdown = `**🚀 SQUAD INVITATION: ${project.title.toUpperCase()}**
> ${project.summary}

**🎯 Needed Roles:** \`${rolesText}\`
**🛠️ Technologies:** \`${techText}\`
**🔗 Join on Linkora:** <${projectUrl}>`;

  const copyToClipboard = (text: string, type: 'link' | 'discord' | 'pitch') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const shareToWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappPitch);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const shareToTelegram = () => {
    const encodedUrl = encodeURIComponent(projectUrl);
    const encodedText = encodeURIComponent(
      `🚀 Join our squad for "${project.title}" on Linkora! Looking for: ${rolesText}`
    );
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Recruit Your Dream Squad
              </h3>
              <p className="text-xs text-slate-500">
                Share directly to college WhatsApp groups, Discord servers, and Telegram.
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

        {/* Live Card Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="font-bold text-amber-600 uppercase">● SQUAD RECRUITMENT ACTIVE</span>
            <span>{project.current_team_size || 1}/{project.desired_team_size || 4} Members</span>
          </div>
          <h4 className="font-black text-slate-900 text-sm">{project.title}</h4>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {project.summary}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
              Needed: {rolesText}
            </span>
          </div>
        </div>

        {/* 1-Click Platform Share Buttons */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            1-Click Campus Broadcast
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <button
              onClick={shareToWhatsApp}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] font-bold text-xs transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Squad</span>
            </button>

            {/* Telegram */}
            <button
              onClick={shareToTelegram}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 text-[#0088cc] font-bold text-xs transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Telegram Channel</span>
            </button>
          </div>

          {/* Discord Formatted Copy */}
          <button
            onClick={() => copyToClipboard(discordMarkdown, 'discord')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#5865F2]/10 hover:bg-[#5865F2]/15 border border-[#5865F2]/30 text-[#5865F2] font-bold text-xs transition-all"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Copy Discord / Slack LFG Card (Markdown)</span>
            </div>
            {copiedType === 'discord' ? (
              <span className="text-emerald-600 flex items-center gap-1 font-mono text-[11px]">
                <Check className="w-3.5 h-3.5" /> Copied!
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-60" />
            )}
          </button>

          {/* Post to LinkedIn with AI */}
          {onOpenLinkedIn && (
            <button
              onClick={() => {
                onClose();
                onOpenLinkedIn();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/15 border border-[#0A66C2]/30 text-[#0A66C2] font-bold text-xs transition-all"
            >
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 fill-[#0A66C2] text-[#0A66C2]" />
                <span>Post Project on LinkedIn with AI Summary</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0A66C2]/15 text-[#0A66C2] border border-[#0A66C2]/30">
                1-Click
              </span>
            </button>
          )}
        </div>

        {/* Direct Project Link Copy */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-mono text-slate-500 font-semibold block">
            DIRECT PROJECT INVITE LINK
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200">
            <input
              type="text"
              readOnly
              value={projectUrl}
              className="w-full bg-transparent px-2.5 text-xs font-mono text-slate-700 outline-none truncate"
            />
            <button
              onClick={() => copyToClipboard(projectUrl, 'link')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors"
            >
              {copiedType === 'link' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
