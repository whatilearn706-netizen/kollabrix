'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Code2, Swords, MessageSquare, Users } from 'lucide-react';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { getClientKaSubdomain } from '@/lib/kaBrandDomains';

export function Footer() {
  const pathname = usePathname();
  const { theme, isDark } = useSiteTheme();
  const footerRef = useRef<HTMLElement | null>(null);
  const [laserRevealed, setLaserRevealed] = useState(false);
  const [laserFading, setLaserFading] = useState(false);
  const [laserFinished, setLaserFinished] = useState(false);

  const isFooterDark = pathname === '/' || isDark;

  useEffect(() => {
    if (!isFooterDark) {
      setLaserRevealed(true);
      setLaserFinished(true);
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setLaserRevealed(true);
      setLaserFinished(true);
      return;
    }

    const node = footerRef.current;
    if (!node) return;

    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    let doneTimer: ReturnType<typeof setTimeout> | null = null;
    const triggerReveal = () => {
      requestAnimationFrame(() => setLaserRevealed(true));
      fadeTimer = setTimeout(() => setLaserFading(true), 2250);
      doneTimer = setTimeout(() => setLaserFinished(true), 2650);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          triggerReveal();
          observer.disconnect();
        }
      },
      { threshold: 0.14 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (fadeTimer) clearTimeout(fadeTimer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, [isFooterDark, pathname]);

  if (
    getClientKaSubdomain() !== null ||
    pathname?.startsWith('/resources') ||
    pathname?.startsWith('/arena') ||
    pathname?.startsWith('/spark') ||
    pathname?.startsWith('/ai-spark') ||
    pathname?.startsWith('/ka-ai') ||
    pathname?.startsWith('/ka-codex')
  ) {
    return null;
  }

  const surfaceStyle = isFooterDark
    ? 'bg-[#090C12]/90 border border-white/15 border-t-white/25 text-zinc-300 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.16)]'
    : 'bg-white border border-stone-200 text-stone-700 shadow-xs';

  const headingClass = isFooterDark
    ? 'text-[11px] font-bold uppercase tracking-[0.14em] font-mono text-zinc-100'
    : 'text-[11px] font-bold uppercase tracking-[0.14em] font-mono text-stone-900';

  const linkClass = isFooterDark
    ? 'text-xs font-medium text-zinc-400 hover:text-white transition-colors duration-150'
    : 'text-xs font-medium text-stone-600 hover:text-stone-950 transition-colors duration-150';

  return (
    <footer
      data-kollabrix-footer
      ref={footerRef}
      style={{
        backgroundColor: isFooterDark ? '#000000' : '#f8fafc',
        color: isFooterDark ? '#94A3B8' : theme.bodyTextColor,
      }}
      className="relative w-full overflow-hidden text-sm transition-all"
    >
      {/* Titanium Silver Laser Scan Reveal Wrapper (clips horizon + content in sync L->R) */}
      <div
        style={
          isFooterDark
            ? {
                clipPath: laserRevealed ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                transition: 'clip-path 2400ms cubic-bezier(0.25, 0.1, 0.25, 1)',
              }
            : undefined
        }
        className="relative w-full pt-14 sm:pt-16 pb-6 sm:pb-8"
      >
      {/* Curved Brushed-Titanium Horizon Separator & Soft Atmospheric Glow */}
      {isFooterDark ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 overflow-hidden" aria-hidden="true">
          {/* Soft cool silver atmospheric spill below center arc */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[72%] max-w-[960px] h-32 bg-[radial-gradient(ellipse_at_top,rgba(226,232,240,0.14),rgba(148,163,184,0.04)_48%,transparent_75%)] blur-2xl" />
          {/* Curved luminous titanium hairline arc */}
          <svg
            viewBox="0 0 1440 72"
            preserveAspectRatio="none"
            className="w-full h-14 sm:h-[72px] block"
            fill="none"
          >
            <defs>
              <linearGradient id="kb-footer-horizon" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity="0" />
                <stop offset="20%" stopColor="#CBD5E1" stopOpacity="0.32" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#CBD5E1" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
              </linearGradient>
              <filter id="kb-horizon-glow" x="-10%" y="-80%" width="120%" height="260%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 0 58 Q 720 6 1440 58"
              stroke="url(#kb-footer-horizon)"
              strokeWidth="1.5"
              filter="url(#kb-horizon-glow)"
            />
          </svg>
        </div>
      ) : (
        <div
          style={{ borderColor: theme.borderColor }}
          className="absolute inset-x-0 top-0 border-t"
        />
      )}

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Top Row: Brand Block Left + 3 Clean Navigation Columns Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pt-4 pb-8 sm:pb-10">
          {/* Left Brand Block */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block focus-visible:outline-none">
              <BrandLogo
                size="sm"
                showWordmark={false}
                wordmarkColor={isFooterDark ? 'light' : 'dark'}
                title="Kollabrix"
              />
            </Link>

            <p className={`text-xs sm:text-[13px] leading-relaxed max-w-sm ${isFooterDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              {theme.footerTagline ||
                'Where collegiate builders form hackathon squads, prove coding speed, and ship together.'}
            </p>

            {/* Smoked Liquid-Glass Operational Pill + Action Icon Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium select-none ${surfaceStyle}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                <span>All Systems Operational</span>
              </div>

              <div className="inline-flex items-center gap-1.5">
                <Link
                  href="/explore"
                  aria-label="Explore Projects"
                  title="Explore Projects"
                  className={`p-2 rounded-lg transition-all duration-150 hover:scale-105 ${surfaceStyle} ${isFooterDark ? 'hover:border-white/30 hover:text-white' : 'hover:border-stone-400'}`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/arena"
                  aria-label="KΛ ARENA"
                  title="KΛ ARENA"
                  className={`p-2 rounded-lg transition-all duration-150 hover:scale-105 ${surfaceStyle} ${isFooterDark ? 'hover:border-white/30 hover:text-white' : 'hover:border-stone-400'}`}
                >
                  <Swords className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/feedback"
                  aria-label="Community Feedback"
                  title="Community Feedback"
                  className={`p-2 rounded-lg transition-all duration-150 hover:scale-105 ${surfaceStyle} ${isFooterDark ? 'hover:border-white/30 hover:text-white' : 'hover:border-stone-400'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/teammates"
                  aria-label="Find Teammates"
                  title="Find Teammates"
                  className={`p-2 rounded-lg transition-all duration-150 hover:scale-105 ${surfaceStyle} ${isFooterDark ? 'hover:border-white/30 hover:text-white' : 'hover:border-stone-400'}`}
                >
                  <Users className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right 3 Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className={headingClass}>Platform</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/explore" className={linkClass}>
                    Explore Projects
                  </Link>
                </li>
                <li>
                  <Link href="/teammates" className={linkClass}>
                    Teammates
                  </Link>
                </li>
                <li>
                  <Link href="/hackathons" className={linkClass}>
                    Hackathons
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className={headingClass}>Build &amp; Compete</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/arena" className={linkClass}>
                    KΛ ARENA
                  </Link>
                </li>
                <li>
                  <Link href="/projects/new" className={linkClass}>
                    Launch Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className={linkClass}>
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/spark" target="_blank" rel="noopener noreferrer" className={linkClass}>
                    KΛ ΛI
                  </Link>
                </li>
                <li>
                  <Link href="/resources" target="_blank" rel="noopener noreferrer" className={linkClass}>
                    KΛ FOLIO
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className={headingClass}>Community &amp; Legal</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/teacher/dashboard" className={linkClass}>
                    Faculty Portal
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className={linkClass}>
                    Community Feedback
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className={linkClass}>
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className={linkClass}>
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Oversized Brushed-Titanium Watermark Typography */}
        <div
          className="relative w-full overflow-hidden select-none pointer-events-none pt-2 pb-1 sm:pb-2"
          aria-hidden="true"
          style={
            isFooterDark
              ? {
                  WebkitMaskImage:
                    'radial-gradient(ellipse 88% 95% at 50% 42%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.45) 75%, transparent 100%)',
                  maskImage:
                    'radial-gradient(ellipse 88% 95% at 50% 42%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.45) 75%, transparent 100%)',
                }
              : undefined
          }
        >
          <div
            className="font-black uppercase text-center leading-[0.82] tracking-[0.04em] whitespace-nowrap text-[14vw] sm:text-[13.2vw] xl:text-[184px]"
          >
            <span
              className={
                isFooterDark
                  ? 'bg-gradient-to-b from-white/[0.19] via-slate-300/[0.08] to-transparent bg-clip-text text-transparent'
                  : 'bg-gradient-to-b from-stone-900/[0.10] via-stone-700/[0.04] to-transparent bg-clip-text text-transparent'
              }
            >
              KOLL
            </span>
            <span
              className={`inline-block scale-y-[0.98] mx-[0.015em] ${
                isFooterDark
                  ? 'bg-gradient-to-b from-zinc-400/[0.12] via-zinc-600/[0.06] to-transparent bg-clip-text text-transparent'
                  : 'bg-gradient-to-b from-stone-700/[0.07] via-stone-500/[0.03] to-transparent bg-clip-text text-transparent'
              }`}
            >
              Λ
            </span>
            <span
              className={
                isFooterDark
                  ? 'bg-gradient-to-b from-white/[0.19] via-slate-300/[0.08] to-transparent bg-clip-text text-transparent'
                  : 'bg-gradient-to-b from-stone-900/[0.10] via-stone-700/[0.04] to-transparent bg-clip-text text-transparent'
              }
            >
              BRIX
            </span>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div
          className={`border-t pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isFooterDark
              ? 'border-white/[0.08] text-zinc-500'
              : 'border-stone-200 text-stone-500'
          }`}
        >
          <p>
            © {new Date().getFullYear()} {theme.siteTitle || 'Kollabrix'}. Built for student builders.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className={linkClass}>
              Terms
            </Link>
            <span className="opacity-30">•</span>
            <Link href="/privacy" className={linkClass}>
              Privacy
            </Link>
            <span className="opacity-30">•</span>
            <Link href="/explore" className={linkClass}>
              Directory
            </Link>
            <span className="opacity-30">•</span>
            <Link href="/hackathons" className={linkClass}>
              Events
            </Link>
          </div>
        </div>
      </div>
      </div>

      {/* Synchronized Titanium Silver Laser Beam Head (sweeps L->R along the exact wipe edge) */}
      {isFooterDark && !laserFinished && (
        <div
          aria-hidden="true"
          style={{
            transform: laserRevealed ? 'translateX(0%)' : 'translateX(-100%)',
            opacity: laserFading ? 0 : laserRevealed ? 1 : 0,
            transition:
              'transform 2400ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 320ms ease-out',
          }}
          className="pointer-events-none absolute inset-0 z-30"
        >
          <div className="absolute right-0 inset-y-0 w-36 bg-gradient-to-r from-transparent via-slate-300/[0.08] to-white/25" />
          <div className="absolute right-0 inset-y-0 w-[1.5px] bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_18px_2px_rgba(255,255,255,0.9),_0_0_40px_rgba(226,232,240,0.55)]" />
          {/* Etch flare node traveling along top horizon line */}
          <div className="absolute -right-1.5 top-4 sm:top-5 w-3 h-10 rounded-full bg-white/85 blur-[4px] shadow-[0_0_24px_rgba(255,255,255,0.95)]" />
        </div>
      )}
    </footer>
  );
}
