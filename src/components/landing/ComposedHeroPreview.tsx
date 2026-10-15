'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Users, Sparkles, Code2, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function ComposedHeroPreview() {
  const [activeTab, setActiveTab] = useState<'card' | 'skills'>('card');

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Subtle ambient indigo background glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-600/30 to-violet-600/20 blur-xl opacity-70 -z-10" />

      {/* Main Preview Container */}
      <div className="rounded-2xl bg-charcoal-900/90 border border-charcoal-700/80 shadow-2xl p-5 sm:p-6 backdrop-blur-md">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-slate-400">
              teamforge.live/projects/collaborate
            </span>
          </div>

          <div className="flex items-center gap-1 bg-charcoal-850 p-1 rounded-lg border border-charcoal-750 text-[11px]">
            <button
              onClick={() => setActiveTab('card')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'card'
                  ? 'bg-brand-600 text-white shadow-subtle'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Project Card
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'skills'
                  ? 'bg-brand-600 text-white shadow-subtle'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Skill Matching
            </button>
          </div>
        </div>

        {activeTab === 'card' ? (
          /* Live Card Preview */
          <div className="space-y-4 rounded-xl bg-charcoal-950 p-5 border border-charcoal-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="category">AI / Machine Learning</Badge>
                <Badge variant="difficulty" difficulty="Advanced" />
                <Badge variant="demo" />
              </div>
              <Badge variant="status" status="Recruiting" />
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold text-white">
                NeuroScan: Assistive MRI Brain Tumor Classification
              </h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Computer vision pipeline utilizing deep convolutional neural networks with Grad-CAM visual heatmaps to assist student radiologist research.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['PyTorch', 'FastAPI', 'Three.js', 'Docker'].map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-charcoal-850 text-slate-300 border border-charcoal-750"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Avatar name="Priya Narang" size="sm" />
                <div>
                  <span className="font-medium text-slate-200 block text-xs">Priya Narang</span>
                  <span className="text-[10px] text-slate-500 block">AI & Data Science &middot; 3rd Year</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">2 / 3 joined</span>
                </div>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Live Skill Matching Preview */
          <div className="space-y-4 rounded-xl bg-charcoal-950 p-5 border border-charcoal-800 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-400" />
                Complementary Skill Balance
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Optimal Cohort
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-charcoal-850 border border-charcoal-750 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Avatar name="Aarav S" size="sm" />
                  <span className="font-medium text-slate-200">Aarav</span>
                </div>
                <p className="text-[11px] text-brand-300 font-medium">Backend & Cloud</p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-400">FastAPI</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-400">PostgreSQL</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-charcoal-850 border border-charcoal-750 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Avatar name="Elena Rostova" size="sm" />
                  <span className="font-medium text-slate-200">Elena</span>
                </div>
                <p className="text-[11px] text-purple-300 font-medium">UI/UX & Frontend</p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-400">Next.js</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-400">Figma</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-charcoal-850 border border-dashed border-brand-500/40 space-y-1.5 flex flex-col justify-center items-center text-center">
                <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  ?
                </div>
                <p className="text-[11px] text-slate-300 font-medium">Your Skill Slot</p>
                <span className="text-[10px] text-brand-400">Looking for ML / Vision</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Project roles match student skills transparently before kickoff.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
