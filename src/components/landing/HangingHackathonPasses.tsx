'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import {
  FeaturedHackathonBadgeConfig,
  DEFAULT_FEATURED_HACKATHON_BADGES,
} from '@/types/masterControl';
import { LanyardPassCard3D } from './LanyardPassCard3D';

export function HangingHackathonPasses() {
  const [badges, setBadges] = useState<FeaturedHackathonBadgeConfig[]>(
    DEFAULT_FEATURED_HACKATHON_BADGES
  );
  const [isLive, setIsLive] = useState<boolean>(false);

  // Sync dynamic badge config from Master Control API & Admin updates
  useEffect(() => {
    let isMounted = true;

    try {
      const cached = localStorage.getItem('linkora_master_control_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        const live =
          parsed?.featuredHackathonBadgesEnabled === true ||
          parsed?.sections?.hackathonBadges === true;
        setIsLive(Boolean(live));
        if (
          Array.isArray(parsed?.featuredHackathonBadges) &&
          parsed.featuredHackathonBadges.length > 0
        ) {
          setBadges(parsed.featuredHackathonBadges);
        }
      }
    } catch {}

    fetch('/api/master-control', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.config) {
          const live =
            data.config.featuredHackathonBadgesEnabled === true ||
            data.config.sections?.hackathonBadges === true;
          setIsLive(Boolean(live));
          if (
            Array.isArray(data.config.featuredHackathonBadges) &&
            data.config.featuredHackathonBadges.length > 0
          ) {
            setBadges(data.config.featuredHackathonBadges);
          }
        }
      })
      .catch(() => {});

    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem('linkora_master_control_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          setIsLive(
            Boolean(
              parsed?.featuredHackathonBadgesEnabled === true ||
              parsed?.sections?.hackathonBadges === true
            )
          );
          if (Array.isArray(parsed?.featuredHackathonBadges)) {
            setBadges(parsed.featuredHackathonBadges);
          }
        }
      } catch {}
    };

    window.addEventListener('linkora_master_control_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('linkora_master_control_updated', handleUpdate);
    };
  }, []);

  if (!isLive) {
    return null;
  }

  return (
    <section className="relative py-16 sm:py-24 bg-[#020305] border-t border-white/[0.06] overflow-hidden select-none">
      {/* Studio Backdrop Lighting */}
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-black via-[#020305]/80 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[960px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035),transparent_70%)] blur-[90px] pointer-events-none" />

      <div className="max-w-[1640px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-white/[0.08] text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.08)] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Collegiate Credentials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-heading">
              Curated Hackathon Passes
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
              Official physical-style competition badges for upcoming collegiate hackathons. Explore host campuses, prize pools, and claim your participant pass.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/hackathons"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-xs sm:text-sm font-semibold text-white transition-all group self-start sm:self-auto cursor-pointer"
            >
              <span>View All 40+ Competitions</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3D Studio Stage Row — Top fade seamlessly hides strap origins */}
        <div className="relative w-full pt-4 pb-10 overflow-x-auto no-scrollbar">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-[#020305] via-[#020305]/70 to-transparent z-30"
          />
          <div className="min-w-[1160px] flex items-start justify-center gap-5 sm:gap-6 xl:gap-7 px-6">
            {badges.map((badge, idx) => (
              <LanyardPassCard3D key={badge.id} badge={badge} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
