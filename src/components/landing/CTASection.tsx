'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LandingCTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-[#090B10]" />

      {/* Top gradient fade from site bg */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--site-bg)] to-transparent pointer-events-none z-10" />

      {/* Central glow orb */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-orange-600/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 landing-orb-pulse" />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: '28px 28px',
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative z-20 max-w-3xl mx-auto px-6 text-center"
      >
        <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to build something{' '}
          <span className="landing-gradient-text">amazing?</span>
        </h2>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Join thousands of students who are already collaborating, competing,
          and shipping real projects on Kollabrix.
        </p>
        <Link
          href="/signup"
          className="group inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold text-lg landing-btn-glow"
        >
          Get Started — It&apos;s Free
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
        <p className="mt-5 text-sm text-slate-600">No credit card required</p>
      </motion.div>
    </section>
  );
}
