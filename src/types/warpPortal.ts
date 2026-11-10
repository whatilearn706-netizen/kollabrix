export type CraftModelType = 'battleship' | 'cruiser' | 'interceptor';
export type GlowColorType = 'amber' | 'cyan' | 'purple' | 'emerald';
export type DepthModeType = '3d_deep' | '3d_cinematic' | '3d_ultra';

export interface WarpShipCandidate {
  id: string;
  name: string;        // Name or Object passing through ring (e.g. "Mayank Goyal", "Team Titans", "Interstellar Dreadnought")
  role: string;        // Role or Tagline (e.g. "AI/ML Architect", "Hackathon Grand Champions")
  squad: string;       // Squad or Campus (e.g. "Campus Turing", "BossCoder School", "Svyasa Hub")
  craftModel: CraftModelType; // 3D Geometry: Heavy Battleship (Image 3), Sleek Cruiser, or Kinetic Interceptor
  glowColor: GlowColorType;   // Engine & Particle Plasma Hue
  active: boolean;
}

export interface WarpPortalConfig {
  enabled: boolean;
  intervalSeconds: number; // Interval between jumps (e.g. 10s - 20s)
  depthMode: DepthModeType; // 3D depth and perspective scaling
  multiRingGate: boolean;  // Concentric 3D rings with depth offset (Image 3)
  lightningArcs: boolean;  // Electric arcs crackling between rings (Image 3)
  candidates: WarpShipCandidate[];
}

export const DEFAULT_WARP_PORTAL_CONFIG: WarpPortalConfig = {
  enabled: true,
  intervalSeconds: 12,
  depthMode: '3d_cinematic',
  multiRingGate: true,
  lightningArcs: true,
  candidates: [
    {
      id: 'ship-1',
      name: 'Mayank Goyal',
      role: 'AI/ML Architect',
      squad: 'Campus Turing',
      craftModel: 'battleship',
      glowColor: 'amber',
      active: true,
    },
    {
      id: 'ship-2',
      name: 'Team Titans',
      role: 'Hackathon Grand Champions',
      squad: 'Sprint 27 Squad',
      craftModel: 'battleship',
      glowColor: 'cyan',
      active: true,
    },
    {
      id: 'ship-3',
      name: 'Viraj Bashishtha',
      role: 'Full-Stack Engineer',
      squad: 'BST Innovators',
      craftModel: 'interceptor',
      glowColor: 'amber',
      active: true,
    },
    {
      id: 'ship-4',
      name: 'Ayushman Sharma',
      role: 'UI/UX Lead',
      squad: 'Design Core',
      craftModel: 'cruiser',
      glowColor: 'purple',
      active: true,
    },
    {
      id: 'ship-5',
      name: 'Team Obsidian',
      role: 'Autonomous Systems',
      squad: 'Svyasa Hub',
      craftModel: 'battleship',
      glowColor: 'cyan',
      active: true,
    },
    {
      id: 'ship-6',
      name: 'Priya Sharma',
      role: 'Smart Contracts',
      squad: 'Collegiate Hackers',
      craftModel: 'interceptor',
      glowColor: 'emerald',
      active: true,
    },
  ],
};
