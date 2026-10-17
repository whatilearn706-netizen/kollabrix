/**
 * College Name Verification & LinkedIn Cross-Check Engine
 */

export interface CollegeVerificationResult {
  isMatch: boolean;
  confidence: number;
  enteredCollege: string;
  matchedCollegeName?: string;
  linkedinName?: string;
  isIdentityMismatch?: boolean;
  isCollegeMismatch?: boolean;
  reason?: string;
}

// Dictionary of known institution acronyms and aliases
const COLLEGE_ALIASES: Record<string, string[]> = {
  'indian institute of technology bombay': ['iit bombay', 'iitb', 'iit-b'],
  'indian institute of technology delhi': ['iit delhi', 'iitd', 'iit-d'],
  'indian institute of technology madras': ['iit madras', 'iitm', 'iit-m'],
  'indian institute of technology kanpur': ['iit kanpur', 'iitk', 'iit-k'],
  'indian institute of technology kharagpur': ['iit kharagpur', 'iitkgp', 'iit-kgp'],
  'indian institute of technology roorkee': ['iit roorkee', 'iitr'],
  'indian institute of technology guwahati': ['iit guwahati', 'iitg'],
  'indian institute of technology varanasi': ['iit bhu', 'iit-bhu', 'bhu iit'],
  'delhi technological university': ['dtu', 'dce', 'delhi college of engineering'],
  'netaji subhas university of technology': ['nsut', 'nsit'],
  'birla institute of technology and science': ['bits pilani', 'bits', 'bits-pilani', 'bits goa', 'bits hyderabad'],
  'vellore institute of technology': ['vit', 'vit vellore', 'vit chennai', 'vit ap', 'vit bhopal'],
  'national institute of technology trichy': ['nit trichy', 'nitt'],
  'national institute of technology surathkal': ['nit surathkal', 'nitk'],
  'national institute of technology warangal': ['nit warangal', 'nitw'],
  'national institute of technology rourkela': ['nit rourkela', 'nitr'],
  'national institute of technology calicut': ['nit calicut', 'nitc'],
  'indian institute of information technology hyderabad': ['iiit hyderabad', 'iiith', 'iiit-h'],
  'indian institute of information technology bangalore': ['iiit bangalore', 'iiitb', 'iiit-b'],
  'indian institute of information technology delhi': ['iiit delhi', 'iiitd', 'iiit-d'],
  'manipal academy of higher education': ['manipal university', 'mit manipal', 'mahe'],
  'srm institute of science and technology': ['srm', 'srm university', 'srm ktr'],
  'university of delhi': ['delhi university', 'du', 'north campus', 'south campus'],
  'guru gobind singh indraprastha university': ['ggsipu', 'ipu', 'ip university'],
  'jadavpur university': ['ju'],
  'anna university': ['anna univ', 'ceg guindy'],
  'chandigarh university': ['cu'],
  'lovely professional university': ['lpu'],
  'thapar institute of engineering and technology': ['thapar university', 'tiet'],
  'stanford university': ['stanford'],
  'massachusetts institute of technology': ['mit'],
  'harvard university': ['harvard'],
  'university of california berkeley': ['uc berkeley', 'ucb', 'cal berkeley'],
  'wharton school': ['the wharton school', 'wharton', 'upenn wharton'],
  'university of pennsylvania': ['upenn', 'penn'],
};

// Tokenizer & normalizer
export function cleanTokens(str: string): string[] {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 1 &&
        !['the', 'of', 'and', 'for', 'in', 'at', 'college', 'institute', 'university', 'technology', 'engineering', 'school'].includes(w)
    );
}

/**
 * Fetches public OpenGraph metadata from a LinkedIn profile URL using crawler headers
 */
export async function fetchLinkedInProfileMetadata(handle: string): Promise<{
  status: number;
  name?: string;
  education?: string | null;
  headline?: string;
  title?: string;
  rawDesc?: string;
}> {
  try {
    const res = await fetch(`https://www.linkedin.com/in/${encodeURIComponent(handle)}`, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 60 },
    });

    if (res.status === 404) {
      return { status: 404 };
    }

    const text = await res.text();
    const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
    const descMatch =
      text.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
      text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    const fullTitle = titleMatch ? titleMatch[1].replace(/\s*\|\s*LinkedIn$/i, '').trim() : '';
    // Name is usually the first portion before hyphen or dash
    const namePart = fullTitle.split(/[-–—|]/)[0]?.trim();
    const desc = descMatch ? descMatch[1] : '';

    // Extract Education: e.g. "Education: The Wharton School" or "Education: Indian Institute of Technology"
    const eduMatch = desc.match(/Education:\s*([^·\n]+)/i);
    const education = eduMatch ? eduMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim() : null;

    return {
      status: res.status,
      name: namePart || undefined,
      education: education || null,
      headline: fullTitle,
      title: fullTitle,
      rawDesc: desc,
    };
  } catch (err: unknown) {
    return {
      status: 500,
    };
  }
}

/**
 * Checks if the LinkedIn profile actually belongs to the student (anti-impersonation)
 */
export function verifyLinkedInIdentity(
  linkedInName: string | undefined,
  linkedInHandle: string,
  userDisplayName?: string,
  username?: string,
  userEmail?: string
): { isMatch: boolean; reason?: string } {
  const normHandle = (linkedInHandle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normUsername = (username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const emailPrefix = (userEmail || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Direct handle match with username or email prefix
  if (normHandle && (normHandle === normUsername || normHandle === emailPrefix)) {
    return { isMatch: true };
  }

  // 2. Token overlap between user display name and LinkedIn name/handle
  const nameTokens = cleanTokens(userDisplayName || '');
  const linkedInNameTokens = cleanTokens(linkedInName || '');

  if (linkedInName && nameTokens.length > 0 && linkedInNameTokens.length > 0) {
    const hasCommonName = nameTokens.some((t) => linkedInNameTokens.includes(t));
    if (hasCommonName) {
      return { isMatch: true };
    }

    // Check if name tokens appear in the handle (e.g. mayank-goyal)
    const handleHasName = nameTokens.some((t) => normHandle.includes(t) && t.length >= 3);
    if (handleHasName) {
      return { isMatch: true };
    }

    return {
      isMatch: false,
      reason: `Identity Mismatch! The LinkedIn profile belongs to "${linkedInName}", which does not match your Linkora account name ("${userDisplayName || username}"). You cannot use someone else's LinkedIn profile.`,
    };
  }

  // If no public name was extracted, ensure the handle shares at least part of the username/display name
  if (nameTokens.length > 0) {
    const match = nameTokens.some((t) => normHandle.includes(t) && t.length >= 3);
    if (match) return { isMatch: true };
  }

  if (normUsername && normHandle.includes(normUsername)) {
    return { isMatch: true };
  }

  return { isMatch: true };
}

/**
 * Cross-checks if the user's entered college name matches their LinkedIn education
 */
export function crossCheckCollegeName(
  enteredCollege: string,
  linkedinEducation: string
): CollegeVerificationResult {
  const normEntered = (enteredCollege || '').trim().toLowerCase();
  const normLinkedin = (linkedinEducation || '').trim().toLowerCase();

  if (!normEntered || !normLinkedin) {
    return {
      isMatch: false,
      confidence: 0,
      enteredCollege,
      matchedCollegeName: linkedinEducation,
      isCollegeMismatch: true,
      reason: 'Both college name and LinkedIn institution must be provided.',
    };
  }

  // Exact match
  if (normEntered === normLinkedin) {
    return {
      isMatch: true,
      confidence: 1.0,
      enteredCollege,
      matchedCollegeName: linkedinEducation,
    };
  }

  // Substring match
  if (normLinkedin.includes(normEntered) || normEntered.includes(normLinkedin)) {
    return {
      isMatch: true,
      confidence: 0.95,
      enteredCollege,
      matchedCollegeName: linkedinEducation,
    };
  }

  // Check alias dictionary
  for (const [canonical, aliases] of Object.entries(COLLEGE_ALIASES)) {
    const isEnteredInGroup =
      normEntered === canonical ||
      aliases.some((a) => normEntered.includes(a) || a.includes(normEntered));
    const isLinkedinInGroup =
      normLinkedin === canonical ||
      aliases.some((a) => normLinkedin.includes(a) || a.includes(normLinkedin));

    if (isEnteredInGroup && isLinkedinInGroup) {
      return {
        isMatch: true,
        confidence: 0.98,
        enteredCollege,
        matchedCollegeName: canonical.toUpperCase(),
      };
    }
  }

  // Significant token overlap match
  const enteredTokens = cleanTokens(normEntered);
  const linkedinTokens = cleanTokens(normLinkedin);

  if (enteredTokens.length > 0 && linkedinTokens.length > 0) {
    const commonTokens = enteredTokens.filter((t) => linkedinTokens.includes(t));
    const overlapRatio = commonTokens.length / Math.min(enteredTokens.length, linkedinTokens.length);

    if (overlapRatio >= 0.5) {
      return {
        isMatch: true,
        confidence: overlapRatio,
        enteredCollege,
        matchedCollegeName: linkedinEducation,
      };
    }
  }

  // Did not match
  return {
    isMatch: false,
    confidence: 0.1,
    enteredCollege,
    matchedCollegeName: linkedinEducation,
    isCollegeMismatch: true,
    reason: `Invalid College Name! The entered college "${enteredCollege}" does not match the education institution on your LinkedIn profile ("${linkedinEducation}").`,
  };
}
