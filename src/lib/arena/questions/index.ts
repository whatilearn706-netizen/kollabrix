import { DuelQuestion } from '@/types/arenaDuel';
import { HTML_MEDIUM_ARENA_QUESTIONS } from './htmlMediumQuestions';
import { HTML_HARD_ARENA_QUESTIONS } from './htmlHardQuestions';
import { HTML_CSS_EASY_ARENA_QUESTIONS } from './htmlCssEasyQuestions';
import { HTML_CSS_MEDIUM_ARENA_QUESTIONS } from './htmlCssMediumQuestions';
import { HTML_CSS_HARD_ARENA_QUESTIONS } from './htmlCssHardQuestions';
import { HTML_JS_EASY_ARENA_QUESTIONS } from './htmlJsEasyQuestions';
import { HTML_JS_MEDIUM_ARENA_QUESTIONS } from './htmlJsMediumQuestions';
import { HTML_JS_HARD_ARENA_QUESTIONS } from './htmlJsHardQuestions';
import { HTML_CSS_JS_EASY_ARENA_QUESTIONS } from './htmlCssJsEasyQuestions';
import { HTML_CSS_JS_MEDIUM_ARENA_QUESTIONS } from './htmlCssJsMediumQuestions';
import { HTML_CSS_JS_HARD_ARENA_QUESTIONS } from './htmlCssJsHardQuestions';

export * from './htmlMediumQuestions';
export * from './htmlHardQuestions';
export * from './htmlCssEasyQuestions';
export * from './htmlCssMediumQuestions';
export * from './htmlCssHardQuestions';
export * from './htmlJsEasyQuestions';
export * from './htmlJsMediumQuestions';
export * from './htmlJsHardQuestions';
export * from './htmlCssJsEasyQuestions';
export * from './htmlCssJsMediumQuestions';
export * from './htmlCssJsHardQuestions';

/**
 * All 330 Newly Calibrated Battle Arena Questions
 * Covers:
 * - HTML: Medium, Hard (3m, 5m, 10m)
 * - HTML + CSS: Easy, Medium, Hard (3m, 5m, 10m)
 * - HTML + JS: Easy, Medium, Hard (3m, 5m, 10m)
 * - HTML + CSS + JS: Easy, Medium, Hard (3m, 5m, 10m)
 */
export const ALL_EXPANDED_ARENA_QUESTIONS: DuelQuestion[] = [
  ...HTML_MEDIUM_ARENA_QUESTIONS,
  ...HTML_HARD_ARENA_QUESTIONS,
  ...HTML_CSS_EASY_ARENA_QUESTIONS,
  ...HTML_CSS_MEDIUM_ARENA_QUESTIONS,
  ...HTML_CSS_HARD_ARENA_QUESTIONS,
  ...HTML_JS_EASY_ARENA_QUESTIONS,
  ...HTML_JS_MEDIUM_ARENA_QUESTIONS,
  ...HTML_JS_HARD_ARENA_QUESTIONS,
  ...HTML_CSS_JS_EASY_ARENA_QUESTIONS,
  ...HTML_CSS_JS_MEDIUM_ARENA_QUESTIONS,
  ...HTML_CSS_JS_HARD_ARENA_QUESTIONS,
];
