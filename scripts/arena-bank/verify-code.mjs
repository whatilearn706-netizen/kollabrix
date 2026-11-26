import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

function normalizeOut(s) {
  return String(s || '').trim();
}

export function verifyTestOutput(actual, expected) {
  const a = normalizeOut(actual);
  const e = normalizeOut(expected);
  if (!a) return false;
  if (a === e) return true;
  if (a.replace(/[\s\r\n]+/g, '') === e.replace(/[\s\r\n]+/g, '')) return true;
  if (/^[\s\[\]\(\),\-\d.]+$/.test(e) && /^[\s\[\]\(\),\-\d.]+$/.test(a)) {
    const numsA = a.match(/-?\d+/g)?.map(Number);
    const numsE = e.match(/-?\d+/g)?.map(Number);
    if (numsA && numsE && numsA.length === numsE.length && numsA.every((v, i) => v === numsE[i])) {
      return true;
    }
  }
  return false;
}

export function testCompiledSet(items, lang, { expectBuggyFail = false } = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `arena-${lang}-`));
  const failures = [];
  let tested = 0;

  try {
    for (const item of items) {
      tested++;
      const q = item.question;
      const runProgram = (code, stdin) => {
        if (lang === 'python') {
          const r = spawnSync('python3', ['-c', code], { input: stdin, encoding: 'utf8', timeout: 3000 });
          return { ok: r.status === 0, out: r.stdout || '', err: r.stderr || '' };
        }
        if (lang === 'cpp') {
          const src = path.join(tmpDir, 'main.cpp');
          const bin = path.join(tmpDir, 'main.out');
          fs.writeFileSync(src, code);
          const comp = spawnSync('g++', ['-std=c++20', '-O0', src, '-o', bin], { encoding: 'utf8', timeout: 8000 });
          if (comp.status !== 0) return { ok: false, out: '', err: comp.stderr || 'g++ compile error' };
          const r = spawnSync(bin, [], { input: stdin, encoding: 'utf8', timeout: 3000 });
          return { ok: r.status === 0, out: r.stdout || '', err: r.stderr || '' };
        }
        if (lang === 'java') {
          const src = path.join(tmpDir, 'Main.java');
          fs.writeFileSync(src, code);
          const comp = spawnSync('javac', [src], { cwd: tmpDir, encoding: 'utf8', timeout: 8000 });
          if (comp.status !== 0) return { ok: false, out: '', err: comp.stderr || 'javac error' };
          const r = spawnSync('java', ['-cp', tmpDir, 'Main'], { input: stdin, encoding: 'utf8', timeout: 3000 });
          return { ok: r.status === 0, out: r.stdout || '', err: r.stderr || '' };
        }
      };

      // 1. Reference solution MUST pass all test cases
      for (let i = 0; i < q.testCases.length; i++) {
        const tc = q.testCases[i];
        const res = runProgram(item.solutionCode, tc.input);
        if (!res.ok || !verifyTestOutput(res.out, tc.expectedOutput)) {
          failures.push({
            id: q.id,
            title: q.title,
            phase: 'solution',
            caseIdx: i,
            expected: tc.expectedOutput,
            actual: res.out.trim(),
            err: res.err.slice(0, 220),
          });
        }
      }

      // 2. For Bug Hunt, buggy starter code MUST fail at least 1 test case
      if (expectBuggyFail && item.buggyCode) {
        let buggyPassedAll = true;
        for (const tc of q.testCases) {
          const r = runProgram(item.buggyCode, tc.input);
          if (!r.ok || !verifyTestOutput(r.out, tc.expectedOutput)) {
            buggyPassedAll = false;
            break;
          }
        }
        if (buggyPassedAll) {
          failures.push({
            id: q.id,
            title: q.title,
            phase: 'buggy_still_passed_all',
            err: 'Buggy code accidentally passed all test cases!',
          });
        }
      }
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  return { tested, failures };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = process.argv[2] || 'all';
  const { PYTHON_BLITZ_QUESTIONS } = await import('./blitz-python.mjs');
  const { CPP_BLITZ_QUESTIONS } = await import('./blitz-cpp.mjs');
  const { JAVA_BLITZ_QUESTIONS } = await import('./blitz-java.mjs');
  const { PYTHON_BUG_QUESTIONS } = await import('./bug-python.mjs');
  const { CPP_BUG_QUESTIONS } = await import('./bug-cpp.mjs');
  const { JAVA_BUG_QUESTIONS } = await import('./bug-java.mjs');

  const suites = [
    ['blitz-py', 'Blitz Python', PYTHON_BLITZ_QUESTIONS, 'python', false],
    ['blitz-cpp', 'Blitz C++', CPP_BLITZ_QUESTIONS, 'cpp', false],
    ['blitz-java', 'Blitz Java', JAVA_BLITZ_QUESTIONS, 'java', false],
    ['bug-py', 'BugHunt Python', PYTHON_BUG_QUESTIONS, 'python', true],
    ['bug-cpp', 'BugHunt C++', CPP_BUG_QUESTIONS, 'cpp', true],
    ['bug-java', 'BugHunt Java', JAVA_BUG_QUESTIONS, 'java', true],
  ].filter(([key]) => only === 'all' || only.split(',').includes(key));

  for (const [, label, list, lang, isBug] of suites) {
    const t0 = Date.now();
    const res = testCompiledSet(list, lang, { expectBuggyFail: isBug });
    console.log(`${label}: ${res.tested} checked in ${((Date.now() - t0) / 1000).toFixed(1)}s | Failures: ${res.failures.length}`);
    if (res.failures.length) console.log(JSON.stringify(res.failures.slice(0, 10), null, 2));
  }
}
