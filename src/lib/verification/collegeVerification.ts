/**
 * College Name Verification & LinkedIn Cross-Check Engine
 */

export interface CollegeVerificationResult {
  isMatch: boolean;
  confidence: number;
  enteredCollege: string;
  matchedCollegeName: string;
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
};

// Tokenizer & normalizer
function cleanTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 1 &&
        !['the', 'of', 'and', 'for', 'in', 'at', 'college', 'institute', 'university', 'technology', 'engineering'].includes(w)
    );
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
    reason: `Entered college name "${enteredCollege}" does not match LinkedIn education "${linkedinEducation}".`,
  };
}
