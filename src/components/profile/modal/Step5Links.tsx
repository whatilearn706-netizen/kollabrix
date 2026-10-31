'use client';

import React from 'react';
import { Globe, Eye, EyeOff } from 'lucide-react';

function GitHubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedInIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

interface Step5LinksProps {
  githubUrl: string;
  setGithubUrl: (val: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (val: string) => void;
  portfolioUrl: string;
  setPortfolioUrl: (val: string) => void;
  isPortfolioPublic: boolean;
  setIsPortfolioPublic: (val: boolean) => void;
}

export function Step5Links({
  githubUrl,
  setGithubUrl,
  linkedinUrl,
  setLinkedinUrl,
  portfolioUrl,
  setPortfolioUrl,
  isPortfolioPublic,
  setIsPortfolioPublic,
}: Step5LinksProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">Online Presence &amp; Showcase</h4>
        <p className="text-xs text-slate-400">
          Connect your developer accounts to showcase your verified contributions and code repositories.
        </p>
      </div>

      {/* GitHub URL */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">
          GitHub Profile / Handle
        </label>
        <div className="relative">
          <input
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="e.g. https://github.com/mayankgoyal or mayankgoyal"
            className="w-full h-11 px-3.5 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-all"
          />
          <span className="absolute left-3 top-3.5 text-slate-400">
            <GitHubIcon className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* LinkedIn URL */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">
          LinkedIn Profile
        </label>
        <div className="relative">
          <input
            type="text"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="e.g. https://linkedin.com/in/mayankgoyal"
            className="w-full h-11 px-3.5 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-all"
          />
          <span className="absolute left-3 top-3.5 text-[#0077B5]">
            <LinkedInIcon className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Personal Website / Portfolio */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">
          Personal Website / Portfolio
        </label>
        <div className="relative">
          <input
            type="text"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="e.g. https://mayank.dev"
            className="w-full h-11 px-3.5 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-all"
          />
          <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Public Portfolio Visibility Switch */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            {isPortfolioPublic ? (
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Public Collegiate Portfolio</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Allow other students and hackathon team recruiters to view your projects and skills.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPortfolioPublic(!isPortfolioPublic)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isPortfolioPublic ? 'bg-amber-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isPortfolioPublic ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
