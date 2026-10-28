/**
 * Kollabrix Content Moderation - Restricted Words Dictionary & Verification Engine
 * Prevents inappropriate language, profanity, scams, academic dishonesty, and harassment
 * across all inputs, textareas, forms, and pages.
 */

export interface RestrictedWordCategory {
  name: string;
  description: string;
  words: string[];
}

export const DEFAULT_RESTRICTED_CATEGORIES: Record<string, RestrictedWordCategory> = {
  profanity: {
    name: 'Profanity & Expletives',
    description: 'Vulgar language, swear words, and explicit expletives',
    words: [
      'fuck',
      'fucker',
      'fucking',
      'motherfucker',
      'shit',
      'bullshit',
      'bitch',
      'bitches',
      'bitching',
      'bastard',
      'asshole',
      'cunt',
      'dick',
      'dickhead',
      'pussy',
      'cock',
      'cocksucker',
      'blowjob',
      'whore',
      'slut',
      'tits',
      'boobs',
      'jackass',
      'dipshit',
      'dumbass',
      'douchebag',
    ],
  },
  slurs: {
    name: 'Hate Speech & Slurs',
    description: 'Derogatory slurs targeting race, gender, identity, or disability',
    words: [
      'nigger',
      'nigga',
      'faggot',
      'fag',
      'retard',
      'chink',
      'spic',
      'kike',
      'coon',
      'dyke',
      'tranny',
    ],
  },
  scams: {
    name: 'Scams & Financial Fraud',
    description: 'Deceptive financial schemes, phishing terms, and fraudulent offerings',
    words: [
      'scam',
      'scammer',
      'scamming',
      'ponzi',
      'pyramid scheme',
      'money double',
      'free money',
      'crypto doubler',
      'phishing',
      'bribe',
      'lottery winner',
      'earn quick money',
      'click here for cash',
    ],
  },
  academic: {
    name: 'Academic Misconduct',
    description: 'Cheating services, exam leaks, and collegiate integrity violations',
    words: [
      'exam leak',
      'paper leak',
      'buy assignment',
      'hackathon cheat',
      'leak paper',
      'test leak',
      'hire test taker',
      'buy thesis',
    ],
  },
  harm: {
    name: 'Violence & Harm',
    description: 'Threats of self-harm, terrorism, or severe violence',
    words: [
      'suicide',
      'kill yourself',
      'terrorist',
      'bombing',
      'shoot up',
      'mass murder',
    ],
  },
  nsfw: {
    name: 'Explicit NSFW Content',
    description: 'Adult content, pornography, and illicit solicitation',
    words: [
      'porn',
      'porno',
      'pornography',
      'xxx',
      'nude',
      'nudes',
      'onlyfans',
      'escort service',
      'pedophile',
      'pedo',
    ],
  },
};

// Flatten all default words into a unified lookup set
export const DEFAULT_RESTRICTED_WORDS: string[] = Array.from(
  new Set(
    Object.values(DEFAULT_RESTRICTED_CATEGORIES).flatMap((cat) =>
      cat.words.map((w) => w.toLowerCase().trim())
    )
  )
);

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalizes leetspeak symbols to plain characters
 * e.g., "f*ck" -> "fuck", "$cam" -> "scam"
 */
function normalizeText(text: string): string {
  return text
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/0/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/\*/g, '');
}

export interface ModerationResult {
  hasRestricted: boolean;
  matchedWords: string[];
  cleanText: string;
}

/**
 * Checks a string against the active restricted words list.
 * Uses strict word-boundary matching so words like 'assignment', 'passport',
 * 'classic', and 'document' are NEVER falsely blocked.
 */
export function checkRestrictedWords(
  text: string,
  customWords: string[] = DEFAULT_RESTRICTED_WORDS
): ModerationResult {
  if (!text || typeof text !== 'string') {
    return { hasRestricted: false, matchedWords: [], cleanText: text || '' };
  }

  const normalized = normalizeText(text);
  const matchedSet = new Set<string>();
  let cleanText = text;

  // Combine and sort words by length descending so multi-word phrases match before individual words
  const sortedWords = Array.from(
    new Set(customWords.map((w) => w.toLowerCase().trim()).filter(Boolean))
  ).sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    const isPhrase = word.includes(' ');
    let pattern: RegExp;
    let normPattern: RegExp;

    if (isPhrase) {
      const parts = word.split(/\s+/).map(escapeRegExp);
      pattern = new RegExp('\\b' + parts.join('\\s+') + '\\b', 'gi');
      normPattern = pattern;
    } else {
      // Matches the word or common morphological variations: -s, -es, -ed, -ing, -er, -ers, -y
      pattern = new RegExp(
        '\\b' + escapeRegExp(word) + '(?:s|es|ed|ing|er|ers|y)?\\b',
        'gi'
      );
      normPattern = pattern;
    }

    let hit = false;
    if (pattern.test(text)) {
      hit = true;
      matchedSet.add(word);
      cleanText = cleanText.replace(pattern, '').replace(/\s{2,}/g, ' ');
    } else if (normPattern.test(normalized)) {
      hit = true;
      matchedSet.add(word);
      // Clean from original text using leet-aware boundary
      const chars = word.split('').map(escapeRegExp);
      const flexiblePattern = new RegExp('\\b' + chars.join('[\\W_]*') + '\\b', 'gi');
      cleanText = cleanText.replace(flexiblePattern, '').replace(/\s{2,}/g, ' ');
    }
  }

  const matchedWords = Array.from(matchedSet);
  return {
    hasRestricted: matchedWords.length > 0,
    matchedWords,
    cleanText: cleanText.trim(),
  };
}
