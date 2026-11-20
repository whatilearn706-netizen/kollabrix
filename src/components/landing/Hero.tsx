'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { HeroKineticStage } from './HeroKineticStage';
import { HeroMatrixScramble } from './HeroMatrixScramble';
import { HeroSettledContent } from './HeroSettledContent';

export function LandingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);

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
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Track scroll progress to enable buttons when Stage 3 is visible
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setIsInteractive(latest > 0.45);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Stage 1: Massive Kinetic Typography Transforms (STR8FIRE Layout)
  const stage1Opacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const topY = useTransform(scrollYProgress, [0, 0.35], [0, -220]);
  const topScale = useTransform(scrollYProgress, [0, 0.35], [1, 2.4]);
  const leftX = useTransform(scrollYProgress, [0, 0.35], [0, -420]);
  const leftScale = useTransform(scrollYProgress, [0, 0.35], [1, 2.2]);
  const rightX = useTransform(scrollYProgress, [0, 0.35], [0, 420]);
  const rightScale = useTransform(scrollYProgress, [0, 0.35], [1, 2.2]);
  const hudOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);

  // Stage 2: Hyperspace Zoom & Cryptographic Matrix Stream
  const videoScale = useTransform(scrollYProgress, [0, 0.75], [1.04, 1.25]);
  const matrixOpacity = useTransform(scrollYProgress, [0.18, 0.32, 0.50, 0.62], [0, 1, 1, 0]);
  const matrixScale = useTransform(scrollYProgress, [0.20, 0.60], [0.94, 1.06]);

  // Stage 3: Settled Hero Content ("3rd Image Content")
  const settledOpacity = useTransform(scrollYProgress, [0.46, 0.70], [0, 1]);
  const settledY = useTransform(scrollYProgress, [0.46, 0.70], [40, 0]);
  const settledScale = useTransform(scrollYProgress, [0.46, 0.70], [0.97, 1]);

  const handleExploreClick = () => {
    if (!containerRef.current) return;
    const targetScroll = containerRef.current.offsetTop + containerRef.current.offsetHeight * 0.75;
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[210vh] bg-[#000002]"
    >
      {/* Sticky Fullscreen Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-end pb-10 sm:pb-12 lg:pb-14 overflow-hidden bg-[#000002] transform-gpu will-change-transform">
        {/* Cinematic Celestial Blue Horizon Video Background with Hyperspace Scale */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <motion.div
            style={{ scale: videoScale }}
            className="w-full h-full transform-gpu will-change-transform origin-center"
          >
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/brand/hero-celestial-horizon-v3.webp"
              className="absolute inset-0 w-full h-full object-cover object-[center_36%] filter brightness-[1.10] contrast-[1.06]"
            >
              <source src="/videos/hero-celestial-horizon-v3.webm" type="video/webm" />
              <source src="/videos/hero-celestial-horizon-v3.mp4" type="video/mp4" />
              {/* Fallback image */}
              <img
                src="/brand/hero-celestial-horizon-v3.webp"
                alt="Kollabrix Horizon"
                className="w-full h-full object-cover object-center"
              />
            </video>
          </motion.div>
        </div>

        {/* Atmospheric Vignette for deep contrast and seamless blend */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-black/30 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_40%,transparent_45%,rgba(0,0,2,0.65)_100%)] pointer-events-none z-10" />

        {/* Stage 1: STR8FIRE Kinetic Editorial Typography */}
        <HeroKineticStage
          opacity={stage1Opacity}
          topY={topY}
          topScale={topScale}
          leftX={leftX}
          leftScale={leftScale}
          rightX={rightX}
          rightScale={rightScale}
          hudOpacity={hudOpacity}
          onExploreClick={handleExploreClick}
        />

        {/* Stage 2: Hyperspace Matrix Binary Scramble */}
        <HeroMatrixScramble
          opacity={matrixOpacity}
          scale={matrixScale}
        />

        {/* Stage 3: Settled 3rd Image Content */}
        <HeroSettledContent
          opacity={settledOpacity}
          y={settledY}
          scale={settledScale}
          isInteractive={isInteractive}
        />
      </div>
    </div>
  );
}
