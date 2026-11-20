'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

const LINE_1 = 'Code.';
const LINE_2 = 'Team Up. Win.';

export function LandingHero() {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Explicitly configure and trigger video playback for WebKit, Safari and mobile policies
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');

    const startVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser policy required a user gesture, listen to first interaction and resume
          const onFirstInteraction = () => {
            video.play().catch(() => {});
            window.removeEventListener('pointerdown', onFirstInteraction);
            window.removeEventListener('touchstart', onFirstInteraction);
            window.removeEventListener('scroll', onFirstInteraction);
          };
          window.addEventListener('pointerdown', onFirstInteraction, { once: true });
          window.addEventListener('touchstart', onFirstInteraction, { once: true });
          window.addEventListener('scroll', onFirstInteraction, { once: true });
        });
      }
    };

    startVideo();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] lg:min-h-[92vh] flex flex-col justify-end pb-10 sm:pb-12 lg:pb-14 overflow-hidden bg-[#000002] transform-gpu will-change-transform"
    >
      {/* Cinematic Celestial Blue Horizon Video Background (Expansive 1.4x scale) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/brand/hero-celestial-horizon-v3.webp"
          className="absolute inset-0 w-full h-full object-cover object-[center_36%] scale-[1.04] sm:scale-[1.06] lg:scale-[1.08] filter brightness-[1.10] contrast-[1.06] transform-gpu will-change-transform origin-center transition-transform duration-1000 ease-out"
        >
          <source src="/videos/hero-celestial-horizon-v3.webm" type="video/webm" />
          <source src="/videos/hero-celestial-horizon-v3.mp4" type="video/mp4" />
          {/* Fallback image if video element is unsupported */}
          <img
            src="/brand/hero-celestial-horizon-v3.webp"
            alt="Kollabrix Horizon"
            className="w-full h-full object-cover object-center"
          />
        </video>
      </div>

      {/* Atmospheric Vignette for deep contrast and seamless blend into obsidian page background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-black/30 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_40%,transparent_45%,rgba(0,0,2,0.65)_100%)] pointer-events-none z-10" />

      {/* Content — Auralis Inspired Split Editorial Layout (Lower Level + Wide Fluid Left Alignment) */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-20 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-end">
          {/* Left Column: Frosted Pill Badge + Row 1: "Code." / Row 2: "Team Up. Win." */}
          <div className="lg:col-span-7 xl:col-span-7">
            {/* Frosted Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <Link
                href="/arena"
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-sky-400/25 bg-sky-500/[0.08] hover:bg-sky-500/[0.18] hover:border-sky-400/50 backdrop-blur-md mb-3.5 transition-all group cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse" />
                <span className="text-xs sm:text-sm text-sky-200 group-hover:text-white font-medium tracking-wide transition-colors">
                  1v1 Battle Arena & Collegiate Hackathons →
                </span>
              </Link>
            </motion.div>

            {/* Headline: Row 1 = Code. | Row 2 = Team Up. Win. (Guaranteed single line on row 2) */}
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.75rem] font-bold text-white tracking-tight leading-[0.94] select-none">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="block text-white"
              >
                {LINE_1}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="block mt-1 whitespace-nowrap"
              >
                <span className="text-white">Team Up. </span>
                <span className="bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">Win.</span>
              </motion.span>
            </h1>
          </div>

          {/* Right Column: Subtitle + Two Big Doors CTAs + Bullets */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-end">
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg text-slate-300/90 leading-relaxed font-normal mb-6 drop-shadow-md"
            >
              The fast-paced 1v1 coding arena & hackathon squad finder for college builders. Duel live in 3 minutes, recruit dream teammates, and build real projects together.
            </motion.p>

            {/* The Two Big Doors Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-3.5 sm:gap-4"
            >
              <Link
                href="/arena"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <span>⚔️ Play 3-Min Code Duel</span>
                <ArrowUpRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <Link
                href="/explore"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.14] text-white text-sm sm:text-base font-semibold backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>👥 Find Hackathon Squad</span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Feature Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 font-mono mt-6"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" /> 3-Min 1v1 Duels
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" /> Hackathon Teammates
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" /> Verified GitHub Proof
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
