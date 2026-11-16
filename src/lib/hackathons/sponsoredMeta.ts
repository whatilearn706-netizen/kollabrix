export type SponsorThemePreset =
  | 'google'
  | 'ethereum'
  | 'cyberpunk'
  | 'sunset-gold'
  | 'crimson'
  | 'electric-violet';

export interface SponsorThemeStyle {
  key: SponsorThemePreset;
  name: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBorder: string;
  cardGlow: string;
  heroGradient: string;
  accentText: string;
  buttonGradient: string;
  chipBorder: string;
  chipBg: string;
  ambientLight: string;
}

export const SPONSOR_THEMES: Record<SponsorThemePreset, SponsorThemeStyle> = {
  google: {
    key: 'google',
    name: 'Google Silicon Valley',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-400/40',
    badgeText: 'text-blue-300',
    cardBorder: 'border-blue-500/40 hover:border-blue-400/80',
    cardGlow: 'shadow-[0_0_35px_-8px_rgba(66,133,244,0.3)]',
    heroGradient: 'from-blue-950/90 via-slate-950 to-emerald-950/30',
    accentText: 'text-blue-400',
    buttonGradient: 'from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white',
    chipBorder: 'border-blue-400/30',
    chipBg: 'bg-blue-950/60 text-blue-200',
    ambientLight: 'rgba(66, 133, 244, 0.15)',
  },
  ethereum: {
    key: 'ethereum',
    name: 'Ethereum Web3 Obsidian',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-400/40',
    badgeText: 'text-purple-300',
    cardBorder: 'border-purple-500/40 hover:border-violet-400/80',
    cardGlow: 'shadow-[0_0_35px_-8px_rgba(168,85,247,0.3)]',
    heroGradient: 'from-purple-950/90 via-slate-950 to-violet-950/30',
    accentText: 'text-purple-400',
    buttonGradient: 'from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
    chipBorder: 'border-purple-400/30',
    chipBg: 'bg-purple-950/60 text-purple-200',
    ambientLight: 'rgba(168, 85, 247, 0.15)',
  },
  cyberpunk: {
    key: 'cyberpunk',
    name: 'Cyber Matrix Terminal',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-400/40',
    badgeText: 'text-cyan-300',
    cardBorder: 'border-cyan-500/40 hover:border-emerald-400/80',
    cardGlow: 'shadow-[0_0_35px_-8px_rgba(6,182,212,0.3)]',
    heroGradient: 'from-cyan-950/90 via-slate-950 to-teal-950/30',
    accentText: 'text-cyan-400',
    buttonGradient: 'from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black',
    chipBorder: 'border-cyan-400/30',
    chipBg: 'bg-cyan-950/60 text-cyan-200',
    ambientLight: 'rgba(6, 182, 212, 0.15)',
  },
  'sunset-gold': {
    key: 'sunset-gold',
    name: 'Sunset 24K Prestige',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-400/40',
    badgeText: 'text-amber-300',
    cardBorder: 'border-amber-500/40 hover:border-yellow-400/80',
    cardGlow: 'shadow-[0_0_35px_-8px_rgba(245,158,11,0.3)]',
    heroGradient: 'from-amber-950/90 via-slate-950 to-rose-950/30',
    accentText: 'text-amber-400',
    buttonGradient: 'from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black',
    chipBorder: 'border-amber-400/30',
    chipBg: 'bg-amber-950/60 text-amber-200',
    ambientLight: 'rgba(245, 158, 11, 0.15)',
  },
  crimson: {
    key: 'crimson',
    name: 'Crimson Red-Team & Security',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-400/40',
    badgeText: 'text-rose-300',
    cardBorder: 'border-rose-500/40 hover:border-red-400/80',
    cardGlow: 'shadow-[0_0_35px_-8px_rgba(244,63,94,0.3)]',
    heroGradient: 'from-rose-950/90 via-slate-950 to-red-950/30',
    accentText: 'text-rose-400',
    buttonGradient: 'from-rose-600 via-red-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black',
    chipBorder: 'border-rose-400/30',
    chipBg: 'bg-rose-950/60 text-rose-200',
    ambientLight: 'rgba(244, 63, 94, 0.15)',
  },
  'electric-violet': {
    key: 'electric-violet',
    name: 'Electric Violet & Tech Club',
    badgeBg: 'bg-fuchsia-500/15',
    badgeBorder: 'border-fuchsia-400/40',
    badgeText: 'text-fuchsia-300',
    cardBorder: 'border-fuchsia-500/40 hover:border-pink-400/80',
    cardGlow: 'shadow-[0_0_35px_-8px_rgba(217,70,239,0.3)]',
    heroGradient: 'from-fuchsia-950/90 via-slate-950 to-pink-950/30',
    accentText: 'text-fuchsia-400',
    buttonGradient: 'from-fuchsia-600 via-pink-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black',
    chipBorder: 'border-fuchsia-400/30',
    chipBg: 'bg-fuchsia-950/60 text-fuchsia-200',
    ambientLight: 'rgba(217, 70, 239, 0.15)',
  },
};

export interface SponsorTrack {
  title: string;
  bounty: string;
  description?: string;
}

export interface SponsoredMeta {
  isSponsored: boolean;
  companyName?: string;
  themePreset: SponsorThemePreset;
  theme: SponsorThemeStyle;
  glowColor?: 'gold' | 'cyan' | 'purple' | 'emerald' | 'blue' | 'rose' | 'fuchsia';
  priorityRank: number;
  recruitmentPerks: string[];
  hiringRoles?: string;
  hiringPackage?: string;
  sponsorLogoUrl?: string;
  tagline?: string;
  promoVideoUrl?: string;
  customCtaText?: string;
  tracks?: SponsorTrack[];
}

export function getSponsorTheme(preset?: string): SponsorThemeStyle {
  if (preset && preset in SPONSOR_THEMES) {
    return SPONSOR_THEMES[preset as SponsorThemePreset];
  }
  return SPONSOR_THEMES['sunset-gold'];
}

/**
 * Extracts corporate / sponsored metadata from direct columns or description comments
 */
export function extractSponsoredMeta(hackathon: any): SponsoredMeta {
  let isSponsored = Boolean(
    hackathon?.is_sponsored ||
      hackathon?.is_enterprise ||
      hackathon?.access_type === 'sponsored'
  );
  let companyName = hackathon?.company_name || (isSponsored ? hackathon?.organizer : undefined);

  // Map glow_color to themePreset if preset not explicit
  let themePreset: SponsorThemePreset = 'sunset-gold';
  const rawGlow = (hackathon?.glow_color || '').toLowerCase();
  if (rawGlow === 'cyan') themePreset = 'cyberpunk';
  else if (rawGlow === 'purple') themePreset = 'ethereum';
  else if (rawGlow === 'emerald') themePreset = 'cyberpunk';
  else if (rawGlow === 'blue') themePreset = 'google';
  else if (rawGlow === 'rose' || rawGlow === 'red') themePreset = 'crimson';
  else if (rawGlow === 'fuchsia' || rawGlow === 'violet') themePreset = 'electric-violet';

  // Smart detect from company name if preset default
  const lowerCompany = (companyName || '').toLowerCase();
  if (lowerCompany.includes('google')) themePreset = 'google';
  else if (lowerCompany.includes('eth') || lowerCompany.includes('devfolio') || lowerCompany.includes('web3')) themePreset = 'ethereum';

  let priorityRank: number = typeof hackathon?.priority_rank === 'number' ? hackathon.priority_rank : 1;
  let recruitmentPerks: string[] = Array.isArray(hackathon?.recruitment_perks)
    ? hackathon.recruitment_perks
    : [];
  let hiringRoles = hackathon?.hiring_roles || '';
  let hiringPackage = hackathon?.hiring_package || '';
  let sponsorLogoUrl = hackathon?.company_logo || hackathon?.logo_url || '';
  let tagline = hackathon?.tagline || '';
  let promoVideoUrl = hackathon?.promo_video_url || '';
  let customCtaText = hackathon?.custom_cta_text || '';
  let tracks: SponsorTrack[] = Array.isArray(hackathon?.tracks) ? hackathon.tracks : [];

  // Extract from HTML meta comment if present
  if (
    hackathon?.description &&
    typeof hackathon.description === 'string' &&
    hackathon.description.includes('<!-- HACKATHON_META:')
  ) {
    try {
      const rawMeta = hackathon.description.split('<!-- HACKATHON_META:')[1]?.split('-->')[0];
      if (rawMeta) {
        const parsed = JSON.parse(rawMeta);
        if (parsed.is_sponsored || parsed.is_enterprise) isSponsored = true;
        if (parsed.company_name) companyName = parsed.company_name;
        if (parsed.theme_preset && parsed.theme_preset in SPONSOR_THEMES) {
          themePreset = parsed.theme_preset;
        } else if (parsed.glow_color) {
          const gc = parsed.glow_color.toLowerCase();
          if (gc === 'cyan') themePreset = 'cyberpunk';
          else if (gc === 'purple') themePreset = 'ethereum';
          else if (gc === 'blue') themePreset = 'google';
          else if (gc === 'rose') themePreset = 'crimson';
        }
        if (typeof parsed.priority_rank === 'number') priorityRank = parsed.priority_rank;
        if (Array.isArray(parsed.recruitment_perks)) recruitmentPerks = parsed.recruitment_perks;
        if (parsed.hiring_roles) hiringRoles = parsed.hiring_roles;
        if (parsed.hiring_package) hiringPackage = parsed.hiring_package;
        if (parsed.sponsor_logo_url) sponsorLogoUrl = parsed.sponsor_logo_url;
        if (parsed.tagline) tagline = parsed.tagline;
        if (parsed.promo_video_url) promoVideoUrl = parsed.promo_video_url;
        if (parsed.custom_cta_text) customCtaText = parsed.custom_cta_text;
        if (Array.isArray(parsed.tracks)) tracks = parsed.tracks;
      }
    } catch {}
  }

  // Fallback defaults for popular sponsors
  if (lowerCompany.includes('google') && !sponsorLogoUrl) {
    sponsorLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg';
  } else if (lowerCompany.includes('devfolio') && !sponsorLogoUrl) {
    sponsorLogoUrl = 'https://devfolio.co/blog/content/images/2021/04/devfolio-logo.png';
  }

  return {
    isSponsored,
    companyName,
    themePreset,
    theme: getSponsorTheme(themePreset),
    glowColor: hackathon?.glow_color || 'gold',
    priorityRank,
    recruitmentPerks,
    hiringRoles,
    hiringPackage,
    sponsorLogoUrl,
    tagline,
    promoVideoUrl,
    customCtaText,
    tracks,
  };
}
