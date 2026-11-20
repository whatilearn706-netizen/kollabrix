'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ArrowUpRight, RotateCcw, Swords, Users, Play, ShieldCheck, Zap } from 'lucide-react';

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStopped, setHasStopped] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');

    const handleTimeUpdate = () => {
      // Pause exactly when video reaches the GameBoy console (6.7s) and hold the frame
      if (video.currentTime >= 6.7) {
        video.pause();
        setHasStopped(true);
      }
    };

    const handleEnded = () => {
      setHasStopped(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    const startVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
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

    // Fallback: Reveal content after 6.8s if browser delayed playback
    const timer = setTimeout(() => {
      setHasStopped(true);
    }, 6800);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      clearTimeout(timer);
    };
  }, []);

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasStopped(false);
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  const handleSkipIntro = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 6.7;
    video.pause();
    setHasStopped(true);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[92vh] lg:min-h-[96vh] flex flex-col justify-end pb-8 sm:pb-12 lg:pb-16 overflow-hidden bg-[#090B10] transform-gpu will-change-transform"
    >
      {/* 100% Fullscreen Hero Section Video (Zero White/Grey Borders, Pure Dark Frame, Cache-Busted) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 bg-[#090B10]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster="/brand/hero-arena-v3.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[1.04] contrast-[1.04] transform-gpu will-change-transform"
        >
          <source src="/videos/hero-arena-v3.mp4" type="video/mp4" />
          <img
            src="/brand/hero-arena-v3.jpg"
            alt="Kollabrix Game Arena"
            className="w-full h-full object-cover object-center"
          />
        </video>
      </div>

      {/* Seamless gradient overlays to cleanly conceal legacy third-party text while keeping the 3D TV console crystal clear */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[64%] bg-gradient-to-l from-[#090B10] via-[#090B10] to-transparent pointer-events-none z-[5]" />
      <div className="absolute top-0 left-0 w-96 h-36 bg-gradient-to-b from-[#090B10] via-[#090B10]/90 to-transparent pointer-events-none z-[5]" />

      {/* Subtle Bottom Vignette for seamless blend into subsequent sections */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-transparent pointer-events-none z-10" />

      {/* Skip Intro Button while video is playing */}
      {!hasStopped && (
        <button
          onClick={handleSkipIntro}
          className="absolute top-20 right-6 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-black/60 hover:bg-black/80 backdrop-blur-md text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
        >
          <span>Skip Intro</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Replay Video Button once stopped */}
      {hasStopped && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleReplay}
          className="absolute top-20 right-6 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-400/25 bg-black/70 hover:bg-sky-500/20 backdrop-blur-md text-xs font-mono text-sky-200 hover:text-white transition-all cursor-pointer shadow-lg"
          title="Replay Video Intro"
        >
          <RotateCcw className="w-3 h-3 text-sky-400" />
          <span>Replay Video</span>
        </motion.button>
      )}

      {/* Content — Revealed directly inside the video scene once video reaches the GameBoy TV */}
      <AnimatePresence>
        {hasStopped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-end">
              {/* Left Side: TV Screen Game Console Display Overlay */}
              <div className="lg:col-span-5 xl:col-span-5">
                <div className="p-5 sm:p-6 rounded-2xl border border-sky-400/30 bg-[#060A14]/85 backdrop-blur-xl shadow-[0_0_40px_rgba(56,189,248,0.2)]">
                  {/* Micro header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-500/20 text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                      TV CONSOLE // ACTIVE
                    </span>
                    <span className="text-slate-400">KOLLABRIX OS</span>
                  </div>

                  {/* Arena Badge Link */}
                  <Link
                    href="/arena"
                    prefetch={false}
                    className="group inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-400/35 bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 hover:text-white text-xs font-mono font-medium mb-3 transition-colors"
                  >
                    <Swords className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
                    <span>1v1 Battle Arena & Collegiate Hackathons →</span>
                  </Link>

                  {/* Words on TV */}
                  <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-black text-white tracking-tight leading-[0.98]">
                    <span className="block text-white">Code.</span>
                    <span className="block mt-1">
                      <span className="text-white">Team Up. </span>
                      <span className="bg-gradient-to-r from-sky-200 via-sky-400 to-cyan-300 bg-clip-text text-transparent">
                        Win.
                      </span>
                    </span>
                  </h1>

                  {/* Micro status footer */}
                  <div className="mt-4 pt-3 border-t border-sky-500/15 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> FAST-PACED 3-MIN DUELS
                    </span>
                    <span className="text-slate-400">100% PROCTORED</span>
                  </div>
                </div>
              </div>

              {/* Right Side: High-Tech Terminal Card (Replaces the video's original right-side text cleanly) */}
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-end">
                <div className="p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#040814]/90 backdrop-blur-xl shadow-2xl">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs font-mono text-slate-400">
                    <span className="text-sky-400 font-semibold tracking-wider uppercase">
                      / 01 WHAT WE OFFER
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      COLLEGIATE NETWORK
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal mb-6">
                    The fast-paced 1v1 coding arena & hackathon squad finder for college builders. Duel live in 3 minutes, recruit dream teammates, and build real projects together.
                  </p>

                  {/* Two Big Action Doors */}
                  <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
                    <Link
                      href="/arena"
                      prefetch={false}
                      className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                    >
                      <Swords className="w-4 h-4 text-slate-950" />
                      <span>Play 3-Min Code Duel</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>

                    <Link
                      href="/explore"
                      className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 text-white text-sm sm:text-base font-semibold backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-lg"
                    >
                      <Users className="w-4 h-4 text-sky-400" />
                      <span>Find Hackathon Squad</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Feature Highlights */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 font-mono mt-6 pt-4 border-t border-white/5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" /> 3-Min 1v1 Duels
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" /> Hackathon Teammates
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" /> Verified GitHub Proof
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
