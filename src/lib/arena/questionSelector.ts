import { DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';

export interface QuestionMatchCriteria {
  arena: string;
  bugDomain?: 'web' | 'logic';
  selectedTags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  seenQuestionIds?: string[];
}

/**
 * Calculates a match score for a question against requested criteria.
 * Higher score = closer match. Returns -10000 for hard disqualifications.
 */
export function scoreQuestion(q: DuelQuestion, criteria: QuestionMatchCriteria): number {
  let score = 0;

  // 1. Arena filter (Hard requirement)
  if (criteria.arena && q.arena !== criteria.arena) {
    return -10000;
  }

  // 2. Bug Domain filter for Bug Hunt
  if (criteria.arena === 'bug_hunt' && criteria.bugDomain) {
    if (criteria.bugDomain === 'web') {
      const isWeb = q.bugDomain === 'web' || Boolean(q.targetComponentHtml);
      if (!isWeb) return -10000;
    } else if (criteria.bugDomain === 'logic') {
      const isLogic = q.bugDomain === 'logic' || !q.targetComponentHtml;
      if (!isLogic) return -10000;
    }
  }

  const targetTags = (criteria.selectedTags || [])
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const qTags = (q.tags || []).map((t) => t.trim().toLowerCase());

  // 3. Competitive Programming Language Filtering (Algorithms & Logic Bug Hunt)
  // If user selected C++, question MUST be C++. If user selected Java, question MUST be Java. If Python, MUST be Python.
  if (criteria.arena === 'algorithms' || (criteria.arena === 'bug_hunt' && criteria.bugDomain === 'logic')) {
    const requestedLang = targetTags.find((t) => ['cpp', 'c++', 'java', 'python'].includes(t)) || 'java';
    const normRequested = requestedLang === 'c++' ? 'cpp' : requestedLang;

    const hasCppTag = qTags.includes('cpp') || qTags.includes('c++');
    const hasJavaTag = qTags.includes('java');
    const hasPythonTag = qTags.includes('python');

    if (normRequested === 'cpp') {
      if (!hasCppTag && !q.starterCpp) return -10000;
      if (hasCppTag) score += 500;
    } else if (normRequested === 'java') {
      if (!hasJavaTag && !q.starterJava) return -10000;
      if (hasJavaTag) score += 500;
    } else if (normRequested === 'python') {
      if (!hasPythonTag && !q.starterPython) return -10000;
      if (hasPythonTag) score += 500;
    }
  }

  // 4. Web Dev Topic Filtering (HTML, CSS, JavaScript)
  if (criteria.arena === 'web_dev' || (criteria.arena === 'bug_hunt' && criteria.bugDomain === 'web')) {
    const wantsJs = targetTags.includes('javascript') || targetTags.includes('js');
    const wantsCss = targetTags.includes('css');

    const hasJsTag = qTags.includes('javascript') || qTags.includes('js');
    const hasCssTag = qTags.includes('css');

    // If JS not wanted, disqualify JS questions
    if (!wantsJs && hasJsTag) return -10000;
    // If JS wanted, disqualify non-JS questions
    if (wantsJs && !hasJsTag) return -10000;
    // If CSS not wanted (HTML only), disqualify CSS questions
    if (!wantsCss && hasCssTag) return -10000;

    if (wantsJs && hasJsTag) score += 500;
    if (wantsCss && hasCssTag) score += 300;
    if (!wantsCss && !wantsJs) score += 400; // HTML-only bonus
  }

  // 5. Difficulty matching (Hard requirement preference)
  if (criteria.difficulty) {
    const targetDiff = criteria.difficulty.toLowerCase();
    const qDiff = (q.difficulty || 'medium').toLowerCase();
    if (qDiff === targetDiff) {
      score += 300;
    } else {
      score -= 800; // Heavy penalty for wrong difficulty
    }
  }

  // 6. Time Limit matching score (180s, 300s, 600s)
  if (criteria.timeLimit && q.timeLimitSeconds) {
    const targetTime = Number(criteria.timeLimit);
    const qTime = Number(q.timeLimitSeconds);
    if (qTime === targetTime) {
      score += 250;
    } else if (Math.abs(qTime - targetTime) <= 120) {
      score += 40;
    } else {
      score -= 100;
    }
  }

  // 7. Admin custom questions prioritization
  // Only apply custom boost if score is already positive (matches the user's chosen options!)
  if (score > 0) {
    const isDefault = DEFAULT_ARENA_QUESTIONS.some((d) => d.id === q.id);
    if (!isDefault) {
      score += 50;
    }
  }

  return score;
}

/**
 * Selects the best question matching the player's configured arena, tags, difficulty, and duration.
 * Strictly guarantees randomized, non-repeating selection:
 * - Never returns questions in static database addition order.
 * - Excludes questions already seen in recent matches until all matching questions have been played.
 * - When all questions in the matching pool have been exhausted, automatically cycles/resets the pool.
 */
export function selectBestQuestion(
  allQuestions: DuelQuestion[],
  criteria: QuestionMatchCriteria
): DuelQuestion {
  const list = Array.isArray(allQuestions) && allQuestions.length > 0 ? allQuestions : DEFAULT_ARENA_QUESTIONS;

  // Score each candidate against criteria
  const scored = list
    .map((q) => ({
      question: q,
      score: scoreQuestion(q, criteria),
    }))
    .filter((item) => item.score > -5000); // Discard all hard-disqualified questions!

  let bestCandidates: DuelQuestion[] = [];

  if (scored.length > 0) {
    let maxScore = -Infinity;
    for (const item of scored) {
      if (item.score > maxScore) maxScore = item.score;
    }
    const topScoreThreshold = maxScore - 40;
    bestCandidates = scored
      .filter((item) => item.score >= topScoreThreshold)
      .map((item) => item.question);
  } else {
    // Fallback: strictly filter by arena and language
    const targetTags = (criteria.selectedTags || []).map((t) => t.trim().toLowerCase()).filter(Boolean);
    const requestedLang = targetTags.find((t) => ['cpp', 'c++', 'java', 'python'].includes(t));
    const fallbackList = list.filter((q) => {
      if (criteria.arena && q.arena !== criteria.arena) return false;
      if (criteria.arena === 'algorithms' && requestedLang) {
        const qTags = (q.tags || []).map((t) => t.trim().toLowerCase());
        const norm = requestedLang === 'c++' ? 'cpp' : requestedLang;
        return norm === 'cpp' ? (qTags.includes('cpp') || qTags.includes('c++')) : qTags.includes(norm);
      }
      return true;
    });
    bestCandidates = fallbackList.length > 0 ? fallbackList : list;
  }

  const seenSet = new Set(
    (criteria.seenQuestionIds || []).map((id) => String(id).toLowerCase().trim())
  );

  // Separate top candidates into unseen vs already played
  const unseenCandidates = bestCandidates.filter(
    (q) => q && q.id && !seenSet.has(q.id.toLowerCase().trim())
  );

  // If there are unseen questions, pick randomly from them (no duplicates!)
  // If ALL matching candidates have already been played, cycle resets: pick randomly from all best candidates!
  const candidatePool = unseenCandidates.length > 0 ? unseenCandidates : bestCandidates;

  const chosen =
    candidatePool.length > 0
      ? candidatePool[Math.floor(Math.random() * candidatePool.length)]
      : list[0];

  // Override timeLimitSeconds to strictly match the room's duration (e.g. 180s, 300s, 600s)
  const matchDuration = Number(criteria.timeLimit) || Number(chosen.timeLimitSeconds) || 300;

  return {
    ...chosen,
    timeLimitSeconds: matchDuration,
  };
}

/**
 * Helper to update seen questions history and cycle/reset when all pool questions have been played.
 */
export function updateSeenQuestionsHistory(
  currentSeenIds: string[],
  newQuestionId: string,
  matchingQuestionIds: string[]
): string[] {
  const seenSet = new Set(currentSeenIds.map((id) => String(id).toLowerCase().trim()));
  seenSet.add(newQuestionId.toLowerCase().trim());

  if (matchingQuestionIds.length > 0) {
    const matchingSet = new Set(matchingQuestionIds.map((id) => String(id).toLowerCase().trim()));
    const allSeen = Array.from(matchingSet).every((id) => seenSet.has(id));

    // When all questions in the matching pool have been seen, reset the matching pool IDs
    // so that the next cycle starts completely fresh!
    if (allSeen) {
      matchingSet.forEach((id) => {
        seenSet.delete(id);
      });
    }
  }

  return Array.from(seenSet);
}

/**
 * Filters and sorts questions for API query response, ranking best matches first
 * while randomizing questions with equal score and prioritizing unseen questions.
 */
export function filterAndRankQuestions(
  allQuestions: DuelQuestion[],
  criteria: QuestionMatchCriteria
): DuelQuestion[] {
  const list = Array.isArray(allQuestions) && allQuestions.length > 0 ? allQuestions : DEFAULT_ARENA_QUESTIONS;

  const matchDuration = Number(criteria.timeLimit) || 300;

  const arenaPool = list.filter((q) => {
    if (criteria.arena && q.arena !== criteria.arena) return false;
    if (criteria.arena === 'bug_hunt' && criteria.bugDomain && q.bugDomain) {
      return q.bugDomain === criteria.bugDomain;
    }
    return true;
  });

  const pool = arenaPool.length > 0 ? arenaPool : list;

  const seenSet = new Set(
    (criteria.seenQuestionIds || []).map((id) => String(id).toLowerCase().trim())
  );

  const scored = pool
    .map((q) => {
      const s = scoreQuestion(q, criteria);
      const isUnseen = q.id && !seenSet.has(q.id.toLowerCase().trim());
      const jitter = Math.random();
      return {
        question: {
          ...q,
          timeLimitSeconds: criteria.timeLimit ? matchDuration : q.timeLimitSeconds,
        },
        score: s,
        isUnseen,
        jitter,
      };
    })
    .filter((item) => item.score > -5000); // Exclude all hard-disqualified questions!

  // Sort: Top score first, then unseen preferred, then randomized jitter (never static addition order)
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.isUnseen !== a.isUnseen) {
      return b.isUnseen ? 1 : -1;
    }
    return b.jitter - a.jitter;
  });

  return scored.map((s) => s.question);
}
