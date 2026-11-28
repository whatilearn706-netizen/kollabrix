'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { KaAiCinematicIntro } from '@/components/brands/KaAiCinematicIntro';
import { KaAiParticleOrb } from '@/components/brands/KaAiParticleOrb';
import { KaBrandEmblem } from '@/components/brands/KaBrandSuite';
import { getKaAiHomePath, getKollabrixHomeUrl } from '@/lib/kaBrandDomains';

export default function KaAiBrandPage() {
  const [introDone, setIntroDone] = useState(false);
  const [introRunKey, setIntroRunKey] = useState(0);
    const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
  }, []);

  const replayIntro = () => {
    setIntroRunKey((k) => k + 1);
    setIntroDone(false);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setContactError('Please fill in your name, email, and mobile number.');
      return;
    }

    setContactLoading(true);
    try {
      // Connects directly to Linkora/Kollabrix Admin Feedback Center
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          category: 'general',
          role: 'student',
          rating: 5,
          message: `[KΛ AI Lead] Mobile: ${contactPhone.trim()}${contactMessage.trim() ? ` | Query: ${contactMessage.trim()}` : ''}`,
        }),
      });

      if (res.ok) {
        setContactSent(true);
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactMessage('');
        setTimeout(() => setContactSent(false), 5000);
      } else {
        const data = await res.json().catch(() => ({}));
        setContactError(data.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setContactError('Network error. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#01030A] text-white relative overflow-x-hidden font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Phase 1: Full-Screen Cinematic KOLLABRIX -> KA AI Morph */}
      <AnimatePresence>
        {!introDone && (
          <KaAiCinematicIntro key={introRunKey} onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Phase 2: Main Standalone KA AI Website (per pin.it/51DEzK4WU & pin.it/4w79gNvLO) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="w-full p-3 sm:p-5 md:p-6 max-w-[1460px] mx-auto"
      >
        {/* SECTION 1: HERO CONTAINER (Rounded-bottom stage with glowing blue floor horizon) */}
        <section
          id="hero"
          className="relative rounded-[28px] overflow-hidden bg-[#020617] border border-white/[0.08] px-5 sm:px-10 pt-7 pb-16 sm:pb-24 flex flex-col items-center text-center shadow-[0_30px_100px_rgba(0,0,0,0.95)]"
        >
          {/* Backlit Ice-Blue / Royal-Blue Atmospheric Horizon Floor */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: [
                'radial-gradient(ellipse 95% 52% at 50% 102%, rgba(186,230,253,0.92) 0%, rgba(96,165,250,0.68) 26%, rgba(29,78,216,0.42) 52%, rgba(2,6,23,0) 78%)',
                'radial-gradient(circle at 12% 96%, rgba(37,99,235,0.65) 0%, transparent 45%)',
                'radial-gradient(circle at 88% 96%, rgba(37,99,235,0.65) 0%, transparent 45%)',
              ].join(', '),
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-blue-400/30 via-sky-100/80 to-blue-400/30 blur-[2px]"
          />

          {/* Centered Floating Pill Navbar */}
          <nav
            aria-label="KΛ ΛI navigation"
            className="relative z-20 w-full max-w-[460px] rounded-2xl bg-[#091229]/70 border border-white/[0.1] backdrop-blur-2xl px-4 py-2 flex items-center justify-between gap-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.65)]"
          >
            <Link href={getKaAiHomePath()} className="inline-flex items-center gap-2 group">
              <KaBrandEmblem />
              <span className="font-semibold text-sm tracking-tight text-white">KΛ ΛI</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/spark"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] hover:brightness-110 text-white text-xs font-medium shadow-[0_0_20px_rgba(37,99,235,0.65)] transition-all"
              >
                Try it now
              </Link>
              <a
                href="#contact"
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 text-xs font-medium text-slate-200 transition-all"
              >
                Contact us
              </a>
            </div>
          </nav>

          {/* Hero Display Headline with Silver-White Focal Luminance Sweep */}
          <div className="relative z-10 mt-12 sm:mt-16 max-w-3xl mx-auto">
            <Link
              href={getKollabrixHomeUrl()}
              title="Visit Kollabrix"
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-sky-300/45 text-[11px] font-mono text-slate-200 mb-5 transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Built by <strong className="text-white">Kollabrix</strong> &rarr;</span>
            </Link>
            <h1 className="text-3xl sm:text-5xl md:text-[54px] font-medium tracking-[-0.03em] leading-[1.14]">
              <span className="bg-gradient-to-r from-slate-500 via-white to-slate-500 bg-clip-text text-transparent">
                Build with KΛ ΛI – Smarter,
              </span>
              <br />
              <span className="bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-clip-text text-transparent">
                Faster, Better
              </span>
            </h1>
          </div>

          {/* Centered Interactive 3D Particle Wave Orb */}
          <div className="relative z-10 my-7 sm:my-10">
            <KaAiParticleOrb
              onClick={() => {
                window.location.href = '/spark';
              }}
            />
          </div>

          {/* Primary Glowing Blue Hero CTA */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <Link
              href="/spark"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#2563EB] hover:brightness-110 text-white text-xs sm:text-sm font-medium shadow-[0_0_36px_rgba(37,99,235,0.9),0_8px_28px_rgba(29,78,216,0.55)] transition-all hover:scale-[1.03]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Speak with KΛ ΛI</span>
            </Link>

            <button
              type="button"
              onClick={replayIntro}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/35 hover:bg-slate-950/55 border border-white/20 text-[10px] font-mono uppercase tracking-[0.18em] text-white/90 hover:text-white font-semibold transition-all cursor-pointer backdrop-blur-sm"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Replay Intro</span>
            </button>
          </div>
        </section>

                {/* ========================================================= */}
        {/* KΛ AI PROMPT WEAPONS: HIGH-TECH TERMINAL CAPSULES         */}
        {/* ========================================================= */}
        <section className="relative z-10 w-full max-w-5xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-[10px] font-mono tracking-[0.2em] text-sky-300 uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              DIRECT AUDIO SYNTHESIS
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Command <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">KΛ AI</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto">
              Select a pre-tuned neural copilot mode. Click to synthesize the voice query.
            </p>
          </div>

          {/* 3 Creative Blueprint Terminal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Hackathon Architect */}
            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative rounded-2xl bg-[#030611]/90 border border-sky-500/25 hover:border-sky-400/80 p-5 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-[0_0_30px_rgba(56,189,248,0.25)] flex flex-col justify-between"
            >
              {/* Corner Tech Decor */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-sky-500/15 to-transparent rounded-bl-2xl border-b border-l border-sky-400/20 flex items-start justify-end pr-2 pt-1.5">
                <span className="text-[9px] font-mono font-bold text-sky-400">01</span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sm shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                    ⚡
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-sky-400 tracking-wider uppercase block">COGNITIVE / ARCH</span>
                    <h3 className="text-sm font-bold text-white tracking-wide">Hackathon Architect</h3>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#01040A]/90 border border-white/5 font-mono text-[11px] text-zinc-300 leading-relaxed group-hover:border-sky-500/30 transition-colors">
                  <span className="text-sky-400 select-none mr-1.5">&gt;</span>
                  &ldquo;Design winning 24h AI stack &amp; modular DB schema.&rdquo;
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400 group-hover:text-sky-300 transition-colors">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Synthesize Voice
                </span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Card 2: Bug Hunter & Fixer */}
            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative rounded-2xl bg-[#030611]/90 border border-cyan-500/25 hover:border-cyan-400/80 p-5 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-cyan-500/15 to-transparent rounded-bl-2xl border-b border-l border-cyan-400/20 flex items-start justify-end pr-2 pt-1.5">
                <span className="text-[9px] font-mono font-bold text-cyan-400">02</span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-sm shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                    🔍
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase block">RUNTIME / AUDIT</span>
                    <h3 className="text-sm font-bold text-white tracking-wide">Bug Hunter &amp; Fixer</h3>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#01040A]/90 border border-white/5 font-mono text-[11px] text-zinc-300 leading-relaxed group-hover:border-cyan-500/30 transition-colors">
                  <span className="text-cyan-400 select-none mr-1.5">&gt;</span>
                  &ldquo;Trace race condition and memory leak in Spring/Next.&rdquo;
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400 group-hover:text-cyan-300 transition-colors">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Synthesize Voice
                </span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Card 3: Senior Code Review */}
            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative rounded-2xl bg-[#030611]/90 border border-indigo-500/25 hover:border-indigo-400/80 p-5 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-indigo-500/15 to-transparent rounded-bl-2xl border-b border-l border-indigo-400/20 flex items-start justify-end pr-2 pt-1.5">
                <span className="text-[9px] font-mono font-bold text-indigo-400">03</span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-sm shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                    🛡️
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase block">QUALITY / GATE</span>
                    <h3 className="text-sm font-bold text-white tracking-wide">Senior Code Review</h3>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#01040A]/90 border border-white/5 font-mono text-[11px] text-zinc-300 leading-relaxed group-hover:border-indigo-500/30 transition-colors">
                  <span className="text-indigo-400 select-none mr-1.5">&gt;</span>
                  &ldquo;Refactor PR code for production scale and zero smells.&rdquo;
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400 group-hover:text-indigo-300 transition-colors">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Synthesize Voice
                </span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: ORIGINAL SLEEK GLASS CAPSULE (With Mobile No.) */}
        {/* ========================================================= */}
        <section
          id="contact"
          className="relative py-20 sm:py-28 px-4 flex flex-col items-center text-center overflow-hidden"
        >
          {/* Top Centered Hairline Rule */}
          <div className="w-56 sm:w-80 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12" />

          {/* Upward Cobalt Aurora Mist at Bottom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
            style={{
              background:
                'radial-gradient(ellipse 70% 80% at 50% 105%, rgba(37,99,235,0.4) 0%, rgba(15,41,109,0.2) 45%, transparent 75%)',
            }}
          />

          <h2 className="relative z-10 text-3xl sm:text-5xl font-medium tracking-[-0.03em] bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-clip-text text-transparent">
            Get in touch
          </h2>
          <p className="relative z-10 mt-3 max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed">
            Got questions for hackathons or need technical AI assistance? KΛ AI is here to help. Reach out and we&apos;ll get back to you as soon as possible.
          </p>

          {/* Original Ultra-Clean Glass Bar with Mobile Number added in the row */}
          <form
            onSubmit={handleContactSubmit}
            className="relative z-10 mt-9 w-full max-w-3xl rounded-2xl bg-[#070E24]/75 border border-white/[0.1] backdrop-blur-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-[0_24px_70px_rgba(0,0,0,0.8)]"
          >
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Name"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#040919]/90 border border-white/[0.06] focus:border-sky-400/50 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
            />
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Mobile No."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#040919]/90 border border-white/[0.06] focus:border-sky-400/50 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none font-mono transition-colors"
            />
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#040919]/90 border border-white/[0.06] focus:border-sky-400/50 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={contactLoading}
              className="px-6 py-2.5 rounded-xl bg-[#0A132C] hover:bg-[#111E44] border border-white/15 text-xs sm:text-sm font-medium text-slate-100 whitespace-nowrap cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {contactLoading ? 'Sending...' : 'Contact us'}
            </button>
          </form>

          {contactSent && (
            <p className="relative z-10 mt-3 text-xs font-mono text-sky-300">
              ✓ Thanks! Your details and mobile number have been queued for the KΛ AI team.
            </p>
          )}
        </section>

        {/* SECTION 3: COSMIC PLANETARY HORIZON FOOTER (Exact Match to pin.it/4w79gNvLO) */}
        <footer className="relative rounded-b-[28px] overflow-hidden bg-[#000000]">
          {/* Upper Cosmic Sky + Luminous White Curved Planetary Horizon */}
          <div className="relative pt-16 sm:pt-24 pb-28 sm:pb-36 px-6 sm:px-14 bg-[#020410] overflow-hidden">
            {/* Cosmic Blue Gradient Atmosphere */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 100% 75% at 50% 100%, rgba(180,198,252,0.75) 0%, rgba(91,124,250,0.45) 26%, rgba(10,22,82,0.55) 56%, rgba(2,4,16,0.96) 88%)',
              }}
            />

            {/* Footer Content Grid: Left Brand + Blurb + 3 Social Pills | Right 4 Inline Links */}
            <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="max-w-sm space-y-4">
                {/* Official KΛ Brand Emblem */}
                <Link
                  href="/"
                  title="KΛ · Built by Kollabrix"
                  className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 transition-all"
                >
                  <KaBrandEmblem size="md" />
                </Link>

                <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed font-normal">
                  Architect hackathon breakthroughs, analyze technical stacks, and ship engineering projects faster—powered as an independent AI brand connected with Kollabrix.
                </p>

                {/* 3 Translucent Pill Social / Ecosystem Links */}
                <div className="flex items-center gap-2.5 pt-1">
                  <Link
                    href="/spark"
                    aria-label="KΛ ΛI Studio"
                    title="Open KΛ ΛI Studio"
                    className="w-14 h-8 rounded-full border border-white/35 bg-white/[0.06] hover:bg-white/[0.14] flex items-center justify-center text-white text-xs font-bold transition-all"
                  >
                    ΛI
                  </Link>
                  <Link
                    href="/"
                    aria-label="Connected with Kollabrix"
                    title="Visit Kollabrix"
                    className="w-14 h-8 rounded-full border border-white/35 bg-white/[0.06] hover:bg-white/[0.14] flex items-center justify-center text-white text-xs font-bold transition-all"
                  >
                    KΛ
                  </Link>
                  <Link
                    href="/ka-codex"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="KΛ FOLIO"
                    title="Open KΛ FOLIO"
                    className="w-14 h-8 rounded-full border border-white/35 bg-white/[0.06] hover:bg-white/[0.14] flex items-center justify-center text-white text-[11px] font-bold transition-all"
                  >
                    FL
                  </Link>
                </div>
              </div>

              {/* Right 4 Inline Links */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm text-white/85">
                <a href="#hero" className="hover:text-white transition-colors">
                  Features
                </a>
                <Link href="/spark" className="hover:text-white transition-colors">
                  How to Use
                </Link>
                <Link href={getKollabrixHomeUrl()} className="hover:text-white transition-colors">
                  Kollabrix
                </Link>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </div>
            </div>

            {/* Sweeping White Glowing Planetary Horizon Curve Dropping into Pure Black */}
            <svg
              aria-hidden="true"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-24 sm:h-32"
            >
              <defs>
                <filter id="horizonBloom" x="-20%" y="-40%" width="140%" height="180%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M -40 125 Q 720 -18 1480 125 L 1480 130 L -40 130 Z"
                fill="#000000"
              />
              <path
                d="M -40 125 Q 720 -18 1480 125"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4.5"
                filter="url(#horizonBloom)"
              />
            </svg>
          </div>

          {/* Pitch-Black Lower Legal Bar Bounded by Crisp Hairlines */}
          <div className="bg-[#000000] px-6 sm:px-14 pb-8 pt-2">
            <div className="max-w-6xl mx-auto border-y border-white/15 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-white/55">
              <span>&copy; 2026 KΛ ΛI &bull; Built by Kollabrix. All rights reserved.</span>
              <div className="flex items-center gap-6">
                <Link href="/terms" className="hover:text-white/90 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="hover:text-white/90 transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
