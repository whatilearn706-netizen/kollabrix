'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  Users, Trophy, Brain, UserPlus, Code2, Rocket,
} from 'lucide-react';

const features = [
  {
    title: 'Real-time Workspace',
    description:
      'Huddle with your team, track milestones, manage tasks, and ship code — all in one seamless collaborative environment with voice rooms, GitHub sync, and live discussions.',
    icon: Users,
    iconBg: 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400',
    span: 'md:col-span-2',
  },
  {
    title: 'Hackathon Engine',
    description:
      'Host or join hackathons with built-in team formation, submission tracking, and judging workflows.',
    icon: Trophy,
    iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    span: '',
  },
  {
    title: 'Smart Matching',
    description:
      'Find collaborators who complement your skills. Our algorithm surfaces the perfect teammates for your project.',
    icon: UserPlus,
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    span: '',
  },
  {
    title: 'ICPC Arena',
    description:
      'Compete in proctored competitive programming contests with real-time leaderboards and verified results.',
    icon: Code2,
    iconBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    span: '',
  },
  {
    title: 'Spark AI',
    description:
      'AI-powered brainstorming, code generation, and project assistance at your fingertips.',
    icon: Brain,
    iconBg: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    span: '',
  },
  {
    title: 'Starter Kits & Resources',
    description:
      'Launch projects instantly with curated templates, learning paths, and boilerplate code from the community.',
    icon: Rocket,
    iconBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    span: 'md:col-span-2',
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={`landing-card rounded-2xl p-6 md:p-8 border border-stone-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] backdrop-blur-sm ${feature.span}`}
    >
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconBg} mb-5`}
      >
        <feature.icon className="w-6 h-6" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-stone-900 dark:text-white mb-3">
        {feature.title}
      </h3>
      <p className="text-stone-600 dark:text-slate-400 leading-relaxed text-[15px]">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function LandingFeatures() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header — left-aligned for asymmetry */}
        <div className="max-w-2xl mb-16">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-orange-600 dark:text-orange-400 mb-4 block">
            Platform
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-white leading-tight">
            Everything you need to ship something{' '}
            <span className="landing-gradient-text">extraordinary.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
