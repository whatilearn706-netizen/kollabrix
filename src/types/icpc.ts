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

export type ProctorViolationType =
  | 'FULLSCREEN_EXIT'
  | 'TAB_SWITCH'
  | 'PHONE_DETECTED'
  | 'GAZE_DEVIATION'
  | 'SUSPICIOUS_PASTE'
  | 'FACE_MISSING'
  | 'SCREEN_SHARE_STOPPED'
  | 'SIRI_ATTEMPT';

export interface ProctorIncident {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  college?: string;
  contestId: string;
  contestTitle: string;
  problemId?: string;
  problemTitle?: string;
  violationType: ProctorViolationType;
  details: string;
  timestamp: string;
  warningCount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved?: boolean;
  screenSnapshot?: string;
}

export interface ProctorLiveStats {
  activeSessions: number;
  totalViolations: number;
  phoneViolations: number;
  screenViolations: number;
  gazeViolations: number;
  pasteViolations: number;
  flaggedStudentsCount: number;
}

export interface ActiveProctorSession {
  id: string; // studentId
  studentId: string;
  studentName: string;
  studentEmail?: string;
  college?: string;
  contestId: string;
  contestTitle: string;
  problemTitle?: string;
  warningCount: number;
  screenSnapshot?: string;
  lastHeartbeat: string;
  status: 'active' | 'cautioned' | 'demolished';
  cautionMessage?: string;
}
