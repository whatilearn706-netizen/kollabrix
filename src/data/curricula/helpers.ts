import type {
  LanguageCurriculum,
  LearningStep,
  PracticeQuestion,
  StudyMaterial,
  TopicVideo,
} from '@/types/curriculum';
import type { ResourceLanguage, ResourceTrack } from '@/types/resources';

export interface QuestionSpec {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starterCode: string;
  stdin?: string;
  expectedOutput: string;
  hints: string[];
  solution?: string;
}

export interface StepSpec {
  stepNumber: number;
  title: string;
  topic: string;
  estimatedTime: string;
  summary: string;
  studyMaterial: StudyMaterial;
  video: TopicVideo;
  videos?: TopicVideo[];
  compilerStarterCode: string;
  practiceQuestions: QuestionSpec[];
}

export interface TrackSpec {
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
  estimatedTotalHours: string;
  prerequisites: string[];
  outcomes: string[];
  steps: StepSpec[];
}

export function q(spec: QuestionSpec): PracticeQuestion {
  return {
    id: spec.id,
    title: spec.title,
    difficulty: spec.difficulty,
    description: spec.description,
    starterCode: spec.starterCode,
    ...(spec.stdin !== undefined ? { stdin: spec.stdin } : {}),
    expectedOutput: spec.expectedOutput,
    hints: spec.hints,
    ...(spec.solution ? { solution: spec.solution } : {}),
  };
}

export function yt(
  title: string,
  instructor: string,
  youtubeId: string,
  duration: string,
  notes: string,
): TopicVideo {
  return {
    title,
    instructor,
    youtubeId,
    videoUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    duration,
    notes,
  };
}

export function buildStep(spec: StepSpec): LearningStep {
  return {
    stepNumber: spec.stepNumber,
    title: spec.title,
    topic: spec.topic,
    estimatedTime: spec.estimatedTime,
    summary: spec.summary,
    studyMaterial: spec.studyMaterial,
    video: spec.video,
    ...(spec.videos ? { videos: spec.videos } : {}),
    practiceQuestions: spec.practiceQuestions.map(q),
    compilerStarterCode: spec.compilerStarterCode,
  };
}

export function buildCurriculum(spec: TrackSpec): LanguageCurriculum {
  const steps = spec.steps.map(buildStep);
  return {
    ...spec,
    stepsCount: steps.length,
    steps,
    isLive: true,
  };
}
