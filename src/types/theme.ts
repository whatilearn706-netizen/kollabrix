export interface SiteThemeConfig {
  // Brand & Accent Colors
  brandColor: string;          // e.g. '#6366F1' (Indigo) or '#8B5CF6' (Violet)
  brandHoverColor: string;     // e.g. '#4F46E5'
  accentColor: string;         // e.g. '#EC4899' (Pink) or '#10B981' (Emerald)
  
  // Canvas & Background
  backgroundColor: string;     // e.g. '#fafbfc' (Light) or '#090B10' (Dark)
  surfaceColor: string;        // e.g. '#ffffff' (Light card) or '#11141E' (Dark card)
  borderColor: string;         // e.g. '#e2e8f0' (Light border) or '#1F2436' (Dark border)
  cardShadow: 'none' | 'subtle' | 'elevated' | 'glow';
  
  // Text Colors
  headingColor: string;        // e.g. '#0f172a' or '#F8FAFC'
  bodyTextColor: string;       // e.g. '#334155' or '#CBD5E1'
  mutedTextColor: string;      // e.g. '#64748b' or '#64748B'

  // Typography
  headingFont: string;         // 'Inter' | 'Outfit' | 'Plus Jakarta Sans' | 'Space Grotesk' | 'Syne' | 'Poppins' | 'Geist' | 'JetBrains Mono'
  bodyFont: string;            // 'Inter' | 'Roboto' | 'Open Sans' | 'System'
  headingWeight: string;       // '600' | '700' | '800' | '900'
  letterSpacing: string;       // '-0.04em' | '-0.02em' | '0' | '0.02em'

  // Shape & Radii
  borderRadius: string;        // '0px' | '8px' | '12px' | '16px' | '24px' | '9999px'
  buttonShape: string;         // 'rounded-md' | 'rounded-xl' | 'rounded-2xl' | 'rounded-full'

  // Navbar Configuration
  navbarStyle: 'auto' | 'dark' | 'light' | 'glass';
  navbarBgColor?: string;
  navbarBorderColor?: string;
  siteTitle: string;
  navbarCtaText: string;

  // Footer Configuration
  footerBgColor?: string;
  footerBorderColor?: string;
  footerTagline: string;

  // Site Copy & Headlines: Homepage Hero
  heroBadgeText: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCtaText: string;
  secondaryCtaText: string;

  // Page Hubs Copy & Headlines
  exploreBadgeText: string;
  exploreTitle: string;
  exploreSubtitle: string;

  teammatesBadgeText: string;
  teammatesTitle: string;
  teammatesSubtitle: string;

  hackathonsBadgeText: string;
  hackathonsTitle: string;
  hackathonsSubtitle: string;

  // Global Announcement Banner
  announcementBannerActive?: boolean;
  announcementBannerText?: string;
  announcementBannerBg?: string;
  announcementBannerTextColor?: string;
  announcementBannerLink?: string;

  // Advanced Custom CSS Injection
  customCss?: string;
}

export const DEFAULT_SITE_THEME: SiteThemeConfig = {
  brandColor: '#6366F1',
  brandHoverColor: '#4F46E5',
  accentColor: '#EC4899',
  backgroundColor: '#fafbfc',
  surfaceColor: '#ffffff',
  borderColor: '#e2e8f0',
  cardShadow: 'subtle',
  headingColor: '#0f172a',
  bodyTextColor: '#334155',
  mutedTextColor: '#64748b',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  headingWeight: '900',
  letterSpacing: '-0.03em',
  borderRadius: '16px',
  buttonShape: 'rounded-2xl',

  navbarStyle: 'auto',
  navbarBgColor: '',
  navbarBorderColor: '',
  siteTitle: 'Linkora',
  navbarCtaText: 'Start a Project',

  footerBgColor: '',
  footerBorderColor: '',
  footerTagline: 'Collegiate collaboration platform connecting student builders, creators, and mentors.',

  heroBadgeText: 'Linkora • Student Collaboration Network',
  heroHeadline: 'Build something bigger, together.',
  heroSubheadline: 'Find your people, turn ideas into projects, and build a portfolio that proves what you can do.',
  primaryCtaText: 'Explore Projects',
  secondaryCtaText: 'Find Teammates',

  exploreBadgeText: 'Collegiate Project Directory',
  exploreTitle: 'Explore Active Projects',
  exploreSubtitle: 'Discover student-led initiatives seeking collaborators, filtered by skill, tech stack, and category.',

  teammatesBadgeText: 'Campus Builder Network',
  teammatesTitle: 'Find Teammates & Collaborators',
  teammatesSubtitle: 'Connect with talented student engineers, designers, and innovators matching your project requirements.',

  hackathonsBadgeText: 'Competitive Collegiate Arena',
  hackathonsTitle: 'College Hackathons & Competitions',
  hackathonsSubtitle: 'Discover curated hackathons, build sprint challenges, and compete with collegiate builders nationwide.',

  announcementBannerActive: false,
  announcementBannerText: '',
  announcementBannerBg: '#6366F1',
  announcementBannerTextColor: '#ffffff',
  announcementBannerLink: '',

  customCss: '',
};

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  previewBrand: string;
  previewAccent: string;
  config: Partial<SiteThemeConfig>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'clean-collegiate',
    name: 'Clean Collegiate (Default)',
    description: 'Crisp airy bright canvas, deep slate ink, violet and emerald accents',
    previewBg: '#fafbfc',
    previewBrand: '#6366F1',
    previewAccent: '#10B981',
    config: {
      backgroundColor: '#fafbfc',
      surfaceColor: '#ffffff',
      borderColor: '#e2e8f0',
      headingColor: '#0f172a',
      bodyTextColor: '#334155',
      mutedTextColor: '#64748b',
      brandColor: '#6366F1',
      brandHoverColor: '#4F46E5',
      accentColor: '#10B981',
      headingFont: 'Inter',
      borderRadius: '16px',
      buttonShape: 'rounded-2xl',
      navbarStyle: 'auto',
      cardShadow: 'subtle',
    },
  },
  {
    id: 'obsidian-cyber',
    name: 'Obsidian Neon Cyber',
    description: 'Deep space black canvas with electric violet and glowing cyan highlights',
    previewBg: '#090B10',
    previewBrand: '#8B5CF6',
    previewAccent: '#06B6D4',
    config: {
      backgroundColor: '#090B10',
      surfaceColor: '#11141E',
      borderColor: '#1F2436',
      headingColor: '#F8FAFC',
      bodyTextColor: '#CBD5E1',
      mutedTextColor: '#64748B',
      brandColor: '#8B5CF6',
      brandHoverColor: '#7C3AED',
      accentColor: '#06B6D4',
      headingFont: 'Space Grotesk',
      borderRadius: '16px',
      buttonShape: 'rounded-2xl',
      navbarStyle: 'dark',
      cardShadow: 'glow',
    },
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Terminal',
    description: 'Sleek dark foundation with crisp tech emerald green and mint highlights',
    previewBg: '#070A0E',
    previewBrand: '#10B981',
    previewAccent: '#34D399',
    config: {
      backgroundColor: '#070A0E',
      surfaceColor: '#0E141B',
      borderColor: '#182430',
      headingColor: '#F1F5F9',
      bodyTextColor: '#94A3B8',
      mutedTextColor: '#64748B',
      brandColor: '#10B981',
      brandHoverColor: '#059669',
      accentColor: '#34D399',
      headingFont: 'Outfit',
      borderRadius: '12px',
      buttonShape: 'rounded-xl',
      navbarStyle: 'dark',
      cardShadow: 'subtle',
    },
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Coral & Amber',
    description: 'Warm energetic vibe with vivid coral rose and solar amber accents',
    previewBg: '#0B0D13',
    previewBrand: '#F43F5E',
    previewAccent: '#F59E0B',
    config: {
      backgroundColor: '#0B0D13',
      surfaceColor: '#141724',
      borderColor: '#242A42',
      headingColor: '#FFFFFF',
      bodyTextColor: '#E2E8F0',
      mutedTextColor: '#94A3B8',
      brandColor: '#F43F5E',
      brandHoverColor: '#E11D48',
      accentColor: '#F59E0B',
      headingFont: 'Plus Jakarta Sans',
      borderRadius: '20px',
      buttonShape: 'rounded-2xl',
      navbarStyle: 'dark',
      cardShadow: 'glow',
    },
  },
  {
    id: 'nordic-monochrome',
    name: 'Nordic Monochrome',
    description: 'Ultra-minimal Swiss architectural aesthetic with pure high contrast',
    previewBg: '#FFFFFF',
    previewBrand: '#0F172A',
    previewAccent: '#475569',
    config: {
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F8FAFC',
      borderColor: '#E2E8F0',
      headingColor: '#000000',
      bodyTextColor: '#1E293B',
      mutedTextColor: '#64748B',
      brandColor: '#000000',
      brandHoverColor: '#1E293B',
      accentColor: '#475569',
      headingFont: 'Syne',
      borderRadius: '8px',
      buttonShape: 'rounded-md',
      navbarStyle: 'light',
      cardShadow: 'none',
    },
  },
  {
    id: 'deep-ocean-navy',
    name: 'Deep Oceanic Blue',
    description: 'Royal navy collegiate backdrop with bright cobalt and sky blue',
    previewBg: '#090D16',
    previewBrand: '#3B82F6',
    previewAccent: '#38BDF8',
    config: {
      backgroundColor: '#090D16',
      surfaceColor: '#0F172A',
      borderColor: '#1E293B',
      headingColor: '#FFFFFF',
      bodyTextColor: '#CBD5E1',
      mutedTextColor: '#64748B',
      brandColor: '#3B82F6',
      brandHoverColor: '#2563EB',
      accentColor: '#38BDF8',
      headingFont: 'Plus Jakarta Sans',
      borderRadius: '16px',
      buttonShape: 'rounded-2xl',
      navbarStyle: 'dark',
      cardShadow: 'subtle',
    },
  },
];

export const AVAILABLE_FONTS = [
  { id: 'Inter', label: 'Inter (Clean & Modern Sans)', googleFont: 'Inter:wght@400;600;700;800;900' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Contemporary Tech)', googleFont: 'Plus+Jakarta+Sans:wght@400;600;700;800' },
  { id: 'Outfit', label: 'Outfit (Geometric & Friendly)', googleFont: 'Outfit:wght@400;600;700;800;900' },
  { id: 'Space Grotesk', label: 'Space Grotesk (Distinctive Developer/Cyber)', googleFont: 'Space+Grotesk:wght@400;600;700' },
  { id: 'Syne', label: 'Syne (Avant-Garde & High Fashion)', googleFont: 'Syne:wght@600;700;800' },
  { id: 'Poppins', label: 'Poppins (Smooth & Balanced)', googleFont: 'Poppins:wght@400;600;700;800' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono (Technical / Code Mono)', googleFont: 'JetBrains+Mono:wght@400;600;700;800' },
];
