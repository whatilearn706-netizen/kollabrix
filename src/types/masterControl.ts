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

export interface MasterControlConfig {
  banner: BroadcastBannerConfig;
  sections: HomepageSectionToggles;
  colleges: CollegeWhitelistItem[];
  badges: StudentBadgeAward[];
  maintenance: MaintenanceModeConfig;
  workspaceFeatures?: WorkspaceFeaturesConfig;
  customSection?: CustomSectionConfig;
  studentTools?: StudentToolsConfig;
}

export const DEFAULT_MASTER_CONTROL_CONFIG: MasterControlConfig = {
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
    text: '🚀 Linkora is live on campus! Assemble your hackathon dream team & showcase projects.',
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
    maintenanceMessage: 'We are updating collegiate sprint workboards and team matching algorithms. Linkora will be back shortly.',
    expectedBackAt: '30 minutes',
  },
};
