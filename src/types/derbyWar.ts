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

export interface DerbyBoardMatchup {
  boardNumber: number; // 1 to totalBoards (e.g. 1 to 10)
  title: string; // e.g. "Board 1: Heavyweight Frontend Duel"
  collegeAPlayer?: DerbySeatPlayer;
  collegeBPlayer?: DerbySeatPlayer;
  actionUrl: string; // 1v1 Battle Arena room URL for this board
  winnerCollegeId?: 'A' | 'B' | 'draw';
}

export interface CollegiateDerby {
  id: string; // e.g. "derby-thapar-iitd-101"
  title: string;
  description: string;
  
  // Colleges in conflict
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

  totalBoards: number; // e.g. 5 or 10 boards
  status: DerbyStatus;

  // Timeline Lifecycle
  registrationClosesAt: string; // ISO string
  battleStartsAt: string; // ISO string
  resultAnnouncesAt: string; // ISO string

  // Secret Admin Vault (classified until resultAnnouncesAt or admin published)
  resultsPublished: boolean;
  winnerCollege?: string;
  collegeAWins: number;
  collegeBWins: number;

  matchups: DerbyBoardMatchup[];
}

export const DEFAULT_DERBY: CollegiateDerby = {
  id: 'derby-thapar-iitd-101',
  title: 'Collegiate Arena Clash: Thapar vs IIT Delhi',
  description: '10v10 Simultaneous 1v1 Board Speedrun Duel. Only verified collegiate champions may represent their campus.',
  collegeA: {
    id: 'thapar',
    name: 'Thapar Institute of Engineering & Technology',
    shortName: 'TIET Patiala',
    logoUrl: '/thapar-logo.png',
    color: '#F59E0B',
  },
  collegeB: {
    id: 'iitd',
    name: 'Indian Institute of Technology Delhi',
    shortName: 'IIT Delhi',
    logoUrl: '/iitd-logo.png',
    color: '#06B6D4',
  },
  totalBoards: 5,
  status: 'registration',
  registrationClosesAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48h from now
  battleStartsAt: new Date(Date.now() + 1000 * 60 * 60 * 50).toISOString(), // 50h from now
  resultAnnouncesAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // 72h from now
  resultsPublished: false,
  collegeAWins: 3,
  collegeBWins: 2,
  matchups: [
    {
      boardNumber: 1,
      title: 'Board 1 • Heavyweight Lead Ace (Full-Stack)',
      collegeAPlayer: {
        userId: 'thapar-p1',
        name: 'Mayank Goyal',
        username: 'mayank_g',
        collegeName: 'Thapar Institute of Engineering & Technology',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        winStatus: 'win',
        score: 98,
      },
      collegeBPlayer: {
        userId: 'iitd-p1',
        name: 'Aryan Sharma',
        username: 'aryan_iitd',
        collegeName: 'Indian Institute of Technology Delhi',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        winStatus: 'loss',
        score: 84,
      },
      actionUrl: '/arena?room=DERBY-BOARD-1',
      winnerCollegeId: 'A',
    },
    {
      boardNumber: 2,
      title: 'Board 2 • Algorithmic Specialist (Dynamic Programming)',
      collegeAPlayer: {
        userId: 'thapar-p2',
        name: 'Simran Kaur',
        username: 'simran_k',
        collegeName: 'Thapar Institute of Engineering & Technology',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        winStatus: 'loss',
        score: 79,
      },
      collegeBPlayer: {
        userId: 'iitd-p2',
        name: 'Rohan Verma',
        username: 'rohan_v',
        collegeName: 'Indian Institute of Technology Delhi',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        winStatus: 'win',
        score: 95,
      },
      actionUrl: '/arena?room=DERBY-BOARD-2',
      winnerCollegeId: 'B',
    },
    {
      boardNumber: 3,
      title: 'Board 3 • Speed CSS & UI Engineering',
      collegeAPlayer: {
        userId: 'thapar-p3',
        name: 'Kavya Singhal',
        username: 'kavya_s',
        collegeName: 'Thapar Institute of Engineering & Technology',
        isVerified: true,
        joinedAt: new Date().toISOString(),
        winStatus: 'win',
        score: 92,
      },
      actionUrl: '/arena?room=DERBY-BOARD-3',
    },
    {
      boardNumber: 4,
      title: 'Board 4 • High-Concurrency Backend Duel',
      collegeBPlayer: {
        userId: 'iitd-p4',
        name: 'Vikramaditya Roy',
        username: 'vikram_roy',
        collegeName: 'Indian Institute of Technology Delhi',
        isVerified: true,
        joinedAt: new Date().toISOString(),
      },
      actionUrl: '/arena?room=DERBY-BOARD-4',
    },
    {
      boardNumber: 5,
      title: 'Board 5 • Anchor Match (Graph Traversal)',
      actionUrl: '/arena?room=DERBY-BOARD-5',
    },
  ],
};
