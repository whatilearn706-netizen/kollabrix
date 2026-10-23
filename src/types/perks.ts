export type PerkCategory = 'all' | 'cloud' | 'ai' | 'devtools' | 'domains' | 'design';

export type VerificationDifficulty = 'instant' | 'easy' | 'manual-review';

export interface StudentPerk {
  id: string;
  title: string;
  provider: string;
  providerLogo?: string;
  category: 'cloud' | 'ai' | 'devtools' | 'domains' | 'design';
  value: string;
  valueNumeric: number; // for total saved counter
  badgeText?: string;
  badgeColor?: 'emerald' | 'violet' | 'amber' | 'blue' | 'rose';
  shortDescription: string;
  highlights: string[];
  requirements: string; // e.g. "College ID card OR university email (.edu / .ac.in / any collegiate domain)"
  difficulty: VerificationDifficulty;
  stepByStepGuide: {
    step: number;
    title: string;
    description: string;
  }[];
  proTips: string[];
  claimUrl: string;
  isPopular?: boolean;
}
