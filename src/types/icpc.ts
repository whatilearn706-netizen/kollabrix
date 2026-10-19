export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface IcpcProblem {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  points: number;
  timeLimit: string;
  memoryLimit: string;
  tags: string[];
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  explanation?: string;
  solutionCode?: string;
  solutionExplanation?: string;
  solutionLanguage?: string;
  isSolutionLocked?: boolean;
}

export type ContestStatus = 'live' | 'upcoming' | 'ended';
export type ContestType = 'contest' | 'practice';

export interface IcpcContest {
  id: string;
  title: string;
  subtitle: string;
  organizer: string;
  organizerRole?: string;
  college?: string;
  authorId?: string;
  contestType?: ContestType;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: ContestStatus;
  visibility: 'public' | 'passcode';
  passcode?: string;
  hasPasscode?: boolean;
  bannerGradient?: string;
  participantCount: number;
  problems: IcpcProblem[];
  rules: string[];
  scoringType?: 'icpc' | 'leetcode' | 'ioi';
}

export interface ContestSubmission {
  id: string;
  contestId: string;
  problemId: string;
  studentName: string;
  college: string;
  language: string;
  code: string;
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error';
  runtime: string;
  memory: string;
  submittedAt: string;
  pointsEarned: number;
}

export interface StudentIcpcProgress {
  streak: number;
  lastSolvedDate?: string; // YYYY-MM-DD
  totalPoints: number;
  solvedProblemIds: string[];
}
