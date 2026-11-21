import { DuelQuestion } from '@/types/arenaDuel';
import { HTML_BUG_EASY_ARENA_QUESTIONS } from './htmlBugEasyQuestions';
import { HTML_BUG_MEDIUM_ARENA_QUESTIONS } from './htmlBugMediumQuestions';
import { HTML_BUG_HARD_ARENA_QUESTIONS } from './htmlBugHardQuestions';
import { HTML_CSS_BUG_EASY_ARENA_QUESTIONS } from './htmlCssBugEasyQuestions';
import { HTML_CSS_BUG_MEDIUM_ARENA_QUESTIONS } from './htmlCssBugMediumQuestions';
import { HTML_CSS_BUG_HARD_ARENA_QUESTIONS } from './htmlCssBugHardQuestions';
import { HTML_CSS_JS_BUG_EASY_ARENA_QUESTIONS } from './htmlCssJsBugEasyQuestions';
import { HTML_CSS_JS_BUG_MEDIUM_ARENA_QUESTIONS } from './htmlCssJsBugMediumQuestions';
import { HTML_CSS_JS_BUG_HARD_ARENA_QUESTIONS } from './htmlCssJsBugHardQuestions';
import { HTML_JS_BUG_EASY_ARENA_QUESTIONS } from './htmlJsBugEasyQuestions';
import { HTML_JS_BUG_MEDIUM_ARENA_QUESTIONS } from './htmlJsBugMediumQuestions';
import { HTML_JS_BUG_HARD_ARENA_QUESTIONS } from './htmlJsBugHardQuestions';

export * from './htmlBugEasyQuestions';
export * from './htmlBugMediumQuestions';
export * from './htmlBugHardQuestions';
export * from './htmlCssBugEasyQuestions';
export * from './htmlCssBugMediumQuestions';
export * from './htmlCssBugHardQuestions';
export * from './htmlCssJsBugEasyQuestions';
export * from './htmlCssJsBugMediumQuestions';
export * from './htmlCssJsBugHardQuestions';
export * from './htmlJsBugEasyQuestions';
export * from './htmlJsBugMediumQuestions';
export * from './htmlJsBugHardQuestions';

/**
 * All 360 Calibrated Web UI Bug Hunt Questions
 * Distributed cleanly across:
 * - HTML-only Bugs: Easy (30), Medium (30), Hard (30) [10x 3m, 10x 5m, 10x 10m]
 * - HTML + CSS Bugs: Easy (30), Medium (30), Hard (30) [10x 3m, 10x 5m, 10x 10m]
 * - HTML + CSS + JS Bugs: Easy (30), Medium (30), Hard (30) [10x 3m, 10x 5m, 10x 10m]
 * - HTML + JS Bugs: Easy (30), Medium (30), Hard (30) [10x 3m, 10x 5m, 10x 10m]
 *
 * Calibrated with ~30-45s margin to spare so students can finish comfortably.
 */
export const ALL_BUG_HUNT_WEB_QUESTIONS: DuelQuestion[] = [
  ...HTML_BUG_EASY_ARENA_QUESTIONS,
  ...HTML_BUG_MEDIUM_ARENA_QUESTIONS,
  ...HTML_BUG_HARD_ARENA_QUESTIONS,
  ...HTML_CSS_BUG_EASY_ARENA_QUESTIONS,
  ...HTML_CSS_BUG_MEDIUM_ARENA_QUESTIONS,
  ...HTML_CSS_BUG_HARD_ARENA_QUESTIONS,
  ...HTML_CSS_JS_BUG_EASY_ARENA_QUESTIONS,
  ...HTML_CSS_JS_BUG_MEDIUM_ARENA_QUESTIONS,
  ...HTML_CSS_JS_BUG_HARD_ARENA_QUESTIONS,
  ...HTML_JS_BUG_EASY_ARENA_QUESTIONS,
  ...HTML_JS_BUG_MEDIUM_ARENA_QUESTIONS,
  ...HTML_JS_BUG_HARD_ARENA_QUESTIONS,
];
