import { DuelQuestion, DEFAULT_ARENA_QUESTIONS } from '@/types/arenaDuel';

export interface QuestionMatchCriteria {
  arena: string;
  bugDomain?: 'web' | 'logic';
  selectedTags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
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
    score += 120; // Exact difficulty match gets high weight
  } else if (
    (targetDiff === 'medium' && (qDiff === 'easy' || qDiff === 'hard')) ||
    (targetDiff === 'easy' && qDiff === 'medium') ||
    (targetDiff === 'hard' && qDiff === 'medium')
  ) {
    score += 20; // Adjacent difficulty
  } else {
    score -= 30; // Opposite difficulty (e.g. easy requested, hard question)
  }

  // 4. Tags scoring
  const targetTags = (criteria.selectedTags || [])
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const qTags = (q.tags || []).map((t) => t.trim().toLowerCase());

  if (targetTags.length > 0) {
    const matched = targetTags.filter((t) => qTags.includes(t));
    const matchCount = matched.length;

    if (matchCount > 0) {
      // Proportion of requested tags matched
      score += Math.round((matchCount / targetTags.length) * 70);

      // Exact match bonus: Question matches ALL requested tags and has NO irrelevant extra tags
      if (matchCount === targetTags.length && qTags.length === targetTags.length) {
        score += 80;
      } else if (matchCount === targetTags.length) {
        score += 45; // Contains all requested tags
      }
    } else {
      score -= 60; // Zero tags matched
    }
  }

  // 5. Time Limit matching score (Matches duration configured by admin)
  if (criteria.timeLimit && q.timeLimitSeconds) {
    const targetTime = Number(criteria.timeLimit);
    const qTime = Number(q.timeLimitSeconds);
    if (qTime === targetTime) {
      score += 60; // Exact duration match bonus!
    } else if (Math.abs(qTime - targetTime) <= 120) {
      score += 25; // Close duration
    }
  }

  // 6. Admin custom questions prioritization
  // If this question was created in the admin control center, prefer it heavily over default templates!
  const isDefault = DEFAULT_ARENA_QUESTIONS.some((d) => d.id === q.id);
  if (!isDefault) {
    score += 60;
  }

  return score;
}

/**
 * Selects the best question matching the player's configured arena, tags, difficulty, and duration.
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

  // Score each candidate
  let maxScore = -Infinity;
  const scored = pool.map((q) => {
    const s = scoreQuestion(q, criteria);
    if (s > maxScore) maxScore = s;
    return { question: q, score: s };
  });

  // Top candidates
  const bestCandidates = scored
    .filter((item) => item.score === maxScore)
    .map((item) => item.question);

  const chosen =
    bestCandidates.length > 0
      ? bestCandidates[Math.floor(Math.random() * bestCandidates.length)]
      : pool[0] || DEFAULT_ARENA_QUESTIONS[0];

  // Override timeLimitSeconds to strictly match the room's duration (e.g. 180s, 300s, 600s)
  const matchDuration = Number(criteria.timeLimit) || Number(chosen.timeLimitSeconds) || 300;

  return {
    ...chosen,
    timeLimitSeconds: matchDuration,
  };
}

/**
 * Filters and sorts questions for API query response, ranking best matches first.
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

  const scored = pool.map((q) => ({
    question: {
      ...q,
      timeLimitSeconds: criteria.timeLimit ? matchDuration : q.timeLimitSeconds,
    },
    score: scoreQuestion(q, criteria),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.question);
}
