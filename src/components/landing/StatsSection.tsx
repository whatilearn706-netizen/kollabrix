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
  { value: 5000, label: 'Students', suffix: '+' },
  { value: 200, label: 'Projects Shipped', suffix: '+' },
  { value: 50, label: 'Hackathons Hosted', suffix: '+' },
  { value: 100, label: 'Universities', suffix: '+' },
];

export function LandingStats() {
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Glow divider top */}
        <div className="glow-divider mb-16" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-medium text-stone-500 dark:text-slate-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Glow divider bottom */}
        <div className="glow-divider mt-16" />
      </div>
    </section>
  );
}
