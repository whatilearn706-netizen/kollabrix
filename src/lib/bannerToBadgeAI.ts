import { FeaturedHackathonBadgeConfig } from '@/types/masterControl';

export interface BannerAnalysisResult {
  themeStyle: FeaturedHackathonBadgeConfig['themeStyle'];
  statusStripTone: 'blue' | 'emerald' | 'amber' | 'crimson' | 'purple';
  statusStripText: string;
  editionBadge: string;
  authorityBadge: string;
  pattern: FeaturedHackathonBadgeConfig['pattern'];
  accentHex: string;
  suggestedTags: string[];
}

/**
 * AI Banner-to-Badge Analyzer
 * Intelligently extracts the brand spirit, color palette, edition stamp,
 * and collegiate status strip from a hackathon promo banner or title.
 */
export function analyzeBannerForBadge(params: {
  bannerUrl?: string;
  title?: string;
  organizer?: string;
  description?: string;
  prizePool?: string;
}): BannerAnalysisResult {
  const combined = `${params.title || ''} ${params.organizer || ''} ${params.description || ''} ${params.bannerUrl || ''}`.toLowerCase();

  // 1. Theme Classification & Color Psychology
  let themeStyle: FeaturedHackathonBadgeConfig['themeStyle'] = 'cobalt';
  let statusStripTone: 'blue' | 'emerald' | 'amber' | 'crimson' | 'purple' = 'blue';
  let statusStripText = 'STUDENT PARTICIPANT';
  let editionBadge = '#Software Edition • GRAND FINALE 2026';
  let authorityBadge = 'Verified Collegiate • Campus League';
  let pattern: FeaturedHackathonBadgeConfig['pattern'] = 'grid';
  let accentHex = '#0284c7'; // SIH Blue

  if (combined.includes('smart india') || combined.includes('sih') || combined.includes('ministry') || combined.includes('aicte') || combined.includes('moe')) {
    themeStyle = 'cobalt';
    statusStripTone = 'blue';
    statusStripText = 'STUDENT PARTICIPANT';
    editionBadge = '#SIH Software Edition • GRAND FINALE';
    authorityBadge = 'MoE Innovation Cell • AICTE';
    pattern = 'grid';
    accentHex = '#0284c7';
  } else if (combined.includes('ai') || combined.includes('agentic') || combined.includes('llm') || combined.includes('claude') || combined.includes('gpt')) {
    themeStyle = 'magenta';
    statusStripTone = 'purple';
    statusStripText = 'OFFICIAL QUALIFIER';
    editionBadge = '#Autonomous Agents • ONLINE STAGE';
    authorityBadge = 'Agentic AI Innovation Hub';
    pattern = 'rings';
    accentHex = '#c026d3';
  } else if (combined.includes('physical') || combined.includes('iit bombay') || combined.includes('robotics') || combined.includes('hardware')) {
    themeStyle = 'crimson';
    statusStripTone = 'crimson';
    statusStripText = 'CAMPUS FINALIST';
    editionBadge = '#National Finals • 36-HR SPRINT';
    authorityBadge = 'TIH × E-Cell Tech Innovation';
    pattern = 'curves';
    accentHex = '#e11d48';
  } else if (combined.includes('speed') || combined.includes('relay') || combined.includes('bhubaneswar') || combined.includes('algorithm')) {
    themeStyle = 'teal';
    statusStripTone = 'emerald';
    statusStripText = 'APPLICATIONS OPEN';
    editionBadge = '#Algorithm Relay • LIVE STAGE';
    authorityBadge = 'Webnd Student Chapter';
    pattern = 'wave';
    accentHex = '#059669';
  } else if (combined.includes('berlin') || combined.includes('trip') || combined.includes('global') || combined.includes('festive') || combined.includes('wemakedevs')) {
    themeStyle = 'gold';
    statusStripTone = 'amber';
    statusStripText = 'GLOBAL CONTENDER';
    editionBadge = '#International Finals • BERLIN TRIP';
    authorityBadge = 'WeAreDevelopers Global Partner';
    pattern = 'circles';
    accentHex = '#d97706';
  } else {
    // Default smart collegiate pass
    themeStyle = 'cobalt';
    statusStripTone = 'blue';
    statusStripText = 'APPLICATIONS OPEN • CLAIM PASS →';
    editionBadge = '#Collegiate Edition • ALL INDIA STAGE';
    authorityBadge = 'Unstop & GitHub Official Partner';
    pattern = 'grid';
    accentHex = '#2563eb';
  }

  // Refine Edition Badge if year or edition words appear
  const yearMatch = combined.match(/202[4-7]/);
  const detectedYear = yearMatch ? yearMatch[0] : '2026';

  if (!editionBadge.includes(detectedYear) && !editionBadge.includes('GRAND FINALE')) {
    editionBadge = `${editionBadge} ${detectedYear}`;
  }

  return {
    themeStyle,
    statusStripTone,
    statusStripText,
    editionBadge,
    authorityBadge,
    pattern,
    accentHex,
    suggestedTags: ['Collegiate', 'Verified', 'Cash Prize', 'Unstop Official'],
  };
}
