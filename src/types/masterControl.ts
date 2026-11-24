export interface BroadcastBannerConfig {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
  theme: 'indigo' | 'emerald' | 'amber' | 'rose' | 'gradient';
  dismissible: boolean;
}

export interface CustomSectionConfig {
  enabled: boolean;
  position: 'below_hero' | 'above_showcase' | 'above_footer';
  badge: string;
  title: string;
  subtitle: string;
  content: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  theme: 'gradient_violet' | 'gradient_blue' | 'gradient_emerald' | 'gradient_amber' | 'slate_dark' | 'clean_white';
  bannerImageUrl?: string;
}

export interface HomepageSectionToggles {
  campusTicker?: boolean;
  hero: boolean;
  heroSearch?: boolean;
  origamiBird?: boolean;
  collegiateRadar?: boolean;
  domainGrid?: boolean;
  categoryRails?: boolean;
  intent: boolean;
  workflow: boolean;
  showcase: boolean;
  hackathons: boolean;
  ctaBanner: boolean;
  colleges?: boolean;
  badges?: boolean;
  campusPulse?: boolean;
  pulseLeaderboard?: boolean;
  pulseAiMatchmaker?: boolean;
  pulseLivePresence?: boolean;
  customSection?: boolean;
  pulseTitle?: string;
  pulseSubtitle?: string;
  workflowTitle?: string;
  workflowSubtitle?: string;
  showcaseTitle?: string;
  showcaseSubtitle?: string;
  domainGridTitle?: string;
  domainGridSubtitle?: string;
}

export interface CollegeWhitelistItem {
  id: string;
  name: string;
  domain: string;
  city?: string;
  partnerSince: string;
  studentCount?: number;
}

export interface StudentBadgeAward {
  id: string;
  userId: string;
  userEmail?: string;
  username: string;
  badgeType: 'innovator' | 'hackathon_champ' | 'faculty_endorsed' | 'lead_builder' | 'ambassador';
  badgeTitle: string;
  reason: string;
  awardedAt: string;
  awardedBy: string;
}

export interface MaintenanceModeConfig {
  mode: 'public' | 'campus_only' | 'maintenance';
  campusPasscode?: string;
  maintenanceHeadline?: string;
  maintenanceMessage?: string;
  expectedBackAt?: string;
}

export interface WorkspaceFeaturesConfig {
  aiCloserKit: boolean;
  liveToolBridge: boolean;
  teamHuddle: boolean;
  proofOfWork: boolean;
}

export interface StudentToolsConfig {
  perksVault: boolean;
  starterKits: boolean;
}

export interface VisualTemplatesConfig {
  allEnabled: boolean; // Master toggle: Live / Not Live for ALL templates
  bentoGrid: boolean; // Template 1: Interactive Aceternity Bento Grid (Collegiate Ecosystem)
  techOrbit: boolean; // Template 2: Animated Tech-Stack & Campus Orbit (Magic UI Circles)
  codeTerminal: boolean; // Template 3: Interactive Code Playground & Compiler Terminal
  connectionBeams: boolean; // Template 4: Animated Connection Beams (Magic UI Flow Graph)
  campusMarquee: boolean; // Template 5: 3D Diagonal Campus Pulse Marquee Cards
  floatingDock: boolean; // Template 6: Floating Glassmorphic Quick-Action Dock
}

export const DEFAULT_VISUAL_TEMPLATES_CONFIG: VisualTemplatesConfig = {
  allEnabled: false,
  bentoGrid: false,
  techOrbit: false,
  codeTerminal: false,
  connectionBeams: false,
  campusMarquee: false,
  floatingDock: false,
};

export interface FeaturedDeckCardConfig {
  id: string;
  number: string;
  title: string;
  category: string;
  recruitingBadge: string;
  badgeTone: 'emerald' | 'cyan' | 'violet' | 'amber';
  college: string;
  description: string;
  tags: string[];
  teamJoined: string;
  artImage: string;
  glowColor: string;
  href: string;
}

export const DEFAULT_FEATURED_DECK_CARDS: FeaturedDeckCardConfig[] = [
  {
    id: 'proj_devsync_ide',
    number: '01',
    title: 'DevSync IDE',
    category: 'DEV TOOLS',
    recruitingBadge: 'Recruiting • 1 Dev',
    badgeTone: 'emerald',
    college: 'Bosscoder School of Tech',
    description: 'Real-time collaborative web IDE with shared cursors, live terminal execution & AI pair coding.',
    tags: ['Next.js', 'Go', 'Docker'],
    teamJoined: '2/4 Joined',
    artImage: '/brand/card-art-1.webp',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    href: '/projects/proj_devsync_ide',
  },
  {
    id: 'proj_aerovision_uav',
    number: '02',
    title: 'AeroVision UAV',
    category: 'ROBOTICS & AI',
    recruitingBadge: 'Recruiting • 2 Devs',
    badgeTone: 'cyan',
    college: 'BMSCE Bengaluru',
    description: 'Autonomous campus drone tracking with edge-quantized YOLOv8 on Jetson Orin Nano.',
    tags: ['Python', 'PyTorch', 'ROS2'],
    teamJoined: '2/4 Joined',
    artImage: '/brand/card-art-2.webp',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    href: '/projects/proj_aerovision_uav',
  },
  {
    id: 'proj_ecoroute_transit',
    number: '03',
    title: 'EcoRoute Transit',
    category: 'SMART MOBILITY',
    recruitingBadge: 'In Progress',
    badgeTone: 'violet',
    college: 'COEP Pune',
    description: 'Graph-optimized micro-mobility scheduler reducing student shuttle wait times by 40%.',
    tags: ['FastAPI', 'Rust', 'Leaflet'],
    teamJoined: '3/4 Joined',
    artImage: '/brand/card-art-3.webp',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    href: '/projects/proj_ecoroute_transit',
  },
  {
    id: 'proj_finsafe_web3',
    number: '04',
    title: 'FinSafe Web3',
    category: 'FINTECH / ZK',
    recruitingBadge: 'Recruiting • 1 Dev',
    badgeTone: 'cyan',
    college: 'Thapar Patiala',
    description: 'Zero-knowledge fraud prevention and micro-grant protocol for collegiate hackers.',
    tags: ['Solidity', 'Next.js', 'ZK-Rollup'],
    teamJoined: '2/3 Joined',
    artImage: '/brand/card-art-4.webp',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    href: '/projects/proj_finsafe_web3',
  },
  {
    id: 'proj_neuroscan_ai',
    number: '05',
    title: 'NeuroScan AI',
    category: 'HEALTH AI',
    recruitingBadge: 'SIH Finalist',
    badgeTone: 'amber',
    college: 'KIET Ghaziabad',
    description: 'Explainable deep learning pipeline for fast MRI brain lesion classification & triage.',
    tags: ['PyTorch', 'FastAPI', 'React'],
    teamJoined: '4/4 Joined',
    artImage: '/brand/card-art-5.webp',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    href: '/projects/proj_neuroscan_ai',
  },
];

export interface FeaturedHackathonBadgeConfig {
  id: string;
  slot: number;
  hackathonId?: string;
  hostName: string;
  title: string;
  passType: 'HACKER PASS' | 'STAFF PASS' | 'MEDIA PASS' | 'VIP PASS' | 'BUILDER PASS';
  eventDate: string;
  prizePool: string;
  themeStyle: 'crimson' | 'magenta' | 'teal' | 'cobalt' | 'gold';
  pattern: 'curves' | 'circles' | 'wave' | 'rings' | 'soundwave';
  statusBadge: string;
  teamSize: string;
  actionUrl: string;
}

export const DEFAULT_FEATURED_HACKATHON_BADGES: FeaturedHackathonBadgeConfig[] = [
  {
    id: 'badge_iit_bombay',
    slot: 1,
    hackathonId: '3f99aa7c-597a-4e5e-b8b2-430a633bfa41',
    hostName: 'TIH × E-CELL IIT BOMBAY',
    title: 'Physical AI Hackathon',
    passType: 'HACKER PASS',
    eventDate: '15.01',
    prizePool: '₹1,50,000 Cash',
    themeStyle: 'crimson',
    pattern: 'curves',
    statusBadge: 'Verified Collegiate',
    teamSize: '1-4 Builders',
    actionUrl: '/hackathons/3f99aa7c-597a-4e5e-b8b2-430a633bfa41',
  },
  {
    id: 'badge_lighthouse',
    slot: 2,
    hackathonId: '00f2a0f5-c875-453b-8744-ccf3fe693dc7',
    hostName: 'CHANDIGARH UNIVERSITY × LIGHTHOUSE',
    title: 'LightHouse - Agentic AI Hackathon',
    passType: 'STAFF PASS',
    eventDate: '25.12',
    prizePool: '₹5,10,000 Pool',
    themeStyle: 'magenta',
    pattern: 'rings',
    statusBadge: 'Unstop Official',
    teamSize: '1-4 Builders',
    actionUrl: '/hackathons/00f2a0f5-c875-453b-8744-ccf3fe693dc7',
  },
  {
    id: 'badge_code_relay',
    slot: 3,
    hackathonId: '351e6c54-af03-4f06-8867-3226a18d7c6e',
    hostName: 'IIT BHUBANESWAR (WEBND)',
    title: 'Code Relay 5.0 — Speed Dev',
    passType: 'MEDIA PASS',
    eventDate: '05.02',
    prizePool: '₹2,40,000+ Pool',
    themeStyle: 'teal',
    pattern: 'wave',
    statusBadge: 'Live On Campus',
    teamSize: '2-4 Builders',
    actionUrl: '/hackathons/351e6c54-af03-4f06-8867-3226a18d7c6e',
  },
  {
    id: 'badge_festive_berlin',
    slot: 4,
    hackathonId: '43c9f5ab-d331-43bf-92dc-2b552cd60825',
    hostName: 'WEMAKEDEVS × WEAREDEVELOPERS',
    title: 'Festive Hacks 2026: Berlin VIP Trip',
    passType: 'VIP PASS',
    eventDate: '10.01',
    prizePool: 'Berlin VIP Trip + ₹1L',
    themeStyle: 'cobalt',
    pattern: 'circles',
    statusBadge: 'Global Edition',
    teamSize: '1-4 Builders',
    actionUrl: '/hackathons/43c9f5ab-d331-43bf-92dc-2b552cd60825',
  },
  {
    id: 'badge_fasttrack_sprint',
    slot: 5,
    hackathonId: '9892b319-0efa-4743-9411-afd6652ce3b5',
    hostName: 'KOLLABRIX DIRECTORATE',
    title: 'Collegiate FastTrack Sprint: Winter',
    passType: 'BUILDER PASS',
    eventDate: '30.12',
    prizePool: 'Instant UPI Grant',
    themeStyle: 'gold',
    pattern: 'soundwave',
    statusBadge: 'Rapid Squad Match',
    teamSize: '1-3 Builders',
    actionUrl: '/hackathons/9892b319-0efa-4743-9411-afd6652ce3b5',
  },
];

export interface MasterControlConfig {
  banner: BroadcastBannerConfig;
  sections: HomepageSectionToggles;
  colleges: CollegeWhitelistItem[];
  badges: StudentBadgeAward[];
  maintenance: MaintenanceModeConfig;
  workspaceFeatures?: WorkspaceFeaturesConfig;
  customSection?: CustomSectionConfig;
  studentTools?: StudentToolsConfig;
  visualTemplates?: VisualTemplatesConfig;
  featuredDeckCards?: FeaturedDeckCardConfig[];
  featuredHackathonBadges?: FeaturedHackathonBadgeConfig[];
}

export const DEFAULT_MASTER_CONTROL_CONFIG: MasterControlConfig = {
  featuredDeckCards: DEFAULT_FEATURED_DECK_CARDS,
  featuredHackathonBadges: DEFAULT_FEATURED_HACKATHON_BADGES,
  visualTemplates: DEFAULT_VISUAL_TEMPLATES_CONFIG,
  workspaceFeatures: {
    aiCloserKit: false,
    liveToolBridge: false,
    teamHuddle: false,
    proofOfWork: false,
  },
  studentTools: {
    perksVault: true,
    starterKits: true,
  },
  banner: {
    enabled: true,
    text: '🚀 Kollabrix is live on campus! Assemble your hackathon dream team & showcase projects.',
    linkText: 'Explore Projects →',
    linkUrl: '/explore',
    theme: 'gradient',
    dismissible: true,
  },
  sections: {
    campusTicker: false,
    hero: true,
    heroSearch: false,
    origamiBird: true,
    collegiateRadar: false,
    domainGrid: true,
    categoryRails: true,
    intent: true,
    workflow: true,
    showcase: true,
    hackathons: true,
    ctaBanner: true,
    colleges: true,
    badges: true,
    campusPulse: false,
    pulseLeaderboard: true,
    pulseAiMatchmaker: true,
    pulseLivePresence: true,
    customSection: false,
    pulseTitle: 'Campus Innovation Hub',
    pulseSubtitle: 'Live university rankings, AI dream team matchmaking, and real-time collegiate sprint presence.',
    workflowTitle: 'Workflow',
    workflowSubtitle: 'From raw concept to verified career proof in three collegiate stages.',
    showcaseTitle: 'Showcase',
    showcaseSubtitle: 'Explore active projects recruiting collaborators, or enter upcoming university competitions.',
    domainGridTitle: 'What do you want to achieve today?',
    domainGridSubtitle: 'Pick your pathway to join collegiate hackathons, recruit teammates, or solve faculty challenges.',
  },
  customSection: {
    enabled: false,
    position: 'above_showcase',
    badge: '🌟 SPECIAL ANNOUNCEMENT',
    title: 'Grand Collegiate Winter Hackathon 2026',
    subtitle: 'Over ₹5,00,000 in bounties, cloud grants, and direct interview fast-tracks for winning squads.',
    content: 'Registration is now open for students across all engineering branches. Form teams of 2 to 4 developers and build open-source web, AI, or Web3 applications.',
    primaryButtonText: 'Register Your Squad →',
    primaryButtonUrl: '/hackathons',
    secondaryButtonText: 'Find Teammates',
    secondaryButtonUrl: '/teammates',
    theme: 'gradient_violet',
    bannerImageUrl: '',
  },
  colleges: [],
  badges: [],
  maintenance: {
    mode: 'public',
    campusPasscode: 'CAMPUS2026',
    maintenanceHeadline: 'Scheduled Campus Upgrade in Progress',
    maintenanceMessage: 'We are updating collegiate sprint workboards and team matching algorithms. Kollabrix will be back shortly.',
    expectedBackAt: '30 minutes',
  },
};
