import { DEFAULT_ARENA_QUESTIONS, DuelQuestion } from '@/types/arenaDuel';

export type DerbyStatus = 'registration' | 'live' | 'judging' | 'completed';

export interface DerbySeatPlayer {
  userId: string;
  name: string;
  username: string;
  avatarUrl?: string;
  collegeName: string;
  isVerified: boolean;
  joinedAt: string;
  codeSubmitted?: boolean;
  score?: number; // 0 - 100
  winStatus?: 'pending' | 'win' | 'loss' | 'draw';
}

export interface DerbyTeamQuestion {
  id: string;
  title: string;
  prompt: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  arenaQuestionId?: string;
}

export interface DerbyBoardMatchup {
  boardNumber: number; // Team 1 to totalBoards (e.g. 1 to 10)
  title: string; // e.g. "Team 1 • Speed CSS & UI Duel"
  teamQuestion: DerbyTeamQuestion;
  collegeAPlayer?: DerbySeatPlayer;
  collegeBPlayer?: DerbySeatPlayer;
  actionUrl: string; // 1v1 Battle Arena room URL for this team
  winnerCollegeId?: 'A' | 'B' | 'draw' | 'pending';
}

export interface CollegiateDerby {
  id: string; // e.g. "derby-thapar-iitd-101"
  title: string;
  description: string;
  bountyPoints: number;

  // Optional Qualifying Question to Enter/Apply
  entryQuestion?: {
    enabled: boolean;
    question: string;
    hint?: string;
    expectedAnswer?: string;
  };

  // Competing Colleges
  collegeA: {
    id: string;
    name: string;
    shortName: string;
    logoUrl?: string;
    color: string;
  };
  collegeB: {
    id: string;
    name: string;
    shortName: string;
    logoUrl?: string;
    color: string;
  };

  totalBoards: number; // e.g. 10 teams
  status: DerbyStatus;

  // Timeline Lifecycle (Dates)
  registrationClosesAt: string; // ISO string
  battleStartsAt: string; // Simulation Start / "Stimulation Start"
  resultAnnouncesAt: string; // Result Date

  // Secret Admin Vault & College Win Banner
  resultsPublished: boolean; // Live / Not Live toggle!
  winnerCollege?: string;
  collegeAWins: number; // How many teams won in College A
  collegeBWins: number; // How many teams won in College B

  matchups: DerbyBoardMatchup[];
}

export function arenaQuestionToDerbyQuestion(q: DuelQuestion): DerbyTeamQuestion {
  const diffMap: Record<string, 'Easy' | 'Medium' | 'Hard'> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };
  return {
    id: q.id,
    title: q.title,
    prompt: q.description,
    difficulty: diffMap[q.difficulty] || 'Medium',
    topic: q.tags?.join(', ') || q.arena.replace('_', ' ').toUpperCase(),
    arenaQuestionId: q.id,
  };
}

// Battle Arena 1v1 questions mapped directly for Collegiate War Matches
export const ARENA_1V1_DERBY_QUESTIONS: DerbyTeamQuestion[] = DEFAULT_ARENA_QUESTIONS.map(arenaQuestionToDerbyQuestion);

// Deterministic or randomized unique questions selector without duplicates
export function getRandomArenaQuestions(count: number): DerbyTeamQuestion[] {
  const pool = [...ARENA_1V1_DERBY_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  if (count <= pool.length) {
    return pool.slice(0, count);
  }
  const result: DerbyTeamQuestion[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[i % pool.length]);
  }
  return result;
}

export const DEFAULT_DERBY_QUESTIONS: DerbyTeamQuestion[] = ARENA_1V1_DERBY_QUESTIONS;

export const DEFAULT_DERBY: CollegiateDerby = {
  id: 'derby-thapar-iitd-101',
  title: 'Collegiate Arena Clash: Thapar vs IIT Delhi',
  description: '10v10 Simultaneous 1v1 Team Duel. Each team gets a unique technical question. Only verified collegiate champions may represent their campus.',
  bountyPoints: 50,
  entryQuestion: {
    enabled: true,
    question: 'Qualifying Challenge: In Big-O notation, what is the average time complexity of searching in a balanced Binary Search Tree?',
    hint: 'Enter your answer (e.g., O(log n) or O(log N))',
    expectedAnswer: 'O(log n)',
  },
  collegeA: {
    id: 'thapar',
    name: 'Thapar Institute of Engineering & Technology',
    shortName: 'TIET Patiala',
    logoUrl: '/brand/kollabrix-logo.png?v=20261031_v3squircle',
    color: '#F59E0B',
  },
  collegeB: {
    id: 'iitd',
    name: 'Indian Institute of Technology Delhi',
    shortName: 'IIT Delhi',
    logoUrl: '/brand/kollabrix-logo.png?v=20261031_v3squircle',
    color: '#06B6D4',
  },
  totalBoards: 10,
  status: 'registration',
  registrationClosesAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
  battleStartsAt: new Date(Date.now() + 1000 * 60 * 60 * 50).toISOString(),
  resultAnnouncesAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
  resultsPublished: false,
  winnerCollege: 'Thapar Institute of Engineering & Technology',
  collegeAWins: 6,
  collegeBWins: 4,
  matchups: Array.from({ length: 10 }, (_, i) => {
    const boardNum = i + 1;
    const question = DEFAULT_DERBY_QUESTIONS[i] || DEFAULT_DERBY_QUESTIONS[0];
    
    // Sample pre-populated players for demonstration of occupied seats
    let pA: DerbySeatPlayer | undefined = undefined;
    let pB: DerbySeatPlayer | undefined = undefined;
    let winStatus: 'A' | 'B' | 'draw' | 'pending' = 'pending';

    if (boardNum === 1) {
      pA = {
        userId: 'thapar-p1',
        name: 'Mayank Goyal',
        username: 'mayank_g',
        collegeName: 'Thapar Institute of Engineering & Technology',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        score: 98,
        winStatus: 'win',
      };
      pB = {
        userId: 'iitd-p1',
        name: 'Aryan Sharma',
        username: 'aryan_iitd',
        collegeName: 'Indian Institute of Technology Delhi',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        score: 84,
        winStatus: 'loss',
      };
      winStatus = 'A';
    } else if (boardNum === 2) {
      pA = {
        userId: 'thapar-p2',
        name: 'Simran Kaur',
        username: 'simran_k',
        collegeName: 'Thapar Institute of Engineering & Technology',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        score: 79,
        winStatus: 'loss',
      };
      pB = {
        userId: 'iitd-p2',
        name: 'Rohan Verma',
        username: 'rohan_v',
        collegeName: 'Indian Institute of Technology Delhi',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        score: 95,
        winStatus: 'win',
      };
      winStatus = 'B';
    } else if (boardNum === 3) {
      pA = {
        userId: 'thapar-p3',
        name: 'Kavya Singhal',
        username: 'kavya_s',
        collegeName: 'Thapar Institute of Engineering & Technology',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        score: 91,
        winStatus: 'win',
      };
      winStatus = 'A';
    } else if (boardNum === 4) {
      pB = {
        userId: 'iitd-p4',
        name: 'Vikramaditya Roy',
        username: 'vikram_roy',
        collegeName: 'Indian Institute of Technology Delhi',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        score: 88,
        winStatus: 'win',
      };
      winStatus = 'B';
    }

    return {
      boardNumber: boardNum,
      title: `Team ${boardNum} • ${question.title}`,
      teamQuestion: question,
      collegeAPlayer: pA,
      collegeBPlayer: pB,
      actionUrl: `/arena?question=${question.id}&room=DERBY-TEAM-${boardNum}`,
      winnerCollegeId: winStatus,
    };
  }),
};

export function buildDerbyFromMatch(match: any): CollegiateDerby {
  if (match?.derby) {
    return match.derby;
  }

  const collegeAName = match?.challengerCollege || 'Thapar Institute of Engineering & Technology';
  const collegeBName = match?.targetCollege || 'Indian Institute of Technology Delhi';

  const shortA = collegeAName.includes('Thapar')
    ? 'TIET'
    : collegeAName.includes('BITS')
    ? 'BITS'
    : collegeAName.split(' ')[0];

  const shortB = collegeBName.includes('Delhi Technological') || collegeBName.includes('DTU')
    ? 'DTU'
    : collegeBName.includes('IIT Delhi')
    ? 'IITD'
    : collegeBName.split(' ')[0];

  return {
    ...DEFAULT_DERBY,
    id: match?.id ? `derby-${match.id}` : DEFAULT_DERBY.id,
    title: match?.title || DEFAULT_DERBY.title,
    bountyPoints: match?.bountyPoints || 50,
    collegeA: {
      id: shortA.toLowerCase(),
      name: collegeAName,
      shortName: shortA,
      logoUrl: match?.challengerLogo || '/brand/kollabrix-logo.png?v=20261031_v3squircle',
      color: '#F59E0B',
    },
    collegeB: {
      id: shortB.toLowerCase(),
      name: collegeBName,
      shortName: shortB,
      logoUrl: match?.targetLogo || '/brand/kollabrix-logo.png?v=20261031_v3squircle',
      color: '#06B6D4',
    },
    winnerCollege: collegeAName,
  };
}

