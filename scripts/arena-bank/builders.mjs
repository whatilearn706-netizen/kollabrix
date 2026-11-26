/**
 * Clean factory helpers for generating validated Kollabrix Battle Arena DuelQuestions.
 */

export function sanitizeSlug(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/**
 * Wraps Python I/O boilerplate + solve stub so Blitz contestants spend zero time on stdin boilerplate.
 */
export function makePythonBlitz({
  id,
  title,
  difficulty,
  durationSecs,
  description,
  starterBody,
  solutionCode,
  testCases,
  constraints = [],
}) {
  return {
    question: {
      id,
      arena: 'algorithms',
      title,
      description,
      tags: ['python'],
      difficulty,
      timeLimitSeconds: durationSecs,
      starterPython: starterBody,
      starterCpp: '',
      starterJava: '',
      sampleInput: testCases[0].input,
      sampleOutput: testCases[0].expectedOutput,
      constraints,
      testCases,
    },
    solutionCode,
  };
}

export function makeCppBlitz({
  id,
  title,
  difficulty,
  durationSecs,
  description,
  starterBody,
  solutionCode,
  testCases,
  constraints = [],
}) {
  return {
    question: {
      id,
      arena: 'algorithms',
      title,
      description,
      tags: ['cpp'],
      difficulty,
      timeLimitSeconds: durationSecs,
      starterPython: '',
      starterCpp: starterBody,
      starterJava: '',
      sampleInput: testCases[0].input,
      sampleOutput: testCases[0].expectedOutput,
      constraints,
      testCases,
    },
    solutionCode,
  };
}

export function makeJavaBlitz({
  id,
  title,
  difficulty,
  durationSecs,
  description,
  starterBody,
  solutionCode,
  testCases,
  constraints = [],
}) {
  return {
    question: {
      id,
      arena: 'algorithms',
      title,
      description,
      tags: ['java'],
      difficulty,
      timeLimitSeconds: durationSecs,
      starterPython: '',
      starterCpp: '',
      starterJava: starterBody,
      sampleInput: testCases[0].input,
      sampleOutput: testCases[0].expectedOutput,
      constraints,
      testCases,
    },
    solutionCode,
  };
}

export function makeCodeBug({
  id,
  lang,
  title,
  difficulty,
  durationSecs,
  description,
  buggyCode,
  fixedCode,
  testCases,
}) {
  return {
    question: {
      id,
      arena: 'bug_hunt',
      bugDomain: 'logic',
      title,
      description,
      tags: ['bug_logic', lang],
      difficulty,
      timeLimitSeconds: durationSecs,
      codeWithBug: buggyCode,
      starterPython: lang === 'python' ? buggyCode : '',
      starterCpp: lang === 'cpp' ? buggyCode : '',
      starterJava: lang === 'java' ? buggyCode : '',
      sampleInput: testCases[0].input,
      sampleOutput: testCases[0].expectedOutput,
      testCases,
    },
    buggyCode,
    solutionCode: fixedCode,
  };
}

export function makeWebClash({
  id,
  title,
  difficulty,
  durationSecs,
  stackTags,
  description,
  starterHtml,
  starterCss = '',
  starterJs = '',
  targetHtml,
  targetCss = '',
  targetJs = '',
  checks,
}) {
  const cleanTags = stackTags.includes('html') ? stackTags : ['html', ...stackTags];
  return {
    question: {
      id,
      arena: 'web_dev',
      title,
      description,
      tags: cleanTags,
      difficulty,
      timeLimitSeconds: durationSecs,
      targetPreviewTitle: title,
      targetComponentHtml: targetHtml,
      targetComponentCss: cleanTags.includes('css') ? targetCss : '',
      targetComponentJs: cleanTags.includes('javascript') ? targetJs : '',
      starterHtml,
      starterCss: cleanTags.includes('css') ? starterCss : '',
      starterJs: cleanTags.includes('javascript') ? starterJs : '',
      validationCriteria: checks.map((c) =>
        `ruleJson::${JSON.stringify({ label: c.label, scope: c.scope, req: c.req || '', forbid: c.forbid || '' })}`
      ),
      testCases: checks.map((c) => ({
        input: c.scope,
        expectedOutput: 'true',
        description: c.label,
      })),
    },
  };
}

export function makeWebBug({
  id,
  title,
  difficulty,
  stackTags,
  description,
  starterHtml,
  starterCss = '',
  starterJs = '',
  targetHtml,
  targetCss = '',
  targetJs = '',
  checks,
}) {
  const cleanTags = stackTags.includes('html') ? stackTags : ['html', ...stackTags];
  return {
    question: {
      id,
      arena: 'bug_hunt',
      bugDomain: 'web',
      title,
      description,
      tags: ['bug_web', ...cleanTags],
      difficulty,
      timeLimitSeconds: 60,
      targetPreviewTitle: title,
      targetComponentHtml: targetHtml,
      targetComponentCss: cleanTags.includes('css') ? targetCss : '',
      targetComponentJs: cleanTags.includes('javascript') ? targetJs : '',
      starterHtml,
      starterCss: cleanTags.includes('css') ? starterCss : '',
      starterJs: cleanTags.includes('javascript') ? starterJs : '',
      validationCriteria: checks.map((c) =>
        `ruleJson::${JSON.stringify({ label: c.label, scope: c.scope, req: c.req || '', forbid: c.forbid || '' })}`
      ),
      testCases: checks.map((c) => ({
        input: c.scope,
        expectedOutput: 'true',
        description: c.label,
      })),
    },
  };
}
