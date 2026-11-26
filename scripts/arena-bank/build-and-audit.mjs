import fs from 'fs';
import { PYTHON_BLITZ_QUESTIONS } from './blitz-python.mjs';
import { CPP_BLITZ_QUESTIONS } from './blitz-cpp.mjs';
import { JAVA_BLITZ_QUESTIONS } from './blitz-java.mjs';
import { PYTHON_BUG_QUESTIONS } from './bug-python.mjs';
import { CPP_BUG_QUESTIONS } from './bug-cpp.mjs';
import { JAVA_BUG_QUESTIONS } from './bug-java.mjs';
import { WEB_CLASH_HTML_QUESTIONS } from './web-clash-html.mjs';
import { WEB_CLASH_JS_QUESTIONS } from './web-clash-js.mjs';
import { WEB_BUG_QUESTIONS } from './web-bughunt.mjs';
import { testCompiledSet } from './verify-code.mjs';
import { verifyAllWeb } from './verify-web.mjs';
import { formatQuestionCode } from './format-starters.mjs';

const rawQuestions = [
  ...PYTHON_BLITZ_QUESTIONS.map((x) => x.question),
  ...CPP_BLITZ_QUESTIONS.map((x) => x.question),
  ...JAVA_BLITZ_QUESTIONS.map((x) => x.question),
  ...PYTHON_BUG_QUESTIONS.map((x) => x.question),
  ...CPP_BUG_QUESTIONS.map((x) => x.question),
  ...JAVA_BUG_QUESTIONS.map((x) => x.question),
  ...WEB_CLASH_HTML_QUESTIONS.map((x) => x.question),
  ...WEB_CLASH_JS_QUESTIONS.map((x) => x.question),
  ...WEB_BUG_QUESTIONS.map((x) => x.question),
];

const allQuestions = rawQuestions.map(formatQuestionCode);

console.log('Total Questions Generated:', allQuestions.length);

// 1. Check unique IDs & unique titles
const idSet = new Set();
const titleSet = new Set();
const dupIds = [];
const dupTitles = [];
for (const q of allQuestions) {
  if (idSet.has(q.id)) dupIds.push(q.id);
  idSet.add(q.id);
  const tKey = `${q.arena}|${q.bugDomain || ''}|${q.title.toLowerCase().trim()}`;
  if (titleSet.has(tKey)) dupTitles.push(tKey);
  titleSet.add(tKey);
}
console.log('Duplicate IDs:', dupIds.length, 'Duplicate Arena-Titles:', dupTitles.length);
if (dupIds.length || dupTitles.length) {
  console.error({ dupIds, dupTitles });
  process.exit(1);
}

// 2. Bucket inventory audit
const buckets = {};
for (const q of allQuestions) {
  const tags = q.tags.filter((t) => !t.startsWith('bug_')).sort().join('+');
  const key = `${q.arena}${q.bugDomain ? `(${q.bugDomain})` : ''}|${tags}|${q.difficulty}|${q.arena === 'bug_hunt' && q.bugDomain === 'web' ? '60s' : `${q.timeLimitSeconds}s`}`;
  buckets[key] = (buckets[key] || 0) + 1;
}
const wrongBuckets = Object.entries(buckets).filter(([, cnt]) => cnt !== 10);
console.log('Total Distinct Buckets:', Object.keys(buckets).length, '(Expected 102 buckets x 10 = 1020)');
console.log('Buckets != 10:', wrongBuckets.length);
if (wrongBuckets.length || allQuestions.length !== 1020) {
  console.error('Bucket mismatch:', wrongBuckets);
  process.exit(1);
}

// 3. Re-verify all 90 Python BugHunt + edited C++ & Java BugHunt items + all 480 Web
const pyBugRes = testCompiledSet(PYTHON_BUG_QUESTIONS, 'python', { expectBuggyFail: true });
console.log('BugHunt Python re-check:', pyBugRes.tested, '| Failures:', pyBugRes.failures.length);
if (pyBugRes.failures.length) console.log(pyBugRes.failures);

const cppEditedIds = new Set(['bh-cpp-e5-03','bh-cpp-e10-08','bh-cpp-m3-05','bh-cpp-m3-06','bh-cpp-m10-02']);
const cppRes = testCompiledSet(CPP_BUG_QUESTIONS.filter((x) => cppEditedIds.has(x.question.id)), 'cpp', { expectBuggyFail: true });
console.log('BugHunt C++ edited re-check:', cppRes.tested, '| Failures:', cppRes.failures.length);
if (cppRes.failures.length) console.log(cppRes.failures);

const javaEditedIds = new Set(['bh-java-e5-02','bh-java-m3-06','bh-java-h5-03','bh-java-h5-07','bh-java-h5-08']);
const javaRes = testCompiledSet(JAVA_BUG_QUESTIONS.filter((x) => javaEditedIds.has(x.question.id)), 'java', { expectBuggyFail: true });
console.log('BugHunt Java edited re-check:', javaRes.tested, '| Failures:', javaRes.failures.length);
if (javaRes.failures.length) console.log(javaRes.failures);

const webRes = verifyAllWeb();
console.log('Web check:', webRes.total, '| Failures:', webRes.failures.length);

if (pyBugRes.failures.length || cppRes.failures.length || javaRes.failures.length || webRes.failures.length) {
  process.exit(1);
}

const outPath = '/tmp/kollabrix_verified_1020.json';
fs.writeFileSync(outPath, JSON.stringify(allQuestions));
const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
console.log(`ALL 1020 QUESTIONS VERIFIED! Payload written to ${outPath} (${sizeKb} KB)`);
