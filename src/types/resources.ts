export type ResourceLanguage = 'java' | 'cpp' | 'python' | 'web_dev' | 'dsa' | 'app_dev' | string;

export type ResourceTrack = 'beginner' | 'learning' | 'both';

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  language: ResourceLanguage;
  track: ResourceTrack;
  topic: string;
  videoUrl?: string;
  youtubeId?: string;
  duration?: string;
  instructor?: string;
  docUrl?: string;
  practiceUrl?: string;
  tags?: string[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const LANGUAGE_META: Record<
  ResourceLanguage,
  {
    label: string;
    icon: string;
    tagline: string;
    color: string;
    badgeBg: string;
    borderColor: string;
    description: string;
  }
> = {
  java: {
    label: 'Java',
    icon: '☕',
    tagline: 'Enterprise OOP, Backend & Placement DSA',
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-400/30 hover:border-amber-400/70',
    description: 'Master object-oriented programming, Spring Boot microservices, and collegiate placement DSA.',
  },
  cpp: {
    label: 'C++',
    icon: '⚡',
    tagline: 'High Performance & Competitive Programming',
    color: 'text-cyan-500 dark:text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    borderColor: 'border-cyan-400/30 hover:border-cyan-400/70',
    description: 'Master memory management, pointers, the Standard Template Library (STL), and speed for ICPC & codeforces.',
  },
  python: {
    label: 'Python',
    icon: '🐍',
    tagline: 'AI/ML, Data Science, Web & Automation',
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-400/30 hover:border-emerald-400/70',
    description: 'Learn modern Python from basic scripts to machine learning models, FastAPI backends, and data science.',
  },
  web_dev: {
    label: 'Web Development',
    icon: '🌐',
    tagline: 'Full-Stack JavaScript, React, Next.js & Node',
    color: 'text-violet-500 dark:text-violet-400',
    badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    borderColor: 'border-violet-400/30 hover:border-violet-400/70',
    description: 'Build production web apps with modern HTML/CSS, TypeScript, Next.js, and scalable backend REST APIs.',
  },
  dsa: {
    label: 'DSA & Algorithms',
    icon: '🧠',
    tagline: 'LeetCode, Problem Solving & Interview Prep',
    color: 'text-rose-500 dark:text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    borderColor: 'border-rose-400/30 hover:border-rose-400/70',
    description: 'Crack coding rounds with patterns: Two Pointers, Sliding Window, Trees, Graphs, and Dynamic Programming.',
  },
  app_dev: {
    label: 'App & Cloud DevOps',
    icon: '📱',
    tagline: 'Flutter, Android, Docker, Git & Cloud',
    color: 'text-pink-500 dark:text-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    borderColor: 'border-pink-400/30 hover:border-pink-400/70',
    description: 'Cross-platform mobile apps with Flutter, native Android, containerization with Docker, and cloud deployments.',
  },
};
