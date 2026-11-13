import { CollegiateDerby } from './derbyWar';

export type WarPillar = 'arena' | 'hackathon' | 'problem' | 'icpc';
export type WarMatchStatus = 'open' | 'live' | 'completed';

export interface WarMatch {
  id: string;
  title: string;
  pillar: WarPillar;
  challengerCollege: string;
  challengerLogo?: string;
  challengerName?: string;
  targetCollege: string; // e.g. "Delhi Technological University (DTU)" or "Open to Any Campus"
  targetLogo?: string;
  bountyPoints: number; // e.g. 50
  stakes: string; // e.g. "+50 War Pts • Best of 3 Frontend Duel"
  status: WarMatchStatus;
  actionUrl: string; // e.g. "/arena?room=KBX-WAR-101"
  actionLabel: string; // e.g. "⚔️ Accept Duel"
  isPriorityShiny?: boolean;
  createdAt: string;
  expiresAt?: string;
  derby?: CollegiateDerby;
}

export interface WarSponsor {
  enabled: boolean;
  name: string; // e.g. "AWS Cloud", "Red Bull", or "Thapar University"
  logoUrl: string;
  badgeText: string; // e.g. "OFFICIAL TITLE PARTNER" or "FEATURED HOST CAMPUS"
  tagline: string; // e.g. "Powering the Inter-College Innovation War • ₹1,00,000 Prize Pool"
  targetUrl: string;
  isPriorityShiny: boolean; // Enables animated holographic gold/crimson metallic glow
}

export interface CampusStanding {
  id: string;
  collegeName: string;
  shortName: string;
  logoUrl?: string;
  warPoints: number;
  rank: number;
  winRate: number; // e.g. 78%
  duelsWon: number;
  hackathonsWon: number;
  championName: string;
  isPriorityShiny?: boolean; // Highlighted with VIP golden shield
}

export interface CampusWarConfig {
  isLive: boolean;
  maintenanceMessage: string;
  seasonName: string;
  seasonEndDate: string;
  totalPrizePool: string;
  sponsor: WarSponsor;
  matches: WarMatch[];
  standings: CampusStanding[];
  updatedAt: string;
}

export const DEFAULT_CAMPUS_WAR_CONFIG: CampusWarConfig = {
  isLive: true,
  maintenanceMessage:
    'Campus War is currently in intermission between collegiate seasons. Tuning anti-cheat, recalibrating ELO rankings, and onboarding new university chapters. Live battle operations commence shortly!',
  seasonName: 'Season 1: Collegiate Supremacy',
  seasonEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
  totalPrizePool: '₹1,50,000 + Title Trophies',
  sponsor: {
    enabled: true,
    name: 'Thapar Institute of Engineering & Technology',
    logoUrl: '/brand/kollabrix-logo.png?v=20261031_v3squircle',
    badgeText: 'FEATURED HOST CAMPUS',
    tagline: 'Leading the Collegiate Innovation Derby • Official Arena Ground',
    targetUrl: 'https://www.kollabrix.in',
    isPriorityShiny: true,
  },
  matches: [
    {
      id: 'match-war-1',
      title: 'Thapar vs DTU: Speed CSS & React Duel',
      pillar: 'arena',
      challengerCollege: 'Thapar University',
      challengerName: 'Mayank Goyal',
      targetCollege: 'Delhi Technological University (DTU)',
      bountyPoints: 50,
      stakes: '+50 War Pts • Best of 3 Speedrun',
      status: 'open',
      actionUrl: '/arena?room=KBX-WAR-THP-DTU',
      actionLabel: '⚔️ Accept 1v1 Duel',
      isPriorityShiny: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'match-war-2',
      title: 'November 27 Innovation Sprint: Inter-College Derby',
      pillar: 'hackathon',
      challengerCollege: 'Thapar University',
      challengerName: 'Faculty Innovation Cell',
      targetCollege: 'Open to All Campuses',
      bountyPoints: 300,
      stakes: '+300 Constructors Pts • Official Trophy',
      status: 'open',
      actionUrl: '/hackathons',
      actionLabel: '👥 Register Squad',
      isPriorityShiny: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'match-war-3',
      title: 'Autonomous Campus EV Dispatch Algorithm',
      pillar: 'problem',
      challengerCollege: 'Faculty Research Hub',
      challengerName: 'Dr. Sharma (Computer Science)',
      targetCollege: 'Open Collegiate Bounty',
      bountyPoints: 150,
      stakes: '+150 Research Pts • Verified Faculty Bounty',
      status: 'open',
      actionUrl: '/problems',
      actionLabel: '💻 Submit Solution',
      isPriorityShiny: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'match-war-4',
      title: 'Sunday ICPC 60-Minute Campus Gauntlet',
      pillar: 'icpc',
      challengerCollege: 'Kollabrix Competitive Circuit',
      challengerName: 'Collegiate Arena Master',
      targetCollege: 'Top 10 Indian Engineering Colleges',
      bountyPoints: 100,
      stakes: '+100 ELO Boost • Median Top-5 Scoring',
      status: 'open',
      actionUrl: '/icpc',
      actionLabel: '⚡ Enter Gauntlet',
      isPriorityShiny: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'match-war-5',
      title: 'BITS Pilani vs IIT Delhi: Dynamic Programming Duel',
      pillar: 'arena',
      challengerCollege: 'BITS Pilani',
      challengerName: 'Arjun K.',
      targetCollege: 'IIT Delhi',
      bountyPoints: 40,
      stakes: '+40 War Pts • O(N) Algorithm Sprint',
      status: 'open',
      actionUrl: '/arena?room=KBX-WAR-BITS-IITD',
      actionLabel: '⚔️ Defend Campus',
      isPriorityShiny: false,
      createdAt: new Date().toISOString(),
    },
  ],
  standings: [
    {
      id: 'college-1',
      collegeName: 'Thapar Institute of Engineering & Technology',
      shortName: 'Thapar',
      warPoints: 1420,
      rank: 1,
      winRate: 84,
      duelsWon: 38,
      hackathonsWon: 3,
      championName: 'Mayank Goyal (Rating 1850)',
      isPriorityShiny: true,
    },
    {
      id: 'college-2',
      collegeName: 'Indian Institute of Technology Delhi',
      shortName: 'IIT Delhi',
      warPoints: 1310,
      rank: 2,
      winRate: 79,
      duelsWon: 32,
      hackathonsWon: 2,
      championName: 'Rohan Verma (Rating 1810)',
      isPriorityShiny: false,
    },
    {
      id: 'college-3',
      collegeName: 'BITS Pilani',
      shortName: 'BITS',
      warPoints: 1190,
      rank: 3,
      winRate: 76,
      duelsWon: 29,
      hackathonsWon: 2,
      championName: 'Arjun K. (Rating 1785)',
      isPriorityShiny: false,
    },
    {
      id: 'college-4',
      collegeName: 'Delhi Technological University',
      shortName: 'DTU',
      warPoints: 980,
      rank: 4,
      winRate: 71,
      duelsWon: 24,
      hackathonsWon: 1,
      championName: 'Priya Sharma (Rating 1720)',
      isPriorityShiny: false,
    },
    {
      id: 'college-5',
      collegeName: 'Vellore Institute of Technology',
      shortName: 'VIT Vellore',
      warPoints: 890,
      rank: 5,
      winRate: 68,
      duelsWon: 21,
      hackathonsWon: 1,
      championName: 'Aman Deep (Rating 1690)',
      isPriorityShiny: false,
    },
  ],
  updatedAt: new Date().toISOString(),
};
