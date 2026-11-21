import { DuelQuestion } from '@/types/arenaDuel';
import { JAVA_EASY_ARENA_QUESTIONS } from './javaEasyQuestions';
import { JAVA_MEDIUM_ARENA_QUESTIONS } from './javaMediumQuestions';
import { JAVA_HARD_ARENA_QUESTIONS } from './javaHardQuestions';
import { PYTHON_EASY_ARENA_QUESTIONS } from './pythonEasyQuestions';
import { PYTHON_MEDIUM_ARENA_QUESTIONS } from './pythonMediumQuestions';
import { PYTHON_HARD_ARENA_QUESTIONS } from './pythonHardQuestions';
import { CPP_EASY_ARENA_QUESTIONS } from './cppEasyQuestions';
import { CPP_MEDIUM_ARENA_QUESTIONS } from './cppMediumQuestions';
import { CPP_HARD_ARENA_QUESTIONS } from './cppHardQuestions';

export * from './javaEasyQuestions';
export * from './javaMediumQuestions';
export * from './javaHardQuestions';
export * from './pythonEasyQuestions';
export * from './pythonMediumQuestions';
export * from './pythonHardQuestions';
export * from './cppEasyQuestions';
export * from './cppMediumQuestions';
export * from './cppHardQuestions';

/**
 * All 270 Calibrated Competitive Algorithmic Battle Arena Questions
 * Covers:
 * - Java: Easy, Medium, Hard (3m, 5m, 10m)
 * - Python: Easy, Medium, Hard (3m, 5m, 10m)
 * - C++: Easy, Medium, Hard (3m, 5m, 10m)
 */
export const ALL_ALGORITHM_ARENA_QUESTIONS: DuelQuestion[] = [
  ...JAVA_EASY_ARENA_QUESTIONS,
  ...JAVA_MEDIUM_ARENA_QUESTIONS,
  ...JAVA_HARD_ARENA_QUESTIONS,
  ...PYTHON_EASY_ARENA_QUESTIONS,
  ...PYTHON_MEDIUM_ARENA_QUESTIONS,
  ...PYTHON_HARD_ARENA_QUESTIONS,
  ...CPP_EASY_ARENA_QUESTIONS,
  ...CPP_MEDIUM_ARENA_QUESTIONS,
  ...CPP_HARD_ARENA_QUESTIONS,
];
