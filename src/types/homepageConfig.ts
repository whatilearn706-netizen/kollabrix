import { Project } from './database';

export interface IntentCandidate {
  id: string;
  name: string;
  role: string;
  type: 'all' | 'ai' | 'frontend' | 'design';
  college: string;
  skills: string[];
  matchScore: number;
  avatar: string;
}

export interface IntentProjectSlot {
  id: string;
  title: string;
  category: string;
  owner: string;
  neededRole: string;
  teamStatus: string;
  tech: string[];
}

export interface HomepageIntentConfig {
  mode1Headline?: string;
  mode1Subheadline?: string;
  candidates: IntentCandidate[];
  mode2Headline?: string;
  mode2Subheadline?: string;
  projectSlots: IntentProjectSlot[];
}

export interface HomepageShowcaseConfig {
  mode: 'curated' | 'automatic';
  selectedProjectIds: string[];
  customProjects?: Partial<Project>[];
}

export const DEFAULT_INTENT_CANDIDATES: IntentCandidate[] = [
  {
    id: 'cand-1',
    name: 'Aarav Sharma',
    role: 'AI / PyTorch Engineer',
    type: 'ai',
    college: 'IIIT Hyderabad • B.Tech CSE',
    skills: ['PyTorch', 'FastAPI', 'LangChain', 'PostgreSQL'],
    matchScore: 96,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cand-2',
    name: 'Priya Patel',
    role: 'Product & UI/UX Designer',
    type: 'design',
    college: 'BITS Pilani • Design Studio',
    skills: ['Figma', 'User Research', 'Design Systems', 'Tailwind'],
    matchScore: 94,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cand-3',
    name: 'Rohan Verma',
    role: 'Full-Stack Developer',
    type: 'frontend',
    college: 'IIT Delhi • Electrical & CS',
    skills: ['Next.js', 'TypeScript', 'Node.js', 'Docker'],
    matchScore: 92,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export const DEFAULT_INTENT_PROJECT_SLOTS: IntentProjectSlot[] = [
  {
    id: 'slot-1',
    title: 'CampusPulse: Real-Time Transit & Shuttle Tracker',
    category: 'Web / Mobile',
    owner: 'Devon Vance • MIT College',
    neededRole: 'Lead React Native Dev',
    teamStatus: '2 of 4 Filled',
    tech: ['Next.js', 'React Native', 'WebSockets'],
  },
  {
    id: 'slot-2',
    title: 'AuraHealth: Clinical Note Automation for ERs',
    category: 'AI / Healthcare',
    owner: 'Dr. Sarah Chen & Team',
    neededRole: 'PyTorch / NLP Specialist',
    teamStatus: '3 of 5 Filled',
    tech: ['Python', 'FastAPI', 'HuggingFace', 'Docker'],
  },
  {
    id: 'slot-3',
    title: 'AgriVision: Autonomous Drone Crop Analytics',
    category: 'IoT / Robotics',
    owner: 'Vikram Joshi • IIT Bombay',
    neededRole: 'Computer Vision Engineer',
    teamStatus: '1 of 3 Filled',
    tech: ['YOLOv8', 'OpenCV', 'ROS2', 'C++'],
  },
];

export const DEFAULT_HOMEPAGE_INTENT_CONFIG: HomepageIntentConfig = {
  mode1Headline: 'Assemble your campus dream team in minutes.',
  mode1Subheadline: 'Publish your project concept, set needed skill criteria, and invite students with verified GitHub and course profiles.',
  candidates: DEFAULT_INTENT_CANDIDATES,
  mode2Headline: 'Join ambitious projects that need your exact skills.',
  mode2Subheadline: 'Don\'t build side projects alone. Jump into real student teams with active roadmaps, Kanban boards, and faculty problem statements.',
  projectSlots: DEFAULT_INTENT_PROJECT_SLOTS,
};

export const DEFAULT_HOMEPAGE_SHOWCASE_CONFIG: HomepageShowcaseConfig = {
  mode: 'curated',
  selectedProjectIds: ['demo-1', 'demo-2', 'demo-3'],
};
