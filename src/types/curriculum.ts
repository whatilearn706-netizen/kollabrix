import { ResourceLanguage, ResourceTrack } from './resources';

export interface PracticeQuestion {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starterCode: string;
  stdin?: string;
  expectedOutput: string;
  hints?: string[];
  solution?: string;
}

export interface LearningStep {
  stepNumber: number;
  title: string;
  topic: string;
  estimatedTime: string;
  summary: string;
  studyMaterial: {
    overview: string;
    keyPoints: string[];
    codeExamples?: {
      title: string;
      code: string;
      explanation?: string;
    }[];
    cheatsheet?: string[];
    officialDocUrl?: string;
  };
  video: {
    title: string;
    instructor: string;
    youtubeId: string;
    videoUrl: string;
    duration: string;
    notes?: string;
  };
  practiceQuestions: PracticeQuestion[];
  compilerStarterCode: string;
}

export interface LanguageCurriculum {
  id: string;
  language: ResourceLanguage;
  track: ResourceTrack;
  title: string;
  tagline: string;
  icon: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  description: string;
  compilerLanguage: 'java' | 'cpp' | 'python' | 'javascript';
  compilerDisplayName: string;
  stepsCount: number;
  estimatedTotalHours: string;
  prerequisites: string[];
  outcomes: string[];
  steps: LearningStep[];
}
