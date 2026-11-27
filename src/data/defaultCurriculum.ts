import { LanguageCurriculum } from '@/types/curriculum';
import { buildCurriculum } from './curricula/helpers';
import { JAVA_BEGINNER_SPEC } from './curricula/javaBeginner';
import { JAVA_PRO_SPEC } from './curricula/javaPro';
import { CPP_BEGINNER_SPEC } from './curricula/cppBeginner';
import { CPP_PRO_SPEC } from './curricula/cppPro';
import { PYTHON_BEGINNER_SPEC } from './curricula/pythonBeginner';
import { PYTHON_PRO_SPEC } from './curricula/pythonPro';
import { WEBDEV_BEGINNER_SPEC } from './curricula/webDevBeginner';
import { WEBDEV_PRO_SPEC } from './curricula/webDevPro';
import { DSA_BEGINNER_SPEC } from './curricula/dsaBeginner';
import { DSA_PRO_SPEC } from './curricula/dsaPro';

export const DEFAULT_CURRICULA: Record<string, LanguageCurriculum> = {
  'java-beginner': buildCurriculum(JAVA_BEGINNER_SPEC),
  'java-learning': buildCurriculum(JAVA_PRO_SPEC),
  'cpp-beginner': buildCurriculum(CPP_BEGINNER_SPEC),
  'cpp-learning': buildCurriculum(CPP_PRO_SPEC),
  'python-beginner': buildCurriculum(PYTHON_BEGINNER_SPEC),
  'python-learning': buildCurriculum(PYTHON_PRO_SPEC),
  'web_dev-beginner': buildCurriculum(WEBDEV_BEGINNER_SPEC),
  'web_dev-learning': buildCurriculum(WEBDEV_PRO_SPEC),
  'dsa-beginner': buildCurriculum(DSA_BEGINNER_SPEC),
  'dsa-learning': buildCurriculum(DSA_PRO_SPEC),
};
