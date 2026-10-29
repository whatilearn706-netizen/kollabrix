export interface TeammateAttestation {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: string;
  feedbackSnippet: string;
  clutchScore: number; // 1-100
  codeCraftScore: number; // 1-100
  zeroGhost: boolean;
  timestamp: string;
}

export interface ContributionTelemetry {
  backendPercent: number;
  realtimeOrTelemetryPercent: number;
  frontendPercent: number;
  totalCommits: number;
  lateNightCommits: number; // 1AM - 5AM commits
  linesOfCodeEstimated: number;
  mergeConflictsCount: number;
}

export interface DeveloperPassport {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  college: string;
  course?: string;
  roleTitle: string;
  hackathonName: string;
  seasonYear: string;
  tierBadge: string; // e.g. "TOP 2% CLUTCH RATING"
  clutchFactor: number; // 0 - 100
  codeCraft: number; // 0 - 100
  peerReliability: number; // 0 - 100
  icpcAccuracy: number; // 0 - 100
  telemetry: ContributionTelemetry;
  attestations: TeammateAttestation[];
  verificationHash: string; // SHA-256 cryptographic signature
  verificationUrl: string;
  mintedAt: string;
  status: 'minted' | 'draft' | 'revoked';
}

export interface FlightRecorderConfig {
  is_live: boolean;
  show_in_workspace: boolean;
  show_in_profiles: boolean;
  allow_public_sharing: boolean;
  require_peer_attestations: boolean;
  min_commits_required: number;
  banner_announcement?: string;
  last_updated?: string;
  updated_by?: string;
}

export const DEFAULT_FLIGHT_RECORDER_CONFIG: FlightRecorderConfig = {
  is_live: false, // Default to FALSE / Staging mode as requested by user
  show_in_workspace: true,
  show_in_profiles: true,
  allow_public_sharing: true,
  require_peer_attestations: true,
  min_commits_required: 5,
  banner_announcement: 'Kollabrix Flight Recorder & Holographic Passport Lab (Staging Mode Active)',
};

export const SAMPLE_MAYANK_PASSPORT: DeveloperPassport = {
  id: 'pass-mayank-001',
  userId: 'c86ce05f-24de-4a1a-a45f-944d4180b508',
  username: 'mayank142',
  displayName: 'Mayank Goyal',
  avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-88MqerezOHnmEU8oAzSN-PW7POOOZtco7jB_e5Lm15Cpcpsq8jW4gkQC&s=10',
  college: 'Bosscoder School of Technology',
  course: 'B.Tech CSE AI/ML',
  roleTitle: 'Full-Stack Carry & System Architect',
  hackathonName: 'Inter-Collegiate Winter Sprint 2026',
  seasonYear: '2026',
  tierBadge: 'TOP 2% CLUTCH RATING',
  clutchFactor: 98,
  codeCraft: 94,
  peerReliability: 100,
  icpcAccuracy: 99.2,
  telemetry: {
    backendPercent: 78,
    realtimeOrTelemetryPercent: 14,
    frontendPercent: 8,
    totalCommits: 58,
    lateNightCommits: 42,
    linesOfCodeEstimated: 4280,
    mergeConflictsCount: 0,
  },
  attestations: [
    {
      userId: '5f0b26b5-2dff-48c2-b7fb-8910ba59f923',
      name: 'Viraj Bashishtha',
      avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIaHkIzKnEdx0mX0_FkiF7GMTnZkZ4ZmJLsuKBt4TIrEmNNvzmxyQ=s96-c',
      role: 'Frontend Developer',
      feedbackSnippet: '10/10 Clutch Carry. Delivered auth and real-time backend at 4 AM.',
      clutchScore: 98,
      codeCraftScore: 95,
      zeroGhost: true,
      timestamp: '2026-10-28T16:20:00Z',
    },
    {
      userId: 'da320ec5-a949-409a-a84b-efe24af250c5',
      name: 'Ayushman Sharma',
      avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocJNi7TgAepc6Q75A0v4Sn39wfZAw8H0pp4b-3lFF7YeCG4AAJK6=s96-c',
      role: 'UI/UX & Product',
      feedbackSnippet: 'Zero Ghosting. Built the compiler integration and never missed a huddle.',
      clutchScore: 96,
      codeCraftScore: 92,
      zeroGhost: true,
      timestamp: '2026-10-28T16:25:00Z',
    },
  ],
  verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  verificationUrl: 'https://kollabrix.in/p/mayank-goyal',
  mintedAt: '2026-10-28T18:00:00Z',
  status: 'minted',
};
