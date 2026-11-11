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
 * Higher score = closer match.
 */
export function scoreQuestion(q: DuelQuestion, criteria: QuestionMatchCriteria): number {
  let score = 0;

  // 1. Arena filter (Hard requirement)
  if (q.arena !== criteria.arena) {
    return -1000;
  }

  // 2. Bug Domain filter for Bug Hunt
  if (criteria.arena === 'bug_hunt' && criteria.bugDomain) {
    if (q.bugDomain && q.bugDomain !== criteria.bugDomain) {
      return -500;
    }
  }

  // 3. Difficulty scoring
  const targetDiff = (criteria.difficulty || 'medium').toLowerCase();
  const qDiff = (q.difficulty || 'medium').toLowerCase();

  if (qDiff === targetDiff) {
    score += 150; // Exact difficulty match gets high weight
  } else if (
    (targetDiff === 'medium' && (qDiff === 'easy' || qDiff === 'hard')) ||
    (targetDiff === 'easy' && qDiff === 'medium') ||
    (targetDiff === 'hard' && qDiff === 'medium')
  ) {
    score += 20; // Adjacent difficulty
  } else {
    score -= 60; // Opposite difficulty (e.g. easy requested, hard question)
  }

  // 4. Tags scoring (Strict match & heavy penalty for unselected/unwanted technologies)
  const targetTags = (criteria.selectedTags || [])
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const qTags = (q.tags || []).map((t) => t.trim().toLowerCase());

  if (targetTags.length > 0) {
    const matched = targetTags.filter((t) => qTags.includes(t));
    const missing = targetTags.filter((t) => !qTags.includes(t));
    const unwanted = qTags.filter((t) => !targetTags.includes(t));

    // Heavy penalty for extra technologies the user specifically excluded
    // E.g. User selected HTML only: questions requiring CSS or JS receive -150 each
    if (unwanted.length > 0) {
      score -= unwanted.length * 150;
    }

    // Penalty for missing any of the user's requested tags
    if (missing.length > 0) {
      score -= missing.length * 60;
    }

    if (matched.length > 0) {
      // Proportion of requested tags matched
      score += Math.round((matched.length / targetTags.length) * 80);

      // Exact match bonus: Question matches ALL requested tags and has ZERO unwanted tags
      if (matched.length === targetTags.length && unwanted.length === 0) {
        score += 200; // Perfect exact tag match
      } else if (matched.length === targetTags.length) {
        score += 50;
      }
    } else {
      score -= 200; // Zero tags matched
    }
  }

  // 5. Time Limit matching score (Matches duration configured by admin / room)
  if (criteria.timeLimit && q.timeLimitSeconds) {
    const targetTime = Number(criteria.timeLimit);
    const qTime = Number(q.timeLimitSeconds);
    if (qTime === targetTime) {
      score += 100; // Exact duration match bonus!
    } else if (Math.abs(qTime - targetTime) <= 120) {
      score += 30; // Close duration
    } else {
      score -= 30; // Distant duration
    }
  }

  // 6. Admin custom questions prioritization
  // If this question was created in the admin control center, prefer it heavily over default templates!
  const isDefault = DEFAULT_ARENA_QUESTIONS.some((d) => d.id === q.id);
  if (!isDefault) {
    score += 300; // Massive boost for custom admin questions
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

  // Filter candidates that match arena (and bug domain if applicable)
  const arenaPool = list.filter((q) => {
    if (q.arena !== criteria.arena) return false;
    if (criteria.arena === 'bug_hunt' && criteria.bugDomain && q.bugDomain) {
      return q.bugDomain === criteria.bugDomain;
    }
    return true;
  });

  const pool = arenaPool.length > 0 ? arenaPool : list;

  // Score each candidate against criteria
  let maxScore = -Infinity;
  const scored = pool.map((q) => {
    const s = scoreQuestion(q, criteria);
    if (s > maxScore) maxScore = s;
    return { question: q, score: s };
  });

  // Top candidates: take questions matching top score threshold (exact match or near-exact match)
  const topScoreThreshold = maxScore - 40;
  const bestCandidates = scored
    .filter((item) => item.score >= topScoreThreshold)
    .map((item) => item.question);

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
      : pool[Math.floor(Math.random() * pool.length)] || DEFAULT_ARENA_QUESTIONS[0];

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

  const scored = pool.map((q) => {
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
  });

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
