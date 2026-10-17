'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Linkedin,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  X,
  Share2,
  RefreshCw,
  Wand2,
  MessageSquare,
  Users,
  Code,
} from 'lucide-react';

interface LinkedInProjectShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

type ToneOption = 'collegiate' | 'professional' | 'recruiting';

export function LinkedInProjectShareModal({
  isOpen,
  onClose,
  project,
}: LinkedInProjectShareModalProps) {
  const [tone, setTone] = useState<ToneOption>('collegiate');
  const [postContent, setPostContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate valuable post content tailored to LinkedIn
  const generatePost = (selectedTone: ToneOption = tone) => {
    setIsGenerating(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://linkora-edu.online';
    const projectUrl = `${origin}/projects/${project.id}`;
    const techStack = project.technologies && project.technologies.length > 0
      ? project.technologies.slice(0, 5).join(', ')
      : 'Modern Web Stack';
    const collegeAffiliation = project.owner?.college ? ` (${project.owner.college})` : '';
    const creator = project.owner?.display_name || 'Student Creator';

    const cleanCategory = (project.category || 'Tech').replace(/[^a-zA-Z0-9]/g, '');

    let text = '';

    if (selectedTone === 'collegiate') {
      text = `🚀 Excited to announce what we've been building on Linkora: ${project.title}!

💡 The Big Idea:
${project.summary}

${project.description ? `🔍 About the project:\n${project.description.slice(0, 200)}...\n` : ''}
🛠️ Built With:
${techStack}

👥 Team & Campus:
Collaborating with peers${collegeAffiliation}. We are actively welcoming student contributors and feedback from mentors!

👉 Check out the full project & join the squad on Linkora:
${projectUrl}

#Linkora #BuildInPublic #StudentDevelopers #${cleanCategory} #CollegiateProjects #WebDev #OpenSource #Innovation`;
    } else if (selectedTone === 'professional') {
      text = `Proud to share my latest technical milestone: ${project.title}

📌 Problem & Engineering Scope:
${project.summary}

Key Architecture & Innovations:
• Modular full-stack engineering leveraging ${techStack}
• Designed for high performance and real-world collaboration
• Open for peer code reviews and architectural discussions

🔗 Explore the interactive project specs on Linkora:
${projectUrl}

I would love your feedback and thoughts from fellow engineers, tech leads, and mentors!

#SoftwareEngineering #${cleanCategory} #BuildInPublic #Linkora #TechInnovation #Coding #FullStack`;
    } else {
      // recruiting focus
      const rolesNeeded = project.desired_roles && project.desired_roles.length > 0
        ? project.desired_roles.join(', ')
        : 'Frontend Developers, Backend Engineers & UI Designers';

      text = `👋 We are building ${project.title} and recruiting student teammates on Linkora!

🎯 What we are building:
${project.summary}

🔥 Seeking Teammates for:
👉 ${rolesNeeded}

🛠️ Tech Stack: ${techStack}
📍 Open to passionate collegiate builders${collegeAffiliation}!

If you're eager to build a real-world project, sharpen your portfolio, and collaborate on high-impact engineering:

🚀 Apply to join our squad here:
${projectUrl}

#TeamForge #Linkora #HiringStudents #TechSquad #ProjectCollab #DevelopersWanted #${cleanCategory}`;
    }

    setPostContent(text);
    setTimeout(() => setIsGenerating(false), 200);
  };

  useEffect(() => {
    if (isOpen && project) {
      generatePost('collegiate');
    }
  }, [isOpen, project?.id]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  const handleOpenLinkedIn = async () => {
    // 1. Copy formatted text to clipboard so it is guaranteed ready to paste
    try {
      await navigator.clipboard.writeText(postContent);
      setCopied(true);
    } catch (e) {}

    // 2. Open LinkedIn feed share intent with text pre-filled
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postContent)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative">
        {/* LinkedIn Blue Top Stripe */}
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
                  <Sparkles className="w-3 h-3 text-[#70B5F9]" />
                  AI Summary Generator
                </span>
                <span className="text-[10px] text-slate-400">1-Click Post</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Post Project to LinkedIn
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
        <div className="p-5 sm:p-6 space-y-4">
          {/* Tone Selector Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
            <span className="text-xs font-semibold text-slate-300">Choose AI Tone:</span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTone('collegiate');
                  generatePost('collegiate');
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  tone === 'collegiate'
                    ? 'bg-[#0A66C2] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎓 Showcase
              </button>
              <button
                type="button"
                onClick={() => {
                  setTone('recruiting');
                  generatePost('recruiting');
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  tone === 'recruiting'
                    ? 'bg-[#0A66C2] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                👥 Find Teammates
              </button>
              <button
                type="button"
                onClick={() => {
                  setTone('professional');
                  generatePost('professional');
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  tone === 'professional'
                    ? 'bg-[#0A66C2] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                💼 Technical
              </button>
            </div>
          </div>

          {/* Editable Post Textarea */}
          <div className="relative">
            <textarea
              rows={9}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Your AI summarized LinkedIn post will appear here..."
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-sans focus:outline-none focus:border-[#0A66C2] leading-relaxed resize-none shadow-inner"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800">
              <span>{postContent.length} chars</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => generatePost(tone)}
                disabled={isGenerating}
                className="text-[#70B5F9] hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Helpful Instruction Tip */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-200">
            <Sparkles className="w-4 h-4 text-[#70B5F9] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip:</strong> You can edit the text directly above. When you click <strong>Open &amp; Post to LinkedIn</strong>, the entire text is automatically copied to your clipboard and LinkedIn opens directly to your post creator!
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="w-full sm:w-auto text-xs border-slate-700 text-slate-300 hover:text-white"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenLinkedIn}
              className="w-full sm:w-auto bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs shadow-lg shadow-[#0A66C2]/25 px-5 py-2.5"
              leftIcon={<Linkedin className="w-4 h-4 fill-white text-[#0A66C2]" />}
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Open &amp; Post to LinkedIn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
