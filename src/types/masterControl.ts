export interface BroadcastBannerConfig {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
  theme: 'indigo' | 'emerald' | 'amber' | 'rose' | 'gradient';
  dismissible: boolean;
}

export interface HomepageSectionToggles {
  hero: boolean;
  intent: boolean;
  workflow: boolean;
  showcase: boolean;
  hackathons: boolean;
  ctaBanner: boolean;
  colleges?: boolean;
  badges?: boolean;
  workflowTitle?: string;
  workflowSubtitle?: string;
  showcaseTitle?: string;
  showcaseSubtitle?: string;
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

export interface MasterControlConfig {
  banner: BroadcastBannerConfig;
  sections: HomepageSectionToggles;
  colleges: CollegeWhitelistItem[];
  badges: StudentBadgeAward[];
  maintenance: MaintenanceModeConfig;
}

export const DEFAULT_MASTER_CONTROL_CONFIG: MasterControlConfig = {
  banner: {
    enabled: true,
    text: '🚀 Linkora is live on campus! Assemble your hackathon dream team & showcase projects.',
    linkText: 'Explore Projects →',
    linkUrl: '/explore',
    theme: 'gradient',
    dismissible: true,
  },
  sections: {
    hero: true,
    intent: true,
    workflow: true,
    showcase: true,
    hackathons: true,
    ctaBanner: true,
    colleges: true,
    badges: true,
    workflowTitle: 'Workflow',
    workflowSubtitle: 'From raw concept to verified career proof in three collegiate stages.',
    showcaseTitle: 'Showcase',
    showcaseSubtitle: 'Explore active projects recruiting collaborators, or enter upcoming university competitions.',
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
