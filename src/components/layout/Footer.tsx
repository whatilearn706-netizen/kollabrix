'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Github, BookOpen, Heart, Shield, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-charcoal-800 bg-charcoal-950 text-slate-400 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-charcoal-850">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-100 text-base">TeamForge</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              A student-first project collaboration platform helping college makers discover ideas, assemble complementary teams, and build meaningful software together.
            </p>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/projects/new" className="hover:text-white transition-colors">
                  Publish a Project Idea
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Focus Areas
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Web Development</li>
              <li>AI / Machine Learning</li>
              <li>Developer Tooling</li>
              <li>Social Impact & Community</li>
              <li>IoT & Embedded Systems</li>
            </ul>
          </div>

          {/* Phase 1 Notice & Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Architecture & Trust
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Phase 1 architecture built with Next.js App Router, Tailwind CSS, and Supabase PostgreSQL. Protected with strict Row Level Security (RLS).
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero client credential leaks &middot; Privacy focused</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} TeamForge. Empowering collegiate makers and developers.</p>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="hover:text-slate-400 transition-colors">
              Directory
            </Link>
            <span>&middot;</span>
            <Link href="/#how-it-works" className="hover:text-slate-400 transition-colors">
              Guide
            </Link>
            <span>&middot;</span>
            <span className="text-brand-400/80 font-mono">v1.0.0-phase1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
