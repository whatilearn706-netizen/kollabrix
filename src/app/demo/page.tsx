import React from 'react';
import Link from 'next/link';
import { Play, Download, Sparkles, ArrowRight, ShieldCheck, Users, Trophy } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Product Tour & Demo | Kollabrix',
  description: 'Watch the official 30-second live product tour of Kollabrix — campus hackathon squads, project collaboration, and developer portfolios.',
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-6 text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Official 30-Second Live Walkthrough</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
          Experience Kollabrix in Action
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          See how collegiate builders find hackathon teammates, showcase engineering projects, and turn ideas into live products.
        </p>

        {/* Video Player Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-2 sm:p-3 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center">
            <video
              controls
              autoPlay
              muted
              playsInline
              loop
              className="w-full h-full object-cover rounded-2xl"
              poster="/brand/kollabrix-logo.min.svg"
            >
              <source src="/videos/linkora-live-demo.mp4" type="video/mp4" />
              <source src="/videos/linkora-live-demo.webm" type="video/webm" />
              Your browser does not support HTML5 video streaming.
            </video>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
          >
            <span>Launch Kollabrix Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="/videos/linkora-live-demo.mp4"
            download="linkora-live-demo.mp4"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download MP4 (2.9 MB)</span>
          </a>
        </div>

        {/* Feature Pills */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Users className="w-4 h-4" />
              <span>Campus Teammates</span>
            </div>
            <p className="text-xs text-slate-400">
              Filter student builders by exact tech stack (React, Python, AI, Web3).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Trophy className="w-4 h-4" />
              <span>Hackathon Hub</span>
            </div>
            <p className="text-xs text-slate-400">
              Assemble teams with private passcodes and track competition milestones.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Identity</span>
            </div>
            <p className="text-xs text-slate-400">
              National DigiLocker institutional verification with authentic e-Aadhaar visual proof.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
