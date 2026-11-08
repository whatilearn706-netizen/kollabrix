export interface SponsoredMeta {
  isSponsored: boolean;
  companyName?: string;
  glowColor: 'gold' | 'cyan' | 'purple' | 'emerald';
  priorityRank: number;
  recruitmentPerks: string[];
  hiringRoles?: string;
  sponsorLogoUrl?: string;
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
  let glowColor: 'gold' | 'cyan' | 'purple' | 'emerald' =
    hackathon?.glow_color === 'cyan' ||
    hackathon?.glow_color === 'purple' ||
    hackathon?.glow_color === 'emerald'
      ? hackathon.glow_color
      : 'gold';
  let priorityRank: number = typeof hackathon?.priority_rank === 'number' ? hackathon.priority_rank : 1;
  let recruitmentPerks: string[] = Array.isArray(hackathon?.recruitment_perks)
    ? hackathon.recruitment_perks
    : [];
  let hiringRoles = hackathon?.hiring_roles || '';
  let sponsorLogoUrl = hackathon?.company_logo || hackathon?.logo_url || '';

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
        if (parsed.glow_color) glowColor = parsed.glow_color;
        if (typeof parsed.priority_rank === 'number') priorityRank = parsed.priority_rank;
        if (Array.isArray(parsed.recruitment_perks)) recruitmentPerks = parsed.recruitment_perks;
        if (parsed.hiring_roles) hiringRoles = parsed.hiring_roles;
        if (parsed.sponsor_logo_url) sponsorLogoUrl = parsed.sponsor_logo_url;
      }
    } catch {}
  }

  return {
    isSponsored,
    companyName,
    glowColor,
    priorityRank,
    recruitmentPerks,
    hiringRoles,
    sponsorLogoUrl,
  };
}
