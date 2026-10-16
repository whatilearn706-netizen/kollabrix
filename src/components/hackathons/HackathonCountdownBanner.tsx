'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Clock, 
  ArrowRight, 
  Users, 
  Sparkles, 
  X, 
  Calendar, 
  Trophy 
} from 'lucide-react';

interface HackathonCountdownBannerProps {
  hackathonName?: string;
  targetDate?: string; // ISO date string
  prizePool?: string;
  openSquadsCount?: number;
}

export function HackathonCountdownBanner({
  hackathonName = 'ETHIndia & HackMIT Spring 2026',
  targetDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
  prizePool = '$45,000',
  openSquadsCount = 284,
}: HackathonCountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 4, hours: 14, minutes: 22, seconds: 45 });
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isDismissed) return null;

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="relative z-40 bg-zinc-950 text-white border-b border-zinc-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          
          {/* Left info badge */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Live Hackathon
            </span>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                {hackathonName}
              </span>
              <span className="hidden sm:inline-block text-xs text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                Prize {prizePool}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>{openSquadsCount} collegiate builders forming teams</span>
            </div>
          </div>

          {/* Right: Countdown clock + CTA */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4">
            
            {/* Countdown digits */}
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-center min-w-[34px]">
                <span className="font-bold text-white">{padZero(timeLeft.days)}</span>
                <span className="block text-[9px] uppercase tracking-tighter text-zinc-500 font-sans">d</span>
              </div>
              <span className="text-zinc-600 font-bold">:</span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-center min-w-[34px]">
                <span className="font-bold text-white">{padZero(timeLeft.hours)}</span>
                <span className="block text-[9px] uppercase tracking-tighter text-zinc-500 font-sans">h</span>
              </div>
              <span className="text-zinc-600 font-bold">:</span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-center min-w-[34px]">
                <span className="font-bold text-white">{padZero(timeLeft.minutes)}</span>
                <span className="block text-[9px] uppercase tracking-tighter text-zinc-500 font-sans">m</span>
              </div>
              <span className="text-zinc-600 font-bold">:</span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-center min-w-[34px]">
                <span className="font-bold text-amber-400">{padZero(timeLeft.seconds)}</span>
                <span className="block text-[9px] uppercase tracking-tighter text-zinc-500 font-sans">s</span>
              </div>
            </div>

            {/* CTA button */}
            <div className="flex items-center gap-2">
              <Link
                href="/hackathons"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-100 transition-all shadow-sm group"
              >
                <span>Find Squad</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <button
                onClick={() => setIsDismissed(true)}
                aria-label="Dismiss countdown banner"
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
