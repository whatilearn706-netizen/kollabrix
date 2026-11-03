'use client';

import { useRef, useEffect, useState } from 'react';
import { useInView } from 'motion/react';

function AnimatedCounter({
  target,
  suffix = '+',
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  {
    value: 1400,
    label: '1v1 Duels Fought',
    suffix: '+',
    color: 'bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent',
  },
  {
    value: 48,
    label: 'Compiler Latency',
    suffix: 'ms',
    color: 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent',
  },
  {
    value: 40,
    label: 'Engineering Colleges',
    suffix: '+',
    color: 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent',
  },
  {
    value: 100,
    label: 'Proctor Verification',
    suffix: '%',
    color: 'bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent',
  },
];

export function LandingStats() {
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Iridescent divider top */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 via-purple-500/40 to-transparent mb-16" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className={`font-heading text-4xl md:text-5xl font-extrabold mb-2 ${stat.color} drop-shadow-sm`}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Iridescent divider bottom */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 via-cyan-500/40 to-transparent mt-16" />
      </div>
    </section>
  );
}
