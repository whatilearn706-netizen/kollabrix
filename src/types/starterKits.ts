export type StarterKitCategory = 'all' | 'ai-fullstack' | 'saas-mvp' | 'mobile-pwa' | 'python-ml';

export interface StarterKit {
  id: string;
  title: string;
  category: 'ai-fullstack' | 'saas-mvp' | 'mobile-pwa' | 'python-ml';
  tagline: string;
  description: string;
  difficulty: 'Beginner Friendly' | 'Intermediate' | 'Advanced Hackathon';
  estSetupTime: string; // e.g. "2 Minutes"
  techStack: string[];
  featuresList: string[];
  cliCloneCommand: string;
  githubUrl: string;
  deployUrl: string;
  demoUrl?: string;
  envVariables: {
    key: string;
    description: string;
    required: boolean;
  }[];
  badgeText?: string;
  badgeColor?: 'violet' | 'emerald' | 'amber' | 'cyan';
}
